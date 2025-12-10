"""
Script to delete old scraped jobs from Firestore.
Keeps only direct posts and recent scraped jobs.
"""
import json
from datetime import datetime, timedelta

import firebase_admin
from firebase_admin import credentials, firestore

from config import FIREBASE_SERVICE_ACCOUNT_KEY

def init_firebase():
    """Initialize Firebase Admin SDK"""
    if FIREBASE_SERVICE_ACCOUNT_KEY:
        cred_dict = json.loads(FIREBASE_SERVICE_ACCOUNT_KEY)
        cred = credentials.Certificate(cred_dict)
    else:
        raise Exception("No Firebase credentials found")

    firebase_admin.initialize_app(cred)
    return firestore.client()

def cleanup_old_jobs():
    """Delete scraped jobs that are older than 60 days"""
    db = init_firebase()
    jobs_collection = db.collection("jobs")

    # Calculate cutoff date (60 days ago)
    cutoff_date = datetime.utcnow() - timedelta(days=60)

    print(f"Deleting scraped jobs older than {cutoff_date.strftime('%Y-%m-%d')}...")

    # Get all jobs
    all_jobs = jobs_collection.stream()

    deleted_count = 0
    kept_count = 0

    for doc in all_jobs:
        data = doc.to_dict()

        # Skip direct posts - always keep them
        if data.get("isDirectPost"):
            kept_count += 1
            continue

        # Check if it's a scraped job (has sourceSite other than L&D Exchange)
        source_site = data.get("sourceSite", "")
        if source_site and source_site != "L&D Exchange":
            # Check the posted date
            posted_at = data.get("postedAt")
            if posted_at:
                # Convert Firestore timestamp to datetime
                if hasattr(posted_at, 'timestamp'):
                    posted_datetime = datetime.fromtimestamp(posted_at.timestamp())
                else:
                    posted_datetime = posted_at

                # Delete if older than cutoff
                if posted_datetime < cutoff_date:
                    print(f"  Deleting: {data.get('title', 'Unknown')} ({posted_datetime.strftime('%Y-%m-%d')})")
                    doc.reference.delete()
                    deleted_count += 1
                else:
                    kept_count += 1
            else:
                # No date - delete it
                print(f"  Deleting (no date): {data.get('title', 'Unknown')}")
                doc.reference.delete()
                deleted_count += 1
        else:
            kept_count += 1

    print(f"\nDone! Deleted {deleted_count} old jobs, kept {kept_count} jobs.")

if __name__ == "__main__":
    cleanup_old_jobs()
