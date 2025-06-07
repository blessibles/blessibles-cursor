import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://blessibles.com';

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/products',
    '/contact',
    '/blog',
    '/faq',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes (example for products)
  // In a real application, you would fetch this data from your database
  const productRoutes = Array.from({ length: 10 }, (_, i) => ({
    url: `${baseUrl}/products/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Blog post routes (example)
  // In a real application, you would fetch this data from your database
  const blogRoutes = Array.from({ length: 5 }, (_, i) => ({
    url: `${baseUrl}/blog/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
} 