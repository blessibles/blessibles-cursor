"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import ProductRecommendations from '../../components/ProductRecommendations';
import CollectionManager from '../../components/CollectionManager';
import AccountSidebar from '@/components/AccountSidebar';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  download_url?: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  order_items: OrderItem[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const router = useRouter();

  // Profile/account state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false });
  const [success, setSuccess] = useState(false);

  // Password update state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState({ new: false, confirm: false });
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    // Get the logged-in user from Supabase
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setName(data.user?.user_metadata?.name || '');
      setEmail(data.user?.email || '');
    };
    getUser();
  }, []);

  useEffect(() => {
    // Fetch orders for the logged-in user
    const fetchOrders = async () => {
      setLoadingOrders(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (userId) {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        setOrders(ordersData || []);
      }
      setLoadingOrders(false);
    };
    fetchOrders();
  }, []);

  if (!user) {
    return null;
  }

  const isNameValid = name.trim().length > 0;
  const isEmailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const isFormValid = isNameValid && isEmailValid;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;
    // In a real app, update user metadata in backend
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  // Password validation
  const isPasswordValid = newPassword.length >= 6;
  const doPasswordsMatch = newPassword === confirmPassword;
  const isPasswordFormValid = isPasswordValid && doPasswordsMatch && newPassword.length > 0;

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isPasswordFormValid) return;
    // In a real app, update password in backend
    setNewPassword('');
    setConfirmPassword('');
    setPasswordTouched({ new: false, confirm: false });
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 2000);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4 w-full">
          <AccountSidebar />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">Your Profile</h1>
          {/* Profile Information */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 w-full max-w-md flex flex-col gap-4 mb-8">
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
              type="submit"
              className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid}
            >
              Save Changes
            </button>
            {success && <div className="text-green-700 text-center font-semibold mt-2">Profile updated!</div>}
          </form>
          {/* Password Update */}
          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg shadow-md p-8 w-full max-w-md flex flex-col gap-4 mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-2">Change Password</h2>
            <label className="font-semibold text-blue-800">New Password
              <input
                type="password"
                className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${passwordTouched.new && !isPasswordValid ? 'border-red-400' : 'border-blue-300'}`}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                onBlur={() => setPasswordTouched(t => ({ ...t, new: true }))}
                required
              />
              {passwordTouched.new && !isPasswordValid && <span className="text-red-500 text-xs">Password must be at least 6 characters.</span>}
            </label>
            <label className="font-semibold text-blue-800">Confirm New Password
              <input
                type="password"
                className={`mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 ${passwordTouched.confirm && !doPasswordsMatch ? 'border-red-400' : 'border-blue-300'}`}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onBlur={() => setPasswordTouched(t => ({ ...t, confirm: true }))}
                required
              />
              {passwordTouched.confirm && !doPasswordsMatch && <span className="text-red-500 text-xs">Passwords do not match.</span>}
            </label>
            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isPasswordFormValid}
            >
              Update Password
            </button>
            {passwordSuccess && <div className="text-green-700 text-center font-semibold mt-2">Password updated!</div>}
          </form>
          {/* Order History */}
          <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md flex flex-col gap-4 mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-2">Recent Orders</h2>
            {loadingOrders ? (
              <div className="text-gray-500 italic">Loading orders…</div>
            ) : orders.length === 0 ? (
              <div className="text-gray-500 italic">No orders found.</div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map(order => (
                  <div key={order.id} className="border-b last:border-b-0 pb-2 mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <span className="font-semibold text-blue-800">Order #{order.id}</span>
                      <span className="ml-2 text-gray-600 text-sm">{order.date ? new Date(order.date).toLocaleDateString() : ''}</span>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <span className="text-blue-900 font-medium">${order.total.toFixed(2)}</span>
                      <span className="text-xs text-gray-500 capitalize">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <a href="/account/orders" className="mt-2 text-blue-700 hover:underline text-sm font-medium self-end">View all orders & downloads →</a>
          </div>
        </div>
      </div>
    </div>
  );
} 