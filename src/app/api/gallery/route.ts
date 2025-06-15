import { getGalleryCache } from '@/utils/cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const category = searchParams.get('category');

  try {
    const { images, hasMore } = await getGalleryCache(page, limit, category || undefined);
    return NextResponse.json({ images, hasMore });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
} 