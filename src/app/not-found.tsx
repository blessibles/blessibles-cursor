'use client';

import Link from 'next/link';
import { useAnalytics } from '../hooks/useAnalytics';
import { useEffect, Suspense } from 'react';

function NotFoundContent() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent('404_error', {
      page: window.location.pathname,
    });
  }, [trackEvent]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-blue-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">Page Not Found</h2>
        <p className="text-blue-700 mb-8">
          Oops! The page you're looking for seems to have wandered off. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/products"
            className="bg-blue-100 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
          >
            Browse Products
          </Link>
        </div>
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-700 mb-4">
            Can't find what you're looking for? We're here to help!
          </p>
          <Link
            href="/contact"
            className="text-blue-900 font-medium hover:text-blue-800 underline"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
} 