'use client';

// import { ReportHandler } from 'web-vitals';
type WebVitalMetric = {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating?: string;
  [key: string]: any;
};
type ReportHandler = (metric: WebVitalMetric) => void;

interface PerformanceMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

const metrics: Partial<PerformanceMetrics> = {};

export function reportWebVitals(metric: WebVitalMetric) {
  const { name, value } = metric;
  metrics[name as keyof PerformanceMetrics] = value;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}: ${value}`);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service
    sendToAnalytics(metric);
  }
}

function sendToAnalytics(metric: WebVitalMetric) {
  const { name, value, id, delta, rating } = metric;
  
  // Example: Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true,
      metric_delta: delta,
      metric_rating: rating,
    });
  }
}

// Custom performance monitoring
export function trackCustomMetric(name: string, value: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Custom Metric] ${name}: ${value}`);
  }

  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      event_category: 'Custom Metrics',
      value: Math.round(value),
      non_interaction: true,
    });
  }
}

// Track page load time
export function trackPageLoad() {
  if (typeof window === 'undefined') return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    trackCustomMetric('Page Load Time', navigation.loadEventEnd - navigation.startTime);
    trackCustomMetric('DOM Content Loaded', navigation.domContentLoadedEventEnd - navigation.startTime);
    trackCustomMetric('First Byte', navigation.responseStart - navigation.requestStart);
  }
}

// Track resource loading
export function trackResourceLoading() {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming;
      if (resource.initiatorType === 'img' || resource.initiatorType === 'script') {
        trackCustomMetric(`${resource.initiatorType} Load Time`, resource.duration);
      }
    }
  });

  observer.observe({ entryTypes: ['resource'] });
}

// Track user interactions
export function trackUserInteraction(action: string, duration: number) {
  trackCustomMetric(`User Interaction: ${action}`, duration);
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Track initial page load
  trackPageLoad();

  // Track resource loading
  trackResourceLoading();

  // Track route changes
  if (typeof window !== 'undefined') {
    const startTime = performance.now();
    window.addEventListener('popstate', () => {
      const duration = performance.now() - startTime;
      trackCustomMetric('Route Change Time', duration);
    });
  }
} 