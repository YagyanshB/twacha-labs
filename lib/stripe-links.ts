// Stripe Payment Links
export const STRIPE_LINKS = {
  // Monthly Premium - £6.99/month
  monthly: 'https://buy.stripe.com/7sYeVd8gndhhckNghE24001',

  // Annual Premium - £49/year (Save 42%)
  annual: 'https://buy.stripe.com/4gM9ATbsz0uvacFc1o24003',

  // Early Bird - Limited to first 100 users
  earlyBird: 'https://buy.stripe.com/3cI28r2W37WX0C5ghE24004',
} as const;

export const EARLY_BIRD_LIMIT = 100;

export type PlanType = keyof typeof STRIPE_LINKS;
