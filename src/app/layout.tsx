"use client";
import './globals.css';
import Link from 'next/link';
import { ReactNode, useState } from 'react';

export const metadata = {
  title: 'Blessibles.com',
  description: 'Christian Family Printables Ecommerce',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-blue-50 to-white min-h-screen flex flex-col font-sans">
        {/* Header / Navigation */}
        <header className="w-full bg-white shadow-md sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="text-2xl font-extrabold text-blue-800 tracking-tight">
              Blessibles
            </Link>
            <div className="hidden md:flex gap-6 items-center">
              <Link href="/" className="text-blue-700 hover:text-blue-900 font-medium">Home</Link>
              <Link href="#featured-products" className="text-blue-700 hover:text-blue-900 font-medium">Products</Link>
              <Link href="/about" className="text-blue-700 hover:text-blue-900 font-medium">About</Link>
              <button className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-blue-700 hover:text-blue-900">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.5l.375 2.25M6 16.5A2.25 2.25 0 1 0 6 21a2.25 2.25 0 0 0 0-4.5zm0 0h9.75a2.25 2.25 0 0 0 2.24-2.02l1.08-8.11A1.125 1.125 0 0 0 17.93 5.25H4.81" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-blue-700 text-white text-xs rounded-full px-1.5 py-0.5">0</span>
              </button>
            </div>
            {/* Hamburger for mobile */}
            <div className="md:hidden flex items-center">
              <MobileMenu />
            </div>
          </nav>
        </header>
        <main className="flex-1 w-full flex flex-col items-center justify-start">
          {children}
        </main>
        {/* Footer */}
        <footer className="w-full bg-white border-t py-4 text-center text-blue-700 text-sm mt-8">
          &copy; {new Date().getFullYear()} Blessibles.com. All rights reserved.
        </footer>
      </body>
    </html>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="text-blue-700 hover:text-blue-900 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15m-15 5.25h15m-15 5.25h15" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg flex flex-col gap-4 p-4 z-50 min-w-[160px] border">
          <Link href="/" className="text-blue-700 hover:text-blue-900 font-medium" onClick={() => setOpen(false)}>Home</Link>
          <Link href="#featured-products" className="text-blue-700 hover:text-blue-900 font-medium" onClick={() => setOpen(false)}>Products</Link>
          <Link href="/about" className="text-blue-700 hover:text-blue-900 font-medium" onClick={() => setOpen(false)}>About</Link>
          <button className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium" onClick={() => setOpen(false)}>
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
