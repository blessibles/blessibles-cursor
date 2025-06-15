"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import Testimonials from '@/components/Testimonials';

export default function TestimonialsPage() {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  // Fetch user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    if (!user) {
      setError('You must be logged in to submit a testimonial.');
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from('testimonials').insert([
      {
        user_id: user.id,
        name: user.user_metadata?.name || user.email,
        message,
        approved: false,
      },
    ]);
    if (error) {
      setError('Failed to submit testimonial.');
    } else {
      setSuccess('Thank you! Your testimonial has been submitted for review.');
      setMessage('');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">Customer Testimonials</h1>
        <p className="text-blue-700 mb-8 text-center">Read what our customers are saying about Blessibles and our faith-filled printables.</p>
        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="mb-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">Share Your Experience</h3>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your testimonial here..."
            required
            className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[60px]"
          />
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition mt-2"
            disabled={submitting || !message.trim()}
          >
            {submitting ? 'Submitting...' : 'Submit Testimonial'}
          </button>
          {success && <div className="text-green-700 mt-2">{success}</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
        <Testimonials />
      </div>
    </div>
  );
} 