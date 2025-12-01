import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/atoms/StatusBadge';

describe('StatusBadge', () => {
  test('renders PAID status with correct styles', () => {
    const { container } = render(<StatusBadge status="PAID" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-600/30');
    expect(badge).toHaveClass('text-green-200');
    expect(badge).toHaveClass('border-green-400');
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });

  test('renders UNPAID status with correct styles', () => {
    const { container } = render(<StatusBadge status="UNPAID" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-yellow-600/30');
    expect(badge).toHaveClass('text-yellow-200');
    expect(badge).toHaveClass('border-yellow-400');
    expect(screen.getByText('UNPAID')).toBeInTheDocument();
  });

  test('renders PENDING status with correct styles', () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-yellow-600/30');
    expect(badge).toHaveClass('text-yellow-200');
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  test('renders FAILED status with correct styles', () => {
    const { container } = render(<StatusBadge status="FAILED" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-red-600/30');
    expect(badge).toHaveClass('text-red-200');
    expect(badge).toHaveClass('border-red-400');
    expect(screen.getByText('FAILED')).toBeInTheDocument();
  });

  test('renders custom children instead of status', () => {
    render(<StatusBadge status="PAID">Custom Text</StatusBadge>);
    
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
    expect(screen.queryByText('PAID')).not.toBeInTheDocument();
  });

  test('applies default styles for unknown status', () => {
    const { container } = render(<StatusBadge status="UNKNOWN" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-[#b8a492]/20');
    expect(badge).toHaveClass('text-[#2d2d2d]');
    expect(badge).toHaveClass('border-[#b8a492]');
  });

  test('defaults to PAID when no status provided', () => {
    const { container } = render(<StatusBadge />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-600/30');
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });

  test('applies base classes', () => {
    const { container } = render(<StatusBadge status="PAID" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('font-bold');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('px-2');
    expect(badge).toHaveClass('py-1');
    expect(badge).toHaveClass('border-2');
    expect(badge).toHaveClass('font-mono');
  });
});
