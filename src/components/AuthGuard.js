'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingPage } from './LoadingSpinner';

export default function AuthGuard({ children, requiredRole = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/admin/login');
        return;
      }

      try {
        const user = JSON.parse(userData);
        
        if (requiredRole && user.role !== requiredRole) {
          router.push('/admin/login');
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!authorized) {
    return null;
  }

  return children;
}
