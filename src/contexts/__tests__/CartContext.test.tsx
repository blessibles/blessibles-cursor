import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartProvider, useCart } from '../CartContext';
import { Product } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the cart context
function TestComponent() {
  const cart = useCart();
  return (
    <div>
      <div data-testid="total-items">{cart.totalItems}</div>
      <div data-testid="total-price">{cart.totalPrice}</div>
      <button onClick={() => cart.addItem(mockProduct)}>Add Item</button>
      <button onClick={() => cart.removeItem(mockProduct.id)}>Remove Item</button>
      <button onClick={() => cart.updateQuantity(mockProduct.id, 2)}>Update Quantity</button>
      <button onClick={() => cart.clearCart()}>Clear Cart</button>
    </div>
  );
}

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

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('initializes with empty cart', () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(getByTestId('total-items')).toHaveTextContent('0');
    expect(getByTestId('total-price')).toHaveTextContent('0');
  });

  it('loads cart from localStorage on mount', () => {
    const savedCart = [{ product: mockProduct, quantity: 2 }];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedCart));

    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(getByTestId('total-items')).toHaveTextContent('2');
    expect(getByTestId('total-price')).toHaveTextContent('199.98');
  });

  it('adds item to cart', () => {
    const { getByTestId, getByText } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    act(() => {
      getByText('Add Item').click();
    });

    expect(getByTestId('total-items')).toHaveTextContent('1');
    expect(getByTestId('total-price')).toHaveTextContent('99.99');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('removes item from cart', () => {
    const { getByTestId, getByText } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // First add an item
    act(() => {
      getByText('Add Item').click();
    });

    // Then remove it
    act(() => {
      getByText('Remove Item').click();
    });

    expect(getByTestId('total-items')).toHaveTextContent('0');
    expect(getByTestId('total-price')).toHaveTextContent('0');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('updates item quantity', () => {
    const { getByTestId, getByText } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // First add an item
    act(() => {
      getByText('Add Item').click();
    });

    // Then update its quantity
    act(() => {
      getByText('Update Quantity').click();
    });

    expect(getByTestId('total-items')).toHaveTextContent('2');
    expect(getByTestId('total-price')).toHaveTextContent('199.98');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('clears cart', () => {
    const { getByTestId, getByText } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // First add an item
    act(() => {
      getByText('Add Item').click();
    });

    // Then clear the cart
    act(() => {
      getByText('Clear Cart').click();
    });

    expect(getByTestId('total-items')).toHaveTextContent('0');
    expect(getByTestId('total-price')).toHaveTextContent('0');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('throws error when useCart is used outside CartProvider', () => {
    const consoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');

    console.error = consoleError;
  });
}); 