"""
Main entry point for the L&D Exchange job scraper.

Usage:
    python main.py           # Run once
    python main.py --daemon  # Run continuously on schedule
"""
import argparse
import logging
from datetime import datetime
from typing import List
import schedule
import time

import firebase_admin
from firebase_admin import credentials, firestore

import json

from config import (
    ZENROWS_API_KEY,
    SCRAPERAPI_KEY,
    FIREBASE_SERVICE_ACCOUNT_KEY,
    FIREBASE_CREDENTIALS_PATH,
    SCRAPE_INTERVAL_HOURS,
    MAX_JOBS_PER_SOURCE,
    JOB_SOURCES,
)
from models import ScrapedJob
from scrapers import ELearningIndustryScraper

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# Map parser names to scraper classes
SCRAPER_CLASSES = {
    "elearning_industry": ELearningIndustryScraper,
    # Add more scrapers as they're implemented
    # "training_industry": TrainingIndustryScraper,
    # "atd_jobs": ATDJobsScraper,
}


def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Try JSON string from env var first
        if FIREBASE_SERVICE_ACCOUNT_KEY:
            cred_dict = json.loads(FIREBASE_SERVICE_ACCOUNT_KEY)
            cred = credentials.Certificate(cred_dict)
            logger.info("Using Firebase credentials from env var")
        else:
            # Fall back to file
            cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
            logger.info("Using Firebase credentials from file")

        firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise


def get_db():
    """Get Firestore database client"""
    return firestore.client()


def save_jobs_to_firestore(jobs: List[ScrapedJob]):
    """
    Save scraped jobs to Firestore.
    Uses job ID (hash of source URL) to prevent duplicates.
    """
    db = get_db()
    jobs_collection = db.collection("jobs")

    saved_count = 0
    updated_count = 0
    skipped_count = 0

    for job in jobs:
        job_dict = job.to_firestore_dict()
        job_id = job_dict["id"]

        try:
            # Check if job already exists
            existing_doc = jobs_collection.document(job_id).get()

            if existing_doc.exists:
                # Update scraped_at timestamp but keep other data
                existing_data = existing_doc.to_dict()

                # Only update if job hasn't been manually modified
                if not existing_data.get("isDirectPost"):
                    jobs_collection.document(job_id).update({
                        "scrapedAt": datetime.utcnow(),
                        "status": "active",  # Reactivate if it was expired
                    })
                    updated_count += 1
                else:
                    skipped_count += 1
            else:
                # New job - save it
                jobs_collection.document(job_id).set(job_dict)
                saved_count += 1

        except Exception as e:
            logger.error(f"Error saving job {job.title}: {e}")

    logger.info(
        f"Jobs saved: {saved_count}, updated: {updated_count}, skipped: {skipped_count}"
    )


def expire_old_jobs():
    """
    Mark jobs as expired if they're past their expiry date.
    Note: Requires a composite index on (status, expiresAt)
    """
    try:
        db = get_db()
        jobs_collection = db.collection("jobs")

        now = datetime.utcnow()

        # Query for active jobs that should be expired
        expired_jobs = jobs_collection.where("status", "==", "active").where(
            "expiresAt", "<", now
        ).stream()

        expired_count = 0
        for doc in expired_jobs:
            try:
                doc.reference.update({"status": "expired"})
                expired_count += 1
            except Exception as e:
                logger.error(f"Error expiring job {doc.id}: {e}")

        if expired_count > 0:
            logger.info(f"Expired {expired_count} old jobs")
    except Exception as e:
        logger.warning(f"Could not expire old jobs (index may be missing): {e}")


def dedupe_jobs():
    """
    Find and remove duplicate jobs based on title + company similarity.
    Keeps the most recently scraped version.
    """
    # This would implement fuzzy matching to find similar jobs
    # For MVP, the URL-based ID hash handles exact duplicates
    pass


def run_scrapers():
    """Run all enabled scrapers and save results"""
    logger.info("Starting scraper run...")
    all_jobs = []

    for source in JOB_SOURCES:
        if not source["enabled"]:
            continue

        parser_name = source["parser"]

        if parser_name not in SCRAPER_CLASSES:
            logger.warning(f"No scraper class found for parser: {parser_name}")
            continue

        scraper_class = SCRAPER_CLASSES[parser_name]

        try:
            scraper = scraper_class(
                zenrows_api_key=ZENROWS_API_KEY,
                scraperapi_key=SCRAPERAPI_KEY,
            )

            jobs = scraper.scrape(max_jobs=MAX_JOBS_PER_SOURCE)
            all_jobs.extend(jobs)

            scraper.close()

        except Exception as e:
            logger.error(f"Error running scraper for {source['name']}: {e}")

    logger.info(f"Total jobs scraped: {len(all_jobs)}")

    if all_jobs:
        save_jobs_to_firestore(all_jobs)

    # Clean up expired jobs
    expire_old_jobs()

    logger.info("Scraper run completed")


def run_daemon():
    """Run the scraper on a schedule"""
    logger.info(f"Starting scraper daemon, running every {SCRAPE_INTERVAL_HOURS} hours")

    # Run immediately on start
    run_scrapers()

    # Schedule recurring runs
    schedule.every(SCRAPE_INTERVAL_HOURS).hours.do(run_scrapers)

    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute


def main():
    parser = argparse.ArgumentParser(description="L&D Exchange Job Scraper")
    parser.add_argument(
        "--daemon",
        action="store_true",
        help="Run continuously on schedule",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Scrape but don't save to database",
    )
    args = parser.parse_args()

    # Initialize Firebase (skip for dry run)
    if not args.dry_run:
        init_firebase()

    if args.daemon:
        run_daemon()
    else:
        if args.dry_run:
            logger.info("DRY RUN - Jobs will not be saved")
            # Run scrapers without saving
            for source in JOB_SOURCES:
                if not source["enabled"]:
                    continue
                parser_name = source["parser"]
                if parser_name in SCRAPER_CLASSES:
                    scraper = SCRAPER_CLASSES[parser_name](
                        zenrows_api_key=ZENROWS_API_KEY,
                        scraperapi_key=SCRAPERAPI_KEY,
                    )
                    jobs = scraper.scrape(max_jobs=10)
                    for job in jobs:
                        print(f"- {job.title} at {job.company} ({job.source_url})")
                    scraper.close()
        else:
            run_scrapers()


if __name__ == "__main__":
    main()
