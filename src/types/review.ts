export interface Review {
  id: string;
  productId: string;
  reviewer: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO date string
} 