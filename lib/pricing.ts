export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    currency: '£',
    interval: null,
    features: [
      'Unlimited analyses',
      'Advanced skin analysis',
      'Unlimited progress tracking',
      'Personalized recommendations',
      'Educational content'
    ],
    limits: {
      analysesPerMonth: 999999,
      photoTracking: 999999,
      advancedAnalysis: true
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
