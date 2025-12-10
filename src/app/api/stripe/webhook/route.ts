import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

// Lazy initialize Stripe to avoid build-time errors
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;

  if (!metadata) {
    console.error('No metadata in session');
    return;
  }

  console.log('Processing successful payment:', {
    type: metadata.type,
    tier: metadata.tier,
    sessionId: session.id,
  });

  if (metadata.type === 'job_posting') {
    // Retrieve the pending job data from the pendingJobs collection
    // The job data was stored there when checkout was initiated
    const pendingJobId = metadata.pendingJobId;

    if (pendingJobId) {
      // Get pending job data
      const pendingJobDoc = await adminDb.collection('pendingJobs').doc(pendingJobId).get();

      if (pendingJobDoc.exists) {
        const jobData = pendingJobDoc.data();

        // Create the actual job posting
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await adminDb.collection('jobs').add({
          ...jobData,
          isFeatured: metadata.tier === 'featured',
          isDirectPost: true,
          paymentId: session.id,
          paymentStatus: 'paid',
          status: 'active',
          postedAt: new Date(),
          expiresAt: expiresAt,
        });

        // Delete the pending job
        await adminDb.collection('pendingJobs').doc(pendingJobId).delete();

        console.log('Job posting created successfully:', jobData?.title);
      }
    } else {
      // Fallback: Create a minimal job entry from metadata only
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await adminDb.collection('jobs').add({
        title: metadata.jobTitle || 'Untitled Position',
        company: metadata.companyName || 'Unknown Company',
        location: 'Not specified',
        locationType: 'remote',
        description: 'Job details pending update.',
        requirements: [],
        category: 'instructional-design',
        experienceLevel: 'mid',
        employmentType: 'full-time',
        sourceUrl: '',
        sourceSite: 'L&D Exchange',
        isFeatured: metadata.tier === 'featured',
        isDirectPost: true,
        paymentId: session.id,
        paymentStatus: 'paid',
        status: 'pending-details', // Needs employer to fill in details
        postedAt: new Date(),
        expiresAt: expiresAt,
        customerEmail: session.customer_email,
      });

      console.log('Minimal job entry created, pending details');
    }
  } else if (metadata.type === 'profile_boost') {
    const profileId = metadata.profileId;

    if (profileId) {
      const durationDays = metadata.tier === 'weekly' ? 7 : 30;
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + durationDays);

      await adminDb.collection('freelancers').doc(profileId).update({
        isFeatured: true,
        featuredUntil: featuredUntil,
      });

      console.log('Profile boosted:', profileId, 'until', featuredUntil);
    }
  }
}
