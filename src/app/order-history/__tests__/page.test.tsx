import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderHistoryPage from '../page';
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
          order: jest.fn(() => ({
            data: [
              {
                id: 'order1',
                date: '2024-01-01T00:00:00Z',
                total: 99.99,
                status: 'Processing',
              },
              {
                id: 'order2',
                date: '2024-01-02T00:00:00Z',
                total: 149.99,
                status: 'Delivered',
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

describe('OrderHistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders order history for authenticated user', async () => {
    render(<OrderHistoryPage />);

    // Check for loading state
    expect(screen.getByText(/loading orders/i)).toBeInTheDocument();

    // Wait for orders to load
    await waitFor(() => {
      expect(screen.getByText('Order History')).toBeInTheDocument();
    });

    // Check if orders are displayed
    expect(screen.getByText('order1')).toBeInTheDocument();
    expect(screen.getByText('order2')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$149.99')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('shows login message for unauthenticated user', async () => {
    // Mock unauthenticated user
    (supabase.auth.getUser as jest.Mock).mockImplementationOnce(() => ({
      data: { user: null },
    }));

    render(<OrderHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/please log in/i)).toBeInTheDocument();
    });

    // Check for login link
    const loginLink = screen.getByText(/log in/i);
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('displays empty state when no orders exist', async () => {
    // Mock empty orders
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    }));

    render(<OrderHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/you have no orders yet/i)).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    // Mock error response
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: null,
            error: new Error('Failed to fetch orders'),
          })),
        })),
      })),
    }));

    render(<OrderHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/error loading orders/i)).toBeInTheDocument();
    });
  });

  it('displays order dates in correct format', async () => {
    render(<OrderHistoryPage />);

    await waitFor(() => {
      const dates = screen.getAllByText(/1\/1\/2024|1\/2\/2024/);
      expect(dates).toHaveLength(2);
    });
  });
}); 