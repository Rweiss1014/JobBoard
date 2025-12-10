import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getFirebaseAdmin() {
  if (getApps().length === 0) {
    // For Vercel, use environment variable with JSON credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
      });
    } else {
      // Fallback for local development - uses default credentials
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  }

  return getFirestore();
}

export const adminDb = getFirebaseAdmin();
