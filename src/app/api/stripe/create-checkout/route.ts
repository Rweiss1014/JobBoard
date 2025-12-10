import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRICING } from '@/lib/stripe';

// Lazy initialize Stripe to avoid build-time errors
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

// Lazy initialize Firebase Admin to avoid build-time errors
async function getAdminDb() {
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');

  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      try {
        initializeApp({
          credential: cert(JSON.parse(serviceAccount)),
        });
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
        throw new Error('Invalid Firebase service account key format');
      }
    } else {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not configured');
    }
  }

  return getFirestore();
}

export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY');
      return NextResponse.json({ error: 'Server configuration error: Missing Stripe key' }, { status: 500 });
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.error('Missing FIREBASE_SERVICE_ACCOUNT_KEY');
      return NextResponse.json({ error: 'Server configuration error: Missing Firebase key' }, { status: 500 });
    }

    const stripe = getStripe();
    const body = await request.json();
    const { productType, tier, jobData, profileId, successUrl, cancelUrl } = body;

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    let metadata: Record<string, string> = {};

    if (productType === 'job_posting') {
      const pricing = PRICING.jobPosting[tier as keyof typeof PRICING.jobPosting];

      if (!pricing) {
        return NextResponse.json({ error: 'Invalid pricing tier' }, { status: 400 });
      }

      // Get Firebase Admin and save pending job
      const adminDb = await getAdminDb();
      const pendingJobRef = await adminDb.collection('pendingJobs').add({
        title: jobData?.title || '',
        company: jobData?.company || '',
        location: jobData?.location || '',
        locationType: jobData?.locationType || 'remote',
        description: jobData?.description || '',
        requirements: jobData?.requirements
          ? jobData.requirements.split('\n').filter((r: string) => r.trim())
          : [],
        category: jobData?.category || 'instructional-design',
        experienceLevel: jobData?.experienceLevel || 'mid',
        employmentType: jobData?.employmentType || 'full-time',
        salary: jobData?.salaryMin || jobData?.salaryMax
          ? {
              min: jobData?.salaryMin ? parseInt(jobData.salaryMin) : null,
              max: jobData?.salaryMax ? parseInt(jobData.salaryMax) : null,
              currency: 'USD',
              period: jobData?.salaryPeriod || 'annual',
            }
          : null,
        sourceUrl: jobData?.applicationUrl || '',
        sourceSite: 'L&D Exchange',
        createdAt: new Date(),
      });

      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pricing.name,
              description: pricing.features.join(' • '),
            },
            unit_amount: pricing.price * 100,
          },
          quantity: 1,
        },
      ];

      metadata = {
        type: 'job_posting',
        tier,
        pendingJobId: pendingJobRef.id,
        jobTitle: jobData?.title || '',
        companyName: jobData?.company || '',
      };
    } else if (productType === 'profile_boost') {
      const pricing = PRICING.profileBoost[tier as keyof typeof PRICING.profileBoost];

      if (!pricing) {
        return NextResponse.json({ error: 'Invalid pricing tier' }, { status: 400 });
      }

      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pricing.name,
              description: pricing.features.join(' • '),
            },
            unit_amount: pricing.price * 100,
          },
          quantity: 1,
        },
      ];

      metadata = {
        type: 'profile_boost',
        tier,
        profileId: profileId || '',
      };
    } else {
      return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/post-job/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/post-job?cancelled=true`,
      metadata,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
