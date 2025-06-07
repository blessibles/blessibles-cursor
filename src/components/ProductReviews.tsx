import React, { useState } from 'react';
import reviewsData from '../data/reviews';
import { Review } from '../types/review';

interface ProductReviewsProps {
  productId: string;
}

function getAverageRating(reviews: Review[]) {
  if (reviews.length === 0) return 0;
  return (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(
    reviewsData.filter((r) => r.productId === productId)
  );
  const [reviewer, setReviewer] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const avgRating = getAverageRating(reviews);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const newReview: Review = {
      id: `r${Date.now()}`,
      productId,
      reviewer: reviewer || 'Anonymous',
      rating,
      comment,
      date: new Date().toISOString().slice(0, 10),
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewer('');
    setRating(5);
    setComment('');
    setSubmitting(false);
    setReviewMessage('Review submitted successfully.');
    setTimeout(() => setReviewMessage(''), 3000);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 text-xl">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
          <span className="text-blue-900 font-semibold">{avgRating.toFixed(1)} / 5</span>
          <span className="text-blue-900">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mb-8 bg-blue-50 p-4 rounded-lg">
        <div aria-live="polite" className="sr-only">{reviewMessage}</div>
        <h3 className="font-bold text-blue-900 mb-2">Leave a Review</h3>
        <div className="flex flex-col gap-2 mb-2">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex items-center gap-2">
            <label className="text-blue-900 font-medium">Rating:</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>{star} Star{star > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            className="px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[80px]"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition"
          disabled={submitting || !comment.trim()}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-blue-700">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-yellow-600">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                <span className="text-blue-900 font-medium">{review.reviewer}</span>
                <span className="text-blue-900 text-xs">{review.date}</span>
              </div>
              <p className="text-blue-900">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 