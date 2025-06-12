"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CollectionWithItems, getCollection, addToCollection, removeFromCollection } from '../../../utils/collections';
import ProductCard from '../../../components/ProductCard';
import { useCart } from '../../../app/layout';
import { CollectionItems } from '@/components/CollectionItems';
import { useCollections } from '@/hooks/useCollections';
import { useSupabase } from '@/hooks/useSupabase';
import { notFound } from 'next/navigation';

interface CollectionPageProps {
  params: {
    id: string;
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { supabase } = useSupabase();
  const { data: collection, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !collection) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{collection.name}</h1>
        {collection.description && (
          <p className="text-gray-600 mt-2">{collection.description}</p>
        )}
      </div>
      <CollectionItems collectionId={collection.id} />
    </div>
  );
} 