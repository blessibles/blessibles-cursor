import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductPage from '../page';
import { supabase } from '@/utils/supabaseClient';
import { CartProvider } from '@/contexts/CartContext';

// Helper to create a full Supabase query chain mock
function createSupabaseQueryMock({ singleData, arrayData, error = null }) {
  const chain = {
    eq: jest.fn(() => chain),
    neq: jest.fn(() => chain),
    or: jest.fn(() => chain),
    overlaps: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    single: jest.fn().mockResolvedValue({ data: singleData, error }),
    select: jest.fn(() => chain),
    // For recommendations, .single() is not called, so .then() returns arrayData
    then: undefined,
  };
  // For recommendations, .then() is called on the chain
  chain.then = (cb) => Promise.resolve(cb({ data: arrayData, error }));
  return chain;
}

// Mock the supabase client
jest.mock('@/utils/supabaseClient', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    image_url: '/test-image.jpg',
    category: 'test-category',
    tags: ['tag1', 'tag2'],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  return {
    supabase: {
      from: jest.fn((table) => {
        // If fetching the main product, return singleData
        if (table === 'products') {
          return createSupabaseQueryMock({ singleData: mockProduct, arrayData: [mockProduct], error: null });
        }
        // For recommendations or other tables, return arrayData
        return createSupabaseQueryMock({ singleData: null, arrayData: [mockProduct], error: null });
      })
    }
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  })
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  }
}));

describe('ProductPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', async () => {
    render(
      <CartProvider>
        {await ProductPage({ params: { id: '1' } })}
      </CartProvider>
    );
    expect(await screen.findByRole('heading', { name: 'Test Product' })).toBeInTheDocument();
    expect(await screen.findByText('Test Description')).toBeInTheDocument();
    const priceEls = await screen.findAllByText('$99.99');
    expect(priceEls.length).toBeGreaterThan(0);
    const imgEls = await screen.findAllByAltText('Test Product');
    expect(imgEls.length).toBeGreaterThan(0);
    expect(await screen.findByText('tag1')).toBeInTheDocument();
    expect(await screen.findByText('tag2')).toBeInTheDocument();
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(await screen.findByText('Products')).toBeInTheDocument();
    const categoryEls = await screen.findAllByText('test-category');
    expect(categoryEls.length).toBeGreaterThan(0);
    expect(await screen.findByText('Scripture-based Recommendations')).toBeInTheDocument();
    expect(await screen.findByText('You May Also Like')).toBeInTheDocument();
  });

  it('shows error state when product is not found', async () => {
    // Mock the product fetch to return error
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'products') {
        return createSupabaseQueryMock({ singleData: null, arrayData: [], error: new Error('Product not found') });
      }
      return createSupabaseQueryMock({ singleData: null, arrayData: [], error: null });
    });
    render(
      <CartProvider>
        {await ProductPage({ params: { id: '1' } })}
      </CartProvider>
    );
    expect(await screen.findByText('Product not found')).toBeInTheDocument();
    expect(await screen.findByText('Return to Products')).toBeInTheDocument();
  });

  it('renders social sharing buttons', async () => {
    // Explicitly mock the Supabase client to return the product
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      image_url: '/test-image.jpg',
      category: 'test-category',
      tags: ['tag1', 'tag2'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'products') {
        return createSupabaseQueryMock({ singleData: mockProduct, arrayData: [mockProduct], error: null });
      }
      return createSupabaseQueryMock({ singleData: null, arrayData: [mockProduct], error: null });
    });
    render(
      <CartProvider>
        {await ProductPage({ params: { id: '1' } })}
      </CartProvider>
    );
    await screen.findByText('You May Also Like');
    const facebookLinks = document.querySelectorAll('a[href*="facebook.com"]');
    const twitterLinks = document.querySelectorAll('a[href*="twitter.com"]');
    const pinterestLinks = document.querySelectorAll('a[href*="pinterest.com"]');
    expect(facebookLinks.length + twitterLinks.length + pinterestLinks.length).toBeGreaterThan(0);
  });

  it('renders reviews placeholder', async () => {
    // Explicitly mock the Supabase client to return the product
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      image_url: '/test-image.jpg',
      category: 'test-category',
      tags: ['tag1', 'tag2'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'products') {
        return createSupabaseQueryMock({ singleData: mockProduct, arrayData: [mockProduct], error: null });
      }
      return createSupabaseQueryMock({ singleData: null, arrayData: [mockProduct], error: null });
    });
    render(
      <CartProvider>
        {await ProductPage({ params: { id: '1' } })}
      </CartProvider>
    );
    expect(await screen.findByText('Reviews & Ratings')).toBeInTheDocument();
    expect(await screen.findByText('Reviews and ratings coming soon!')).toBeInTheDocument();
  });
}); 