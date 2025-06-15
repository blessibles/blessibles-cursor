import * as Sentry from '@sentry/nextjs';

export function loadImageWithRetry(
  src: string,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    fallbackSrc?: string;
    onSuccess?: () => void;
    onError?: () => void;
    context?: Record<string, any>;
  } = {}
): Promise<string> {
  const {
    maxRetries = 3,
    retryDelay = 500,
    fallbackSrc = '',
    onSuccess,
    onError,
    context = {},
  } = options;

  let attempts = 0;

  return new Promise((resolve) => {
    const tryLoad = () => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        onSuccess?.();
        resolve(src);
      };
      img.onerror = () => {
        attempts++;
        if (attempts < maxRetries) {
          setTimeout(tryLoad, retryDelay);
        } else {
          Sentry.captureException(new Error('Image failed to load after retries'), {
            extra: { src, attempts, ...context },
          });
          onError?.();
          resolve(fallbackSrc);
        }
      };
    };
    tryLoad();
  });
} 