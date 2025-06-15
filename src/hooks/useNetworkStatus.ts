'use client';

import { useState, useEffect } from 'react';

type NetworkSpeed = 'slow-2g' | '2g' | '3g' | '4g';

interface NetworkStatus {
  isOnline: boolean;
  speed: NetworkSpeed;
  effectiveType: string;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    speed: '4g',
    effectiveType: '4g',
  });

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      
      if (connection) {
        setStatus({
          isOnline: navigator.onLine,
          speed: connection.effectiveType as NetworkSpeed,
          effectiveType: connection.effectiveType,
        });
      } else {
        setStatus({
          isOnline: navigator.onLine,
          speed: '4g',
          effectiveType: '4g',
        });
      }
    };

    // Initial check
    updateNetworkStatus();

    // Add event listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return status;
} 