import { render, screen } from '@testing-library/react';
import Badge from '@/components/atoms/Badge';

describe('Badge', () => {
  test('renders children', () => {
    render(<Badge>Test Badge</Badge>);
    
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  test('applies default variant styles', () => {
    const { container } = render(<Badge>Default</Badge>);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-[#b8a492]/20');
    expect(badge).toHaveClass('text-[#2d2d2d]');
    expect(badge).toHaveClass('border-[#b8a492]');
  });

  test('applies success variant styles', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-500/20');
    expect(badge).toHaveClass('text-green-700');
    expect(badge).toHaveClass('border-green-500');
  });

  test('applies warning variant styles', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-yellow-500/20');
    expect(badge).toHaveClass('text-yellow-700');
  });

  test('applies danger variant styles', () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-red-500/20');
    expect(badge).toHaveClass('text-red-700');
  });

  test('applies info variant styles', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-blue-500/20');
    expect(badge).toHaveClass('text-blue-700');
  });

  test('applies small size', () => {
    const { container } = render(<Badge size="small">Small</Badge>);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('px-2');
    expect(badge).toHaveClass('py-1');
    expect(badge).toHaveClass('text-xs');
  });

  test('applies medium size', () => {
    const { container } = render(<Badge size="medium">Medium</Badge>);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('px-3');
    expect(badge).toHaveClass('text-sm');
  });

  test('applies large size', () => {
    const { container } = render(<Badge size="large">Large</Badge>);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('px-4');
    expect(badge).toHaveClass('py-2');
    expect(badge).toHaveClass('text-base');
  });

  test('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Badge</Badge>);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('custom-class');
  });

  test('applies base classes to all badges', () => {
    const { container } = render(<Badge>Badge</Badge>);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('font-bold');
    expect(badge).toHaveClass('font-mono');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('border-2');
  });
});
