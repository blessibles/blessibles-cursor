"use client";
import Link from 'next/link';
import products from '../../data/products';

// Mock activity log data
const mockActivity = [
  { type: 'Purchase', productId: '1', date: '2024-06-01' },
  { type: 'Download', productId: '1', date: '2024-06-01' },
  { type: 'Review', productId: '1', date: '2024-06-02', details: '5 stars: Beautiful wall art!' },
  { type: 'Purchase', productId: '2', date: '2024-06-03' },
  { type: 'Download', productId: '2', date: '2024-06-03' },
  { type: 'Review', productId: '2', date: '2024-06-04', details: '5 stars: Wonderful journal.' },
];

export default function ActivityLogPage() {
  // Mock auth: assume user is logged in
  const isLoggedIn = true;

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Activity Log</h1>
          <p className="mb-4 text-blue-700">Please <Link href="/login" className="text-blue-600 underline hover:text-blue-800">log in</Link> to view your activity log.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">My Activity Log</h1>
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 text-blue-800">Type</th>
              <th className="py-2 px-4 text-blue-800">Product</th>
              <th className="py-2 px-4 text-blue-800">Date</th>
              <th className="py-2 px-4 text-blue-800">Details</th>
            </tr>
          </thead>
          <tbody>
            {mockActivity.map((activity, idx) => {
              const product = products.find((p) => p.id === activity.productId);
              return (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-2 px-4">{activity.type}</td>
                  <td className="py-2 px-4">{product ? product.title : 'Unknown Product'}</td>
                  <td className="py-2 px-4">{activity.date}</td>
                  <td className="py-2 px-4">{activity.details || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
} 