"use client";
import './globals.css';
import Link from 'next/link';
import { ReactNode, useState, createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { v4 as uuidv4 } from 'uuid'; // Removed unused import
import { supabase } from '../utils/supabaseClient';
import NotificationBell from '../components/NotificationBell';
import GoogleAnalytics from '../components/GoogleAnalytics';
import { initPerformanceMonitoring } from '../utils/performance';
import DailyVerse from '../components/DailyVerse';

// Cart context types
interface CartItem {
  title: string;
  quantity: number;
}
interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (title: string) => void;
  increaseQuantity: (title: string) => void;
  decreaseQuantity: (title: string) => void;
  cartCount: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartMessage, setCartMessage] = useState('');
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.title === item.title);
      if (existing) {
        setCartMessage(`${item.title} quantity increased in cart.`);
        return prev.map((i) =>
          i.title === item.title ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      setCartMessage(`${item.title} added to cart.`);
      return [...prev, item];
    });
  };
  const removeFromCart = (title: string) => {
    setCart((prev) => prev.filter((i) => i.title !== title));
    setCartMessage(`${title} removed from cart.`);
  };
  const increaseQuantity = (title: string) => {
    setCart((prev) => prev.map((i) =>
      i.title === title ? { ...i, quantity: i.quantity + 1 } : i
    ));
    setCartMessage(`${title} quantity increased in cart.`);
  };
  const decreaseQuantity = (title: string) => {
    setCart((prev) => prev.flatMap((i) =>
      i.title === title ? (i.quantity > 1 ? [{ ...i, quantity: i.quantity - 1 }] : []) : [i]
    ));
    setCartMessage(`${title} quantity decreased in cart.`);
  };
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, cartCount }}>
      {/* ARIA live region for cart updates */}
      <div aria-live="polite" className="sr-only">{cartMessage}</div>
      {children}
    </CartContext.Provider>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Blessibles.com | Christian Family Printables</title>
        <meta name="description" content="Christian family printables to inspire, encourage, and organize your home. Shop wall art, journals, activities, and more!" />
        <meta property="og:title" content="Blessibles.com | Christian Family Printables" />
        <meta property="og:description" content="Christian family printables to inspire, encourage, and organize your home. Shop wall art, journals, activities, and more!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blessibles.com/" />
        <meta property="og:image" content="https://blessibles.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blessibles.com | Christian Family Printables" />
        <meta name="twitter:description" content="Christian family printables to inspire, encourage, and organize your home. Shop wall art, journals, activities, and more!" />
        <meta name="twitter:image" content="https://blessibles.com/og-image.jpg" />
        <link rel="canonical" href="https://blessibles.com/" />
        <meta name="robots" content="index, follow" />
        <link rel="preload" href="/fonts/Geist-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/og-image.jpg" as="image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Blessibles',
          url: 'https://blessibles.com/',
          logo: 'https://blessibles.com/og-image.jpg',
          sameAs: [
            'https://www.facebook.com/blessibles',
            'https://www.instagram.com/blessibles',
            'https://www.pinterest.com/blessibles'
          ],
          description: 'Christian family printables to inspire, encourage, and organize your home.'
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Blessibles',
          url: 'https://blessibles.com/',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://blessibles.com/?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }) }} />
      </head>
      <body className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col font-sans">
        <GoogleAnalytics />
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only absolute top-2 left-2 bg-blue-900 text-white px-4 py-2 rounded z-50"
        >
          Skip to main content
        </a>
        <CartProvider>
          {/* Header / Navigation */}
          <header className="w-full bg-white shadow-md sticky top-0 z-50">
            <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
              <Link href="/" className="text-2xl font-extrabold text-blue-900 tracking-tight">
                Blessibles
              </Link>
              <div className="hidden md:flex gap-6 items-center">
                <Link href="/" className="text-blue-900 hover:text-blue-950 font-medium">Home</Link>
                <Link href="/products" className="text-blue-900 hover:text-blue-950 font-medium">Products</Link>
                <Link href="/wishlist" className="flex items-center gap-1 text-blue-900 hover:text-blue-950 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ef4444" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 0 0-7.6 0l-.835.836-.835-.836a5.373 5.373 0 1 0-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 0 0 0-7.6z" />
                  </svg>
                  Wishlist
                </Link>
                <Link href="/about" className="text-blue-900 hover:text-blue-950 font-medium">About</Link>
                <AuthStatus />
                <NotificationBell />
                <CartButton />
              </div>
              {/* Hamburger for mobile */}
              <div className="md:hidden flex items-center">
                <MobileMenu />
              </div>
            </nav>
          </header>
          <DailyVerse />
          <main id="main-content" className="flex-1 w-full flex flex-col items-center justify-start">
            {children}
          </main>
          {/* Footer */}
          <footer className="w-full bg-white border-t py-4 text-center text-blue-900 text-sm mt-8" style={{ borderTopColor: '#1e3a8a', borderTopWidth: '1px', borderStyle: 'solid' }}>
            &copy; {new Date().getFullYear()} Blessibles.com. All rights reserved.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

