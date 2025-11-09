// src/app/login/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (typeof window === 'undefined') return; // Skip SSR
      
      if (status === 'authenticated' && session?.user) {
        const existingToken = localStorage.getItem('token');
        
        if (!existingToken) {
          try {
            // OAuth login - get custom JWT from API
            const tokenRes = await axios.post('/api/auth/oauth-token', {
              userId: session.user.id,
              email: session.user.email
            });
            
            localStorage.setItem('token', tokenRes.data.token);
            localStorage.setItem('user', JSON.stringify(tokenRes.data.user));
            
            // Check if needs username setup (username kosong atau null)
            if (!session.user.username || session.user.username === '') {
              toast.success('Login berhasil! Silakan setup username Anda.');
              router.push('/dashboard?setupUsername=true');
            } else {
              router.push('/dashboard');
            }
          } catch (error) {
            console.error('OAuth token generation failed:', error);
            toast.error('Gagal membuat sesi. Silakan coba lagi.');
          }
        } else {
          router.push('/dashboard');
        }
      }
    };

    handleOAuthCallback();
  }, [session, status, router]);

  // Check if already logged in
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip SSR
    
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.userType === 'admin' || user.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      } catch (e) {
        // Invalid data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setChecking(false);
      }
    } else {
      setChecking(false);
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend validation
    if (!email || !password) {
      toast.error('Email dan password wajib diisi!');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Format email tidak valid!');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success('Login berhasil!');
      
      // Use window.location.href for hard navigation
      if (res.data.user.userType === "admin" || res.data.user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login gagal";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2d2d2d] mx-auto mb-4"></div>
          <p className="text-[#2d2d2d] font-mono font-bold">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#2d2d2d] p-6 sm:p-8 rounded-xl border-4 border-[#b8a492]">
        <div>
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Nyumbangin Logo" className="w-20 h-20" />
          </div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-[#b8a492] font-mono">
            Masuk ke akun Anda
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#b8a492]">
            Atau{' '}
            <Link href="/creator/register" className="font-bold text-[#b8a492] underline hover:text-[#d6c6b9]">
              buat akun baru
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-t-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="Alamat email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-b-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-[#b8a492]/20 p-3 sm:p-4 border border-[#b8a492]">
              <div className="text-xs sm:text-sm text-[#b8a492]">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-[#2d2d2d] bg-[#b8a492] hover:bg-[#d6c6b9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492] disabled:opacity-50 font-mono transition-all duration-200"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#b8a492]/30"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-[#2d2d2d] text-[#b8a492]/70 font-mono">atau</span>
            </div>
          </div>

          {/* Google Sign In */}
          <div>
            <button
              type="button"
              onClick={() => {
                toast.loading('Mengarahkan ke Google...', { id: 'google-signin' });
                signIn('google', { callbackUrl: '/dashboard' });
              }}
              className="group relative w-full flex items-center justify-center py-3 sm:py-4 px-4 border-2 border-[#b8a492] text-sm sm:text-base font-medium rounded-md text-[#b8a492] bg-transparent hover:bg-[#b8a492]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492] font-mono transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
            <Link href="/forgot-password" className="text-[#b8a492] hover:text-[#d6c6b9] underline font-mono">
              Lupa password?
            </Link>
            <Link href="/" className="text-[#b8a492] hover:text-[#d6c6b9] underline font-mono">
              ← Kembali ke beranda
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
