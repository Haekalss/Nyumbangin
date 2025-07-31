import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export class SessionManager {
  constructor() {
    this.checkInterval = null;
    this.warningShown = false;
  }

  // Start monitoring session
  startSessionMonitoring(router) {
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkTokenExpiry(router);
    }, 60000); // 60 seconds

    // Also check immediately
    this.checkTokenExpiry(router);
  }

  // Stop monitoring
  stopSessionMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.warningShown = false;
  }

  // Check if token is expired or about to expire
  checkTokenExpiry(router) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.handleLogout(router);
      return;
    }

    try {
      // Decode JWT to get expiry time
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = payload.exp;
      const timeUntilExpiry = expiryTime - currentTime;

      // If token expired, logout immediately
      if (timeUntilExpiry <= 0) {
        this.handleLogout(router, 'Sesi Anda telah berakhir. Silakan login kembali.');
        return;
      }

      // If token expires in 10 minutes, show warning
      if (timeUntilExpiry <= 600 && !this.warningShown) { // 10 minutes = 600 seconds
        this.showExpiryWarning(timeUntilExpiry);
        this.warningShown = true;
      }

    } catch (error) {
      console.error('Error checking token expiry:', error);
      this.handleLogout(router, 'Token tidak valid. Silakan login kembali.');
    }
  }

  // Show warning before expiry
  showExpiryWarning(timeUntilExpiry) {
    const minutes = Math.floor(timeUntilExpiry / 60);
    toast.error(`Sesi Anda akan berakhir dalam ${minutes} menit. Silakan refresh halaman untuk memperpanjang sesi.`, {
      duration: 8000,
      position: 'top-center'
    });
  }

  // Handle logout
  handleLogout(router, message = 'Sesi Anda telah berakhir.') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    toast.error(message, {
      duration: 5000,
      position: 'top-center'
    });

    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  }

  // Manual logout
  logout(router) {
    this.stopSessionMonitoring();
    this.handleLogout(router, 'Anda telah logout.');
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();

// Hook for easy use in components
export function useSessionManager() {
  const router = useRouter();

  const startMonitoring = () => {
    sessionManager.startSessionMonitoring(router);
  };

  const stopMonitoring = () => {
    sessionManager.stopSessionMonitoring();
  };

  const logout = () => {
    sessionManager.logout(router);
  };

  return {
    startMonitoring,
    stopMonitoring,
    logout
  };
}
