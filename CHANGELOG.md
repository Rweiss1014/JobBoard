# L&D Exchange - Development Changelog

## 2025-12-09

### Session Updates

#### Update 1: Fixed Jobs Page to Fetch from Firestore
**Time:** ~9:38 PM EST
**File:** `src/app/jobs/page.tsx`
**Issue:** Posted jobs were not appearing on the jobs page
**Root Cause:** The jobs page was only displaying mock data from `mockJobs`, not fetching real jobs from Firestore
**Changes Made:**
- Added `useEffect` hook to fetch jobs from Firestore on page load
- Added Firestore imports: `collection`, `query`, `where`, `orderBy`, `getDocs`
- Created `firestoreJobs` state to hold real jobs from database
- Added `loading` state with spinner UI while fetching
- Combined Firestore jobs with mock data (Firestore jobs appear first)
- Added `Loader2` icon from lucide-react for loading state

**Status:** Code updated locally, pending deployment to Vercel

---

#### Update 2: Deployed Firestore Indexes
**Time:** ~9:38 PM EST
**Command:** `npx firebase-tools deploy --only firestore:indexes`
**Status:** Successfully deployed to Firebase project `ld-exchange`

---

#### Update 3: Connected GitHub Repository
**Time:** ~10:45 PM EST
**Repository:** `https://github.com/Rweiss1014/JobBoard`
**Changes Made:**
- Added GitHub remote to local project
- Pushed all code to GitHub main branch
- Vercel can now be connected to auto-deploy from GitHub

**Status:** Complete

---

#### Update 4: Updated Stripe Webhook Endpoint
**Time:** ~10:42 PM EST
**Old Endpoint:** `https://ld-exchange-eyx6g05h7-rweiss1014s-projects.vercel.app/api/stripe/webhook` (preview URL)
**New Endpoint:** `https://ld-exchange.vercel.app/api/stripe/webhook` (production URL)
**Status:** Updated in Stripe Dashboard

---

#### Update 5: Fixed Missing Source Files in Git
**Time:** ~11:25 PM EST
**Issue:** Vercel build failing with "module-not-found" errors
**Root Cause:** Source files (components, lib, api routes) were not tracked by git
**Changes Made:**
- Added all source files to git: `src/components/`, `src/lib/`, `src/types/`, `src/app/api/`
- Added Firebase config files: `firebase.json`, `firestore.rules`, `firestore.indexes.json`
- Pushed 29 files to GitHub

**Status:** Complete

---

#### Update 6: Added Firebase Environment Variables to Vercel
**Time:** ~11:55 PM EST
**Issue:** Build failing with `Firebase: Error (auth/invalid-api-key)`
**Root Cause:** Client-side Firebase env vars missing from Vercel
**Variables Added:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

**Status:** Complete - Build succeeded!

---

## 2025-12-10

### Session Updates

#### Update 7: Added Missing Firestore Index for Jobs Query
**Time:** ~12:00 AM EST
**File:** `firestore.indexes.json`
**Issue:** Jobs page console error: "The query requires an index"
**Root Cause:** The jobs page query uses `status` + `postedAt` fields, but only a 3-field index existed (`status` + `isFeatured` + `postedAt`)
**Changes Made:**
- Added new composite index with 2 fields: `status` (ASC) + `postedAt` (DESC)
- Deployed indexes to Firebase: `npx firebase-tools deploy --only firestore:indexes`
- Added `.firebase` to `.gitignore` to prevent tracking build artifacts
- Fixed git history to remove accidentally committed large files
- Pushed changes to GitHub

**Status:** Complete - Vercel will auto-deploy

---

### Pending Items

1. **Test Job Posting**
   - Post a new job and verify it appears on the jobs page
   - The Firestore index may take a few minutes to become active

---

### Environment Configuration

**Local (.env.local):**
- Firebase: Configured ✓
- Stripe Test Keys: Configured ✓ (pk_test_, sk_test_)
- Stripe Webhook Secret: Configured ✓
- Base URL: `http://localhost:3000`

**Vercel (Required):**
- All Firebase env vars
- `STRIPE_SECRET_KEY` (test key)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test key)
- `STRIPE_WEBHOOK_SECRET` (must match Stripe dashboard webhook)
- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string)

---

### Test Payment Info
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits
