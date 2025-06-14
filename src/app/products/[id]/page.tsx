"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProductRecommendations from '../../../components/ProductRecommendations';
import { useCart } from '../../../app/layout';
import { supabase } from '../../../utils/supabaseClient';
import { AddToCollection } from '@/components/AddToCollection';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [resolvedParams.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Product not found</h1>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 mt-4"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
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
            <button
              onClick={() => addToCart(product)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
            <AddToCollection productId={product.id} />
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
        </div>
      </div>

      {/* Scripture-based Recommendations */}
      <ProductRecommendations
        productId={resolvedParams.id}
        type="scripture"
        title="Scripture-based Recommendations"
        className="mt-12"
      />

      <ProductRecommendations
        productId={resolvedParams.id}
        type="similar"
        title="You May Also Like"
        className="mt-12"
      />
    </div>
  );
} 