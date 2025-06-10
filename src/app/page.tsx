"use client";
import Image from "next/image";
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useState, useEffect } from 'react';
import { SearchableItem } from '../utils/search';
import ProductFilters from '../components/ProductFilters';
import products from '../data/products';
import dynamic from 'next/dynamic';

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Wall Art', value: 'wall-art' },
  { label: 'Journals', value: 'journals' },
  { label: 'Activities', value: 'activities' },
];

const ProductModal = dynamic(() => import('../components/ProductModal'), { ssr: false });

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<SearchableItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SearchableItem[]>(products);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SearchableItem | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  // Update filtered products when search results or category changes
  useEffect(() => {
    let filtered = searchResults.length > 0 ? searchResults : products;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [searchResults, selectedCategory, products]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterError('');
    setNewsletterMessage('');
    setNewsletterSubmitting(true);
    if (!newsletterEmail.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setNewsletterError('Please enter a valid email address.');
      setNewsletterSubmitting(false);
      return;
    }
    // Simulate async API call
    setTimeout(() => {
      setNewsletterMessage('Thank you for subscribing! Please check your inbox for confirmation.');
      setNewsletterSubmitting(false);
      setNewsletterEmail('');
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center w-full">
      {/* Modern Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-10 md:py-16 bg-gradient-to-r from-blue-100 via-white to-blue-50 border-b border-blue-100 shadow-sm">
        <div className="flex-1 text-left md:pr-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-blue-900 mb-3 leading-tight drop-shadow-lg">
            Beautiful Christian Printables
          </h1>
          <p className="text-lg md:text-xl text-blue-700 mb-4 font-medium">
            Faith-filled resources for families, teachers, and churches.
          </p>
          <p className="text-base md:text-lg text-blue-600 mb-6">
            Explore our curated collection of wall art, journals, activities, and more—designed to inspire and encourage.
          </p>
          <a
            href="#featured-products"
            className="inline-block bg-blue-700 text-white px-7 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-800 transition"
          >
            Shop Featured Printables
          </a>
        </div>
        <div className="flex-1 flex justify-center mt-8 md:mt-0">
          <Image src="/hero-preview.png" alt="Blessibles Printables" width={340} height={340} className="rounded-xl shadow-lg border border-blue-100 object-contain bg-white" />
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="w-full flex flex-col md:flex-row justify-center items-center gap-12 mb-12 px-8 mt-8">
        <div className="flex flex-col items-center">
          <Image src="/icons/heart.svg" alt="Faith-Based" width={40} height={40} />
          <span className="mt-2 text-blue-800 font-semibold">Faith-Based</span>
        </div>
        <div className="flex flex-col items-center">
          <Image src="/icons/star.svg" alt="5-Star Reviews" width={40} height={40} />
          <span className="mt-2 text-blue-800 font-semibold">5-Star Reviews</span>
        </div>
        <div className="flex flex-col items-center">
          <Image src="/icons/shield.svg" alt="Secure Checkout" width={40} height={40} />
          <span className="mt-2 text-blue-800 font-semibold">Secure Checkout</span>
        </div>
      </section>

      {/* Search and Category Filter Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full">
            <SearchBar
              items={products}
              onSearch={setSearchResults}
              placeholder="Search for printables..."
              className="w-full"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Filters */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ProductFilters
          products={filteredProducts}
          onFilterChange={setFilteredProducts}
          className="bg-gray-50 p-4 rounded-lg"
        />
      </div>

      {/* Featured Products Grid */}
      <section id="featured-products" className="mb-16 px-4 md:px-12 flex flex-col items-center w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 text-center">
          Featured Printables
        </h2>
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 w-full">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description || ''}
                imageUrl={product.imageUrl}
                onView={() => {
                  setSelectedProduct(product);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </section>
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Newsletter Signup */}
      <section className="w-full bg-blue-50 py-12 px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
            Join Our Newsletter
          </h2>
          <p className="text-blue-700 mb-6">
            Get weekly inspiration, new printables, and special offers delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 justify-center" onSubmit={handleNewsletterSubmit}>
            {/* ARIA live region for newsletter feedback */}
            <div aria-live="polite" className="sr-only">{newsletterMessage || newsletterError}</div>
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 flex-grow max-w-md"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              disabled={newsletterSubmitting}
            />
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
              disabled={newsletterSubmitting}
            >
              {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {newsletterMessage && <div className="text-green-700 font-semibold mt-2">{newsletterMessage}</div>}
          {newsletterError && <div className="text-red-600 font-semibold mt-2">{newsletterError}</div>}
        </div>
      </section>
    </main>
  );
}
