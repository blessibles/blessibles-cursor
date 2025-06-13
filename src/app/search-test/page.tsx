'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import SearchBar from '@/components/SearchBar';
import { Product } from '@/types';
import products from '@/data/products';
import Image from 'next/image';

export default function SearchTest() {
  const [searchResults, setSearchResults] = useState<Product[]>(products);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('relevance');

  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Wall Art', value: 'wall-art' },
    { label: 'Journals', value: 'journals' },
    { label: 'Activities', value: 'activities' },
    { label: 'Gift Cards', value: 'gift-card' },
  ];

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A-Z', value: 'name-asc' },
    { label: 'Name: Z-A', value: 'name-desc' },
  ];

  // Filter and sort search results
  const filteredResults = searchResults
    .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
    .sort((a, b) => {
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
      return 0; // relevance (default)
    });

  // Personalized recommendations: products from the same category as the first search result, or random
  const recommendations = useMemo(() => {
    if (filteredResults.length > 0) {
      const category = filteredResults[0].category;
      return products.filter(p => p.category === category && !filteredResults.some(r => r.id === p.id)).slice(0, 3);
    }
    // If no search, show 3 random products
    return products.sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [filteredResults]);

  // Track recently viewed products in localStorage
  useEffect(() => {
    if (filteredResults.length > 0) {
      const viewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
      const newIds = filteredResults.map(p => p.id);
      const updated = [...newIds, ...viewed.filter((id: string) => !newIds.includes(id))].slice(0, 6);
      localStorage.setItem('recently_viewed', JSON.stringify(updated));
    }
  }, [filteredResults]);

  // Get recently viewed products
  const recentlyViewed = useMemo(() => {
    const ids = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('recently_viewed') || '[]' : '[]');
    return ids.map((id: string) => products.find(p => p.id === id)).filter(Boolean).slice(0, 6);
  }, [filteredResults]);

  // Favorites logic
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    }
    return [];
  });

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const favoriteProducts = useMemo(() => {
    return favorites.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  }, [favorites]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-blue-900 mb-6">Search Test Page</h1>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
            <div className="flex-1 w-full">
              <SearchBar
                items={products}
                onSearch={setSearchResults}
                placeholder="Search for products..."
                className="w-full"
                selectedCategory={selectedCategory}
              />
            </div>
            <div className="w-full md:w-64 flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-1/2 px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-blue-900 placeholder-blue-400"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-1/2 px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-blue-900 placeholder-blue-400"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Search Results ({searchResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-blue-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <button
                    className={`absolute top-2 right-2 z-10 p-1 rounded-full ${favorites.includes(product.id) ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'}`}
                    onClick={() => toggleFavorite(product.id)}
                    aria-label={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={favorites.includes(product.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                  </button>
                  <div className="relative h-48">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-blue-900">{product.name}</h3>
                    <p className="text-sm text-blue-600 mt-1">{product.category}</p>
                    <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-lg font-semibold text-blue-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.tags && (
                        <div className="flex gap-2">
                          {product.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-blue-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-32">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-blue-900">{product.name}</h3>
                  <p className="text-sm text-blue-600 mt-1">{product.category}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-lg font-semibold text-blue-900">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Recently Viewed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewed.map((product: Product) => (
                <div
                  key={product.id}
                  className="bg-white border border-blue-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-32">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-blue-900">{product.name}</h3>
                    <p className="text-sm text-blue-600 mt-1">{product.category}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-lg font-semibold text-blue-900">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {favoriteProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Favorites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-blue-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-32">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-blue-900">{product.name}</h3>
                    <p className="text-sm text-blue-600 mt-1">{product.category}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-lg font-semibold text-blue-900">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 