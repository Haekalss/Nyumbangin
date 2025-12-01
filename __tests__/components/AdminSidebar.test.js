import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminSidebar from '@/components/organisms/AdminSidebar';

describe('AdminSidebar', () => {
  const mockSetActiveSection = jest.fn();
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sidebar with logo and brand', () => {
    render(
      <AdminSidebar 
        activeSection="dashboard" 
        setActiveSection={mockSetActiveSection} 
        onLogout={mockOnLogout} 
      />
    );
    
    expect(screen.getByAltText('Nyumbangin Logo')).toBeInTheDocument();
    expect(screen.getByText('Nyumbangin')).toBeInTheDocument();
    expect(screen.getByText('ADMIN PANEL')).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(
      <AdminSidebar 
        activeSection="dashboard" 
        setActiveSection={mockSetActiveSection} 
        onLogout={mockOnLogout} 
      />
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Creator')).toBeInTheDocument();
    expect(screen.getByText('Payout')).toBeInTheDocument();
  });

  test('highlights active section (dashboard)', () => {
    render(
      <AdminSidebar 
        activeSection="dashboard" 
        setActiveSection={mockSetActiveSection} 
        onLogout={mockOnLogout} 
      />
    );
    
    const dashboardBtn = screen.getByText('Dashboard').closest('button');
    expect(dashboardBtn).toHaveClass('bg-[#b8a492]', 'text-[#2d2d2d]');
  });

  test('highlights active section (creator)', () => {
    render(
      <AdminSidebar 
        activeSection="creator" 
        setActiveSection={mockSetActiveSection} 
        onLogout={mockOnLogout} 
      />
    );
    
    const creatorBtn = screen.getByText('Creator').closest('button');
    expect(creatorBtn).toHaveClass('bg-[#b8a492]', 'text-[#2d2d2d]');
  });

  test('highlights active section (payout)', () => {
    render(
      <AdminSidebar 
        activeSection="payout" 
        setActiveSection={mockSetActiveSection} 
        onLogout={mockOnLogout} 
      />
    );
    
    const payoutBtn = screen.getByText('Payout').closest('button');
    expect(payoutBtn).toHaveClass('bg-[#b8a492]', 'text-[#2d2d2d]');
  });

  test('calls setActiveSection when clicking dashboard', async () => {
    const user = userEvent.setup();
    render(
      <AdminSidebar 
        activeSection="creator" 
        setActiveSection={mockSetActiveSection} 
        onLogout={mockOnLogout} 
      />
    );
    
    await user.click(screen.getByText('Dashboard'));
    expect(mockSetActiveSection).toHaveBeenCalledWith('dashboard');
  });

  test('calls setActiveSection when clicking creator', async () => {
    const user = userEvent.setup();
    render(
      <AdminSidebar 
        activeSection="dashboard" 
        setActiveSection={mockSetActiveSection} 
        onLogout={mockOnLogout} 
      />
    );
    
    await user.click(screen.getByText('Creator'));
    expect(mockSetActiveSection).toHaveBeenCalledWith('creator');
  });

  test('calls setActiveSection when clicking payout', async () => {
    const user = userEvent.setup();
    render(
      <AdminSidebar 
        activeSection="dashboard" 
        setActiveSection={mockSetActiveSection} 
        onLogout={mockOnLogout} 
      />
    );
    
    await user.click(screen.getByText('Payout'));
    expect(mockSetActiveSection).toHaveBeenCalledWith('payout');
  });

  test('renders logout button', () => {
    render(
      <AdminSidebar 
        activeSection="dashboard" 
        setActiveSection={mockSetActiveSection} 
        onLogout={mockOnLogout} 
      />
    );
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('calls onLogout when clicking logout button', async () => {
    const user = userEvent.setup();
    render(
      <AdminSidebar 
        activeSection="dashboard" 
        setActiveSection={mockSetActiveSection} 
        onLogout={mockOnLogout} 
      />
    );
    
    await user.click(screen.getByText('Logout'));
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });
});
