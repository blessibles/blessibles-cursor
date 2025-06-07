"use client";
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_placeholder');

function CheckoutForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isNameValid = name.trim().length > 0;
  const isEmailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const isFormValid = isNameValid && isEmailValid;
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setMessage(null);
    // For demo, use $10.00 USD
    const res = await fetch('/api/checkout-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000, currency: 'usd' }),
    });
    const data = await res.json();
    setClientSecret(data.clientSecret);
    setLoading(false);
  }

  async function handlePay() {
    if (!stripe || !elements || !clientSecret) return;
    setPaying(true);
    setMessage(null);
    const cardElement = elements.getElement(CardElement);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement!,
        billing_details: { name, email },
      },
    });
    if (result.error) {
      setMessage(result.error.message || 'Payment failed.');
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      setMessage('Payment successful! Thank you for your order.');
    }
    setPaying(false);
  }

  return (
    <form className="bg-white rounded-lg shadow-md p-8 w-full max-w-md flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="font-semibold text-blue-800">Name
        <input
          type="text"
          className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${touched.name && !isNameValid ? 'border-red-400' : 'border-blue-300'}`}
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, name: true }))}
          required
        />
        {touched.name && !isNameValid && <span className="text-red-500 text-xs">Name is required.</span>}
      </label>
      <label className="font-semibold text-blue-800">Email
        <input
          type="email"
          className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${touched.email && !isEmailValid ? 'border-red-400' : 'border-blue-300'}`}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, email: true }))}
          required
        />
        {touched.email && !isEmailValid && <span className="text-red-500 text-xs">Valid email required.</span>}
      </label>
      {clientSecret ? (
        <>
          <div className="mb-2">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
          </div>
          <button
            type="button"
            className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePay}
            disabled={!stripe || !elements || paying}
          >
            {paying ? 'Processing…' : 'Pay $10.00'}
          </button>
        </>
      ) : (
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isFormValid || loading}
        >
          {loading ? 'Loading…' : 'Continue to Payment'}
        </button>
      )}
      {message && <div className={`mt-2 p-3 rounded text-center font-semibold ${message.includes('success') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>{message}</div>}
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
} 