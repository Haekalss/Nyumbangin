import { render, screen } from '@testing-library/react';
import StatsCard from '@/components/StatsCard';

describe('StatsCard', () => {
  test('renders title and value correctly', () => {
    render(<StatsCard title="Total Donations" value="Rp 1.000.000" />);
    
    expect(screen.getByText('Total Donations')).toBeInTheDocument();
    expect(screen.getByText('Rp 1.000.000')).toBeInTheDocument();
  });

  test('renders with default color', () => {
    const { container } = render(
      <StatsCard title="Test" value="100" />
    );
    
    expect(container.querySelector('.bg-\\[\\#fffdf9\\]')).toBeInTheDocument();
  });

  test('renders with custom color prop', () => {
    render(<StatsCard title="Test" value="100" color="red" />);
    
    // Component should render regardless of color
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  test('renders without icon', () => {
    render(<StatsCard title="Test" value="100" />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('applies correct styling classes', () => {
    const { container } = render(
      <StatsCard title="Revenue" value="Rp 5.000.000" />
    );
    
    const cardDiv = container.firstChild;
    expect(cardDiv).toHaveClass('bg-[#fffdf9]');
    expect(cardDiv).toHaveClass('border-2');
    expect(cardDiv).toHaveClass('border-[#2d2d2d]');
    expect(cardDiv).toHaveClass('rounded-2xl');
  });
});
