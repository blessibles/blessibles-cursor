"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CollectionWithItems, getCollection, addToCollection, removeFromCollection } from '../../../utils/collections';
import ProductCard from '../../../components/ProductCard';
import { useCart } from '../../../app/layout';

export default function CollectionPage({ params }: { params: { id: string } }) {
  const [collection, setCollection] = useState<CollectionWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    loadCollection();
  }, [params.id]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCollection(params.id);
      setCollection(data);
    } catch (err) {
      console.error('Error loading collection:', err);
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    addToCart({ title: `Product ${productId}`, quantity: 1 });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-gray-600">
          Collection not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">{collection.name}</h1>
        {collection.description && (
          <p className="text-gray-600 mb-4">{collection.description}</p>
        )}
        {collection.is_public && (
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
            Public Collection
          </span>
        )}
      </div>

      {collection.items.length === 0 ? (
        <div className="text-gray-600 text-center py-8">
          This collection is empty
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {collection.items.map(item => (
            <ProductCard
              key={item.product_id}
              id={item.product_id}
              title="Product Title" // This should be fetched from the products table
              price={9.99} // This should be fetched from the products table
              imageUrl="/placeholder.png" // This should be fetched from the products table
              onView={() => router.push(`/products/${item.product_id}`)}
              onAddToCart={() => handleAddToCart(item.product_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 