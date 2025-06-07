import React, { useState } from 'react';

export default function CheckoutPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false });
  const isNameValid = name.trim().length > 0;
  const isEmailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const isFormValid = isNameValid && isEmailValid;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">Checkout</h1>
      <form className="bg-white rounded-lg shadow-md p-8 w-full max-w-md flex flex-col gap-4">
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
        <button
          type="button"
          className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isFormValid}
        >
          Pay with Card (Coming Soon)
        </button>
      </form>
    </div>
  );
} 