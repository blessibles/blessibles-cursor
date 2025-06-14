"use client";
import Image from "next/image";
import { ProductCard } from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useState, useEffect } from 'react';
import { SearchableItem } from '../utils/search';
import ProductFilters from '../components/ProductFilters';
import products from '../data/products';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCart } from '../app/layout';
import ProductRecommendations from '../components/ProductRecommendations';
import Testimonials from '../components/Testimonials';

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Wall Art', value: 'wall-art' },
  { label: 'Journals', value: 'journals' },
  { label: 'Activities', value: 'activities' },
  { label: 'Planners', value: 'planners' },
];

const ProductModal = dynamic(() => import('../components/ProductModal'), { ssr: false });

export default function Home() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<SearchableItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SearchableItem[]>(products);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SearchableItem | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const router = useRouter();

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
    <main className="min-h-screen bg-white flex flex-col items-center w-full">
      {/* Modern Hero Section with Overlay - Shorter Height */}
      <section className="relative w-full min-h-[420px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.png"
            alt="Beautiful Christian Printables Hero Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/80" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-white space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Beautiful Christian Printables
              </h1>
              <p className="text-xl text-blue-100 font-medium">
                Faith-filled resources for families, teachers, and churches.
              </p>
              <p className="text-lg text-blue-50">
                Explore our curated collection of wall art, journals, activities, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a
                  href="#featured-products"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-900 rounded-lg font-semibold shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
                >
                  Shop Featured Printables
                </a>
                <a
                  href="/categories"
                  className="inline-flex items-center justify-center px-6 py-3 bg-transparent text-white border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Browse Categories
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <Image
                  src="/placeholder.png"
                  alt="Blessibles Printables Preview"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="w-full bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.filter(cat => cat.value !== 'all').map((category) => (
              <a
                key={category.value}
                href={`/categories/${category.value}`}
                className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 fade-in-up"
              >
                <div className="aspect-square relative">
                  <Image
                    src={`/categories/${category.value}.jpg`}
                    alt={category.label}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg">{category.label}</h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
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
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-blue-900 placeholder-blue-400"
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
        </div>
      </section>

      {/* Featured Products Grid */}
      <section id="featured-products" className="w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900">Featured Printables</h2>
            <a href="/products" className="text-blue-600 hover:text-blue-800 font-semibold">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: (product as any).title || product.name,
                  description: product.description,
                  price: product.price,
                  image: (product as any).imageUrl || product.image,
                  category: product.category,
                  createdAt: product.createdAt || new Date().toISOString(),
                  updatedAt: product.updatedAt || new Date().toISOString(),
                  tags: product.tags
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductRecommendations
            type="trending"
            title="Trending Now"
            limit={4}
          />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full bg-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">What Our Customers Say</h2>
          <Testimonials limit={3} />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full bg-gradient-to-br from-blue-900 to-blue-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Get weekly inspiration, new printables, and special offers delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto" onSubmit={handleNewsletterSubmit}>
            <div className="flex-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-6 py-3 rounded-lg border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white/10 text-blue-900 placeholder-blue-400"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                disabled={newsletterSubmitting}
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
              disabled={newsletterSubmitting}
            >
              {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {newsletterMessage && (
            <div className="mt-4 text-green-300 font-semibold">{newsletterMessage}</div>
          )}
          {newsletterError && (
            <div className="mt-4 text-red-300 font-semibold">{newsletterError}</div>
          )}
        </div>
      </section>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}
