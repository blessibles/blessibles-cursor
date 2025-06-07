"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';

interface User {
  id: string;
  email: string;
  user_metadata: {
    role?: string;
    active?: boolean;
    name?: string;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
  }>;
}

export default function SupportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium',
  });

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata || {}
        });
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/login');
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setOrder(data as Order);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { error } = await supabase
        .from('support_tickets')
        .insert([
          {
            user_id: user.id,
            order_id: orderId,
            subject: formData.subject,
            message: formData.message,
            category: formData.category,
            priority: formData.priority,
            status: 'open',
          },
        ]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        subject: '',
        message: '',
        category: 'general',
        priority: 'medium',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-blue-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Contact Support</h1>

        {order && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Order Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Order #:</span> {order.id}</p>
              <p><span className="font-medium">Status:</span> {order.status}</p>
              <p><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              Your message has been sent. We'll get back to you soon!
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-medium text-blue-800 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="general">General Inquiry</option>
                <option value="order">Order Issue</option>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="refund">Refund Request</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-blue-800 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-blue-800 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-blue-800 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 h-32"
                placeholder="Please provide details about your issue..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-blue-700">
          <p className="mb-2">Need immediate assistance?</p>
          <p>Email us at support@blessibles.com</p>
        </div>
      </div>
    </div>
  );
} 