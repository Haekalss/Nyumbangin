import { render, screen, fireEvent } from '@testing-library/react';
import DonationTable from '@/components/organisms/DonationTable';

// Mock formatRupiah
jest.mock('@/utils/format', () => ({
  formatRupiah: jest.fn((value) => `Rp ${value.toLocaleString('id-ID')}`),
}));

describe('DonationTable', () => {
  const mockDonations = [
    {
      _id: '1',
      name: 'John Doe',
      amount: 50000,
      message: 'Semangat!',
      status: 'PAID',
      createdAt: '2025-01-01T10:00:00Z',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      amount: 100000,
      message: '',
      status: 'PENDING',
      createdAt: '2025-01-02T12:00:00Z',
    },
  ];

  test('renders table with donations', () => {
    render(
      <DonationTable 
        donations={mockDonations} 
        onDelete={jest.fn()} 
        onPreviewNotification={jest.fn()} 
      />
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Semangat!')).toBeInTheDocument();
  });

  test('shows "Tidak ada pesan" when message is empty', () => {
    render(
      <DonationTable 
        donations={mockDonations} 
        onDelete={jest.fn()} 
        onPreviewNotification={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Tidak ada pesan')).toBeInTheDocument();
  });

  test('formats amounts using formatRupiah', () => {
    render(
      <DonationTable 
        donations={mockDonations} 
        onDelete={jest.fn()} 
        onPreviewNotification={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Rp 50.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 100.000')).toBeInTheDocument();
  });

  test('displays status badges', () => {
    render(
      <DonationTable 
        donations={mockDonations} 
        onDelete={jest.fn()} 
        onPreviewNotification={jest.fn()} 
      />
    );
    
    expect(screen.getByText('PAID')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  test('formats dates correctly', () => {
    render(
      <DonationTable 
        donations={mockDonations} 
        onDelete={jest.fn()} 
        onPreviewNotification={jest.fn()} 
      />
    );
    
    // Date formatting will depend on locale
    const dateElements = screen.getAllByText(/\//);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  test('calls onPreviewNotification when row clicked', () => {
    const mockPreview = jest.fn();
    
    render(
      <DonationTable 
        donations={mockDonations} 
        onDelete={jest.fn()} 
        onPreviewNotification={mockPreview} 
      />
    );
    
    const row = screen.getByText('John Doe').closest('tr');
    fireEvent.click(row);
    
    expect(mockPreview).toHaveBeenCalledWith(mockDonations[0]);
  });

  test('calls onDelete when delete button clicked', () => {
    const mockDelete = jest.fn();
    
    render(
      <DonationTable 
        donations={mockDonations} 
        onDelete={mockDelete} 
        onPreviewNotification={jest.fn()} 
      />
    );
    
    const deleteButtons = screen.getAllByText('Hapus');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockDelete).toHaveBeenCalledWith('1');
  });

  test('stops propagation when delete button clicked', () => {
    const mockPreview = jest.fn();
    const mockDelete = jest.fn();
    
    render(
      <DonationTable 
        donations={mockDonations} 
        onDelete={mockDelete} 
        onPreviewNotification={mockPreview} 
      />
    );
    
    const deleteButtons = screen.getAllByText('Hapus');
    fireEvent.click(deleteButtons[0]);
    
    // onPreviewNotification should NOT be called because of stopPropagation
    expect(mockPreview).not.toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith('1');
  });

  test('renders table headers', () => {
    render(
      <DonationTable 
        donations={mockDonations} 
        onDelete={jest.fn()} 
        onPreviewNotification={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Donatur')).toBeInTheDocument();
    expect(screen.getByText('Jumlah')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Tanggal')).toBeInTheDocument();
    expect(screen.getByText('Aksi')).toBeInTheDocument();
  });

  test('handles empty donations array', () => {
    const { container } = render(
      <DonationTable 
        donations={[]} 
        onDelete={jest.fn()} 
        onPreviewNotification={jest.fn()} 
      />
    );
    
    // Should return null for empty array
    expect(container.firstChild).toBeNull();
  });

  test('handles null donations', () => {
    const { container } = render(
      <DonationTable 
        donations={null} 
        onDelete={jest.fn()} 
        onPreviewNotification={jest.fn()} 
      />
    );
    
    // Component should return nothing for null donations
    expect(container.firstChild).toBeNull();
  });

  test('uses default PAID status when status is missing', () => {
    const donationWithoutStatus = [{
      _id: '3',
      name: 'No Status',
      amount: 75000,
      createdAt: '2025-01-03T10:00:00Z',
    }];
    
    render(
      <DonationTable 
        donations={donationWithoutStatus} 
        onDelete={jest.fn()} 
        onPreviewNotification={jest.fn()} 
      />
    );
    
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });
});
