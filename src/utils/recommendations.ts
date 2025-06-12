import { supabase } from './supabaseClient';
import { SearchableItem } from './search';

export type InteractionType = 'view' | 'wishlist' | 'purchase' | 'cart_add' | 'cart_remove';

export interface UserInteraction {
  id: string;
  user_id: string;
  product_id: string;
  interaction_type: InteractionType;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Recommendation {
  product_id: string;
  score: number;
  reason: string;
}

export async function trackUserInteraction(
  userId: string,
  productId: string,
  interactionType: InteractionType,
  metadata?: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('user_interactions')
    .insert({
      user_id: userId,
      product_id: productId,
      interaction_type: interactionType,
      metadata: metadata || {}
    });

  if (error) {
    console.error('Error tracking user interaction:', error);
    throw error;
  }
}

export async function getUserRecommendations(
  userId: string,
  limit: number = 5
): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .rpc('get_user_recommendations', {
      user_id: userId,
      limit_count: limit
    });

  if (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }

  return data as Recommendation[];
}

export async function getSimilarProducts(
  productId: string,
  limit: number = 4
): Promise<SearchableItem[]> {
  // Get the product's category and tags
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('category, tags')
    .eq('id', productId)
    .single();

  if (productError) {
    console.error('Error getting product details:', productError);
    throw productError;
  }

  // Find products in the same category or with similar tags
  const { data: similarProducts, error: similarError } = await supabase
    .from('products')
    .select('*')
    .neq('id', productId)
    .or(`category.eq.${product.category},tags.cs.{${product.tags.join(',')}}`)
    .limit(limit);

  if (similarError) {
    console.error('Error getting similar products:', similarError);
    throw similarError;
  }

  return similarProducts as SearchableItem[];
}

export async function getTrendingProducts(
  limit: number = 4,
  timeFrame: 'day' | 'week' | 'month' = 'week'
): Promise<SearchableItem[]> {
  try {
    // First, let's check if we have any products at all
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (productsError) {
      console.error('Error checking products:', productsError);
      return [];
    }

    if (!products || products.length === 0) {
      console.log('No products found in database');
      return [];
    }

    // Now try to get trending products
    const { data: trendingProducts, error: trendingError } = await supabase
      .from('user_interactions')
      .select('product_id')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (trendingError) {
      console.error('Error getting trending products:', trendingError);
      // Return the most recent products as fallback
      return products as SearchableItem[];
    }

    if (!trendingProducts || trendingProducts.length === 0) {
      console.log('No trending products found, returning recent products');
      return products as SearchableItem[];
    }

    // Get the product IDs from trending products
    const productIds = trendingProducts
      .filter((p): p is { product_id: string } => p !== null && typeof p.product_id === 'string')
      .map(p => p.product_id);

    if (productIds.length === 0) {
      console.log('No valid product IDs in trending products');
      return products as SearchableItem[];
    }

    // Get the full product details for trending products
    const { data: trendingProductDetails, error: detailsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (detailsError) {
      console.error('Error getting trending product details:', detailsError);
      return products as SearchableItem[];
    }

    if (!trendingProductDetails || trendingProductDetails.length === 0) {
      console.log('No trending product details found');
      return products as SearchableItem[];
    }

    return trendingProductDetails as SearchableItem[];
  } catch (err) {
    console.error('Unexpected error in getTrendingProducts:', err);
    // Return empty array as last resort
    return [];
  }
}

// Helper function to get recent products
async function getRecentProducts(limit: number): Promise<SearchableItem[]> {
  try {
    const { data: recentProducts, error: recentError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (recentError) {
      console.error('Error getting recent products:', recentError);
      return [];
    }

    if (!recentProducts || recentProducts.length === 0) {
      console.log('No recent products found');
      return [];
    }

    return recentProducts as SearchableItem[];
  } catch (err) {
    console.error('Error in getRecentProducts:', err);
    return [];
  }
} 