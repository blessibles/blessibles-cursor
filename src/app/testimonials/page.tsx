import Testimonials from '@/components/Testimonials';

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">Customer Testimonials</h1>
        <p className="text-blue-700 mb-8 text-center">Read what our customers are saying about Blessibles and our faith-filled printables.</p>
        <Testimonials />
      </div>
    </div>
  );
} 