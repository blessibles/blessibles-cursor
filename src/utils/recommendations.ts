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
  const timeFrameMap = {
    day: '1 day',
    week: '7 days',
    month: '30 days'
  };

  try {
    // First get the trending product IDs
    const { data: trendingProducts, error } = await supabase
      .from('user_interactions')
      .select('product_id')
      .gte('created_at', `now() - interval '${timeFrameMap[timeFrame]}'`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting trending products:', error);
      // If there's an error or no interactions yet, return the most recent products
      const { data: recentProducts, error: recentError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (recentError) {
        console.error('Error getting recent products:', recentError);
        throw recentError;
      }

      return recentProducts as SearchableItem[];
    }

    // If there are no trending products yet, return the most recent products
    if (!trendingProducts || trendingProducts.length === 0) {
      const { data: recentProducts, error: recentError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (recentError) {
        console.error('Error getting recent products:', recentError);
        throw recentError;
      }

      return recentProducts as SearchableItem[];
    }

    // Get full product details for the trending products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', trendingProducts.map((p: { product_id: string }) => p.product_id));

    if (productsError) {
      console.error('Error getting product details:', productsError);
      throw productsError;
    }

    return products as SearchableItem[];
  } catch (err) {
    console.error('Error in getTrendingProducts:', err);
    // Return empty array as fallback
    return [];
  }
} 