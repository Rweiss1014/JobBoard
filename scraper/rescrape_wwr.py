"""
Delete We Work Remotely jobs and re-scrape with fixed URL parsing.
"""
import json
import logging
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, firestore

from config import (
    FIREBASE_SERVICE_ACCOUNT_KEY,
    FIREBASE_CREDENTIALS_PATH,
    ZENROWS_API_KEY,
    SCRAPERAPI_KEY,
    MAX_JOBS_PER_SOURCE,
)
from scrapers import WeWorkRemotelyScraper

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        if FIREBASE_SERVICE_ACCOUNT_KEY:
            cred_dict = json.loads(FIREBASE_SERVICE_ACCOUNT_KEY)
            cred = credentials.Certificate(cred_dict)
        else:
            cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise


def delete_wwr_jobs():
    """Delete all We Work Remotely jobs"""
    db = firestore.client()
    jobs_collection = db.collection("jobs")

    # Query for WWR jobs
    wwr_jobs = jobs_collection.where("sourceSite", "==", "We Work Remotely").stream()

    deleted_count = 0
    for doc in wwr_jobs:
        data = doc.to_dict()
        logger.info(f"Deleting: {data.get('title', 'Unknown')} - URL: {data.get('sourceUrl', 'EMPTY')}")
        doc.reference.delete()
        deleted_count += 1

    logger.info(f"Deleted {deleted_count} We Work Remotely jobs")
    return deleted_count


def scrape_and_save():
    """Re-scrape and save jobs"""
    db = firestore.client()
    jobs_collection = db.collection("jobs")

    scraper = WeWorkRemotelyScraper(
        zenrows_api_key=ZENROWS_API_KEY,
        scraperapi_key=SCRAPERAPI_KEY,
    )

    jobs = scraper.scrape(max_jobs=MAX_JOBS_PER_SOURCE)
    scraper.close()

    saved_count = 0
    for job in jobs:
        job_dict = job.to_firestore_dict()
        job_id = job_dict["id"]

        # Log the URL being saved
        logger.info(f"Saving: {job.title} - URL: {job.source_url}")

        jobs_collection.document(job_id).set(job_dict)
        saved_count += 1

    logger.info(f"Saved {saved_count} jobs with URLs")
    return saved_count


if __name__ == "__main__":
    init_firebase()

    print("\n=== Deleting existing We Work Remotely jobs ===")
    deleted = delete_wwr_jobs()

    print(f"\n=== Re-scraping We Work Remotely with fixed URL parsing ===")
    saved = scrape_and_save()

    print(f"\n=== Complete ===")
    print(f"Deleted: {deleted} old jobs")
    print(f"Saved: {saved} new jobs with correct URLs")
