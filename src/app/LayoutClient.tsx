"use client";

import Link from 'next/link';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import NotificationBell from '../components/NotificationBell';
import GoogleAnalytics from '../components/GoogleAnalytics';
import { initPerformanceMonitoring } from '../utils/performance';
import DailyVerse from '../components/DailyVerse';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import CartButton from '@/components/CartButton';
import QueryProvider from '@/providers/QueryProvider';
import OfflineBanner from '@/components/OfflineBanner';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch((err) => {
          console.error('Service worker registration failed:', err);
        });
      });
    }
  }, []);

  return (
    <>
      <OfflineBanner />
      <GoogleAnalytics />
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-2 left-2 bg-blue-900 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      <CartProvider>
        <QueryProvider>
          {/* Header / Navigation */}
          <header className="w-full bg-white shadow-md sticky top-0 z-50">
            <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
              <Link href="/" className="text-2xl font-extrabold text-blue-900 tracking-tight">
                Blessibles
              </Link>
              <div className="hidden md:flex gap-6 items-center">
                <Link href="/" className="text-blue-900 hover:text-blue-950 font-medium">Home</Link>
                <Link href="/products" className="text-blue-900 hover:text-blue-950 font-medium">Products</Link>
                <Link href="/calendar" className="text-blue-900 hover:text-blue-950 font-medium">Calendar</Link>
                <Link href="/testimonials" className="text-blue-900 hover:text-blue-950 font-medium">Testimonials</Link>
                <Link href="/prayer-board" className="text-blue-900 hover:text-blue-950 font-medium">Prayer Board</Link>
                <Link href="/ministry" className="text-blue-900 hover:text-blue-950 font-medium">Ministry</Link>
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
          <main id="main-content" className="flex-1 w-full">
            {children}
          </main>
          {/* Footer */}
          <footer className="w-full bg-white border-t py-4 text-center text-blue-900 text-sm mt-8" style={{ borderTopColor: '#1e3a8a', borderTopWidth: '1px', borderStyle: 'solid' }}>
            &copy; {new Date().getFullYear()} Blessibles.com. All rights reserved.
          </footer>
        </QueryProvider>
      </CartProvider>
    </>
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