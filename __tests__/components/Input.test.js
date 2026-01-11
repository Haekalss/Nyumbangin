import { render, screen, fireEvent } from '@testing-library/react';
import Input from '@/components/atoms/Input';

describe('Input Component', () => {
  test('renders with default type text', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'text');
  });

  test('renders with custom type', () => {
    const { container } = render(<Input type="email" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'email');
  });

  test('renders with placeholder', () => {
    const { container } = render(<Input placeholder="Enter name" />);
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('placeholder', 'Enter name');
  });

  test('renders with placeholder anjing', () => {
    render(<Input placeholder="anjing" />);
    expect(screen.getByPlaceholderText('anjing')).toBeInTheDocument();
  });

  test('renders with value', () => {
    const { container } = render(<Input value="test value" onChange={() => {}} />);
    const input = container.querySelector('input');
    expect(input).toHaveValue('test value');
  });

  test('handles onChange event', () => {
    const handleChange = jest.fn();
    const { container } = render(<Input onChange={handleChange} />);
    const input = container.querySelector('input');
    
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('calls onChange when typing anjing', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'anjing' } });
    expect(handleChange).toHaveBeenCalled();
  });

  test('renders as disabled', () => {
    const { container } = render(<Input disabled />);
    const input = container.querySelector('input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('cursor-not-allowed');
  });

  test('renders as required', () => {
    const { container } = render(<Input required />);
    const input = container.querySelector('input');
    expect(input).toBeRequired();
  });

  test('applies error styling', () => {
    const { container } = render(<Input error={true} />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-red-500');
  });

  test('applies normal styling when no error', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-[#b8a492]');
  });

  test('applies custom className', () => {
    const { container } = render(<Input className="custom-input" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('custom-input');
  });

  test('applies base classes', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('w-full');
    expect(input).toHaveClass('px-3');
    expect(input).toHaveClass('py-2');
    expect(input).toHaveClass('bg-[#2d2d2d]');
    expect(input).toHaveClass('text-[#b8a492]');
    expect(input).toHaveClass('font-mono');
  });

  test('forwards additional props', () => {
    const { container } = render(<Input data-testid="custom-input" maxLength={10} />);
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('maxlength', '10');
  });
});
