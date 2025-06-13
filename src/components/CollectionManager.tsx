"use client";
import { useState, ChangeEvent } from 'react';
import { useCollections } from '../hooks/useCollections';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';

interface CollectionManagerProps {
  onSelect?: (collectionId: string) => void;
}

export function CollectionManager({ onSelect }: CollectionManagerProps) {
  const { user } = useAuth();
  const {
    collections,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
  } = useCollections();

  const [isCreating, setIsCreating] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPublic: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to manage your collections</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading collections...</p>
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

  const handleCreate = async () => {
    try {
      await createCollection(
        newCollection.name,
        newCollection.description,
        newCollection.isPublic
      );
      setNewCollection({ name: '', description: '', isPublic: false });
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating collection:', err);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateCollection(id, {
        name: editForm.name,
        description: editForm.description,
        is_public: editForm.isPublic,
      });
      setEditingId(null);
    } catch (err) {
      console.error('Error updating collection:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await deleteCollection(id);
      } catch (err) {
        console.error('Error deleting collection:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Collections</h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </Button>
      </div>

      {isCreating && (
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Create New Collection</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newCollection.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewCollection({ ...newCollection, name: e.target.value })
                }
                placeholder="Enter collection name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCollection.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setNewCollection({
                    ...newCollection,
                    description: e.target.value,
                  })
                }
                placeholder="Enter collection description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={newCollection.isPublic}
                onCheckedChange={(checked: boolean) =>
                  setNewCollection({ ...newCollection, isPublic: checked })
                }
              />
              <Label htmlFor="public">Make Public</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Card key={collection.id} className="p-4" onClick={() => onSelect && onSelect(collection.id)} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
            {editingId === collection.id ? (
              <div className="space-y-4">
                <Input
                  value={editForm.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Collection name"
                />
                <Textarea
                  value={editForm.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Collection description"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editForm.isPublic}
                    onCheckedChange={(checked: boolean) =>
                      setEditForm({ ...editForm, isPublic: checked })
                    }
                  />
                  <Label>Public</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => handleUpdate(collection.id)}>
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {collection.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {collection.is_public ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(collection.id);
                      setEditForm({
                        name: collection.name,
                        description: collection.description || '',
                        isPublic: collection.is_public,
                      });
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(collection.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default CollectionManager; 