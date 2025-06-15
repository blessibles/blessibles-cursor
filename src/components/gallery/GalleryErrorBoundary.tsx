'use client';

import ErrorBoundary from '../ErrorBoundary';

interface GalleryErrorBoundaryProps {
  children: React.ReactNode;
}

export default function GalleryErrorBoundary({ children }: GalleryErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Gallery Error
          </h3>
          <p className="text-gray-600 mb-4">
            We're having trouble loading the gallery. This might be due to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Network connectivity issues</li>
            <li>Image loading problems</li>
            <li>Temporary server issues</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Please try refreshing the page or come back later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Refresh Page
          </button>
        </div>
      }
      onError={(error, errorInfo) => {
        // Log error to your error tracking service
        console.error('Gallery error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
} 