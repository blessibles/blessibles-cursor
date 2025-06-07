import React, { useState, useEffect, useRef } from 'react';
import { createSearchIndex, searchItems, getSearchSuggestions, SearchableItem } from '../utils/search';

interface SearchBarProps {
  items: SearchableItem[];
  onSearch: (results: SearchableItem[]) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ items, onSearch, placeholder = 'Search...', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchIndex = useRef(createSearchIndex(items));
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update search index when items change
    searchIndex.current = createSearchIndex(items);
  }, [items]);

  useEffect(() => {
    // Handle clicks outside of suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const results = searchItems(searchIndex.current, searchQuery);
    onSearch(results);
    
    if (searchQuery.length >= 2) {
      const newSuggestions = getSearchSuggestions(searchIndex.current, searchQuery);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => query.length >= 2 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 