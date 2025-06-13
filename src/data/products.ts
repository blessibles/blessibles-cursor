import { Product } from '../types';

const products: Product[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Scripture Wall Art',
    description: 'Inspire your home with beautiful verses.',
    image: '/products/scripture-wall-art.jpg',
    images: [
      '/products/scripture-wall-art.jpg',
      '/products/scripture-wall-art-2.jpg',
      '/products/scripture-wall-art-3.jpg'
    ],
    category: 'wall-art',
    tags: ['scripture', 'wall art', 'home decor', 'faith'],
    price: 12.99,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-20')
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Family Prayer Journal',
    description: 'Grow together in faith and gratitude.',
    image: '/products/family-prayer-journal.jpg',
    images: [
      '/products/family-prayer-journal.jpg',
      '/products/family-prayer-journal-2.jpg'
    ],
    category: 'journals',
    tags: ['prayer', 'journal', 'family', 'faith'],
    price: 9.99,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-20')
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: "Kids' Bible Activities",
    description: 'Fun, faith-filled activities for children.',
    image: '/products/kids-bible-activities.jpg',
    images: [
      '/products/kids-bible-activities.jpg',
      '/products/kids-bible-activities-2.jpg',
      '/products/kids-bible-activities-3.jpg'
    ],
    category: 'activities',
    tags: ['kids', 'bible', 'activities', 'learning'],
    price: 14.99,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-20')
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Blessibles Digital Gift Card',
    description: 'Give the gift of choice! Instantly delivered by email, redeemable for any printable.',
    image: '/products/gift-card.jpg',
    images: ['/products/gift-card.jpg'],
    category: 'gift-card',
    tags: ['gift card', 'gift', 'digital'],
    price: 25.00,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-20')
  }
];

export default products; 