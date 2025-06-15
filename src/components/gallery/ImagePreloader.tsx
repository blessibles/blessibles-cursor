'use client';

import { useEffect, useState } from 'react';
import { GalleryImage } from '@/types/gallery';

interface ImagePreloaderProps {
  images: GalleryImage[];
  preloadCount?: number;
}

export default function ImagePreloader({ images, preloadCount = 6 }: ImagePreloaderProps) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (url: string) => {
      if (preloadedImages.has(url)) return;

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, url]));
      };
    };

    // Preload next batch of images
    const nextImages = images.slice(0, preloadCount);
    nextImages.forEach(image => {
      if (!preloadedImages.has(image.url)) {
        preloadImage(image.url);
      }
    });
  }, [images, preloadCount, preloadedImages]);

  // This component doesn't render anything
  return null;
} 