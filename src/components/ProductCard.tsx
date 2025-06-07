import Image from 'next/image';
import { useCart } from '../app/layout';

interface ProductCardProps {
  title: string;
  description: string;
  imageUrl: string;
  onView: () => void;
}

export default function ProductCard({ title, description, imageUrl, onView }: ProductCardProps) {
  const { addToCart } = useCart();
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition">
      <div className="w-24 h-24 bg-blue-100 rounded mb-3 flex items-center justify-center overflow-hidden">
        <Image src={imageUrl} alt={title} width={96} height={96} className="object-contain" />
      </div>
      <h3 className="font-semibold text-blue-800 mb-1 text-center">{title}</h3>
      <p className="text-sm text-blue-600 mb-2 text-center">{description}</p>
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