import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import LayoutClient from './LayoutClient';

export const metadata: Metadata = {
  title: 'Blessibles - Christian Family Printables',
  description: 'Discover and share Christian family printables, crafts, and resources.',
};

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
