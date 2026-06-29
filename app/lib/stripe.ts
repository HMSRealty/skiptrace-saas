import Stripe from 'stripe';

// Lazily-created Stripe client so the build does not require STRIPE_SECRET_KEY
// to be present at module-eval time.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set.');
  }
  _stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia' });
  return _stripe;
}
