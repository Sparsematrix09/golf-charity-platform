import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia' as any,
});

export const PLANS = {
  monthly: {
    name: 'Monthly',
    price: 9.99,
    interval: 'month' as const,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    poolPct: 0.5,
    charityMinPct: 0.1,
  },
  yearly: {
    name: 'Yearly',
    price: 95.88, // 7.99 x 12
    interval: 'year' as const,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    poolPct: 0.5,
    charityMinPct: 0.1,
    monthlyEquivalent: 7.99,
    savingsPct: 20,
  },
};
