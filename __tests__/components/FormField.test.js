import { render, screen, fireEvent } from '@testing-library/react';
import FormField from '@/components/molecules/FormField';

describe('FormField Component', () => {
  test('renders label when provided', () => {
    render(<FormField label="Username" value="" onChange={() => {}} />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  test('does not render label when not provided', () => {
    const { container } = render(<FormField value="" onChange={() => {}} />);
    const labels = container.querySelectorAll('p');
    // Should not have label text elements (only error if present)
    expect(labels.length).toBe(0);
  });

  test('renders input with value', () => {
    const { container } = render(
      <FormField label="Email" value="test@test.com" onChange={() => {}} />
    );
    const input = container.querySelector('input');
    expect(input).toHaveValue('test@test.com');
  });

  test('handles onChange event', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <FormField label="Name" value="" onChange={handleChange} />
    );
    const input = container.querySelector('input');
    
    fireEvent.change(input, { target: { value: 'John' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('renders with placeholder', () => {
    const { container } = render(
      <FormField 
        label="Email" 
        value="" 
        onChange={() => {}} 
        placeholder="Enter your email"
      />
    );
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('placeholder', 'Enter your email');
  });

  test('renders with type', () => {
    const { container } = render(
      <FormField 
        label="Password" 
        type="password" 
        value="" 
        onChange={() => {}} 
      />
    );
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  test('renders error message when error provided', () => {
    render(
      <FormField 
        label="Email" 
        value="" 
        onChange={() => {}} 
        error="Email is required"
      />
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  test('does not render error when no error', () => {
    render(<FormField label="Email" value="" onChange={() => {}} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('renders as disabled', () => {
    const { container } = render(
      <FormField label="Email" value="" onChange={() => {}} disabled />
    );
    const input = container.querySelector('input');
    expect(input).toBeDisabled();
  });

  test('applies error styling to input', () => {
    const { container } = render(
      <FormField 
        label="Email" 
        value="" 
        onChange={() => {}} 
        error="Invalid email"
      />
    );
    const input = container.querySelector('input');
    expect(input).toHaveClass('border-red-500');
  });

  test('renders with all props together', () => {
    const handleChange = jest.fn();
    render(
      <FormField 
        label="Username" 
        type="text"
        value="testuser" 
        onChange={handleChange} 
        placeholder="Enter username"
        error="Username taken"
        disabled={false}
      />
    );
    
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Username taken')).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Enter username');
    expect(input).toHaveValue('testuser');
    expect(input).toHaveClass('border-red-500');
  });
});
