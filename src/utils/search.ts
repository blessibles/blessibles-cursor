import Fuse, { FuseResult, FuseResultMatch } from 'fuse.js';
import { Product } from '@/types';

export type SearchableItem = Product;

export interface SearchOptions {
  keys: Array<{
    name: string;
    weight: number;
  }>;
  threshold?: number;
  minMatchCharLength?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
}

const defaultSearchOptions: SearchOptions = {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'description', weight: 1 },
    { name: 'category', weight: 1.5 },
    { name: 'tags', weight: 1.2 }
  ],
  threshold: 0.3,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
};

// Search history management
const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  const history = localStorage.getItem(SEARCH_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
}

export function addToSearchHistory(query: string): void {
  if (typeof window === 'undefined') return;
  const history = getSearchHistory();
  const newHistory = [query, ...history.filter(item => item !== query)].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
}

export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

export function createSearchIndex(items: SearchableItem[], options: SearchOptions = defaultSearchOptions) {
  return new Fuse(items, {
    ...options,
    keys: options.keys.map(key => key.name),
    getFn: (obj, path) => {
      const value = path.split('.').reduce((o, i) => o?.[i], obj);
      return value || '';
    }
  });
}

export function searchItems(
  searchIndex: Fuse<SearchableItem>,
  query: string,
  limit: number = 10,
  category?: string
): SearchableItem[] {
  if (!query || query.length < 2) return [];
  
  let results = searchIndex.search(query, { limit });
  
  // Filter by category if specified
  if (category && category !== 'all') {
    results = results.filter(result => result.item.category === category);
  }
  
  return results.map((result: FuseResult<SearchableItem>) => result.item);
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'tag';
  image?: string;
  category?: string;
}

export function getSearchSuggestions(
  searchIndex: Fuse<SearchableItem>,
  query: string,
  limit: number = 5
): SearchSuggestion[] {
  if (!query || query.length < 2) return [];
  
  const results = searchIndex.search(query, { limit });
  const suggestions: SearchSuggestion[] = [];
  
  // Add product suggestions
  results.forEach(result => {
    suggestions.push({
      text: result.item.name,
      type: 'product',
      image: result.item.image,
      category: result.item.category
    });
  });
  
  // Add category suggestions if they match
  const categories = new Set(results.map(r => r.item.category));
  categories.forEach(category => {
    if (category.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push({
        text: category,
        type: 'category'
      });
    }
  });
  
  // Add tag suggestions
  const tags = new Set(results.flatMap(r => r.item.tags || []));
  tags.forEach(tag => {
    if (tag.toLowerCase().includes(query.toLowerCase())) {
      suggestions.push({
        text: tag,
        type: 'tag'
      });
    }
  });
  
  return suggestions;
}

export function highlightMatches(text: string, matches: FuseResultMatch[]): string {
  if (!matches || matches.length === 0) return text;
  
  let highlightedText = text;
  matches.forEach(match => {
    match.indices.forEach(([start, end]: [number, number]) => {
      const matchedText = text.slice(start, end + 1);
      highlightedText = highlightedText.replace(
        matchedText,
        `<mark class="bg-yellow-200">${matchedText}</mark>`
      );
    });
  });
  
  return highlightedText;
} 