'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: {
        page_path?: string;
        page_location?: string;
        page_title?: string;
        [key: string]: any;
      }
    ) => void;
  }
}

export function useAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = pathname + searchParams.toString();
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
          page_path: url,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    }
  }, [pathname, searchParams]);

  const trackEvent = (action: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', action, params);
    }
  };

  return { trackEvent };
} 