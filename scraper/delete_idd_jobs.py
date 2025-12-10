"""
Delete remaining test jobs (IDD)
"""
import json

import firebase_admin
from firebase_admin import credentials, firestore

from config import FIREBASE_SERVICE_ACCOUNT_KEY

def init_firebase():
    if FIREBASE_SERVICE_ACCOUNT_KEY:
        cred_dict = json.loads(FIREBASE_SERVICE_ACCOUNT_KEY)
        cred = credentials.Certificate(cred_dict)
    else:
        raise Exception("No Firebase credentials found")
    firebase_admin.initialize_app(cred)
    return firestore.client()

def delete_idd_jobs():
    db = init_firebase()
    jobs_collection = db.collection("jobs")
    all_jobs = jobs_collection.stream()

    for doc in all_jobs:
        data = doc.to_dict()
        title = data.get("title", "")
        company = data.get("company", "")

        # Delete IDD test jobs
        if title.upper() == "IDD" or company.upper() == "IDD":
            print(f"Deleting: '{title}' at '{company}'")
            doc.reference.delete()

    print("Done!")

if __name__ == "__main__":
    delete_idd_jobs()
