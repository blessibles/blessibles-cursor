import { NextResponse } from 'next/server';

export async function GET() {
  // List of static routes; in a real app, you might fetch dynamic product/blog URLs
  const pages = [
    '', // homepage
    'about',
    'wishlist',
    'library',
    'community',
    'prayer-board',
    'resources',
    'events',
    'groups',
    'messages',
    'activity-log',
    'newsletter',
    'support',
    'profile',
    'signup',
    'login',
    'order-history',
    'checkout',
    'success',
    'admin',
  ];
  const baseUrl = 'https://blessibles.com';
  const urls = pages.map(
    (page) =>
      `<url><loc>${baseUrl}/${page}</loc></url>`
  ).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 