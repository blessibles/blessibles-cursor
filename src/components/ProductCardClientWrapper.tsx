"use client";
import ProductCard from "./ProductCard";
import { Product } from '@/types';

export default function ProductCardClientWrapper({ product }: { product: Product }) {
  return <ProductCard product={product} />;
} 