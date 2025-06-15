import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderTracking from '../OrderTracking';
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
                status: 'In Transit',
                location: 'New York, NY',
                timestamp: '2024-01-01T12:00:00Z',
                description: 'Package is in transit',
              },
              {
                status: 'Delivered',
                location: 'Brooklyn, NY',
                timestamp: '2024-01-02T15:00:00Z',
                description: 'Package has been delivered',
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
  },
}));

// Mock fetch for tracking API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        events: [
          {
            status: 'In Transit',
            location: 'New York, NY',
            timestamp: '2024-01-01T12:00:00Z',
            description: 'Package is in transit',
          },
          {
            status: 'Delivered',
            location: 'Brooklyn, NY',
            timestamp: '2024-01-02T15:00:00Z',
            description: 'Package has been delivered',
          },
        ],
      }),
  })
) as jest.Mock;

describe('OrderTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders tracking information when available', async () => {
    render(
      <OrderTracking
        orderId="123"
        trackingNumber="TRACK123"
        carrier="USPS"
      />
    );

    // Check for loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for tracking information to load
    await waitFor(() => {
      expect(screen.getByText('Tracking Information')).toBeInTheDocument();
    });

    // Check tracking details
    expect(screen.getByText('TRACK123')).toBeInTheDocument();
    expect(screen.getByText('USPS')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('displays message when tracking number is not available', () => {
    render(<OrderTracking orderId="123" />);

    expect(
      screen.getByText('Tracking information is not available yet.')
    ).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock fetch error
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    render(
      <OrderTracking
        orderId="123"
        trackingNumber="TRACK123"
        carrier="USPS"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading tracking information/i)).toBeInTheDocument();
    });
  });

  it('displays tracking events in chronological order', async () => {
    render(
      <OrderTracking
        orderId="123"
        trackingNumber="TRACK123"
        carrier="USPS"
      />
    );

    await waitFor(() => {
      const events = screen.getAllByText(/In Transit|Delivered/);
      expect(events[0]).toHaveTextContent('In Transit');
      expect(events[1]).toHaveTextContent('Delivered');
    });
  });

  it('shows last updated timestamp', async () => {
    render(
      <OrderTracking
        orderId="123"
        trackingNumber="TRACK123"
        carrier="USPS"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
    });
  });
}); 