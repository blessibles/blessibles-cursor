import Fuse, { FuseResult, FuseResultMatch } from 'fuse.js';

export interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

export interface SearchOptions {
  keys: string[];
  threshold?: number;
  minMatchCharLength?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
}

const defaultSearchOptions: SearchOptions = {
  keys: ['title', 'description', 'category', 'tags'],
  threshold: 0.3,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
};

export function createSearchIndex(items: SearchableItem[], options: SearchOptions = defaultSearchOptions) {
  return new Fuse(items, options);
}

export function searchItems(
  searchIndex: Fuse<SearchableItem>,
  query: string,
  limit: number = 10
): SearchableItem[] {
  if (!query || query.length < 2) return [];
  
  const results = searchIndex.search(query, { limit });
  return results.map((result: FuseResult<SearchableItem>) => result.item);
}

export function getSearchSuggestions(
  searchIndex: Fuse<SearchableItem>,
  query: string,
  limit: number = 5
): string[] {
  if (!query || query.length < 2) return [];
  
  const results = searchIndex.search(query, { limit });
  return results.map((result: FuseResult<SearchableItem>) => result.item.title);
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