function AuthStatus() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user as SupabaseUser);
    };
    getUser();
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as SupabaseUser) ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-blue-900 font-medium">Hi, {user.user_metadata?.name || user.email}</span>
        <Link href="/profile" className="text-blue-900 hover:underline font-medium">Profile</Link>
        <button
          className="bg-blue-100 text-blue-900 px-3 py-1 rounded hover:bg-blue-200 font-semibold"
          onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
        >
          Logout
        </button>
      </div>
    );
  }
  return (
    <Link href="/login" className="text-blue-900 hover:text-blue-950 font-medium">Login</Link>
  );
}

function CartButton() {
  const ctx = useContext(CartContext);
  const cartCount = ctx ? ctx.cartCount : 0;
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <button className="relative" onClick={() => setOpen(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-900 hover:text-blue-950">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.5l.375 2.25M6 16.5A2.25 2.25 0 1 0 6 21a2.25 2.25 0 0 0 0-4.5zm0 0h9.75a2.25 2.25 0 0 0 2.24-2.02l1.08-8.11A1.125 1.125 0 0 0 17.93 5.25H4.81" />
        </svg>
        <span className="absolute -top-2 -right-2 bg-blue-900 text-white text-xs rounded-full px-1.5 py-0.5">{cartCount}</span>
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-none relative mx-4 sm:mx-12 md:mx-32 lg:mx-64 xl:mx-96">
            <button className="absolute top-2 right-2 text-blue-900 hover:text-blue-950 text-xl" onClick={() => setOpen(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-4 text-blue-900">Your Cart</h3>
            {ctx && ctx.cart.length > 0 ? (
              <>
                <ul className="mb-4">
                  {ctx.cart.map((item) => (
                    <li key={item.title} className="flex justify-between items-center py-1 border-b last:border-b-0 gap-2">
                      <span>{item.title}</span>
                      <div className="flex items-center gap-1">
                        <button className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded hover:bg-blue-200" onClick={() => ctx.decreaseQuantity(item.title)}>-</button>
                        <span className="font-semibold text-blue-900">{item.quantity}</span>
                        <button className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded hover:bg-blue-200" onClick={() => ctx.increaseQuantity(item.title)}>+</button>
                      </div>
                      <button className="text-red-600 hover:text-red-800 text-xs ml-2" onClick={() => ctx.removeFromCart(item.title)}>Remove</button>
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-blue-900 text-white py-2 rounded font-semibold hover:bg-blue-800 transition mb-2" onClick={() => { setOpen(false); router.push('/checkout'); }}>Checkout</button>
              </>
            ) : (
              <p className="text-blue-900">Your cart is empty.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="text-blue-900 hover:text-blue-950 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15m-15 5.25h15m-15 5.25h15" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg flex flex-col gap-4 p-4 z-50 min-w-[160px] border">
          <Link href="/" className="text-blue-900 hover:text-blue-950 font-medium" onClick={() => setOpen(false)}>Home</Link>
          <Link href="/products" className="text-blue-900 hover:text-blue-950 font-medium" onClick={() => setOpen(false)}>Products</Link>
          <Link href="/about" className="text-blue-900 hover:text-blue-950 font-medium" onClick={() => setOpen(false)}>About</Link>
          <button className="flex items-center gap-2 text-blue-900 hover:text-blue-950 font-medium" onClick={() => setOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.5l.375 2.25M6 16.5A2.25 2.25 0 1 0 6 21a2.25 2.25 0 0 0 0-4.5zm0 0h9.75a2.25 2.25 0 0 0 2.24-2.02l1.08-8.11A1.125 1.125 0 0 0 17.93 5.25H4.81" />
            </svg>
            Cart
          </button>
        </div>
      )}
    </>
  );
}

export function reportWebVitals(metric: any) {
  if (typeof window !== 'undefined') {
    console.log('[Web Vitals]', metric);
  }
}
