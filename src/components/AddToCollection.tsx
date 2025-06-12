import { useState } from 'react';
import { useCollections } from '@/hooks/useCollections';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Plus } from 'lucide-react';

interface AddToCollectionProps {
  productId: string;
}

export function AddToCollection({ productId }: AddToCollectionProps) {
  const { collections, addToCollection } = useCollections();
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async (collectionId: string) => {
    try {
      await addToCollection(collectionId, productId);
      setIsOpen(false);
    } catch (err) {
      console.error('Error adding to collection:', err);
    }
  };

  if (collections.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add to Collection
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add to Collection
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-48 p-2 z-10">
          <div className="space-y-1">
            {collections.map((collection) => (
              <Button
                key={collection.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleAdd(collection.id)}
              >
                {collection.name}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 