'use client';

import Skeleton from './Skeleton';

export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4">
          <Skeleton className="w-full h-48 mb-4" variant="rectangular" />
          <Skeleton className="w-3/4 mb-2" />
          <Skeleton className="w-1/2 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="w-20 h-8" variant="rectangular" />
            <Skeleton className="w-24 h-8" variant="rectangular" />
          </div>
        </div>
      ))}
    </div>
  );
} 