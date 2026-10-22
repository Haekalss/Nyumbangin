'use client'

import { useState, useEffect } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialUsername = params.get('username') || params.get('u');
      if (initialUsername) {
        const clean = initialUsername.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        setFormData(prev => ({
          ...prev,
          username: clean,
          displayName: clean.charAt(0).toUpperCase() + clean.slice(1)
        }));
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUsernameChange = (e) => {
    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setFormData({
      ...formData,
      username: clean
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username || !formData.displayName || !formData.email || !formData.password) {
      toast.error('Semua field bertanda * wajib diisi!');
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
      toast.error('Username hanya boleh berisi huruf, angka, underscore, dan strip!');
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
        toast.success('Pendaftaran berhasil! Silakan masuk.');
        router.push('/login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Pendaftaran gagal. Silakan coba lagi.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbf8f3] text-[#2d2d2d] font-sans antialiased p-4 sm:p-6">
      {/* Kartu Register Sederhana & Bersih */}
      <div className="w-full max-w-md rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-6 sm:p-8 shadow-[6px_6px_0px_#2d2d2d]">
        
        {/* Header Bersih */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 transition hover:opacity-85">
            <img src="/logo.png" alt="Nyumbangin" className="h-10 w-10 object-contain" />
            <span className="text-xl font-black tracking-tight text-[#2d2d2d]">nyumbangin</span>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-[#2d2d2d]">
            Daftar Akun Baru
          </h1>
          <p className="mt-1 text-xs text-[#696057]">
            Buat halaman apresiasi untuk karyamu dalam 1 menit
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl border-2 border-red-500 bg-red-50 p-2.5 text-xs font-bold text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form Pendaftaran */}
        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d] mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8c8276] select-none">@</span>
              <input
                id="username"
                name="username"
                type="text"
                required
                placeholder="namamu"
                value={formData.username}
                onChange={handleUsernameChange}
                className="w-full rounded-xl border-2 border-[#2d2d2d] bg-white pl-8 pr-3.5 py-2 text-sm font-semibold text-[#2d2d2d] placeholder:text-[#b4aba0] outline-none transition focus:bg-[#fbf8f3] focus:shadow-[2px_2px_0px_#2d2d2d]"
              />
            </div>
            {formData.username && (
              <p className="mt-1 text-[11px] font-mono text-[#696057]">
                nyumbangin.web.id/donate/{formData.username}
              </p>
            )}
          </div>

          {/* Nama Tampilan */}
          <div>
            <label htmlFor="displayName" className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d] mb-1">
              Nama Tampilan <span className="text-red-500">*</span>
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              placeholder="Nama Lengkap atau Channel"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full rounded-xl border-2 border-[#2d2d2d] bg-white px-3.5 py-2 text-sm font-semibold text-[#2d2d2d] placeholder:text-[#b4aba0] outline-none transition focus:bg-[#fbf8f3] focus:shadow-[2px_2px_0px_#2d2d2d]"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d] mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border-2 border-[#2d2d2d] bg-white px-3.5 py-2 text-sm font-semibold text-[#2d2d2d] placeholder:text-[#b4aba0] outline-none transition focus:bg-[#fbf8f3] focus:shadow-[2px_2px_0px_#2d2d2d]"
            />
          </div>

          {/* Password dengan Show/Hide */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d]">
                Password <span className="text-red-500">*</span>
              </label>
              <span className={`text-[11px] ${formData.password.length >= 6 ? 'text-green-600 font-bold' : 'text-[#8c8276]'}`}>
                Min. 6 karakter
              </span>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-[#2d2d2d] bg-white pl-3.5 pr-10 py-2 text-sm font-semibold text-[#2d2d2d] placeholder:text-[#b4aba0] outline-none transition focus:bg-[#fbf8f3] focus:shadow-[2px_2px_0px_#2d2d2d]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d7369] hover:text-[#2d2d2d] p-1 transition cursor-pointer"
                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] py-2.5 text-sm font-extrabold text-[#fbf8f3] shadow-[3px_3px_0px_#b8a492] transition hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-0.5 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <span>Daftar Sekarang</span>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2d8ca]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#fffdf9] px-3 font-semibold text-[#8c8276]">atau</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => {
              toast.loading('Mengarahkan ke Google...', { id: 'google-signin' });
              signIn('google', { callbackUrl: '/dashboard' });
            }}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border-2 border-[#2d2d2d] bg-white py-2.5 text-sm font-bold text-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d] transition hover:bg-[#faf4ec] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-0.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Daftar dengan Google
          </button>
        </form>

        {/* Tautan Masuk */}
        <div className="mt-6 pt-4 border-t border-[#ede4d7] text-center">
          <p className="text-xs text-[#696057]">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-extrabold text-[#2d2d2d] underline hover:text-[#8f857b]">
              Masuk di sini ↗
            </Link>
          </p>
        </div>
      </div>

      {/* Navigasi Balik ke Beranda */}
      <div className="mt-4 text-center">
        <Link href="/" className="text-xs font-semibold text-[#7d7368] hover:text-[#2d2d2d] hover:underline">
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
