import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import AddToCollectionClientWrapper from './AddToCollectionClientWrapper';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`} className="block group">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
          <Image
            src={product.image || '/placeholder.png'}
            alt={product.name || `${product.category} product`}
            width={500}
            height={500}
            className="h-full w-full object-cover object-center group-hover:opacity-75"
          />
        </div>
        <div className="mt-4 flex justify-between">
          <div>
            <h3 className="text-sm text-gray-700">{product.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{product.category}</p>
          </div>
          <p className="text-sm font-medium text-gray-900">${product.price}</p>
        </div>
      </Link>
      <div className="mt-4">
        <AddToCollectionClientWrapper productId={product.id} />
      </div>
    </div>
  );
}

export default ProductCard; 