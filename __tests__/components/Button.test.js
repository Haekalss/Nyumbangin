import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/atoms/Button';

describe('Button Component', () => {
  test('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('renders with primary variant by default', () => {
    const { container } = render(<Button>Test</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-[#2d2d2d]');
  });

  test('renders with secondary variant', () => {
    const { container } = render(<Button variant="secondary">Test</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-white');
    expect(button).toHaveClass('text-[#2d2d2d]');
  });

  test('renders with danger variant', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-red-500');
  });

  test('renders with success variant', () => {
    const { container } = render(<Button variant="success">Save</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-emerald-600');
  });

  test('renders with small size', () => {
    const { container } = render(<Button size="small">Small</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('py-1.5');
    expect(button).toHaveClass('text-xs');
  });

  test('renders with medium size by default', () => {
    const { container } = render(<Button>Medium</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
  });

  test('renders with large size', () => {
    const { container } = render(<Button size="large">Large</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('px-5');
    expect(button).toHaveClass('py-2.5');
    expect(button).toHaveClass('text-base');
  });

  test('handles onClick event', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not trigger onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click Me</Button>);
    
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('applies disabled classes when disabled', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
    expect(button).toBeDisabled();
  });

  test('has submit type when specified', () => {
    const { container } = render(<Button type="submit">Submit</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('has button type by default', () => {
    const { container } = render(<Button>Test</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  test('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Test</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('custom-class');
  });

  test('forwards additional props', () => {
    render(<Button data-testid="custom-button" aria-label="Test Button">Test</Button>);
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Test Button');
  });
});
