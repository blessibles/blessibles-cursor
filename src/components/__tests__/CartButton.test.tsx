import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartButton from '../CartButton';
import { CartProvider } from '@/contexts/CartContext';

describe('CartButton', () => {
  it('renders cart button with link', () => {
    render(
      <CartProvider>
        <CartButton />
      </CartProvider>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/cart');
    expect(link).toHaveClass('relative', 'flex', 'items-center', 'gap-1', 'text-blue-900', 'hover:text-blue-950', 'font-medium');
  });

  it('shows cart count when items are present', () => {
    const { getByText } = render(
      <CartProvider>
        <CartButton />
      </CartProvider>
    );

    // Add an item to the cart
    const addToCartButton = getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    // Check if cart count is displayed
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not show cart count when cart is empty', () => {
    render(
      <CartProvider>
        <CartButton />
      </CartProvider>
    );

    const countElement = screen.queryByText('0');
    expect(countElement).not.toBeInTheDocument();
  });

  it('has correct SVG icon', () => {
    render(
      <CartProvider>
        <CartButton />
      </CartProvider>
    );

    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toHaveClass('w-6', 'h-6');
  });
}); 