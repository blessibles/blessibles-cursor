import React, { useEffect, useState } from 'react';
import { SearchableItem } from '../utils/search';
import { Recommendation, getUserRecommendations, getSimilarProducts, getTrendingProducts } from '../utils/recommendations';
import ProductCardClientWrapper from './ProductCardClientWrapper';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../hooks/useSupabase';
import { Product } from '@/types';

interface ProductRecommendationsProps {
  userId?: string;
  productId?: string;
  type: 'personal' | 'similar' | 'trending' | 'scripture';
  limit?: number;
  title?: string;
  className?: string;
}

export default function ProductRecommendations({
  userId,
  productId,
  type,
  limit = 4,
  title,
  className = ''
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        let recommendations: Product[] = [];
        switch (type) {
          case 'personal':
            if (!userId) {
              throw new Error('User ID is required for personal recommendations');
            }
            const userRecs = await getUserRecommendations(userId, limit);
            // Fetch full product details for each recommendation
            const { data: personalProducts, error: personalError } = await supabase
              .from('products')
              .select('*')
              .in('id', userRecs.map(r => r.product_id));
            
            if (personalError) {
              throw new Error(`Error fetching personal products: ${personalError.message}`);
            }
            
            recommendations = personalProducts || [];
            break;

          case 'similar':
            if (!productId) {
              throw new Error('Product ID is required for similar products');
            }
            recommendations = await getSimilarProducts(productId, limit);
            break;

          case 'trending':
            recommendations = await getTrendingProducts(limit);
            break;

          case 'scripture':
            if (!productId) {
              throw new Error('Product ID is required for scripture-based recommendations');
            }
            const { getScriptureBasedRecommendations } = await import('../utils/recommendations');
            recommendations = await getScriptureBasedRecommendations(productId, limit);
            break;
        }

        if (!recommendations || recommendations.length === 0) {
          setError(`No ${type} recommendations available at this time`);
        } else {
          setProducts(recommendations);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, productId, type, limit, supabase]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-2xl font-bold text-blue-900">{title || 'Loading recommendations...'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
              <div className="h-4 bg-gray-200 rounded mt-2"></div>
              <div className="h-4 bg-gray-200 rounded mt-2 w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 ${className}`}>
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-2xl font-bold text-blue-900">
        {title || {
          personal: 'Recommended for You',
          similar: 'You May Also Like',
          trending: 'Trending Now',
          scripture: 'Scripture-based Recommendations',
        }[type]}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCardClientWrapper
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}