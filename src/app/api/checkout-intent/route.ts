import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_placeholder');

export async function POST(req: NextRequest) {
  try {
    const { amount, currency } = await req.json();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Payment intent failed.' }, { status: 400 });
  }
} 