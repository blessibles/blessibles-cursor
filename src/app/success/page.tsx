"use client";
import React from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">Thank You for Your Order!</h1>
      <p className="text-lg text-gray-700 mb-6">Your order has been successfully placed.</p>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Order Details</h2>
        <p className="text-gray-600">Order ID: #12345</p>
        <p className="text-gray-600">Total: $10.00</p>
      </div>
      <Link href="/order-history" className="text-blue-600 hover:underline mb-4">View Order History</Link>
      <Link href="/" className="text-blue-600 hover:underline">Return to Home</Link>
    </div>
  );
} 