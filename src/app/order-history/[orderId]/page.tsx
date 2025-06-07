"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../utils/supabaseClient';
import OrderTracking from '../../../components/OrderTracking';

interface OrderItem {
  downloaded_at?: string;
  product: {
    title: string;
    description: string;
    price: number;
    image_url: string;
  };
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  payment_method: string;
  shipping_address: string;
  tracking_number?: string;
  estimated_delivery?: string;
  carrier?: string;
  refunded_at?: string;
  order_items: OrderItem[];
}

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [requestingRefund, setRequestingRefund] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundsEnabled, setRefundsEnabled] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login';
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:products (
                title,
                description,
                price,
                image_url
              )
            )
          `)
          .eq('id', params.orderId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Order not found');
        
        setOrder(data);
      } catch (err: unknown) {
        let errorMsg = 'Unknown error';
        if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
          errorMsg = (err as { message: string }).message;
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [params.orderId]);

  useEffect(() => {
    // Fetch refunds_enabled flag
    const fetchRefundsEnabled = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'refunds_enabled')
        .single();
      if (!error && data && typeof data.value.enabled === 'boolean') {
        setRefundsEnabled(data.value.enabled);
      }
    };
    fetchRefundsEnabled();
  }, [params.orderId]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: params.orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      // Refresh the order details
      const { data: updatedOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              title,
              description,
              price,
              image_url
            )
          )
        `)
        .eq('id', params.orderId)
        .single();

      if (fetchError) throw fetchError;
      setOrder(updatedOrder);
      
      alert('Order cancelled successfully');
    } catch (err: unknown) {
      let errorMsg = 'Unknown error';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
        errorMsg = (err as { message: string }).message;
      }
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  const handleRefundRequest = async () => {
    if (!refundReason.trim()) {
      alert('Please provide a reason for the refund request');
      return;
    }

    setRequestingRefund(true);
    try {
      const response = await fetch('/api/orders/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: params.orderId,
          reason: refundReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund request');
      }

      // Refresh the order details
      const { data: updatedOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              title,
              description,
              price,
              image_url
            )
          )
        `)
        .eq('id', params.orderId)
        .single();

      if (fetchError) throw fetchError;
      setOrder(updatedOrder);
      
      setShowRefundModal(false);
      setRefundReason('');
      alert(data.message || 'Refund request submitted successfully');
    } catch (err: unknown) {
      let errorMsg = 'Unknown error';
      if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
        errorMsg = (err as { message: string }).message;
      }
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setRequestingRefund(false);
    }
  };

  const anyDownloaded = order?.order_items?.some((item: OrderItem) => !!item.downloaded_at);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-blue-800 text-xl">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-blue-800 text-xl">Order not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Order #{order.id}</h1>
          <Link
            href="/order-history"
            className="text-blue-700 hover:text-blue-900 font-medium"
          >
            ← Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Order Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Order Date:</span> {new Date(order.date).toLocaleDateString()}</p>
                <p><span className="font-medium">Status:</span> <span className="text-green-600">{order.status}</span></p>
                <p><span className="font-medium">Total:</span> {order.total}</p>
                <p><span className="font-medium">Payment Method:</span> {order.payment_method}</p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Shipping Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Address:</span> {order.shipping_address}</p>
                <p><span className="font-medium">Tracking Number:</span> {order.tracking_number || 'Not available'}</p>
                <p><span className="font-medium">Estimated Delivery:</span> {order.estimated_delivery || 'Not available'}</p>
              </div>
            </div>
          </div>
        </div>

        {order.tracking_number && (
          <div className="mb-6">
            <OrderTracking
              orderId={order.id}
              trackingNumber={order.tracking_number}
              carrier={order.carrier}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                {item.product?.image_url && (
                  <img
                    src={item.product.image_url}
                    alt={item.product.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900">{item.product?.title || item.title}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-gray-600">Price: {item.price}</p>
                </div>
                {item.download_url && (
                  <a
                    href={`/api/download/${item.id}`}
                    className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => window.print()}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
          >
            Print Order
          </button>
          <button
            onClick={() => window.location.href = `/support?order=${order.id}`}
            className="bg-yellow-700 text-white px-6 py-2 rounded hover:bg-yellow-800 transition"
          >
            Contact Support
          </button>
          {order.status === 'Processing' && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className={`bg-red-700 text-white px-6 py-2 rounded hover:bg-red-800 transition ${
                cancelling ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          {['Completed', 'Shipped', 'Delivered'].includes(order.status) && !order.refunded_at && refundsEnabled && !anyDownloaded && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="bg-orange-700 text-white px-6 py-2 rounded hover:bg-orange-800 transition"
            >
              Request Refund
            </button>
          )}
          {anyDownloaded && (
            <button
              disabled
              className="bg-gray-400 text-white px-6 py-2 rounded cursor-not-allowed"
              title="Refunds are not allowed after download."
            >
              Refund Not Available
            </button>
          )}
          {!refundsEnabled && (
            <button
              disabled
              className="bg-gray-400 text-white px-6 py-2 rounded cursor-not-allowed"
              title="Refunds are currently disabled."
            >
              Refunds Disabled
            </button>
          )}
        </div>

        {/* Refund Request Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Request Refund</h3>
              <div className="mb-4">
                <label className="block font-medium text-blue-800 mb-2">
                  Reason for Refund
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 h-32"
                  placeholder="Please explain why you're requesting a refund..."
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefundRequest}
                  disabled={requestingRefund || !refundReason.trim()}
                  className={`bg-orange-700 text-white px-6 py-2 rounded hover:bg-orange-800 transition ${
                    (requestingRefund || !refundReason.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {requestingRefund ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 