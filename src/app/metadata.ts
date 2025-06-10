import { Metadata } from 'next';

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}

export function generateMetadata({
  title = 'Blessibles.com | Christian Family Printables',
  description = 'Christian family printables to inspire, encourage, and organize your home. Shop wall art, journals, activities, and more!',
  image = 'https://blessibles.com/og-image.jpg',
  path = '',
}: GenerateMetadataProps = {}): Metadata {
  const url = `https://blessibles.com${path}`;

  return {
    title,
    description,
    metadataBase: new URL('https://blessibles.com'),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Blessibles',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@blessibles',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-site-verification',
      yandex: 'your-yandex-verification',
    },
  };
} 