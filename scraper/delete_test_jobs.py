"""
Script to delete test jobs and old scraped jobs from Firestore.
"""
import json

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

def delete_jobs():
    """Delete test jobs and all scraped jobs"""
    db = init_firebase()
    jobs_collection = db.collection("jobs")

    # Get all jobs
    all_jobs = jobs_collection.stream()

    deleted_count = 0
    kept_count = 0

    for doc in all_jobs:
        data = doc.to_dict()
        title = data.get("title", "")
        company = data.get("company", "")
        source_site = data.get("sourceSite", "")
        is_direct = data.get("isDirectPost", False)

        # Delete test jobs (title or company is just "id" or very short)
        if title.lower() in ["id", "test", "asdf"] or len(title) <= 2:
            print(f"  Deleting test job: '{title}' at '{company}'")
            doc.reference.delete()
            deleted_count += 1
            continue

        # Delete all scraped jobs (we'll re-scrape fresh ones later)
        if source_site and source_site != "L&D Exchange" and not is_direct:
            print(f"  Deleting scraped job: '{title}' at '{company}' (via {source_site})")
            doc.reference.delete()
            deleted_count += 1
            continue

        kept_count += 1
        print(f"  Keeping: '{title}' at '{company}'")

    print(f"\nDone! Deleted {deleted_count} jobs, kept {kept_count} jobs.")

if __name__ == "__main__":
    delete_jobs()
