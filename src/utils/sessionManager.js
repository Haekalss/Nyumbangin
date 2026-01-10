import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export class SessionManager {
  constructor() {
    this.checkInterval = null;
    this.warningShown = false;
    this.isManualLogout = false; // Flag untuk detect manual logout
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
    this.isManualLogout = false; // Reset flag
  }

  // Check if token is expired or about to expire
  checkTokenExpiry(router) {
    // Skip check if manual logout in progress
    if (this.isManualLogout) {
      return;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      // Skip logout notification if manual logout happened
      if (this.isManualLogout) return;
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
  handleLogout(router, message = 'Sesi Anda telah berakhir.', isError = true) {
    // Skip if manual logout in progress
    if (this.isManualLogout) {
      console.log('Manual logout detected, skipping auto-logout notification');
      this.isManualLogout = false; // Reset flag
      return;
    }
    
    // Skip if already logged out (no token in storage)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      console.log('No token found, user already logged out');
      return;
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (isError) {
      toast.error(message, {
        duration: 5000,
        position: 'top-center'
      });
    } else {
      toast.success(message, {
        duration: 3000,
        position: 'top-center'
      });
    }

    // Redirect to landing page after a short delay
    setTimeout(() => {
      router.push('/');
    }, 1000);
  }

  // Manual logout (dipanggil saat user klik logout)
  logout(router) {
    // Set flag SEBELUM stop monitoring
    this.isManualLogout = true;
    
    // Stop monitoring untuk prevent false "sesi berakhir" notification
    this.stopSessionMonitoring();
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    toast.success('Berhasil logout!', {
      duration: 2000,
      position: 'top-center'
    });

    // Redirect to landing page
    setTimeout(() => {
      router.push('/');
      // Reset flag setelah redirect
      this.isManualLogout = false;
    }, 500);
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
