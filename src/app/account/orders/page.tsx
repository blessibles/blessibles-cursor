'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import DownloadButton from '@/components/DownloadButton';
import AccountSidebar from '@/components/AccountSidebar';

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  order_items: Array<{
    id: string;
    product_id: string;
    title: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            total,
            status,
            order_items (
              id,
              product_id,
              title,
              quantity,
              price
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(data || []);
      } catch (err) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4 w-full">
            <AccountSidebar />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">My Orders</h1>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">You haven't placed any orders yet.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4 w-full">
          <AccountSidebar />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-blue-900 mb-6">My Orders</h1>
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-blue-900">
                        Order #{order.id}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-blue-900">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{order.status}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Items</h3>
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2"
                      >
                        <div>
                          <p className="font-medium text-blue-900">{item.title}</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <DownloadButton
                            orderId={order.id}
                            productId={item.product_id}
                            productName={item.title}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 