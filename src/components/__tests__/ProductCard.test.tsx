import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '../ProductCard';

const mockProduct = {
  id: 1,
  title: 'Test Product',
  description: 'Test Description',
  price: 19.99,
  image: '/test-image.jpg',
  category: 'test-category',
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
    expect(screen.getByText(`$${mockProduct.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByAltText(mockProduct.title)).toBeInTheDocument();
  });

  it('calls onAddToCart when Add to Cart button is clicked', async () => {
    const onAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    await userEvent.click(addToCartButton);

    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('calls onAddToWishlist when wishlist button is clicked', async () => {
    const onAddToWishlist = jest.fn();
    render(<ProductCard product={mockProduct} onAddToWishlist={onAddToWishlist} />);

    const wishlistButton = screen.getByRole('button', { name: /add to wishlist/i });
    await userEvent.click(wishlistButton);

    expect(onAddToWishlist).toHaveBeenCalledWith(mockProduct);
  });

  it('shows loading state when isLoading is true', () => {
    render(<ProductCard product={mockProduct} isLoading={true} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(mockProduct.title)).not.toBeInTheDocument();
  });
}); 