import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartPage from '../page';
import { CartProvider } from '@/contexts/CartContext';
import { Product } from '@/types';

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

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  }
}));

describe('CartPage', () => {
  it('renders empty cart message when cart is empty', () => {
    render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    expect(screen.getByText('Your Cart')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
  });

  it('renders cart items and summary when cart has items', () => {
    const { getByText } = render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // Add an item to the cart
    const addToCartButton = getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    // Check if cart items are rendered
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('test-category')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();

    // Check if order summary is rendered
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
  });

  it('allows updating item quantity', () => {
    const { getByText, getByLabelText } = render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // Add an item to the cart
    const addToCartButton = getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    // Increase quantity
    const increaseButton = getByLabelText('Increase quantity');
    fireEvent.click(increaseButton);

    // Check if total price is updated
    expect(screen.getByText('$199.98')).toBeInTheDocument();
  });

  it('allows removing items from cart', () => {
    const { getByText } = render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // Add an item to the cart
    const addToCartButton = getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    // Remove the item
    const removeButton = getByText('Remove');
    fireEvent.click(removeButton);

    // Check if cart is empty
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('shows processing state when checking out', () => {
    const { getByText } = render(
      <CartProvider>
        <CartPage />
      </CartProvider>
    );

    // Add an item to the cart
    const addToCartButton = getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    // Click checkout button
    const checkoutButton = getByText('Proceed to Checkout');
    fireEvent.click(checkoutButton);

    // Check if button shows processing state
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
}); 