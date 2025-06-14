"use client";
import Image from "next/image";

export default function TshirtsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">Tshirts</h1>
        <div className="relative w-64 h-64 mb-4">
          <Image src="/categories/planners.jpg" alt="Tshirts" fill className="object-cover rounded-xl" />
        </div>
        <p className="text-blue-700 text-lg">This is a placeholder page for the Tshirts category. More content coming soon!</p>
      </div>
    </div>
  );
} 