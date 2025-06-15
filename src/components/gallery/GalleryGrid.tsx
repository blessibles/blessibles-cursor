'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { GalleryImage } from '@/types/gallery';
import ImagePreloader from './ImagePreloader';
import { useGallery } from '@/hooks/useGallery';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getOptimizedImageUrl, getImageFormat, getImageQuality, getResponsiveImageSizes } from '@/utils/imageOptimization';
import { loadImageWithRetry } from '@/utils/imageRetry';

interface GalleryGridProps {
  initialImages: GalleryImage[];
  category?: string;
}

const ITEMS_PER_PAGE = 12;
const FALLBACK_IMAGE = '/images/fallback-image.png'; // Make sure this exists in your public/images folder

export default function GalleryGrid({ initialImages, category }: GalleryGridProps) {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const { data, isLoading, isError, error } = useGallery({
    page,
    limit: ITEMS_PER_PAGE,
    category,
  });

  const { speed } = useNetworkStatus();
  const imageFormat = getImageFormat();
  const imageQuality = getImageQuality(speed);
  const [containerWidth, setContainerWidth] = useState(0);

  const images = page === 1 ? initialImages : data?.images ?? [];
  const hasMore = data?.hasMore ?? false;

  // Track loaded image URLs (with retry/fallback)
  const [imageSrcs, setImageSrcs] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const updateWidth = () => {
        setContainerWidth(containerRef.current?.offsetWidth || 0);
      };

      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, []);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, isLoading]);

  // Load/retry images when images change
  useEffect(() => {
    images.forEach((image) => {
      const optimizedUrl = getOptimizedImageUrl(image.url, {
        format: imageFormat,
        quality: imageQuality,
        width: getResponsiveImageSizes(containerWidth)[0],
      });
      if (!imageSrcs[image.id]) {
        loadImageWithRetry(optimizedUrl, {
          maxRetries: 3,
          retryDelay: 500,
          fallbackSrc: FALLBACK_IMAGE,
        }).then((src) => {
          setImageSrcs((prev) => ({ ...prev, [image.id]: src }));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, imageFormat, imageQuality, containerWidth]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    throw error;
  }

  const imageSizes = getResponsiveImageSizes(containerWidth);

  return (
    <div className="space-y-6" ref={containerRef}>
      {/* Preload next page images */}
      <ImagePreloader images={data?.images ?? []} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image: GalleryImage) => {
          const src = imageSrcs[image.id] || getOptimizedImageUrl(image.url, {
            format: imageFormat,
            quality: imageQuality,
            width: imageSizes[0],
          });

          return (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
            >
              <Link href={`/gallery/${image.id}`}>
                <div className="relative h-full w-full">
                  <Image
                    src={src}
                    alt={image.title}
                    fill
                    sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={false}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                      '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="#f3f4f6"/></svg>'
                    ).toString('base64')}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <h3 className="text-lg font-semibold">{image.title}</h3>
                    {image.description && (
                      <p className="text-sm text-gray-200 mt-1">{image.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      
      {/* Loading indicator */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
} 