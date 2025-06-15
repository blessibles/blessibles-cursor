"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import Image from 'next/image';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import GalleryErrorBoundary from '@/components/gallery/GalleryErrorBoundary';

const GalleryGrid = dynamic(() => import('@/components/gallery/GalleryGrid'), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-gray-100 rounded-lg animate-pulse"
        />
      ))}
    </div>
  ),
  ssr: false,
});

const ITEMS_PER_PAGE = 12;

export default async function GalleryPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: initialImages, error } = await supabase
    .from('gallery')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(ITEMS_PER_PAGE);

  if (error) {
    console.error('Error fetching gallery images:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gallery</h1>
        <p className="text-red-500">Error loading gallery images. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <Link
          href="/gallery/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          Upload Image
        </Link>
      </div>
      <GalleryErrorBoundary>
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        }>
          <GalleryGrid initialImages={initialImages} />
        </Suspense>
      </GalleryErrorBoundary>
    </div>
  );
} 