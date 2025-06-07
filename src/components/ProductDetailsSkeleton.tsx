'use client';

import Skeleton from './Skeleton';

export default function ProductDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <Skeleton className="w-full h-96" variant="rectangular" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-24" variant="rectangular" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <Skeleton className="w-3/4 h-8" />
          <Skeleton className="w-1/4 h-6" />
          <div className="space-y-2">
            <Skeleton className="w-full" />
            <Skeleton className="w-full" />
            <Skeleton className="w-2/3" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="w-32 h-10" variant="rectangular" />
            <Skeleton className="w-32 h-10" variant="rectangular" />
          </div>
          <div className="pt-6 border-t">
            <Skeleton className="w-1/3 h-6 mb-4" />
            <div className="space-y-2">
              <Skeleton className="w-full" />
              <Skeleton className="w-full" />
              <Skeleton className="w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 