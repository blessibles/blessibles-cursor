'use client';

import { useEffect, useState } from 'react';
import { onCLS, onINP, onLCP } from 'web-vitals';

interface PerformanceData {
  CLS: number;
  INP: number;
  LCP: number;
  pageLoad: number;
  resourceLoad: { [key: string]: number };
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceData>({
    CLS: 0,
    INP: 0,
    LCP: 0,
    pageLoad: 0,
    resourceLoad: {},
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Track Web Vitals
    onCLS(console.log);
    onINP(console.log);
    onLCP(console.log);

    // Track page load
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      setMetrics(prev => ({
        ...prev,
        pageLoad: navigation.loadEventEnd - navigation.startTime,
      }));
    }

    // Track resource loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.initiatorType === 'img' || resourceEntry.initiatorType === 'script') {
          setMetrics(prev => ({
            ...prev,
            resourceLoad: {
              ...prev.resourceLoad,
              [entry.name]: entry.duration,
            },
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
      <div className="space-y-2">
        <div>
          <span className="font-medium">CLS:</span> {metrics.CLS.toFixed(3)}
        </div>
        <div>
          <span className="font-medium">INP:</span> {metrics.INP.toFixed(2)}ms
        </div>
        <div>
          <span className="font-medium">LCP:</span> {metrics.LCP.toFixed(2)}ms
        </div>
        <div>
          <span className="font-medium">Page Load:</span> {metrics.pageLoad.toFixed(2)}ms
        </div>
        <div className="mt-4">
          <h4 className="font-medium mb-1">Resource Loading:</h4>
          {Object.entries(metrics.resourceLoad).map(([name, duration]) => (
            <div key={name} className="text-sm">
              {name}: {duration.toFixed(2)}ms
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 