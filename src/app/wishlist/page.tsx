'use client';
export const dynamic = "force-dynamic";
import { useWishlist, WishlistProvider } from '../../context/WishlistContext';
import products from '../../data/products';
import ProductCard from '../../components/ProductCard';
import { SearchableItem } from '../../utils/search';
import Link from 'next/link';

function WishlistContent() {
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wishlistProducts: SearchableItem[] = products.filter((p: SearchableItem) => wishlist.includes(p.id));

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center w-full py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">My Wishlist</h1>
      {wishlistProducts.length === 0 ? (
        <div className="text-blue-700 text-lg text-center">
          <p>Your wishlist is empty.</p>
          <Link href="/" className="text-blue-600 underline hover:text-blue-800">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
          {wishlistProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default function WishlistPage() {
  return (
    <WishlistProvider>
      <WishlistContent />
    </WishlistProvider>
  );
} 