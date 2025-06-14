'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function CartButton() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1 text-blue-900 hover:text-blue-950 font-medium"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="w-6 h-6"
      >
        <circle cx="9" cy="20" r="1" />
        <circle cx="17" cy="20" r="1" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h2l.4 2M7 6h13l-1.5 9h-11.5l-1-6H21" />
      </svg>
      <span className="sr-only">Cart</span>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  );
} 