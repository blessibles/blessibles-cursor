import React, { useState, useRef, useEffect } from 'react';
import ProductReviews from './ProductReviews';
import { SearchableItem } from '../utils/search';
import products from '../data/products';
import ProductCard from './ProductCard';
import Image from 'next/image';

interface ProductModalProps {
  product: SearchableItem;
  open: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, open, onClose }: ProductModalProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<SearchableItem | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      lastActiveElement.current = document.activeElement as HTMLElement;
      // Focus the modal
      modalRef.current?.focus();
      // Trap focus
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        }
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else if (lastActiveElement.current) {
      lastActiveElement.current.focus();
    }
  }, [open, onClose]);

  if (!open && !quickViewProduct) return null;

  // If a related product is selected, show its modal instead
  if (quickViewProduct) {
    return (
      <ProductModal product={quickViewProduct} open={true} onClose={() => setQuickViewProduct(null)} />
    );
  }

  // Find up to 3 related products from the same category, excluding the current product
  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      tabIndex={-1}
      ref={modalRef}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-blue-900 hover:text-blue-950 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0 flex items-center justify-center w-full md:w-1/2">
            <div className="relative w-48 h-48">
              <Image
                src={product.imageUrl || '/placeholder.png'}
                alt={product.title}
                fill
                className="object-contain rounded"
                loading="lazy"
                sizes="192px"
                priority={false}
              />
            </div>
          </div>
          <div className="flex-1">
            <h2 id="product-modal-title" className="text-2xl font-bold text-blue-900 mb-2">{product.title}</h2>
            <p className="text-blue-900 mb-4">{product.description}</p>
            <div className="mb-4">
              <span className="text-blue-900 font-semibold text-lg">${product.sale ? product.salePrice : product.price}</span>
              {product.sale && (
                <span className="ml-2 text-gray-700 line-through">${product.price}</span>
              )}
            </div>
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-900 px-2 py-1 rounded text-xs font-medium mr-2">{product.category}</span>
              {product.bestseller && <span className="inline-block bg-yellow-100 text-yellow-900 px-2 py-1 rounded text-xs font-medium mr-2">Bestseller</span>}
              {product.new && <span className="inline-block bg-green-100 text-green-900 px-2 py-1 rounded text-xs font-medium mr-2">New</span>}
              {product.sale && <span className="inline-block bg-red-100 text-red-900 px-2 py-1 rounded text-xs font-medium">Sale</span>}
            </div>
          </div>
        </div>
        <div className="mt-8">
          <ProductReviews productId={product.id} />
        </div>
        {related.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Related Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rel) => (
                <div
                  key={rel.id}
                  className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 rounded"
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${rel.title}`}
                  onClick={() => setQuickViewProduct(rel)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setQuickViewProduct(rel);
                    }
                  }}
                >
                  <ProductCard
                    id={rel.id}
                    title={rel.title}
                    description={rel.description || ''}
                    imageUrl={rel.imageUrl || ''}
                    onView={() => setQuickViewProduct(rel)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 