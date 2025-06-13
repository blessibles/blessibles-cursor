import React, { useState } from 'react';
import { useCollections } from '@/hooks/useCollections';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface AddToCollectionProps {
  productId: string;
  onSuccess?: () => void;
}

export function AddToCollection({ productId, onSuccess }: AddToCollectionProps) {
  const { collections, addToCollection } = useCollections();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCollection = async (collectionId: string) => {
    try {
      setIsLoading(true);
      await addToCollection(collectionId, productId);
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error('Error adding to collection:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add to Collection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {collections.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                You haven't created any collections yet.
              </p>
            ) : (
              collections.map((collection) => (
                <Button
                  key={collection.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAddToCollection(collection.id)}
                  disabled={isLoading}
                >
                  {collection.name}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 