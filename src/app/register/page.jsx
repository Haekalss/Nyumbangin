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
    email: '',
    password: '',
    role: 'user'
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
    if (!formData.email || !formData.password) {
      toast.error('Email dan password wajib diisi!');
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
          <div className="rounded-md shadow-sm -space-y-px">
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
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-t-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
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
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-b-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
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
