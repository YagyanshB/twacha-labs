export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    currency: '£',
    interval: null,
    features: [
      '1 analysis per month',
      'Basic acne detection',
      'General recommendations',
      'Track 1 photo',
      'Educational content'
    ],
    limits: {
      analysesPerMonth: 1,
      photoTracking: 1,
      advancedAnalysis: false
    }
  },
  premium: {
    name: 'Premium',
    price: 4.99,
    currency: '£',
    interval: 'month',
    yearlyPrice: 49,
    features: [
      'Unlimited analyses',
      'Advanced skin analysis',
      'Unlimited progress tracking',
      'Personalized routine builder',
      'Product recommendations',
      'Priority support'
    ],
    limits: {
      analysesPerMonth: 999,
      photoTracking: 999,
      advancedAnalysis: true
    }
  },
  oneTime: {
    name: 'Premium Report',
    price: 9.99,
    currency: '£',
    interval: 'once',
    features: [
      'Full detailed analysis',
      'Comprehensive report',
      'Valid for 7 days',
      'All premium features'
    ],
    limits: {
      analysesPerMonth: 10,
      photoTracking: 10,
      advancedAnalysis: true,
      expiryDays: 7
    }
  }
};

export type PricingTier = keyof typeof PRICING_TIERS;
