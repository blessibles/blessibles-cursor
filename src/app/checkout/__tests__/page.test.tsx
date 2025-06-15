import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckoutPage from '../page';
import { CartProvider } from '@/contexts/CartContext';
import { supabase } from '@/utils/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    createPaymentMethod: jest.fn(),
    confirmCardPayment: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock fetch for checkout intent
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ clientSecret: 'test_secret' }),
  })
) as jest.Mock;

describe('CheckoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock authenticated user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    });
  });

  it('renders checkout form with all required fields', () => {
    render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>
    );

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
  });

  it('validates form fields', async () => {
    render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>
    );

    // Try to submit empty form
    const submitButton = screen.getByText('Continue to Payment');
    fireEvent.click(submitButton);

    // Check for validation messages
    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(await screen.findByText('Valid email required.')).toBeInTheDocument();
    expect(await screen.findByText('Address is required.')).toBeInTheDocument();
    expect(await screen.findByText('City is required.')).toBeInTheDocument();
    expect(await screen.findByText('State is required.')).toBeInTheDocument();
    expect(await screen.findByText('Valid ZIP code required.')).toBeInTheDocument();
  });

  it('shows payment form after valid form submission', async () => {
    render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>
    );

    // Fill out form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/street address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Anytown' } });
    fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });
    fireEvent.change(screen.getByLabelText(/zip code/i), { target: { value: '12345' } });

    // Submit form
    const submitButton = screen.getByText('Continue to Payment');
    fireEvent.click(submitButton);

    // Check if payment form is shown
    await waitFor(() => {
      expect(screen.getByText('Payment Information')).toBeInTheDocument();
    });
  });

  it('handles payment processing', async () => {
    render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>
    );

    // Fill out form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/street address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Anytown' } });
    fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });
    fireEvent.change(screen.getByLabelText(/zip code/i), { target: { value: '12345' } });

    // Submit form
    const submitButton = screen.getByText('Continue to Payment');
    fireEvent.click(submitButton);

    // Mock successful payment
    const mockStripe = await loadStripe('test_key');
    (mockStripe.confirmCardPayment as jest.Mock).mockResolvedValue({
      paymentIntent: { status: 'succeeded' },
    });

    // Click pay button
    const payButton = await screen.findByText(/pay/i);
    fireEvent.click(payButton);

    // Check if order is created in Supabase
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('orders');
    });
  });

  it('shows error message on payment failure', async () => {
    render(
      <CartProvider>
        <CheckoutPage />
      </CartProvider>
    );

    // Fill out form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/street address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Anytown' } });
    fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } });
    fireEvent.change(screen.getByLabelText(/zip code/i), { target: { value: '12345' } });

    // Submit form
    const submitButton = screen.getByText('Continue to Payment');
    fireEvent.click(submitButton);

    // Mock failed payment
    const mockStripe = await loadStripe('test_key');
    (mockStripe.confirmCardPayment as jest.Mock).mockResolvedValue({
      error: { message: 'Your card was declined.' },
    });

    // Click pay button
    const payButton = await screen.findByText(/pay/i);
    fireEvent.click(payButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Your card was declined.')).toBeInTheDocument();
    });
  });
}); 