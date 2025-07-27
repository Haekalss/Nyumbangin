'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

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
                Username (Link Donasi)
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
                Nama Tampilan
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
                Email
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
                Password
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
