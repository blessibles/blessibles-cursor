import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

const WISHLIST_KEY = 'blessibles_wishlist';

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistMessage: string;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistMessage, setWishlistMessage] = useState('');

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  }, []);

  // Save wishlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) return prev;
      setWishlistMessage('Added to wishlist.');
      return [...prev, productId];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => {
      setWishlistMessage('Removed from wishlist.');
      return prev.filter((id) => id !== productId);
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistMessage }}>
      {/* ARIA live region for wishlist actions */}
      <div aria-live="polite" className="sr-only">{wishlistMessage}</div>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
} 