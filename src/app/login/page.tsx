"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/order-history');
      }
    };
    checkSession();
  }, [router]);

  const isEmailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const isPasswordValid = password.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else {
      router.replace('/order-history');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 w-full">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 w-full flex flex-col gap-4">
        {/* ARIA live region for error messages */}
        <div aria-live="assertive" className="sr-only">{error}</div>
        {error && <p className="text-red-600 text-sm mt-2">{error && error.replace(/'/g, "&apos;")}</p>}
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
        <label className="font-semibold text-blue-800">Password
          <input
            type="password"
            className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${touched.password && !isPasswordValid ? 'border-red-400' : 'border-blue-300'}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, password: true }))}
            required
          />
          {touched.password && !isPasswordValid && <span className="text-red-500 text-xs">Password must be at least 6 characters.</span>}
        </label>
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isFormValid || loading}
        >
          {loading ? 'Logging In…' : 'Login'}
        </button>
        <div className="text-center text-blue-700 mt-2">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>
        </div>
      </form>
    </div>
  );
} 