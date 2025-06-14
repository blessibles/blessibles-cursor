"use client";
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '../../utils/supabaseClient';
import { sendOrderConfirmation } from '@/utils/email';

// Load Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    address: false,
    city: false,
    state: false,
    zipCode: false,
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const isNameValid = name.trim().length > 0;
  const isEmailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const isAddressValid = address.trim().length > 0;
  const isCityValid = city.trim().length > 0;
  const isStateValid = state.trim().length > 0;
  const isZipCodeValid = /^\d{5}(-\d{4})?$/.test(zipCode);
  
  const isFormValid = isNameValid && isEmailValid && isAddressValid && isCityValid && isStateValid && isZipCodeValid;
  
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, totalPrice } = useCart();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get the logged-in user's ID from Supabase
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };
    getUser();
  }, []);

  const orderTotalFormatted = `$${totalPrice.toFixed(2)}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setMessage(null);
    setApiError(null);

    try {
      const res = await fetch('/api/checkout-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalPrice * 100), // Convert to cents
          currency: 'usd',
          items: items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      const data = await res.json();
      
      if (data.error) {
        setApiError(data.error);
        setLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      setApiError('Failed to initialize payment. Please try again.');
    }
    
    setLoading(false);
  }

  async function handlePay() {
    if (!stripe || !elements || !clientSecret) return;
    setPaying(true);
    setMessage(null);

    try {
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name,
            email,
            address: {
              line1: address,
              city,
              state,
              postal_code: zipCode,
            },
          },
        },
      });

      if (result.error) {
        setMessage(result.error.message || 'Payment failed.');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        setMessage('Payment successful! Thank you for your order.');
        
        // Add new order for the logged-in user with cart line items in Supabase
        if (userId) {
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
              {
                user_id: userId,
                total: totalPrice,
                status: 'Processing',
                shipping_address: `${address}, ${city}, ${state} ${zipCode}`,
                payment_method: `Card ending in ${result.paymentIntent.payment_method?.toString().slice(-4) || '****'}`,
              },
            ])
            .select()
            .single();

          if (!orderError && orderData) {
            const orderId = orderData.id;
            const orderItems = items.map((item) => ({
              order_id: orderId,
              product_id: item.product.id,
              title: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
              download_url: `/downloads/${item.product.id}.pdf`,
            }));
            
            await supabase.from('order_items').insert(orderItems);

            // Send order confirmation email if user has opted in
            try {
              const { data: userPref, error: prefError } = await supabase
                .from('user_preferences')
                .select('order_updates')
                .eq('user_id', userId)
                .single();
              if (!prefError && userPref?.order_updates) {
                await sendOrderConfirmation(
                  email,
                  orderId,
                  items.map(item => ({
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                  })),
                  totalPrice,
                  items.map(item => ({
                    name: item.product.name,
                    url: `/downloads/${item.product.id}.pdf`,
                  }))
                );
              }
            } catch (emailError) {
              console.error('Failed to send order confirmation email:', emailError);
              // Don't block the order process if email fails
            }
          }
        }
        
        // Redirect to success page after successful payment
        router.push('/success');
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
    }
    
    setPaying(false);
  }

  return (
    <>
      {/* Cart Review Section */}
      <div className="mb-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Review Your Cart</h2>
        {items.length === 0 ? (
          <div className="text-gray-600">Your cart is empty.</div>
        ) : (
          <ul className="divide-y divide-gray-200 mb-4">
            {items.map((item) => (
              <li key={item.product.id} className="flex justify-between items-center py-2">
                <div>
                  <span className="font-medium text-blue-900">{item.product.name}</span>
                  <span className="ml-2 text-gray-500 text-sm">x{item.quantity}</span>
                </div>
                <span className="text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between font-semibold text-blue-900 border-t pt-2">
          <span>Total</span>
          <span>{orderTotalFormatted}</span>
        </div>
      </div>

      {/* Payment Form */}
      <form className="bg-white rounded-lg shadow-md p-8 w-full max-w-md flex flex-col gap-4" onSubmit={handleSubmit}>
        {apiError && (
          <div className="mb-2 p-3 rounded bg-red-100 text-red-800 border border-red-200 text-center font-semibold">
            {apiError}
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-900">Personal Information</h3>
          
          <label className="font-semibold text-blue-800">
            Name
            <input
              type="text"
              className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                touched.name && !isNameValid ? 'border-red-400' : 'border-blue-300'
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              required
            />
            {touched.name && !isNameValid && (
              <span className="text-red-500 text-xs">Name is required.</span>
            )}
          </label>

          <label className="font-semibold text-blue-800">
            Email
            <input
              type="email"
              className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                touched.email && !isEmailValid ? 'border-red-400' : 'border-blue-300'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              required
            />
            {touched.email && !isEmailValid && (
              <span className="text-red-500 text-xs">Valid email required.</span>
            )}
          </label>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-900">Shipping Address</h3>
          
          <label className="font-semibold text-blue-800">
            Street Address
            <input
              type="text"
              className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                touched.address && !isAddressValid ? 'border-red-400' : 'border-blue-300'
              }`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, address: true }))}
              required
            />
            {touched.address && !isAddressValid && (
              <span className="text-red-500 text-xs">Address is required.</span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="font-semibold text-blue-800">
              City
              <input
                type="text"
                className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  touched.city && !isCityValid ? 'border-red-400' : 'border-blue-300'
                }`}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, city: true }))}
                required
              />
              {touched.city && !isCityValid && (
                <span className="text-red-500 text-xs">City is required.</span>
              )}
            </label>

            <label className="font-semibold text-blue-800">
              State
              <input
                type="text"
                className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  touched.state && !isStateValid ? 'border-red-400' : 'border-blue-300'
                }`}
                value={state}
                onChange={(e) => setState(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, state: true }))}
                required
              />
              {touched.state && !isStateValid && (
                <span className="text-red-500 text-xs">State is required.</span>
              )}
            </label>
          </div>

          <label className="font-semibold text-blue-800">
            ZIP Code
            <input
              type="text"
              className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                touched.zipCode && !isZipCodeValid ? 'border-red-400' : 'border-blue-300'
              }`}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, zipCode: true }))}
              required
            />
            {touched.zipCode && !isZipCodeValid && (
              <span className="text-red-500 text-xs">Valid ZIP code required.</span>
            )}
          </label>
        </div>

        {/* Payment Section */}
        {clientSecret ? (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Payment Information</h3>
              <div className="mb-2">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </div>
              <button
                type="button"
                className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePay}
                disabled={!stripe || !elements || paying}
              >
                {paying ? 'Processing…' : `Pay ${orderTotalFormatted}`}
              </button>
            </div>
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

        {message && (
          <div
            className={`mt-2 p-3 rounded text-center font-semibold ${
              message.includes('success')
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}