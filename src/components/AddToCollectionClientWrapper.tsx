"use client";
import { AddToCollection } from "./AddToCollection";

export default function AddToCollectionClientWrapper({ productId }: { productId: string }) {
  return <AddToCollection productId={productId} />;
} 