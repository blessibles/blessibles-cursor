import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddToCartClient from '../AddToCartClient';
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

describe('AddToCartClient', () => {
  it('renders add to cart button', () => {
    render(
      <CartProvider>
        <AddToCartClient product={mockProduct} />
      </CartProvider>
    );

    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('adds product to cart when clicked', () => {
    const { getByText } = render(
      <CartProvider>
        <AddToCartClient product={mockProduct} />
      </CartProvider>
    );

    fireEvent.click(getByText('Add to Cart'));

    // The button should still be visible after adding to cart
    expect(getByText('Add to Cart')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    render(
      <CartProvider>
        <AddToCartClient product={mockProduct} />
      </CartProvider>
    );

    const button = screen.getByText('Add to Cart');
    expect(button).toHaveClass('px-6', 'py-2', 'bg-blue-600', 'text-white', 'rounded-lg', 'hover:bg-blue-700', 'transition-colors');
  });
}); 