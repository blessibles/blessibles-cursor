import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProductRecommendationsClientWrapper from '../../../components/ProductRecommendationsClientWrapper';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '../../../utils/supabaseClient';
import AddToCollectionClientWrapper from '@/components/AddToCollectionClientWrapper';
import Link from 'next/link';
import AddToCartClient from '@/components/AddToCartClient';
import SocialShareClient from '@/components/SocialShareClient';

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Fetch product data from Supabase
  let product = null;
  let error = null;
  try {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();
    if (fetchError) throw fetchError;
    product = data;
  } catch (err: any) {
    error = err.message || 'Failed to load product';
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Product not found</h1>
          <Link href="/products" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: product.category, href: `/categories/${product.category}` },
    { label: product.name, href: `/products/${product.id}` },
  ];

  // Social share URLs
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShare = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`;
  const pinterestShare = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(product.image_url || '/placeholder.png')}&description=${encodeURIComponent(product.name)}`;

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-blue-700 flex gap-2 items-center">
        {breadcrumbs.map((crumb, idx) => (
          <span key={crumb.href} className="flex items-center">
            <Link href={crumb.href} className="hover:underline">
              {crumb.label}
            </Link>
            {idx < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
          </span>
        ))}
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-96">
          <Image
            src={product.image_url || '/placeholder.png'}
            alt={product.name || 'Product image'}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">{product.name}</h1>
            <p className="text-2xl font-semibold text-blue-700 mt-2">
              ${product.price.toFixed(2)}
            </p>
          </div>
          <p className="text-gray-600">{product.description}</p>
          <div className="flex flex-wrap gap-4">
            <AddToCartClient product={product} />
            <AddToCollectionClientWrapper productId={product.id} />
          </div>
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* Social Sharing */}
          <SocialShareClient
            shareUrl={shareUrl}
            facebookShare={facebookShare}
            twitterShare={twitterShare}
            pinterestShare={pinterestShare}
          />
          {/* Reviews/Ratings Placeholder */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Reviews & Ratings</h2>
            <p className="text-gray-500">Reviews and ratings coming soon!</p>
          </div>
        </div>
      </div>
      {/* Scripture-based Recommendations */}
      <ProductRecommendationsClientWrapper
        productId={product.id}
        type="scripture"
        title="Scripture-based Recommendations"
        className="mt-12"
      />
      <ProductRecommendationsClientWrapper
        productId={product.id}
        type="similar"
        title="You May Also Like"
        className="mt-12"
      />
    </div>
  );
} 