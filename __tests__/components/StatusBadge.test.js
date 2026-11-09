import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/atoms/StatusBadge';

describe('StatusBadge', () => {
  test('renders PAID status with correct styles', () => {
    const { container } = render(<StatusBadge status="PAID" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-emerald-100');
    expect(badge).toHaveClass('text-emerald-800');
    expect(badge).toHaveClass('border-emerald-700');
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });

  test('renders UNPAID status with correct styles', () => {
    const { container } = render(<StatusBadge status="UNPAID" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-amber-100');
    expect(badge).toHaveClass('text-amber-800');
    expect(badge).toHaveClass('border-amber-700');
    expect(screen.getByText('UNPAID')).toBeInTheDocument();
  });

  test('renders PENDING status with correct styles', () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-amber-100');
    expect(badge).toHaveClass('text-amber-800');
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  test('renders FAILED status with correct styles', () => {
    const { container } = render(<StatusBadge status="FAILED" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-800');
    expect(badge).toHaveClass('border-red-700');
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
    expect(badge).toHaveClass('bg-[#f2e4d4]');
    expect(badge).toHaveClass('text-[#2d2d2d]');
    expect(badge).toHaveClass('border-[#2d2d2d]');
  });

  test('defaults to PAID when no status provided', () => {
    const { container } = render(<StatusBadge />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-emerald-100');
    expect(screen.getByText('PAID')).toBeInTheDocument();
  });

  test('applies base classes', () => {
    const { container } = render(<StatusBadge status="PAID" />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('text-[11px]');
    expect(badge).toHaveClass('font-extrabold');
    expect(badge).toHaveClass('rounded-md');
    expect(badge).toHaveClass('px-2');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('border-2');
    expect(badge).toHaveClass('shadow-[1px_1px_0px_#2d2d2d]');
  });
});
