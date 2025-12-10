"""
Check what jobs are currently in the database.
"""
import json
import logging

import firebase_admin
from firebase_admin import credentials, firestore

from config import (
    FIREBASE_SERVICE_ACCOUNT_KEY,
    FIREBASE_CREDENTIALS_PATH,
)

logging.basicConfig(level=logging.INFO)

def init_firebase():
    if FIREBASE_SERVICE_ACCOUNT_KEY:
        cred_dict = json.loads(FIREBASE_SERVICE_ACCOUNT_KEY)
        cred = credentials.Certificate(cred_dict)
    else:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)

if __name__ == "__main__":
    init_firebase()
    db = firestore.client()

    jobs = db.collection("jobs").stream()

    print("\n=== All Jobs in Database ===\n")

    by_source = {}
    for doc in jobs:
        data = doc.to_dict()
        source = data.get("sourceSite", "Unknown")
        if source not in by_source:
            by_source[source] = []
        by_source[source].append({
            "title": data.get("title"),
            "company": data.get("company"),
            "status": data.get("status"),
            "postedAt": data.get("postedAt"),
        })

    total = 0
    for source, jobs_list in by_source.items():
        print(f"\n--- {source}: {len(jobs_list)} jobs ---")
        for job in jobs_list[:5]:  # Show first 5
            print(f"  - {job['title']} at {job['company']} ({job['status']})")
        if len(jobs_list) > 5:
            print(f"  ... and {len(jobs_list) - 5} more")
        total += len(jobs_list)

    print(f"\n=== TOTAL: {total} jobs ===")
