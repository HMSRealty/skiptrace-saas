import { NextResponse } from 'next/server';
import { getStripe } from '../../../lib/stripe';

const PRICE_MAP: Record<string, number> = {
  starter: 4900,   // $49.00 in cents
  growth: 14900,   // $149.00
  pro: 29900,      // $299.00
  scale: 99900,    // $999.00
};

const CREDITS_MAP: Record<string, number> = {
  starter: 500,
  growth: 2000,
  pro: 5000,
  scale: 25000,
};

export async function POST(request: Request) {
  try {
    const { packageId, userId, userEmail } = await request.json();

    if (!packageId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const amount = PRICE_MAP[packageId];
    const credits = CREDITS_MAP[packageId];

    if (!amount || !credits) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SkipTrace Pro — ${credits.toLocaleString()} Credits`,
              description: `${credits.toLocaleString()} skip trace credits. Credits never expire.`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        credits: credits.toString(),
        packageId,
      },
      success_url: `${baseUrl}?payment=success`,
      cancel_url: `${baseUrl}?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
