import { render, screen, fireEvent } from '@testing-library/react';
import DonationCard from '@/components/molecules/DonationCard';

// Mock formatRupiah
jest.mock('@/utils/format', () => ({
  formatRupiah: jest.fn((value) => `Rp ${value.toLocaleString('id-ID')}`),
}));

describe('DonationCard', () => {
  const mockDonation = {
    _id: '123',
    name: 'John Doe',
    amount: 50000,
    message: 'Semangat terus!',
  };

  test('renders donation name', () => {
    render(<DonationCard donation={mockDonation} onDelete={jest.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('renders formatted amount', () => {
    render(<DonationCard donation={mockDonation} onDelete={jest.fn()} />);
    
    expect(screen.getByText('Rp 50.000')).toBeInTheDocument();
  });

  test('renders message when present', () => {
    render(<DonationCard donation={mockDonation} onDelete={jest.fn()} />);
    
    expect(screen.getByText('Semangat terus!')).toBeInTheDocument();
  });

  test('does not render message when empty', () => {
    const donationWithoutMessage = { ...mockDonation, message: '' };
    
    render(<DonationCard donation={donationWithoutMessage} onDelete={jest.fn()} />);
    
    expect(screen.queryByText('Semangat terus!')).not.toBeInTheDocument();
  });

  test('renders delete button', () => {
    render(<DonationCard donation={mockDonation} onDelete={jest.fn()} />);
    
    expect(screen.getByText('Hapus')).toBeInTheDocument();
  });

  test('calls onDelete with donation id when delete clicked', () => {
    const mockDelete = jest.fn();
    
    render(<DonationCard donation={mockDonation} onDelete={mockDelete} />);
    
    const deleteButton = screen.getByText('Hapus');
    fireEvent.click(deleteButton);
    
    expect(mockDelete).toHaveBeenCalledWith('123');
  });
});
