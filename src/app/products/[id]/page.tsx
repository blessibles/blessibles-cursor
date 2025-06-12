import Image from 'next/image';

export default function GiftCardProductPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Image
        src="https://via.placeholder.com/400x400?text=Gift+Card"
        alt="Gift Card Sample"
        width={400}
        height={400}
        className="rounded-lg"
      />
      <h1 className="mt-6 text-2xl font-bold text-blue-900">Gift Card Printable</h1>
      <p className="mt-2 text-blue-700">This is a sample image for the gift card product.</p>
    </div>
  );
} 