import { useCallback, useEffect, useState } from 'react';
import { useSupabase } from './useSupabase';
import { useAuth } from './useAuth';

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  product_id: string;
  added_at: string;
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
}

export function useCollections() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCollections(data || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  const createCollection = useCallback(async (name: string, description: string, isPublic: boolean) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { data, error: createError } = await supabase
        .from('collections')
        .insert([
          {
            name,
            description,
            is_public: isPublic,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      setCollections(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating collection:', err);
      throw err;
    }
  }, [supabase, user]);

  const updateCollection = useCallback(async (id: string, updates: Partial<Collection>) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { data, error: updateError } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setCollections(prev => prev.map(c => c.id === id ? data : c));
      return data;
    } catch (err) {
      console.error('Error updating collection:', err);
      throw err;
    }
  }, [supabase, user]);

  const deleteCollection = useCallback(async (id: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { error: deleteError } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting collection:', err);
      throw err;
    }
  }, [supabase, user]);

  const addToCollection = useCallback(async (collectionId: string, productId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { error: addError } = await supabase
        .from('collection_items')
        .insert([
          {
            collection_id: collectionId,
            product_id: productId
          }
        ]);

      if (addError) throw addError;
    } catch (err) {
      console.error('Error adding to collection:', err);
      throw err;
    }
  }, [supabase, user]);

  const removeFromCollection = useCallback(async (collectionId: string, productId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { error: removeError } = await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('product_id', productId);

      if (removeError) throw removeError;
    } catch (err) {
      console.error('Error removing from collection:', err);
      throw err;
    }
  }, [supabase, user]);

  const getCollectionItems = useCallback(async (collectionId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      const { data, error: fetchError } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collectionId)
        .order('added_at', { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err) {
      console.error('Error fetching collection items:', err);
      throw err;
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    getCollectionItems,
    refreshCollections: fetchCollections
  };
} 