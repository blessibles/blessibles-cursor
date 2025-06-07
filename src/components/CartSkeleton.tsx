'use client';

import Skeleton from './Skeleton';

export default function CartSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton className="w-48 h-8 mb-8" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-4 items-center">
            <Skeleton className="w-24 h-24" variant="rectangular" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-3/4" />
              <Skeleton className="w-1/4" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="w-8 h-8" variant="circular" />
              <Skeleton className="w-8 h-8" variant="circular" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="w-32" />
          <Skeleton className="w-24" />
        </div>
        <Skeleton className="w-full h-12" variant="rectangular" />
      </div>
    </div>
  );
} 