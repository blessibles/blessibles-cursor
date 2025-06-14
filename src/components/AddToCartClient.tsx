"use client";
import { useCart } from '@/contexts/CartContext';

export default function AddToCartClient({ product }: { product: any }) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() => addItem(product)}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Add to Cart
    </button>
  );
} 