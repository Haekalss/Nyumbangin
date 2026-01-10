import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        toast.error('Silakan login terlebih dahulu', { id: 'auth-required' });
        router.replace('/login');
        return;
      }

      try {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          // Token expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.', { id: 'session-expired' });
          router.replace('/');
          return;
        }

        const parsedUser = JSON.parse(userData);
        
        if (parsedUser.userType !== 'admin') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Anda tidak memiliki akses ke halaman ini', { id: 'no-access' });
          router.replace('/login');
          return;
        }
        
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Token tidak valid. Silakan login kembali.', { id: 'invalid-token' });
        router.replace('/login');
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    const handlePopState = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, router]);

  return { user, isAuthChecking };
}
