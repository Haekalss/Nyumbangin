import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '@/components/atoms/Modal';

describe('Modal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  test('renders modal with title', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Title">
        <div>Content</div>
      </Modal>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders modal without title', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  test('renders close button', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    expect(screen.getByLabelText('Tutup modal')).toBeInTheDocument();
  });

  test('calls onClose when clicking close button', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    await user.click(screen.getByLabelText('Tutup modal'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when clicking backdrop', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    const backdrop = container.firstChild;
    await user.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose when clicking modal content', async () => {
    const user = userEvent.setup();
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    await user.click(screen.getByText('Content'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('renders footer when provided', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} footer={<div>Footer Content</div>}>
        <div>Content</div>
      </Modal>
    );

    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  test('does not render footer when not provided', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    expect(screen.queryByText('Footer Content')).not.toBeInTheDocument();
  });

  test('applies default maxWidth class', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Content</div>
      </Modal>
    );

    const modalContent = container.querySelector('.max-w-2xl');
    expect(modalContent).toBeInTheDocument();
  });

  test('applies custom maxWidth class', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={mockOnClose} maxWidth="max-w-5xl">
        <div>Content</div>
      </Modal>
    );

    const modalContent = container.querySelector('.max-w-5xl');
    expect(modalContent).toBeInTheDocument();
  });

  test('renders children correctly', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Child 1</div>
        <div>Child 2</div>
      </Modal>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});
