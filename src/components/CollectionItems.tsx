import { useState, useEffect } from 'react';
import { useCollections } from '@/hooks/useCollections';
import { useSupabase } from '@/hooks/useSupabase';
import { ProductCard } from './ProductCard';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trash2 } from 'lucide-react';

interface CollectionItemsProps {
  collectionId: string;
}

export function CollectionItems({ collectionId }: CollectionItemsProps) {
  const { supabase } = useSupabase();
  const { removeFromCollection } = useCollections();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        setError(null);

        const { data: collectionItems, error: itemsError } = await supabase
          .from('collection_items')
          .select('product_id')
          .eq('collection_id', collectionId);

        if (itemsError) throw itemsError;

        if (collectionItems && collectionItems.length > 0) {
          const productIds = collectionItems.map(item => item.product_id);
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

          if (productsError) throw productsError;
          setItems(products || []);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Error fetching collection items:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [supabase, collectionId]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCollection(collectionId, productId);
      setItems(items.filter(item => item.id !== productId));
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No items in this collection</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <ProductCard product={item} />
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemove(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
} 