import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_placeholder');

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { amount, currency } = await req.json();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: unknown) {
    let errorMsg = 'Payment intent failed.';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      errorMsg = (error as { message: string }).message;
    }
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
} 