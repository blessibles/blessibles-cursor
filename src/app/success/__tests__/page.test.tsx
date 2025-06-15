import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuccessPage from '../page';

describe('SuccessPage', () => {
  it('renders success message and next steps', () => {
    render(<SuccessPage />);

    // Check for success message
    expect(screen.getByText('Thank You for Your Order!')).toBeInTheDocument();
    expect(screen.getByText(/Your order has been successfully processed/i)).toBeInTheDocument();

    // Check for next steps
    expect(screen.getByText("What's Next?")).toBeInTheDocument();
    expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    expect(screen.getByText(/We've sent a confirmation email with your order details and download links/i)).toBeInTheDocument();

    // Check for action buttons
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
    expect(screen.getByText('View Order History')).toBeInTheDocument();
  });

  it('has correct links for navigation', () => {
    render(<SuccessPage />);

    const continueShoppingLink = screen.getByText('Continue Shopping').closest('a');
    const viewOrderHistoryLink = screen.getByText('View Order History').closest('a');

    expect(continueShoppingLink).toHaveAttribute('href', '/products');
    expect(viewOrderHistoryLink).toHaveAttribute('href', '/account');
  });

  it('has correct styling classes', () => {
    render(<SuccessPage />);

    // Check main container
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toHaveClass('min-h-screen', 'flex', 'flex-col', 'items-center', 'justify-center');

    // Check success message container
    const successContainer = screen.getByText('Thank You for Your Order!').closest('div');
    expect(successContainer).toHaveClass('text-center', 'max-w-2xl', 'mx-auto', 'px-4');

    // Check next steps container
    const nextStepsContainer = screen.getByText("What's Next?").closest('div');
    expect(nextStepsContainer).toHaveClass('mt-12', 'bg-white', 'rounded-lg', 'shadow-md', 'p-6');
  });
}); 