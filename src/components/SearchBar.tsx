import React, { useState, useEffect, useRef } from 'react';
import { createSearchIndex, searchItems, getSearchSuggestions, SearchableItem, SearchSuggestion, getSearchHistory, addToSearchHistory, clearSearchHistory } from '../utils/search';
import Image from 'next/image';

interface SearchBarProps {
  items: SearchableItem[];
  onSearch: (results: SearchableItem[]) => void;
  placeholder?: string;
  className?: string;
  selectedCategory?: string;
}

export default function SearchBar({ 
  items, 
  onSearch, 
  placeholder = 'Search...', 
  className = '',
  selectedCategory
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchIndex = useRef(createSearchIndex(items));
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update search index when items change
    searchIndex.current = createSearchIndex(items);
  }, [items]);

  useEffect(() => {
    // Load search history
    setSearchHistory(getSearchHistory());
  }, []);

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
    const results = searchItems(searchIndex.current, searchQuery, 10, selectedCategory);
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

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch(suggestion.text);
    addToSearchHistory(suggestion.text);
    setSearchHistory(getSearchHistory());
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearchHistory();
    setSearchHistory([]);
  };

  const renderSuggestion = (suggestion: SearchSuggestion, index: number) => {
    return (
      <button
        key={index}
        onClick={() => handleSuggestionClick(suggestion)}
        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 flex items-center gap-3"
      >
        {suggestion.type === 'product' && suggestion.image && (
          <div className="w-8 h-8 relative flex-shrink-0">
            <Image
              src={suggestion.image}
              alt={suggestion.text}
              fill
              className="object-cover rounded"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-900">{suggestion.text}</div>
          {suggestion.type === 'product' && suggestion.category && (
            <div className="text-xs text-blue-600">{suggestion.category}</div>
          )}
        </div>
        <div className="text-xs text-blue-400 capitalize">{suggestion.type}</div>
      </button>
    );
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
        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-blue-900 placeholder-blue-400"
      />
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((suggestion, index) => renderSuggestion(suggestion, index))}
            </div>
          ) : query.length >= 2 ? (
            <div className="px-4 py-2 text-sm text-blue-600">No results found</div>
          ) : searchHistory.length > 0 ? (
            <div className="py-1">
              <div className="px-4 py-2 flex justify-between items-center border-b border-blue-100">
                <span className="text-sm font-medium text-blue-900">Recent Searches</span>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Clear History
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick({ text: item, type: 'product' })}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-blue-900">{item}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
} 