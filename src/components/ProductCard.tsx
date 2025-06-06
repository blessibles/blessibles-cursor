import Image from 'next/image';

interface ProductCardProps {
  title: string;
  description: string;
  imageUrl: string;
  onView: () => void;
}

export default function ProductCard({ title, description, imageUrl, onView }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-xl transition">
      <div className="w-24 h-24 bg-blue-100 rounded mb-3 flex items-center justify-center overflow-hidden">
        <Image src={imageUrl} alt={title} width={96} height={96} className="object-contain" />
      </div>
      <h3 className="font-semibold text-blue-800 mb-1 text-center">{title}</h3>
      <p className="text-sm text-blue-600 mb-2 text-center">{description}</p>
      <button
        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
        onClick={onView}
      >
        View
      </button>
    </div>
  );
} 