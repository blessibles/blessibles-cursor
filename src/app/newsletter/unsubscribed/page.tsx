import Link from 'next/link';

export default function NewsletterUnsubscribedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-blue-600"
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
        <h1 className="text-3xl font-bold text-blue-900 mb-4">You&apos;ve Unsubscribed</h1>
        <p className="text-blue-700 mb-6">
          You have been successfully unsubscribed from the Blessibles newsletter.
          We're sorry to see you go! If you change your mind, you can always
          resubscribe through our website.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition"
          >
            Return to Homepage
          </Link>
          <p className="text-sm text-gray-600">
            Changed your mind?{' '}
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Resubscribe here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 