"use client";
import { useEffect, useState } from 'react';
import products from '../../data/products';
import Link from 'next/link';
import Image from 'next/image';

// Mock: pretend these are the user's purchased product IDs
const mockPurchasedProductIds = ['1', '2'];

export default function LibraryPage() {
  // In a real app, fetch purchased product IDs for the logged-in user
  const [purchased, setPurchased] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  // Mock auth: assume user is logged in
  const isLoggedIn = true;

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setPurchased(mockPurchasedProductIds);
      setLoading(false);
    }, 500);
  }, []);

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">My Library</h1>
          <p className="mb-4 text-blue-700">Please <Link href="/login" className="text-blue-600 underline hover:text-blue-800">log in</Link> to view your purchased printables.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">My Library</h1>
      {loading ? (
        <div className="text-blue-700">Loading your purchases...</div>
      ) : purchased.length === 0 ? (
        <div className="text-blue-700 text-lg">You have not purchased any printables yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
          {products.filter((p) => purchased.includes(p.id)).map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
              <Image src={product.imageUrl} alt={product.title} width={128} height={128} className="w-32 h-32 object-contain mb-3" loading="lazy" />
              <h3 className="font-semibold text-blue-800 mb-1 text-center">{product.title}</h3>
              <p className="text-sm text-blue-600 mb-2 text-center">{product.description}</p>
              <a
                href={"/downloads/" + product.id}
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition mt-2"
                download
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
} 