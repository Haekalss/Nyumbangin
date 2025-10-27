// File: app/register/page.jsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend validation
    if (!formData.username || !formData.email || !formData.password || !formData.displayName) {
      toast.error('Username, email, password, dan nama tampilan wajib diisi!');
      setLoading(false);
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(formData.username)) {
      toast.error('Username hanya boleh berisi huruf, angka, underscore (_), dan dash (-)');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 30) {
      toast.error('Username harus 3-30 karakter!');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Format email tidak valid!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter!');
      setLoading(false);
      return;
    }

    if (formData.displayName.length < 2 || formData.displayName.length > 50) {
      toast.error('Nama tampilan harus 2-50 karakter!');
      setLoading(false);
      return;
    }
    
    try {
      await axios.post('/api/auth/register', formData);
      toast.success('Registrasi berhasil! Silakan login.');
      router.push('/login');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal register';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#2d2d2d] p-6 sm:p-8 rounded-xl border-4 border-[#b8a492]">
        <div>
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Nyumbangin Logo" className="w-20 h-20" />
          </div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-[#b8a492] font-mono">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#b8a492]">
            Atau{' '}
            <Link href="/login" className="font-bold text-[#b8a492] underline hover:text-[#d6c6b9]">
              masuk ke akun yang sudah ada
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-3">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="Username (untuk link donasi)"
                value={formData.username}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-[#b8a492]/70">Contoh: johndoe (huruf, angka, _, -)</p>
            </div>
            <div>
              <label htmlFor="displayName" className="sr-only">
                Nama Tampilan
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="Nama Tampilan (untuk ditampilkan)"
                value={formData.displayName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="Alamat email"
                value={formData.email}
                onChange={handleChange}
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
                autoComplete="new-password"
                required
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="Password (min. 6 karakter)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="bio" className="sr-only">
                Bio (Opsional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="3"
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono resize-none"
                placeholder="Bio / Deskripsi (opsional)"
                value={formData.bio}
                onChange={handleChange}
                maxLength="500"
              />
              <p className="mt-1 text-xs text-[#b8a492]/70">Max. 500 karakter</p>
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
              className="group relative w-full flex justify-center py-3 sm:py-4 px-4 border-2 border-[#b8a492] text-sm sm:text-base font-bold rounded-md text-[#b8a492] bg-[#2d2d2d] hover:bg-[#b8a492] hover:text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492] disabled:opacity-50 font-mono transition-all duration-200"
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
