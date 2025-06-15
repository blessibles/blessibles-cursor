import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrdersPage from '../page';
import { supabase } from '@/utils/supabaseClient';

// Mock Supabase
jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              {
                id: '1',
                created_at: '2024-01-01T00:00:00Z',
                total: 99.99,
                status: 'Processing',
                order_items: [
                  {
                    id: '1',
                    product_id: '1',
                    title: 'Test Product',
                    quantity: 1,
                    price: 99.99,
                  },
                ],
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

describe('OrdersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders order history with order details', async () => {
    render(<OrdersPage />);

    // Check for page title
    expect(screen.getByText('My Orders')).toBeInTheDocument();

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeInTheDocument();
    });

    // Check order details
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
  });

  it('displays order date in correct format', async () => {
    render(<OrdersPage />);

    await waitFor(() => {
      const dateElement = screen.getByText(/Placed on/);
      expect(dateElement).toBeInTheDocument();
      expect(dateElement).toHaveTextContent('1/1/2024');
    });
  });

  it('shows download button for order items', async () => {
    render(<OrdersPage />);

    await waitFor(() => {
      const downloadButton = screen.getByRole('button', { name: /download/i });
      expect(downloadButton).toBeInTheDocument();
    });
  });

  it('handles empty order history', async () => {
    // Mock empty orders
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    }));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    // Mock error
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: null,
            error: new Error('Failed to fetch orders'),
          })),
        })),
      })),
    }));

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading orders')).toBeInTheDocument();
    });
  });
}); 