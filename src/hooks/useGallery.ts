import { useQuery } from '@tanstack/react-query';
import { GalleryImage } from '@/types/gallery';

export interface GalleryQueryParams {
  page: number;
  limit: number;
  category?: string;
}

export interface GalleryResponse {
  images: GalleryImage[];
  hasMore: boolean;
  total: number;
}

async function fetchGallery({ page, limit, category }: GalleryQueryParams): Promise<GalleryResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category }),
  });

  const response = await fetch(`/api/gallery?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch gallery images');
  }

  return response.json();
}

export function useGallery(params: GalleryQueryParams) {
  return useQuery<GalleryResponse>({
    queryKey: ['gallery', params],
    queryFn: () => fetchGallery(params),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000, // 1 minute
  });
} 