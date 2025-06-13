export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  tags?: string[];
  sale?: boolean;
  salePrice?: number;
  bestseller?: boolean;
  new?: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
} 