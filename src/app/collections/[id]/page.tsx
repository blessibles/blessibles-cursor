"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCollections } from '@/hooks/useCollections';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CollectionPage() {
  const params = useParams();
  const collectionId = params.id as string;
  const { collections, loading, error, getCollectionItems, deleteCollection } = useCollections();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const collection = collections.find(c => c.id === collectionId);

  useEffect(() => {
    const loadItems = async () => {
      if (!collectionId) return;
      try {
        setIsLoading(true);
        const collectionItems = await getCollectionItems(collectionId);
        setItems(collectionItems);
      } catch (err) {
        console.error('Error loading collection items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [collectionId, getCollectionItems]);

  if (loading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Collection not found</h1>
          <Link href="/collections" className="text-blue-600 hover:text-blue-800">
            Return to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/collections">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-blue-900">{collection.name}</h1>
            {collection.description && (
              <p className="text-gray-600 mt-2">{collection.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/collections/${collectionId}/edit`}>
            <Button variant="outline" size="icon">
              <Edit2 className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this collection?')) {
                deleteCollection(collectionId);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">This collection is empty</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Browse products to add to your collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <ProductCard
              key={item.product_id}
              product={item.product}
            />
          ))}
        </div>
      )}
    </div>
  );
} 