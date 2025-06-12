import { CollectionManager } from '@/components/CollectionManager';

export default function CollectionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Collections</h1>
      <CollectionManager />
    </div>
  );
} 