"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';

interface Order {
  id: string;
  date: string;
  total: string;
  status: string;
}

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
      if (userData.user) {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('date', { ascending: false });
        setOrders(ordersData || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Order History</h1>
          <p className="mb-4 text-blue-700">Please <Link href="/login" className="text-blue-600 underline hover:text-blue-800">log in</Link> to view your orders.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Order History</h1>
        {loading ? (
          <div className="text-blue-700">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-blue-700">You have no orders yet.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Order ID</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Total</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-blue-50">
                  <td className="py-2 px-4 border-b font-mono text-xs">{order.id}</td>
                  <td className="py-2 px-4 border-b">{order.date ? new Date(order.date).toLocaleDateString() : '-'}</td>
                  <td className="py-2 px-4 border-b">{order.total}</td>
                  <td className="py-2 px-4 border-b">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
};

export default OrderHistoryPage;