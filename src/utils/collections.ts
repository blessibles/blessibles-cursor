import { supabase } from './supabaseClient';

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

// Create a new collection
export async function createCollection(
  name: string,
  description?: string,
  isPublic: boolean = false
): Promise<Collection | null> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: user.user.id,
      name,
      description,
      is_public: isPublic
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating collection:', error);
    return null;
  }

  return data;
}

// Get all collections for the current user
export async function getUserCollections(): Promise<Collection[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return [];

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', user.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching collections:', error);
    return [];
  }

  return data || [];
}

// Get a single collection with its items
export async function getCollection(id: string): Promise<CollectionWithItems | null> {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      items:collection_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching collection:', error);
    return null;
  }

  return data;
}

// Update a collection
export async function updateCollection(
  id: string,
  updates: Partial<Pick<Collection, 'name' | 'description' | 'is_public'>>
): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating collection:', error);
    return null;
  }

  return data;
}

// Delete a collection
export async function deleteCollection(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting collection:', error);
    return false;
  }

  return true;
}

// Add a product to a collection
export async function addToCollection(
  collectionId: string,
  productId: string
): Promise<CollectionItem | null> {
  const { data, error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      product_id: productId
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding to collection:', error);
    return null;
  }

  return data;
}

// Remove a product from a collection
export async function removeFromCollection(
  collectionId: string,
  productId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing from collection:', error);
    return false;
  }

  return true;
}

// Get public collections
export async function getPublicCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public collections:', error);
    return [];
  }

  return data || [];
} 