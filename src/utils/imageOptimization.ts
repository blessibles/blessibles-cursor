interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const { width, height, quality = 80, format } = options;
  const url = new URL(originalUrl);

  // Add width parameter if specified
  if (width) {
    url.searchParams.set('w', width.toString());
  }

  // Add height parameter if specified
  if (height) {
    url.searchParams.set('h', height.toString());
  }

  // Add quality parameter
  url.searchParams.set('q', quality.toString());

  // Add format parameter if specified
  if (format) {
    url.searchParams.set('fm', format);
  }

  return url.toString();
}

export function getResponsiveImageSizes(containerWidth: number): number[] {
  // Generate sizes for different breakpoints
  const sizes = [
    containerWidth, // Full width
    Math.min(containerWidth, 1024), // Large screens
    Math.min(containerWidth, 768), // Medium screens
    Math.min(containerWidth, 480), // Small screens
  ];

  // Remove duplicates and sort in descending order
  return [...new Set(sizes)].sort((a, b) => b - a);
}

export function getImageFormat(): 'webp' | 'avif' | 'jpeg' {
  // Check if the browser supports WebP
  const webpSupport = typeof window !== 'undefined' && 
    window.navigator.userAgent.includes('Chrome') ||
    window.navigator.userAgent.includes('Firefox') ||
    window.navigator.userAgent.includes('Safari');

  // Check if the browser supports AVIF
  const avifSupport = typeof window !== 'undefined' && 
    window.navigator.userAgent.includes('Chrome') ||
    window.navigator.userAgent.includes('Firefox');

  if (avifSupport) {
    return 'avif';
  } else if (webpSupport) {
    return 'webp';
  } else {
    return 'jpeg';
  }
}

export function getImageQuality(networkSpeed?: 'slow-2g' | '2g' | '3g' | '4g'): number {
  if (!networkSpeed) {
    return 80; // Default quality
  }

  switch (networkSpeed) {
    case 'slow-2g':
    case '2g':
      return 40; // Lower quality for slow connections
    case '3g':
      return 60; // Medium quality for 3G
    case '4g':
      return 80; // High quality for 4G
    default:
      return 80;
  }
} 