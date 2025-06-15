import { unstable_cache } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export interface CacheConfig {
  revalidate?: number;
  tags?: string[];
}

const defaultConfig: CacheConfig = {
  revalidate: 3600, // 1 hour
  tags: ['gallery'],
};

export const getGalleryCache = unstable_cache(
  async (page: number, limit: number, category?: string) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from('gallery')
      .select('*', { count: 'exact' })
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: images, error, count } = await query;

    if (error) {
      throw new Error('Failed to fetch gallery images');
    }

    return {
      images,
      hasMore: count ? count > end + 1 : false,
    };
  },
  ['gallery-data'],
  defaultConfig
);

export const revalidateGalleryCache = async () => {
  // This function can be called after gallery updates
  // to invalidate the cache
  try {
    await fetch('/api/revalidate?tag=gallery', { method: 'POST' });
  } catch (error) {
    console.error('Failed to revalidate gallery cache:', error);
  }
}; 