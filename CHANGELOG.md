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

### Pending Items

1. **Stripe Webhook Configuration (Vercel)**
   - The webhook endpoint needs to be registered in Stripe Dashboard for production
   - URL: `https://[your-vercel-domain]/api/stripe/webhook`
   - Event: `checkout.session.completed`
   - The `STRIPE_WEBHOOK_SECRET` in `.env.local` is: `whsec_0YQRaR9bclgirl48E9PGBp4iP1JTWJFT`
   - **Make sure this same secret is set in Vercel environment variables**

2. **Push Code to GitHub/Vercel**
   - The jobs page update needs to be committed and pushed
   - Git push was interrupted due to large `.firebase` folder being tracked

3. **Clean up .gitignore**
   - The `.firebase` build folder should be added to `.gitignore` to prevent tracking build artifacts

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
