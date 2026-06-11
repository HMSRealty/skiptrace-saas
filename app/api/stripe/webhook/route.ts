import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, credits } = session.metadata || {};

    if (!userId || !credits) {
      console.error('Missing metadata in checkout session:', session.id);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const creditsToAdd = parseInt(credits, 10);

    // Fetch current balance and add credits atomically
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('credits_balance')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Profile not found for userId:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({ credits_balance: (profile.credits_balance || 0) + creditsToAdd })
      .eq('id', userId);

    if (updateErr) {
      console.error('Failed to update credits:', updateErr);
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
    }

    console.log(`Added ${creditsToAdd} credits to user ${userId}`);
  }

  return NextResponse.json({ received: true });
}
