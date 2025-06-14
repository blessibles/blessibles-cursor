"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import { Product } from "@/types";
import products from "@/data/products";
import Image from "next/image";

export default function CategoriesPage() {
  const [searchResults, setSearchResults] = useState<Product[]>(products);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("relevance");
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [collection, setCollection] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  const categories = [
    { label: "All", value: "all" },
    { label: "Wall Art", value: "wall-art" },
    { label: "Journals", value: "journals" },
    { label: "Activities", value: "activities" },
    { label: "Gift Cards", value: "gift-card" },
  ];

  const sortOptions = [
    { label: "Relevance", value: "relevance" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Name: A-Z", value: "name-asc" },
    { label: "Name: Z-A", value: "name-desc" },
  ];

  // Filter and sort search results
  const filteredResults = useMemo(() => {
    return searchResults
      .filter(
        (product) =>
          selectedCategory === "all" || product.category === selectedCategory
      )
      .sort((a, b) => {
        if (sortOption === "price-asc") return a.price - b.price;
        if (sortOption === "price-desc") return b.price - a.price;
        if (sortOption === "name-asc") return a.name.localeCompare(b.name);
        if (sortOption === "name-desc") return b.name.localeCompare(a.name);
        return 0; // relevance (default)
      });
  }, [searchResults, selectedCategory, sortOption]);

  // Personalized recommendations: products from the same category as the first search result, or random
  const recommendations = useMemo(() => {
    if (filteredResults.length > 0) {
      const category = filteredResults[0].category;
      return products
        .filter(
          (p) =>
            p.category === category &&
            !filteredResults.some((r) => r.id === p.id)
        )
        .slice(0, 3);
    }
    // If no search, show 3 random products
    return products.slice().sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [filteredResults]);

  // Track recently viewed products in localStorage
  useEffect(() => {
    if (mounted && filteredResults.length > 0) {
      const viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      const newIds = filteredResults.map((p) => p.id);
      const updated = [
        ...newIds,
        ...viewed.filter((id: string) => !newIds.includes(id)),
      ].slice(0, 6);
      localStorage.setItem("recently_viewed", JSON.stringify(updated));
    }
  }, [filteredResults, mounted]);

  // Get recently viewed products
  useEffect(() => {
    if (mounted) {
      const ids = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      const viewed = ids
        .map((id: string) => products.find((p) => p.id === id))
        .filter(Boolean) as Product[];
      setRecentlyViewed(viewed);
    }
  }, [mounted]);

  // Favorites logic
  useEffect(() => {
    if (mounted) {
      setFavorites(JSON.parse(localStorage.getItem("favorites") || "[]"));
    }
  }, [mounted]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const favoriteProducts = useMemo(() => {
    return favorites
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as Product[];
  }, [favorites]);

  // Custom user collection logic
  useEffect(() => {
    if (mounted) {
      setCollection(JSON.parse(localStorage.getItem("my_collection") || "[]"));
    }
  }, [mounted]);

  const toggleCollection = useCallback((id: string) => {
    setCollection((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((cid) => cid !== id)
        : [...prev, id];
      localStorage.setItem("my_collection", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const collectionProducts = useMemo(() => {
    return collection
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as Product[];
  }, [collection]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Browse Categories</h1>
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
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          Search Results ({filteredResults.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mounted &&
            filteredResults.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-blue-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <button
                    className={`p-1 rounded-full ${favorites.includes(product.id) ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400"}`}
                    onClick={() => toggleFavorite(product.id)}
                    aria-label={favorites.includes(product.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={favorites.includes(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                  </button>
                  <button
                    className={`p-1 rounded-full ${collection.includes(product.id) ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}
                    onClick={() => toggleCollection(product.id)}
                    aria-label={collection.includes(product.id) ? "Remove from My Collection" : "Add to My Collection"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill={collection.includes(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
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
                  <div className="flex gap-2 mt-4">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                      </svg>
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}&text=${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black hover:text-gray-800"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href={`https://pinterest.com/pin/create/button/?url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}&media=${encodeURIComponent(product.image)}&description=${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
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
      {/* Favorites Section */}
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
      {/* My Collection Section */}
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
    </div>
  );
} 