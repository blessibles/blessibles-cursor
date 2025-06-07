"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
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
  total: number;
  order_items: OrderItem[];
}

export default function OrderHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Get the logged-in user from Supabase
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    // Fetch orders for the logged-in user
    const fetchOrders = async () => {
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
    };
    fetchOrders();
  }, []);

  if (!user) {
    return null;
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase());
    const orderDate = new Date(order.date);
    const afterStart = !startDate || orderDate >= new Date(startDate);
    const beforeEnd = !endDate || orderDate <= new Date(endDate);
    return matchesSearch && afterStart && beforeEnd;
  });

  const handleDownloadReceipt = (orderId: string) => {
    // Placeholder for downloading receipt
    alert(`Downloading receipt for order #${orderId}`);
  };

  const handleContactSupport = (orderId: string) => {
    // Placeholder for contacting customer support
    alert(`Contacting support for order #${orderId}`);
  };

  const handleRateAndReview = (orderId: string) => {
    // Placeholder for rating and reviewing the order
    alert(`Rating and reviewing order #${orderId}`);
  };

  const handleReorder = (orderId: string) => {
    // Placeholder for reordering items
    alert(`Reordering items from order #${orderId}`);
  };

  const handleShare = (orderId: string) => {
    // Placeholder for sharing order details
    alert(`Sharing order #${orderId} on social media`);
  };

  const handlePrint = (orderId: string) => {
    // Placeholder for printing order details
    alert(`Printing details for order #${orderId}`);
  };

  const handleCancel = (orderId: string) => {
    // Placeholder for canceling the order
    alert(`Canceling order #${orderId}`);
  };

  const handleRefund = (orderId: string) => {
    // Placeholder for requesting a refund
    alert(`Requesting refund for order #${orderId}`);
  };

  const handleTrackShipping = (orderId: string) => {
    // Placeholder for tracking shipping status
    alert(`Tracking shipping status for order #${orderId}`);
  };

  const handleReportIssue = (orderId: string) => {
    // Placeholder for reporting an issue
    alert(`Reporting an issue for order #${orderId}`);
  };

  const handleViewAddress = (orderId: string) => {
    // Placeholder for viewing delivery address
    alert(`Viewing delivery address for order #${orderId}`);
  };

  const handleUpdateAddress = (orderId: string) => {
    // Placeholder for updating delivery address
    alert(`Updating delivery address for order #${orderId}`);
  };

  const handleViewPaymentMethod = (orderId: string) => {
    // Placeholder for viewing payment method
    alert(`Viewing payment method for order #${orderId}`);
  };

  const handleUpdatePaymentMethod = (orderId: string) => {
    // Placeholder for updating payment method
    alert(`Updating payment method for order #${orderId}`);
  };

  const handleViewDeliveryDate = (orderId: string) => {
    // Placeholder for viewing estimated delivery date
    alert(`Viewing estimated delivery date for order #${orderId}`);
  };

  const handleUpdateDeliveryDate = (orderId: string) => {
    // Placeholder for updating estimated delivery date
    alert(`Updating estimated delivery date for order #${orderId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">Order History</h1>
      <div className="flex flex-col md:flex-row gap-2 mb-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Search by Order ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="w-full max-w-md">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 text-center text-gray-500">
            No orders found.
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h2 className="text-xl font-semibold text-blue-800">Order #{order.id}</h2>
              <p className="text-gray-600">Date: {order.date}</p>
              <p className="text-gray-600">Total: {order.total}</p>
              <button
                onClick={() => handleDownloadReceipt(order.id)}
                className="mt-2 bg-blue-700 text-white py-1 px-3 rounded font-semibold hover:bg-blue-800 transition"
              >
                Download Receipt
              </button>
              <Link
                href={`/order-history/${order.id}`}
                className="mt-2 ml-2 bg-green-700 text-white py-1 px-3 rounded font-semibold hover:bg-green-800 transition inline-block"
              >
                View Details
              </Link>
              <button
                onClick={() => handleContactSupport(order.id)}
                className="mt-2 ml-2 bg-yellow-700 text-white py-1 px-3 rounded font-semibold hover:bg-yellow-800 transition"
              >
                Contact Support
              </button>
              <button
                onClick={() => handleRateAndReview(order.id)}
                className="mt-2 ml-2 bg-purple-700 text-white py-1 px-3 rounded font-semibold hover:bg-purple-800 transition"
              >
                Rate & Review
              </button>
              <button
                onClick={() => handleReorder(order.id)}
                className="mt-2 ml-2 bg-indigo-700 text-white py-1 px-3 rounded font-semibold hover:bg-indigo-800 transition"
              >
                Reorder
              </button>
              <button
                onClick={() => handleShare(order.id)}
                className="mt-2 ml-2 bg-pink-700 text-white py-1 px-3 rounded font-semibold hover:bg-pink-800 transition"
              >
                Share
              </button>
              <button
                onClick={() => handlePrint(order.id)}
                className="mt-2 ml-2 bg-gray-700 text-white py-1 px-3 rounded font-semibold hover:bg-gray-800 transition"
              >
                Print
              </button>
              <button
                onClick={() => handleCancel(order.id)}
                className="mt-2 ml-2 bg-red-700 text-white py-1 px-3 rounded font-semibold hover:bg-red-800 transition"
              >
                Cancel Order
              </button>
              <button
                onClick={() => handleRefund(order.id)}
                className="mt-2 ml-2 bg-orange-700 text-white py-1 px-3 rounded font-semibold hover:bg-orange-800 transition"
              >
                Request Refund
              </button>
              <button
                onClick={() => handleTrackShipping(order.id)}
                className="mt-2 ml-2 bg-teal-700 text-white py-1 px-3 rounded font-semibold hover:bg-teal-800 transition"
              >
                Track Shipping
              </button>
              <button
                onClick={() => handleReportIssue(order.id)}
                className="mt-2 ml-2 bg-red-500 text-white py-1 px-3 rounded font-semibold hover:bg-red-600 transition"
              >
                Report Issue
              </button>
              <button
                onClick={() => handleViewAddress(order.id)}
                className="mt-2 ml-2 bg-blue-500 text-white py-1 px-3 rounded font-semibold hover:bg-blue-600 transition"
              >
                View Address
              </button>
              <button
                onClick={() => handleUpdateAddress(order.id)}
                className="mt-2 ml-2 bg-green-500 text-white py-1 px-3 rounded font-semibold hover:bg-green-600 transition"
              >
                Update Address
              </button>
              <button
                onClick={() => handleViewPaymentMethod(order.id)}
                className="mt-2 ml-2 bg-yellow-500 text-white py-1 px-3 rounded font-semibold hover:bg-yellow-600 transition"
              >
                View Payment Method
              </button>
              <button
                onClick={() => handleUpdatePaymentMethod(order.id)}
                className="mt-2 ml-2 bg-yellow-400 text-white py-1 px-3 rounded font-semibold hover:bg-yellow-500 transition"
              >
                Update Payment Method
              </button>
              <button
                onClick={() => handleViewDeliveryDate(order.id)}
                className="mt-2 ml-2 bg-blue-400 text-white py-1 px-3 rounded font-semibold hover:bg-blue-500 transition"
              >
                View Delivery Date
              </button>
              <button
                onClick={() => handleUpdateDeliveryDate(order.id)}
                className="mt-2 ml-2 bg-blue-300 text-white py-1 px-3 rounded font-semibold hover:bg-blue-400 transition"
              >
                Update Delivery Date
              </button>
            </div>
          ))
        )}
      </div>
      <Link href="/" className="text-blue-600 hover:underline mt-4">Return to Home</Link>
    </div>
  );
} 