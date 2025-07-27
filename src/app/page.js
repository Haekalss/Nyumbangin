'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <span className="font-medium">Yakin ingin keluar?</span>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast.promise(
                new Promise((resolve) => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setUser(null);
                  setTimeout(() => {
                    resolve();
                  }, 500);
                }),
                {
                  loading: 'Keluar dari akun...',
                  success: 'Berhasil logout!',
                  error: 'Gagal logout'
                }
              );
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Ya, Keluar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Batal
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono">
      {/* Header */}
      <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-6 sm:py-8 gap-4">
            <div className="flex items-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#b8a492] tracking-wide font-mono text-center sm:text-left">Nyumbangin</h1>
            </div>
            <nav className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/creator/register" className="bg-[#b8a492] text-[#2d2d2d] px-4 sm:px-6 py-2 rounded-lg font-bold border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-all text-sm sm:text-base w-full sm:w-auto text-center">
                Daftar Creator
              </Link>
              {user ? (
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  <span className="text-[#b8a492] font-medium text-sm sm:text-base text-center">
                    Halo, {user.displayName || user.username}!
                  </span>
                  {user.role === 'admin' && (
                    <Link href="/dashboard" className="bg-[#b8a492] text-[#2d2d2d] px-3 sm:px-4 py-2 rounded-lg font-bold border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-all text-sm w-full sm:w-auto text-center">
                      Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold border-2 border-red-700 hover:bg-red-700 transition-all text-sm w-full sm:w-auto"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="bg-[#2d2d2d] text-[#b8a492] px-4 sm:px-6 py-2 rounded-lg font-bold border-2 border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] transition-all text-sm sm:text-base w-full sm:w-auto text-center">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-[#2d2d2d] mb-4 sm:mb-6 font-mono">
            Platform Donasi Digital Retro
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-[#2d2d2d] max-w-2xl mx-auto font-mono px-4">
            Buat halaman donasi personal Anda sendiri. Terima dukungan dari fans dan followers dengan mudah, aman, dan nuansa retro profesional.
          </p>
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            {user ? (
              <div className="text-center">
                <p className="text-lg sm:text-xl text-[#2d2d2d] mb-4 font-mono">
                  Selamat datang kembali, {user.displayName || user.username}!
                </p>
                {user.role === 'admin' ? (
                  <Link href="/dashboard" className="bg-[#b8a492] text-[#2d2d2d] px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-extrabold text-lg sm:text-2xl border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-all inline-block">
                    Ke Dashboard
                  </Link>
                ) : (
                  <Link href={`/donate/${user.username}`} className="bg-[#b8a492] text-[#2d2d2d] px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-extrabold text-lg sm:text-2xl border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-all inline-block">
                    Halaman Donasi Saya
                  </Link>
                )}
              </div>
            ) : (
              <>
                <Link href="/creator/register" className="bg-[#b8a492] text-[#2d2d2d] px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-extrabold text-lg sm:text-2xl border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-all text-center">
                  Daftar Creator
                </Link>
                <Link href="/login" className="bg-[#2d2d2d] text-[#b8a492] px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-extrabold text-lg sm:text-2xl border-2 border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] transition-all text-center">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-center mt-12 sm:mt-16">
          <div className="w-full max-w-2xl bg-[#2d2d2d] rounded-2xl p-6 sm:p-8 border-4 border-[#b8a492] mx-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#b8a492] mb-4 font-mono">Kenapa Nyumbangin?</h3>
            <ul className="text-base sm:text-lg text-[#b8a492] space-y-3 font-mono">
              <li>✔️ Desain retro profesional</li>
              <li>🔒 Aman, cepat, dan mudah digunakan</li>
              <li>👥 Multi-tenant, cocok untuk semua kreator</li>
              <li>💡 Realtime notifikasi donasi</li>
              <li>🌐 Dukungan penuh untuk komunitas digital</li>
            </ul>
          </div>
        </div>
      </main>
      <style jsx global>{`
        body, .font-mono { font-family: 'IBM Plex Mono', 'Fira Mono', 'Roboto Mono', monospace; }
      `}</style>
    </div>
  );
}
