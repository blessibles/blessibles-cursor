"use client";
import React, { useEffect } from "react";
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white p-8 rounded shadow text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Something went wrong</h1>
        <p className="mb-4 text-blue-700">An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.</p>
        <button
          className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition"
          onClick={() => reset()}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
} 