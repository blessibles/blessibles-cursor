import React from 'react';
import { SearchableItem } from '../utils/search';

interface ProductFiltersProps {
  products: SearchableItem[];
  onFilterChange: (filteredProducts: SearchableItem[]) => void;
  className?: string;
}

type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'newest' | 'bestseller';

export default function ProductFilters({ products, onFilterChange, className = '' }: ProductFiltersProps) {
  const [sortBy, setSortBy] = React.useState<SortOption>('newest');
  const [filters, setFilters] = React.useState({
    priceRange: { min: 0, max: 100 },
    showBestsellers: false,
    showNew: false,
    showSale: false,
    rating: 0,
  });

  React.useEffect(() => {
    let filteredProducts = [...products];

    // Apply filters
    filteredProducts = filteredProducts.filter(product => {
      const price = product.sale ? product.salePrice : product.price;
      const matchesPrice = typeof price === 'number' && price >= (filters.priceRange?.min ?? 0) && price <= (filters.priceRange?.max ?? Infinity);
      const matchesBestseller = !filters.showBestsellers || product.bestseller;
      const matchesNew = !filters.showNew || product.new;
      const matchesSale = !filters.showSale || product.sale;
      const matchesRating = (typeof product.rating === "number" ? product.rating : 0) >= filters.rating;

      return matchesPrice && matchesBestseller && matchesNew && matchesSale && matchesRating;
    });

    // Apply sorting
    filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.sale ? a.salePrice ?? a.price ?? 0 : a.price ?? 0) - (b.sale ? b.salePrice ?? b.price ?? 0 : b.price ?? 0);
        case 'price-desc':
          return (b.sale ? b.salePrice ?? b.price ?? 0 : b.price ?? 0) - (a.sale ? a.salePrice ?? a.price ?? 0 : a.price ?? 0);
        case 'rating-desc':
          return (typeof b.rating === 'number' ? b.rating : 0) - (typeof a.rating === 'number' ? a.rating : 0);
        case 'newest':
          return b.new ? 1 : -1;
        case 'bestseller':
          return b.bestseller ? 1 : -1;
        default:
          return 0;
      }
    });

    onFilterChange(filteredProducts);
  }, [products, sortBy, filters, onFilterChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sort Options */}
      <div className="flex flex-wrap gap-2">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
          <option value="bestseller">Bestsellers</option>
        </select>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-4">
        {/* Price Range */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-blue-900">Price Range:</label>
          <input
            type="number"
            value={filters.priceRange.min}
            onChange={(e) => setFilters(prev => ({ ...prev, priceRange: { ...prev.priceRange, min: Number(e.target.value) } }))}
            className="w-20 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            min="0"
          />
          <span>to</span>
          <input
            type="number"
            value={filters.priceRange.max}
            onChange={(e) => setFilters(prev => ({ ...prev, priceRange: { ...prev.priceRange, max: Number(e.target.value) } }))}
            className="w-20 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            min="0"
          />
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-blue-900">Min Rating:</label>
          <select
            value={filters.rating}
            onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
            className="px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="0">Any</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showBestsellers}
              onChange={(e) => setFilters(prev => ({ ...prev, showBestsellers: e.target.checked }))}
              className="rounded border-blue-300 text-blue-600 focus:ring-blue-200"
            />
            <span className="text-sm font-medium text-blue-900">Bestsellers</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showNew}
              onChange={(e) => setFilters(prev => ({ ...prev, showNew: e.target.checked }))}
              className="rounded border-blue-300 text-blue-600 focus:ring-blue-200"
            />
            <span className="text-sm font-medium text-blue-900">New</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showSale}
              onChange={(e) => setFilters(prev => ({ ...prev, showSale: e.target.checked }))}
              className="rounded border-blue-300 text-blue-600 focus:ring-blue-200"
            />
            <span className="text-sm font-medium text-blue-900">On Sale</span>
          </label>
        </div>
      </div>
    </div>
  );
} 