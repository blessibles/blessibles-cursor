import Link from 'next/link';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 w-full">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-10 text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">Browse Categories</h1>
        <p className="text-blue-700 mb-8">This page is coming soon! You'll be able to explore all product categories here.</p>
        <Link
          href="/"
          className="inline-block bg-blue-700 text-white px-6 py-3 rounded font-semibold hover:bg-blue-800 transition"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
} 