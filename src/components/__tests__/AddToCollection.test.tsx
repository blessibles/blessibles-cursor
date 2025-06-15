import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddToCollection } from '../AddToCollection';
import { useCollections } from '@/hooks/useCollections';
import { useAuth } from '@/hooks/useAuth';

// Mock the hooks
jest.mock('@/hooks/useCollections', () => ({
  useCollections: jest.fn()
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user' },
    loading: false
  }))
}));

describe('AddToCollection', () => {
  const mockCollections = [
    { id: '1', name: 'Favorites' },
    { id: '2', name: 'Wishlist' }
  ];

  const mockAddToCollection = jest.fn();

  beforeEach(() => {
    (useCollections as jest.Mock).mockReturnValue({
      collections: mockCollections,
      addToCollection: mockAddToCollection,
      loading: false
    });
  });

  it('renders the add to collection button', () => {
    render(<AddToCollection productId="test-product" />);
    expect(screen.getByRole('button', { name: /add to collection/i })).toBeInTheDocument();
  });

  it('opens dialog when button is clicked', () => {
    render(<AddToCollection productId="test-product" />);
    fireEvent.click(screen.getByRole('button', { name: /add to collection/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
  });

  it('shows empty state when no collections exist', () => {
    (useCollections as jest.Mock).mockReturnValue({
      collections: [],
      addToCollection: mockAddToCollection,
      loading: false
    });

    render(<AddToCollection productId="test-product" />);
    fireEvent.click(screen.getByRole('button', { name: /add to collection/i }));
    expect(screen.getByText("You haven't created any collections yet.")).toBeInTheDocument();
  });

  it('calls addToCollection when a collection is selected', async () => {
    render(<AddToCollection productId="test-product" />);
    fireEvent.click(screen.getByRole('button', { name: /add to collection/i }));
    fireEvent.click(screen.getByText('Favorites'));

    await waitFor(() => {
      expect(mockAddToCollection).toHaveBeenCalledWith('1', 'test-product');
    });
  });

  it('calls onSuccess callback after successful addition', async () => {
    const onSuccess = jest.fn();
    render(<AddToCollection productId="test-product" onSuccess={onSuccess} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add to collection/i }));
    fireEvent.click(screen.getByText('Favorites'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
}); 