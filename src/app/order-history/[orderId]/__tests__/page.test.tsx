import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderDetailsPage from '../page';
import { supabase } from '@/utils/supabaseClient';

// Mock Supabase
jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'user123' } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'order123',
              date: '2024-01-01T00:00:00Z',
              status: 'Processing',
              total: 99.99,
              payment_method: 'Credit Card',
              shipping_address: '123 Main St, City, State 12345',
              tracking_number: 'TRACK123',
              estimated_delivery: '2024-01-05',
              carrier: 'USPS',
              order_items: [
                {
                  id: 'item1',
                  product: {
                    title: 'Test Product',
                    description: 'Test Description',
                    price: 99.99,
                    image_url: 'test.jpg',
                  },
                  quantity: 1,
                  price: 99.99,
                },
              ],
            },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

describe('OrderDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders order details correctly', async () => {
    render(<OrderDetailsPage params={Promise.resolve({ orderId: 'order123' })} />);

    // Check for loading state
    expect(screen.getByText(/loading order details/i)).toBeInTheDocument();

    // Wait for order details to load
    await waitFor(() => {
      expect(screen.getByText('Order #order123')).toBeInTheDocument();
    });

    // Check order information
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, City, State 12345')).toBeInTheDocument();
    expect(screen.getByText('TRACK123')).toBeInTheDocument();
    expect(screen.getByText('1/5/2024')).toBeInTheDocument();
  });

  it('displays order items correctly', async () => {
    render(<OrderDetailsPage params={Promise.resolve({ orderId: 'order123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });
  });

  it('handles order cancellation', async () => {
    global.confirm = jest.fn(() => true);

    render(<OrderDetailsPage params={Promise.resolve({ orderId: 'order123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Cancel Order')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel Order'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/orders/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: 'order123' }),
      });
    });
  });

  it('handles refund request', async () => {
    render(<OrderDetailsPage params={Promise.resolve({ orderId: 'order123' })} />);

    await waitFor(() => {
      expect(screen.getByText('Request Refund')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Request Refund'));

    // Check if refund modal is displayed
    expect(screen.getByText('Reason for Refund')).toBeInTheDocument();

    // Fill in refund reason
    const textarea = screen.getByPlaceholderText(/explain why you're requesting a refund/i);
    fireEvent.change(textarea, { target: { value: 'Test refund reason' } });

    // Submit refund request
    fireEvent.click(screen.getByText('Submit Request'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/orders/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: 'order123',
          reason: 'Test refund reason',
        }),
      });
    });
  });

  it('handles error state', async () => {
    // Mock error response
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: new Error('Failed to fetch order'),
          })),
        })),
      })),
    }));

    render(<OrderDetailsPage params={Promise.resolve({ orderId: 'order123' })} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch order/i)).toBeInTheDocument();
    });
  });
}); 