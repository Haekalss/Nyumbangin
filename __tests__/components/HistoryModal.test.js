import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistoryModal from '@/components/organisms/HistoryModal';

jest.mock('@/utils/format', () => ({
  formatRupiah: (amount) => `Rp ${amount.toLocaleString('id-ID')}`
}));

jest.mock('@/components/atoms/Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
      <div>
        <h3>{title}</h3>
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/atoms/Button', () => {
  return function MockButton({ children, onClick }) {
    return <button onClick={onClick}>{children}</button>;
  };
});

describe('HistoryModal', () => {
  const mockOnClose = jest.fn();
  const mockOnDateFilterChange = jest.fn();

  const mockHistoryData = [
    {
      date: '2024-01-15',
      total: 500000,
      count: 3,
      donations: [
        { name: 'Donor A', amount: 200000 },
        { name: 'Donor B', amount: 150000 },
        { name: 'Donor C', amount: 150000 }
      ]
    },
    {
      date: '2024-01-14',
      total: 300000,
      count: 2,
      donations: [
        { name: 'Donor D', amount: 200000 },
        { name: 'Donor E', amount: 100000 }
      ]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal with title', () => {
    render(
      <HistoryModal 
        onClose={mockOnClose}
        historyData={mockHistoryData}
        selectedDate=""
        onDateFilterChange={mockOnDateFilterChange}
      />
    );

    expect(screen.getByText('Riwayat Donasi Harian')).toBeInTheDocument();
  });

  test('renders date filter select with options', () => {
    render(
      <HistoryModal 
        onClose={mockOnClose}
        historyData={mockHistoryData}
        selectedDate=""
        onDateFilterChange={mockOnDateFilterChange}
      />
    );

    expect(screen.getByText('Filter berdasarkan tanggal:')).toBeInTheDocument();
    expect(screen.getByText('Semua tanggal')).toBeInTheDocument();
    expect(screen.getAllByText(/2024-01-15/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2024-01-14/).length).toBeGreaterThan(0);
  });

  test('renders history data correctly', () => {
    render(
      <HistoryModal 
        onClose={mockOnClose}
        historyData={mockHistoryData}
        selectedDate=""
        onDateFilterChange={mockOnDateFilterChange}
      />
    );

    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    expect(screen.getByText('2024-01-14')).toBeInTheDocument();
    expect(screen.getByText('Donor A')).toBeInTheDocument();
    expect(screen.getByText('Donor D')).toBeInTheDocument();
  });

  test('displays formatted amounts', () => {
    render(
      <HistoryModal 
        onClose={mockOnClose}
        historyData={mockHistoryData}
        selectedDate=""
        onDateFilterChange={mockOnDateFilterChange}
      />
    );

    expect(screen.getAllByText(/Rp 500.000/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rp 300.000/).length).toBeGreaterThan(0);
  });

  test('displays donation counts', () => {
    render(
      <HistoryModal 
        onClose={mockOnClose}
        historyData={mockHistoryData}
        selectedDate=""
        onDateFilterChange={mockOnDateFilterChange}
      />
    );

    expect(screen.getAllByText(/3 donasi/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2 donasi/).length).toBeGreaterThan(0);
  });

  test('calls onDateFilterChange when selecting date', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <HistoryModal 
        onClose={mockOnClose}
        historyData={mockHistoryData}
        selectedDate=""
        onDateFilterChange={mockOnDateFilterChange}
      />
    );

    const select = container.querySelector('select');
    await user.selectOptions(select, '2024-01-15');
    
    expect(mockOnDateFilterChange).toHaveBeenCalledWith('2024-01-15');
  });

  test('renders empty state when no history data', () => {
    render(
      <HistoryModal 
        onClose={mockOnClose}
        historyData={[]}
        selectedDate=""
        onDateFilterChange={mockOnDateFilterChange}
      />
    );

    expect(screen.getByText('Memuat data...')).toBeInTheDocument();
  });

  test('renders empty state for selected date', () => {
    render(
      <HistoryModal 
        onClose={mockOnClose}
        historyData={[]}
        selectedDate="2024-01-20"
        onDateFilterChange={mockOnDateFilterChange}
      />
    );

    expect(screen.getByText('Tidak ada donasi pada tanggal tersebut')).toBeInTheDocument();
  });

  test('renders all donations for each day', () => {
    render(
      <HistoryModal 
        onClose={mockOnClose}
        historyData={mockHistoryData}
        selectedDate=""
        onDateFilterChange={mockOnDateFilterChange}
      />
    );

    // First day donations
    expect(screen.getByText('Donor A')).toBeInTheDocument();
    expect(screen.getByText('Donor B')).toBeInTheDocument();
    expect(screen.getByText('Donor C')).toBeInTheDocument();

    // Second day donations
    expect(screen.getByText('Donor D')).toBeInTheDocument();
    expect(screen.getByText('Donor E')).toBeInTheDocument();
  });
});
