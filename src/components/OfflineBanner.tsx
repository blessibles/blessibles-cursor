"use client";

import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="w-full bg-yellow-400 text-yellow-900 text-center py-2 font-semibold z-50">
      You are offline. Some features may be unavailable.
    </div>
  );
} 