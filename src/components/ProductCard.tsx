import Image from 'next/image';
import { useCart } from '../app/layout';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  onView: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export default function ProductCard({ id, title, description, imageUrl, onView, isWishlisted = false, onToggleWishlist }: ProductCardProps) {
  const { addToCart } = useCart();
  // Demo: hardcoded price and category for schema. In a real app, pass these as props.
  const price = id === '1' ? 12.99 : id === '2' ? 9.99 : id === '3' ? 14.99 : 25.0;
  const category = id === '1' ? 'Wall Art' : id === '2' ? 'Journals' : id === '3' ? 'Activities' : 'Gift Card';
  const rating = id === '1' ? 4.8 : id === '2' ? 4.9 : id === '3' ? 4.7 : 5.0;
  const reviews = id === '1' ? 124 : id === '2' ? 89 : id === '3' ? 56 : 12;
  const image = `https://blessibles.com${imageUrl}`;
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: title,
    image: [image],
    description,
    sku: id,
    category,
    offers: {
      '@type': 'Offer',
      url: `https://blessibles.com/`,
      price: price.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center hover:shadow-2xl transition-all duration-200 border border-blue-100 group relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {/* Wishlist Heart Button */}
      {onToggleWishlist && (
        <button
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow hover:bg-blue-50 border border-blue-100"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => onToggleWishlist(id)}
        >
          {isWishlisted ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="#ef4444" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ef4444" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 0 0-7.6 0l-.835.836-.835-.836a5.373 5.373 0 1 0-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 0 0 0-7.6z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ef4444" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 0 0-7.6 0l-.835.836-.835-.836a5.373 5.373 0 1 0-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 0 0 0-7.6z" />
            </svg>
          )}
        </button>
      )}
      {/* Product Image */}
      <div className="w-full flex justify-center mb-4">
        <div className="relative w-40 h-40 bg-blue-50 rounded-xl overflow-hidden flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
          <Image src={imageUrl} alt={title} width={160} height={160} className="object-contain" />
        </div>
      </div>
      {/* Price Badge */}
      <span className="absolute top-3 left-3 bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">${price.toFixed(2)}</span>
      {/* Category */}
      <span className="mb-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">{category}</span>
      {/* Title */}
      <h3 className="font-bold text-blue-900 mb-1 text-center text-lg group-hover:text-blue-800 transition-colors">{title}</h3>
      {/* Rating */}
      <div className="flex items-center mb-2">
        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
        <span className="text-sm text-blue-900 font-semibold mr-1">{rating}</span>
        <span className="text-xs text-blue-500">({reviews})</span>
      </div>
      {/* Description */}
      <p className="text-sm text-blue-900 mb-4 text-center line-clamp-3 min-h-[48px]">{description}</p>
      {/* Buttons */}
      <div className="flex gap-2 w-full mt-auto">
        <button
          className="flex-1 bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
          onClick={onView}
        >
          View
        </button>
        <button
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          onClick={() => addToCart({ title, quantity: 1 })}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
} 