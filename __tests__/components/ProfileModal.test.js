import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileModal from '@/components/organisms/ProfileModal';

// Mock all dependencies
jest.mock('@/components/atoms/Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;
    return (
      <div>
        <h3>{title}</h3>
        <button onClick={onClose}>Close Modal</button>
        {children}
      </div>
    );
  };
});

jest.mock('@/components/molecules/SectionBox', () => {
  return function MockSectionBox({ title, description, children }) {
    return (
      <div>
        <h4>{title}</h4>
        {description && <p>{description}</p>}
        {children}
      </div>
    );
  };
});

jest.mock('@/components/atoms/Input', () => {
  return function MockInput({ value, onChange, disabled, placeholder, type }) {
    return (
      <input
        type={type || 'text'}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  };
});

jest.mock('@/components/atoms/Text', () => {
  return function MockText({ children, className }) {
    return <div className={className}>{children}</div>;
  };
});

jest.mock('@/components/atoms/Button', () => {
  return function MockButton({ children, onClick, type, disabled, variant }) {
    return (
      <button onClick={onClick} type={type} disabled={disabled}>
        {children}
      </button>
    );
  };
});

jest.mock('@/components/molecules/PayoutFields', () => {
  return function MockPayoutFields({ formData, onChange, locked }) {
    return <div>PayoutFields Component {locked && '(Locked)'}</div>;
  };
});

jest.mock('@/components/molecules/ImageCropModal', () => {
  return function MockImageCropModal({ isOpen, onClose, imageSrc, onCropComplete }) {
    if (!isOpen) return null;
    return (
      <div>
        <h3>Image Crop Modal</h3>
        <button onClick={onClose}>Close Crop</button>
        <button onClick={() => onCropComplete('data:image/png;base64,cropped')}>
          Crop Complete
        </button>
      </div>
    );
  };
});

describe('ProfileModal', () => {
  const mockOnClose = jest.fn();
  const mockOnFormDataChange = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnLogout = jest.fn();

  const defaultFormData = {
    displayName: 'Test Creator',
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio',
    profileImageUrl: '/profile.jpg',
    socialLinks: {
      twitch: 'https://twitch.tv/test',
      youtube: 'https://youtube.com/@test',
      instagram: 'https://instagram.com/test',
      tiktok: 'https://tiktok.com/@test',
      twitter: 'https://twitter.com/test'
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when showProfile is false', () => {
    const { container } = render(
      <ProfileModal
        showProfile={false}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders modal when showProfile is true', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    expect(screen.getByText('Edit Profil')).toBeInTheDocument();
  });

  test('displays profile image', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    const img = screen.getByAltText('Profile');
    expect(img).toHaveAttribute('src', '/profile.jpg');
  });

  test('displays display name and username', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    expect(screen.getByText('Test Creator')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  test('renders all form sections', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    expect(screen.getByText('Informasi Dasar')).toBeInTheDocument();
    expect(screen.getByText('Social Media Links')).toBeInTheDocument();
    expect(screen.getByText('Ubah Password')).toBeInTheDocument();
    expect(screen.getByText('Pengaturan Rekening Penarikan')).toBeInTheDocument();
  });

  test('calls onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockImplementation((e) => e.preventDefault());

    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    await user.click(screen.getByText('Simpan Perubahan'));
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  test('shows loading state on submit button', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={true}
      />
    );

    expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
  });

  test('disables username input when payout is locked', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
        payoutLocked={true}
      />
    );

    const usernameInput = screen.getByPlaceholderText('Username untuk link donasi');
    expect(usernameInput).toBeDisabled();
  });

  test('shows payout locked message', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
        payoutLocked={true}
      />
    );

    expect(screen.getByText('Data Rekening Terkunci')).toBeInTheDocument();
  });

  test('shows payout warning when not locked', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
        payoutLocked={false}
      />
    );

    expect(screen.getByText('Perhatian!')).toBeInTheDocument();
  });

  test('renders logout button when onLogout provided', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('calls onLogout when logout button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
        onLogout={mockOnLogout}
      />
    );

    await user.click(screen.getByText('Logout'));
    expect(mockOnLogout).toHaveBeenCalled();
  });

  test('handles bio character count', () => {
    const formDataWithBio = { ...defaultFormData, bio: 'Short bio' };
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={formDataWithBio}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    expect(screen.getByText('9/500 karakter')).toBeInTheDocument();
  });

  test('shows PayoutFields component', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
        payoutLocked={true}
      />
    );

    expect(screen.getByText(/PayoutFields Component/)).toBeInTheDocument();
    expect(screen.getByText(/\(Locked\)/)).toBeInTheDocument();
  });

  test('handles file input for image upload', async () => {
    const user = userEvent.setup();
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    // File input exists (hidden)
    const fileInputs = document.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBeGreaterThan(0);
  });

  test('shows username warning when empty', () => {
    const formDataNoUsername = { ...defaultFormData, username: '' };
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={formDataNoUsername}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    expect(screen.getByText(/Username belum diisi/)).toBeInTheDocument();
  });

  test('shows cancel button', () => {
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    expect(screen.getByText('Batal')).toBeInTheDocument();
  });

  test('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProfileModal
        showProfile={true}
        onClose={mockOnClose}
        profileFormData={defaultFormData}
        onFormDataChange={mockOnFormDataChange}
        onSubmit={mockOnSubmit}
        loading={false}
      />
    );

    await user.click(screen.getByText('Batal'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
