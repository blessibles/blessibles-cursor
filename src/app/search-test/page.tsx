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
  const [mounted, setMounted] = useState(false);

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
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFavorites(JSON.parse(localStorage.getItem('favorites') || '[]'));
    }
  }, []);

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

  // Custom user collection logic
  const [collection, setCollection] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCollection(JSON.parse(localStorage.getItem('my_collection') || '[]'));
    }
  }, []);

  const toggleCollection = useCallback((id: string) => {
    setCollection(prev => {
      const updated = prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id];
      localStorage.setItem('my_collection', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const collectionProducts = useMemo(() => {
    return collection.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  }, [collection]);

  useEffect(() => { setMounted(true); }, []);

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
              {mounted && filteredResults.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-blue-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
                >
                  <div className="absolute top-2 right-2 z-10 flex gap-2">
                    <button
                      className={`p-1 rounded-full ${favorites.includes(product.id) ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400'}`}
                      onClick={() => toggleFavorite(product.id)}
                      aria-label={favorites.includes(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill={favorites.includes(product.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                      </svg>
                    </button>
                    <button
                      className={`p-1 rounded-full ${collection.includes(product.id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                      onClick={() => toggleCollection(product.id)}
                      aria-label={collection.includes(product.id) ? 'Remove from My Collection' : 'Add to My Collection'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill={collection.includes(product.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
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
                    <div className="mt-4 flex gap-2">
                      {/* Facebook Share */}
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://blessibles.com/products/' + product.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on Facebook"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                          <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                        </svg>
                      </a>
                      {/* Twitter Share */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name + ' - Blessibles')}&url=${encodeURIComponent('https://blessibles.com/products/' + product.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on Twitter"
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                          <path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.496 14.009-13.986 0-.21 0-.423-.016-.634A9.936 9.936 0 0 0 24 4.557z" />
                        </svg>
                      </a>
                      {/* Pinterest Share */}
                      <a
                        href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent('https://blessibles.com/products/' + product.id)}&media=${encodeURIComponent(product.image)}&description=${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share on Pinterest"
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 4.991 3.657 9.128 8.438 10.388-.117-.883-.223-2.24.047-3.205.242-.828 1.557-5.28 1.557-5.28s-.396-.793-.396-1.963c0-1.838 1.067-3.212 2.396-3.212 1.13 0 1.676.849 1.676 1.866 0 1.137-.724 2.837-1.096 4.418-.312 1.32.663 2.396 1.965 2.396 2.358 0 3.953-3.03 3.953-6.622 0-2.736-1.848-4.788-5.217-4.788-3.797 0-6.18 2.844-6.18 5.998 0 1.093.322 1.864.827 2.46.232.277.265.388.181.705-.062.242-.2.825-.257 1.057-.08.323-.326.438-.602.318-1.682-.687-2.453-2.53-2.453-4.604 0-3.42 2.89-7.513 8.617-7.513 4.605 0 7.638 3.324 7.638 6.89 0 4.729-2.63 8.264-6.537 8.264-1.312 0-2.545-.711-2.965-1.515l-.807 3.07c-.23.888-.682 2.002-1.018 2.68.765.236 1.572.364 2.414.364 6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {mounted && (
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
        )}

        {/* Recently Viewed Section */}
        {mounted && recentlyViewed.length > 0 && (
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
        {mounted && favoriteProducts.length > 0 && (
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

        {/* My Collection Section */}
        {mounted && collectionProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">My Collection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collectionProducts.map((product) => (
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