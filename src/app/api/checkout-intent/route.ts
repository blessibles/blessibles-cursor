import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { amount, currency, items } = await req.json();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: JSON.stringify(items),
      },
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: unknown) {
    console.error('Error creating payment intent:', error);
    let errorMsg = 'Failed to create payment intent.';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      errorMsg = (error as { message: string }).message;
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
} 