'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend validation
    if (!formData.email || !formData.password || !formData.username || !formData.displayName) {
      toast.error('Semua field wajib diisi!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter!');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Format email tidak valid!');
      setLoading(false);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(formData.username)) {
      toast.error('Username hanya boleh berisi huruf, angka, underscore, dan dash!');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      toast.error('Username minimal 3 karakter!');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', formData);
      
      if (response.data.success) {
        toast.success('Pendaftaran berhasil! Silakan login.');
        router.push('/login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Terjadi kesalahan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-[#2d2d2d] p-6 sm:p-8 rounded-xl border-4 border-[#b8a492]">
        <div>
          <h2 className="mt-2 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-[#b8a492] font-mono">
            Daftar sebagai Creator
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#b8a492]">
            Buat halaman donasi personal Anda
          </p>
        </div>
        
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-[#b8a492]/20 border-l-4 border-[#b8a492] p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-[#b8a492]">{error}</div>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-[#b8a492] font-mono">
                Username (Link Donasi) <span className="text-red-400">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 sm:py-3 border-2 border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="contoh: johndoe"
                value={formData.username}
                onChange={handleChange}
                pattern="[a-zA-Z0-9_-]+"
                title="Hanya huruf, angka, underscore, dan dash"
              />
              <p className="mt-1 text-xs text-[#b8a492]/80">
                Link donasi Anda: /donate/{formData.username || 'username'}
              </p>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-xs sm:text-sm font-medium text-[#b8a492] font-mono">
                Nama Tampilan <span className="text-red-400">*</span>
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 sm:py-3 border-2 border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="John Doe"
                value={formData.displayName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[#b8a492] font-mono">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 sm:py-3 border-2 border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-[#b8a492] font-mono">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 sm:py-3 border-2 border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-[#b8a492] font-mono">
                Deskripsi (Opsional)
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="mt-1 appearance-none relative block w-full px-3 py-2 sm:py-3 border-2 border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono resize-none"
                placeholder="Ceritakan tentang konten atau proyek Anda..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 sm:py-4 px-4 border-2 border-[#b8a492] text-sm sm:text-base font-bold rounded-md text-[#b8a492] bg-[#2d2d2d] hover:bg-[#b8a492] hover:text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492] disabled:opacity-50 font-mono transition-all duration-200"
            >
              {loading ? 'Mendaftar...' : 'Daftar Creator'}
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

          {/* Google Sign Up - Recommended */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <span className="text-xl">💡</span>
              <p className="text-xs text-[#b8a492]/80 font-mono">
                <span className="font-bold text-[#b8a492]">Disarankan:</span> Gunakan Google untuk pendaftaran lebih cepat dan aman
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                toast.loading('Mengarahkan ke Google...', { id: 'google-signup' });
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
              Daftar dengan Google
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-[#b8a492] hover:text-[#d6c6b9] underline font-mono text-xs sm:text-sm">
              Sudah punya akun? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
