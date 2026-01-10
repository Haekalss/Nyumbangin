'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(redirectTo = '/login') {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Not logged in, redirect to login
        router.push(redirectTo);
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
          router.push(redirectTo);
          return;
        }

        // Token is valid
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid token format
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  return { isAuthenticated, isLoading };
}

export function useRequireAuth() {
  return useAuth('/login');
}

export function useRequireAdmin() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        router.push('/login');
        return;
      }

      try {
        const userData = JSON.parse(user);
        
        if (userData.role !== 'admin') {
          // Not admin, redirect to dashboard
          router.push('/dashboard');
          return;
        }

        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  return { isAdmin, isLoading };
}
