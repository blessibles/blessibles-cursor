'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export default function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-blue-100';
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
} 