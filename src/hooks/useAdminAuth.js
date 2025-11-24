import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const [user, setUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        router.replace('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        
        if (parsedUser.userType !== 'admin') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.replace('/login');
          return;
        }
        
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
