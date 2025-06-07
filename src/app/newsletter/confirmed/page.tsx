import Link from 'next/link';

export default function NewsletterConfirmedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-blue-900 mb-4">You&apos;re Subscribed!</h1>
        <p className="text-blue-700 mb-6">
          Thank you for confirming your subscription to the Blessibles newsletter.
          You'll now receive our latest updates, printables, and special offers.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
} 