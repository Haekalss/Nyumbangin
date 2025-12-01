import { render, screen } from '@testing-library/react';
import SectionBox from '@/components/molecules/SectionBox';

describe('SectionBox', () => {
  test('renders title when provided', () => {
    render(<SectionBox title="Test Title">Content</SectionBox>);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders description when provided', () => {
    render(
      <SectionBox title="Title" description="Test Description">
        Content
      </SectionBox>
    );
    
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('renders children', () => {
    render(<SectionBox>Test Content</SectionBox>);
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('does not render title when not provided', () => {
    const { container } = render(<SectionBox>Content</SectionBox>);
    
    const h4 = container.querySelector('h4');
    expect(h4).not.toBeInTheDocument();
  });

  test('applies default tone styles', () => {
    const { container } = render(<SectionBox>Content</SectionBox>);
    
    const box = container.firstChild;
    expect(box).toHaveClass('bg-[#b8a492]/10');
    expect(box).toHaveClass('border-[#b8a492]/30');
  });

  test('applies danger tone styles', () => {
    const { container } = render(<SectionBox tone="danger">Content</SectionBox>);
    
    const box = container.firstChild;
    expect(box).toHaveClass('bg-red-500/10');
    expect(box).toHaveClass('border-red-500/30');
  });

  test('applies success tone styles', () => {
    const { container } = render(<SectionBox tone="success">Content</SectionBox>);
    
    const box = container.firstChild;
    expect(box).toHaveClass('bg-green-500/10');
    expect(box).toHaveClass('border-green-500/30');
  });

  test('applies custom className', () => {
    const { container } = render(
      <SectionBox className="custom-class">Content</SectionBox>
    );
    
    const box = container.firstChild;
    expect(box).toHaveClass('custom-class');
  });
});
