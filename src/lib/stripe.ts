import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Pricing configuration
export const PRICING = {
  jobPosting: {
    basic: {
      id: 'job_basic',
      name: 'Basic Job Posting',
      price: 99,
      duration: 30, // days
      features: [
        'Listed for 30 days',
        'Standard visibility',
        'Application tracking',
      ],
    },
    featured: {
      id: 'job_featured',
      name: 'Featured Job Posting',
      price: 199,
      duration: 30,
      features: [
        'Listed for 30 days',
        'Featured badge & top placement',
        'Highlighted in search results',
        'Included in weekly email digest',
        'Social media promotion',
      ],
    },
  },
  profileBoost: {
    weekly: {
      id: 'profile_boost_weekly',
      name: 'Profile Boost - 1 Week',
      price: 29,
      duration: 7,
      features: [
        'Featured badge',
        'Top placement in search',
        'Priority in employer searches',
      ],
    },
    monthly: {
      id: 'profile_boost_monthly',
      name: 'Profile Boost - 1 Month',
      price: 79,
      duration: 30,
      features: [
        'Featured badge',
        'Top placement in search',
        'Priority in employer searches',
        'Included in talent spotlight emails',
      ],
    },
  },
};

export type PricingTier = keyof typeof PRICING.jobPosting | keyof typeof PRICING.profileBoost;
