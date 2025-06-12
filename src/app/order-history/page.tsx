 "use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

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

const OrderHistoryPage = () => {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (userId) {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        setFilteredOrders(ordersData || []);
      }
    };
    fetchOrders();
  }, []);

  const handleDownloadReceipt = (orderId: string) => {
    console.log('Downloading receipt for order:', orderId);
  };

  const handleContactSupport = (orderId: string) => {
    console.log('Contacting support for order:', orderId);
  };

  const handleRateAndReview = (orderId: string) => {
    console.log('Rating and reviewing order:', orderId);
  };

  const handleReorder = (orderId: string) => {
    console.log('Reordering items from order:', orderId);
  };

  const handleShare = (orderId: string) => {
    console.log('Sharing order:', orderId);
  };

  const handlePrint = (orderId: string) => {
    console.log('Printing order:', orderId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Order History</h1>
        
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No orders found.
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-800">Order #{order.id}</h2>
                    <p className="text-gray-600">Date: {new Date(order.date).toLocaleDateString()}</p>
                    <p className="text-gray-600">Total: ${order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadReceipt(order.id)}
                      className="bg-blue-700 text-white py-2 px-4 rounded font-semibold hover:bg-blue-800 transition"
                    >
                      Download Receipt
                    </button>
                    <button
                      onClick={() => handleContactSupport(order.id)}
                      className="bg-gray-100 text-gray-700 py-2 px-4 rounded font-semibold hover:bg-gray-200 transition"
                    >
                      Contact Support
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
                  <div className="space-y-2">
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-medium">{item.product.title}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-gray-700">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-4 mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRateAndReview(order.id)}
                    className="text-blue-700 hover:text-blue-800 font-medium"
                  >
                    Rate & Review
                  </button>
                  <button
                    onClick={() => handleReorder(order.id)}
                    className="text-blue-700 hover:text-blue-800 font-medium"
                  >
                    Reorder
                  </button>
                  <button
                    onClick={() => handleShare(order.id)}
                    className="text-blue-700 hover:text-blue-800 font-medium"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => handlePrint(order.id)}
                    className="text-blue-700 hover:text-blue-800 font-medium"
                  >
                    Print
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;