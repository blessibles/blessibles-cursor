import React, { useState, useEffect } from 'react';
import { Collection, createCollection, getUserCollections, updateCollection, deleteCollection } from '../utils/collections';
import { useRouter } from 'next/navigation';

interface CollectionManagerProps {
  onSelect?: (collectionId: string) => void;
  className?: string;
}

export default function CollectionManager({ onSelect, className = '' }: CollectionManagerProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  const router = useRouter();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserCollections();
      setCollections(data);
    } catch (err) {
      console.error('Error loading collections:', err);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const collection = await createCollection(
        newCollection.name,
        newCollection.description,
        newCollection.isPublic
      );
      if (collection) {
        setCollections([collection, ...collections]);
        setNewCollection({ name: '', description: '', isPublic: false });
        setIsCreating(false);
      }
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Failed to create collection');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Collection>) => {
    try {
      const updated = await updateCollection(id, updates);
      if (updated) {
        setCollections(collections.map(c => c.id === id ? updated : c));
        setIsEditing(null);
      }
    } catch (err) {
      console.error('Error updating collection:', err);
      setError('Failed to update collection');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      const success = await deleteCollection(id);
      if (success) {
        setCollections(collections.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError('Failed to delete collection');
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-900">My Collections</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
        >
          Create Collection
        </button>
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newCollection.name}
              onChange={e => setNewCollection({ ...newCollection, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newCollection.description}
              onChange={e => setNewCollection({ ...newCollection, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={newCollection.isPublic}
              onChange={e => setNewCollection({ ...newCollection, isPublic: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make this collection public
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {collections.map(collection => (
          <div key={collection.id} className="bg-white p-4 rounded-lg shadow-md">
            {isEditing === collection.id ? (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleUpdate(collection.id, {
                    name: newCollection.name,
                    description: newCollection.description,
                    is_public: newCollection.isPublic
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newCollection.name}
                    onChange={e => setNewCollection({ ...newCollection, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newCollection.description}
                    onChange={e => setNewCollection({ ...newCollection, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`isPublic-${collection.id}`}
                    checked={newCollection.isPublic}
                    onChange={e => setNewCollection({ ...newCollection, isPublic: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`isPublic-${collection.id}`} className="ml-2 block text-sm text-gray-700">
                    Make this collection public
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-gray-600 mt-1">{collection.description}</p>
                    )}
                    {collection.is_public && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setNewCollection({
                          name: collection.name,
                          description: collection.description || '',
                          isPublic: collection.is_public
                        });
                        setIsEditing(collection.id);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(collection.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {onSelect && (
                  <button
                    onClick={() => onSelect(collection.id)}
                    className="mt-4 w-full px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                  >
                    View Collection
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 