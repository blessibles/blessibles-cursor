import Image from 'next/image';
import { useCart } from '../app/layout';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  onView: () => void;
  onAddToCart: () => void;
  badge?: string; // e.g. 'New', 'Sale'
}

export default function ProductCard({ id, title, price, imageUrl, onView, onAddToCart, badge }: ProductCardProps) {
  const { addToCart } = useCart();
  // Get category from the product ID
  const category = id === '11111111-1111-1111-1111-111111111111' ? 'Wall Art' : 
                  id === '22222222-2222-2222-2222-222222222222' ? 'Journals' : 
                  id === '33333333-3333-3333-3333-333333333333' ? 'Activities' : 
                  'Gift Card';
  const rating = id === '11111111-1111-1111-1111-111111111111' ? 4.8 : 
                id === '22222222-2222-2222-2222-222222222222' ? 4.9 : 
                id === '33333333-3333-3333-3333-333333333333' ? 4.7 : 
                5.0;
  const reviews = id === '11111111-1111-1111-1111-111111111111' ? 124 : 
                 id === '22222222-2222-2222-2222-222222222222' ? 89 : 
                 id === '33333333-3333-3333-3333-333333333333' ? 56 : 
                 12;
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: title,
    image: [imageUrl],
    description: '',
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
    <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden flex flex-col items-center transition-transform hover:-translate-y-1 hover:shadow-xl min-h-[370px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {/* Badge */}
      {badge && (
        <span className="absolute top-3 left-3 z-10 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">{badge}</span>
      )}
      {/* Product Image with overlay */}
      <div className="relative w-full flex-1 flex items-center justify-center bg-blue-50" style={{ minHeight: 220 }}>
        <Image
          src={imageUrl && imageUrl !== '' ? imageUrl : '/placeholder.png'}
          alt={title}
          width={220}
          height={220}
          className="object-contain w-auto h-52 transition-transform duration-300 group-hover:scale-105"
        />
        {/* Overlay Buttons */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="mx-2 px-4 py-2 bg-white text-blue-900 font-semibold rounded-lg shadow hover:bg-blue-50 transition"
            onClick={e => { e.stopPropagation(); onView(); }}
          >
            View
          </button>
          <button
            className="mx-2 px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg shadow hover:bg-blue-800 transition"
            onClick={e => { e.stopPropagation(); onAddToCart(); }}
          >
            Add to Cart
          </button>
        </div>
      </div>
      {/* Details */}
      <div className="w-full px-4 py-3 flex flex-col items-center">
        <h3 className="text-lg font-bold text-blue-900 text-center mb-1 line-clamp-2">{title}</h3>
        <div className="text-blue-700 font-semibold text-base mb-1">${typeof price === 'number' ? price.toFixed(2) : '9.99'}</div>
      </div>
    </div>
  );
} 