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
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {/* Wishlist Heart Button */}
      {onToggleWishlist && (
        <button
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white shadow hover:bg-blue-50"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => onToggleWishlist(id)}
        >
          {isWishlisted ? (
            // Filled heart
            <svg xmlns="http://www.w3.org/2000/svg" fill="#ef4444" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ef4444" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 0 0-7.6 0l-.835.836-.835-.836a5.373 5.373 0 1 0-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 0 0 0-7.6z" />
            </svg>
          ) : (
            // Outline heart
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ef4444" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 0 0-7.6 0l-.835.836-.835-.836a5.373 5.373 0 1 0-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 0 0 0-7.6z" />
            </svg>
          )}
        </button>
      )}
      <div className="w-24 h-24 bg-blue-100 rounded mb-3 flex items-center justify-center overflow-hidden">
        <Image src={imageUrl} alt={title} width={96} height={96} className="object-contain" />
      </div>
      <h3 className="font-semibold text-blue-900 mb-1 text-center">{title}</h3>
      <p className="text-sm text-blue-900 mb-2 text-center">{description}</p>
      <button
        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition mb-2"
        onClick={onView}
      >
        View
      </button>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        onClick={() => addToCart({ title, quantity: 1 })}
      >
        Add to Cart
      </button>
    </div>
  );
} 