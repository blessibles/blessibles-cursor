import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCard from '../ProductCard';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { useCollections } from '@/hooks/useCollections';
import { Product } from '@/types';

// Mock all required hooks
jest.mock('@/hooks/useSupabase', () => ({
  useSupabase: jest.fn(() => ({
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }
  }))
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: null,
    loading: false
  }))
}));

jest.mock('@/hooks/useCollections', () => ({
  useCollections: jest.fn(() => ({
    collections: [],
    loading: false,
    addToCollection: jest.fn(),
    removeFromCollection: jest.fn()
  }))
}));

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    image: '/test-image.jpg',
    category: 'test-category',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('test-category')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });
}); 