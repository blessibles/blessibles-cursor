import { supabase } from './supabaseClient';
import { Product } from '@/types';

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
  // First, check if there's an existing interaction
  const { data: existingInteraction, error: checkError } = await supabase
    .from('user_interactions')
    .select('id, count')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('interaction_type', interactionType)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error checking existing interaction:', checkError);
    throw checkError;
  }

  if (existingInteraction) {
    // Update the count of the existing interaction
    const { error: updateError } = await supabase
      .from('user_interactions')
      .update({ 
        count: existingInteraction.count + 1,
        metadata: metadata || {}
      })
      .eq('id', existingInteraction.id);

    if (updateError) {
      console.error('Error updating interaction:', updateError);
      throw updateError;
    }
  } else {
    // Create a new interaction
    const { error: insertError } = await supabase
      .from('user_interactions')
      .insert({
        user_id: userId,
        product_id: productId,
        interaction_type: interactionType,
        metadata: metadata || {},
        count: 1
      });

    if (insertError) {
      console.error('Error creating interaction:', insertError);
      throw insertError;
    }
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
): Promise<Product[]> {
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

  return similarProducts as Product[];
}

export async function getTrendingProducts(limit: number = 4): Promise<Product[]> {
  try {
    // Get trending products based on user interactions
    const { data: trendingProducts, error: trendingError } = await supabase
      .from('user_interactions')
      .select('product_id, count')
      .order('count', { ascending: false })
      .limit(limit);

    if (trendingError) {
      console.error('Error fetching trending products:', JSON.stringify(trendingError, null, 2));
      if (typeof window !== 'undefined') {
        alert('Trending error: ' + JSON.stringify(trendingError, null, 2));
      }
      return [];
    }

    if (!trendingProducts || trendingProducts.length === 0) {
      console.log('No trending products found, falling back to recent products');
      // Fall back to recent products if no trending products
      const { data: recentProducts, error: recentError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (recentError) {
        console.error('Error fetching recent products:', JSON.stringify(recentError, null, 2));
        if (typeof window !== 'undefined') {
          alert('Recent products error: ' + JSON.stringify(recentError, null, 2));
        }
        return [];
      }

      return recentProducts || [];
    }

    // Get the product IDs from trending products
    const productIds = trendingProducts
      .filter((p): p is { product_id: string; count: number } => 
        p !== null && 
        typeof p.product_id === 'string' && 
        typeof p.count === 'number'
      )
      .map(p => p.product_id);

    if (productIds.length === 0) {
      console.log('No valid product IDs found in trending products');
      return [];
    }

    // Fetch the full product details
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching product details:', JSON.stringify(productsError, null, 2));
      if (typeof window !== 'undefined') {
        alert('Product details error: ' + JSON.stringify(productsError, null, 2));
      }
      return [];
    }

    if (!products || products.length === 0) {
      console.log('No products found for trending product IDs');
      return [];
    }

    // Sort products to match the trending order
    const productMap = new Map(products.map(p => [p.id, p]));
    return productIds
      .map(id => productMap.get(id))
      .filter((p): p is Product => p !== undefined);
  } catch (error) {
    console.error('Unexpected error in getTrendingProducts:', JSON.stringify(error, null, 2));
    if (typeof window !== 'undefined') {
      alert('Unexpected trending error: ' + JSON.stringify(error, null, 2));
    }
    return [];
  }
}

// Helper function to get recent products
async function getRecentProducts(limit: number): Promise<Product[]> {
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

    return recentProducts as Product[];
  } catch (err) {
    console.error('Error in getRecentProducts:', err);
    return [];
  }
} 