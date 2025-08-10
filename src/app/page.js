'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
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
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              toast.success('Berhasil logout!');
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
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono">
      {/* Header */}
      <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center py-6">
          <h1 className="text-3xl font-extrabold text-[#b8a492] tracking-wide">Nyumbangin</h1>
          <nav className="flex items-center gap-4">
            <Link href="/creator/register" className="bg-[#b8a492] text-[#2d2d2d] px-4 py-2 rounded-lg font-bold border-2 border-[#2d2d2d] hover:bg-[#d6c6b9]">
              Daftar Creator
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link href="/dashboard" className="bg-[#b8a492] text-[#2d2d2d] px-4 py-2 rounded-lg font-bold border-2 border-[#2d2d2d] hover:bg-[#d6c6b9]">
                    Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold border-2 border-red-700 hover:bg-red-700">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-[#2d2d2d] text-[#b8a492] px-4 py-2 rounded-lg font-bold border-2 border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d]">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center py-16 px-4">
        <h2 className="text-5xl font-extrabold text-[#2d2d2d]">Buat Halaman Donasi Pribadi Anda</h2>
        <p className="mt-4 text-lg text-[#2d2d2d] max-w-2xl mx-auto">
          Nyumbangin adalah platform donasi digital yang memudahkan kreator menerima dukungan dari fans dan followers dengan aman, cepat, dan transparan.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/creator/register" className="bg-[#b8a492] text-[#2d2d2d] px-8 py-4 rounded-xl font-extrabold text-lg border-2 border-[#2d2d2d] hover:bg-[#d6c6b9]">
            Mulai Sebagai Creator
          </Link>
          <Link href="/explore" className="bg-[#2d2d2d] text-[#b8a492] px-8 py-4 rounded-xl font-extrabold text-lg border-2 border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d]">
            Lihat Creator
          </Link>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="bg-[#2d2d2d] border-t-4 border-[#b8a492] py-16">
        <div className="max-w-5xl mx-auto px-4 text-[#b8a492]">
          <h3 className="text-3xl font-bold text-center mb-12">Bagaimana Cara Kerjanya?</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="text-xl font-bold mb-2">1. Daftar</h4>
              <p>Buat akun creator dan lengkapi profil Anda.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">2. Bagikan</h4>
              <p>Promosikan halaman donasi Anda ke audiens.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">3. Terima Donasi</h4>
              <p>Terima dukungan finansial langsung melalui platform kami.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan */}
 {/* Keunggulan */}
<section className="max-w-5xl mx-auto px-4 py-16">
  <h3 className="text-3xl font-bold text-center text-[#2d2d2d] mb-12">
    Kenapa Pilih Nyumbangin?
  </h3>
  <ul className="space-y-4 text-lg text-[#2d2d2d]">
    <li>🎨 Tampil keren & rapi di semua perangkat</li>
    <li>🔒 Pembayaran aman via Midtrans</li>
    <li>⚡ Donasi masuk, notifikasi langsung</li>
    <li>🌍 Cocok untuk kreator, komunitas, & proyek sosial</li>
  </ul>
</section>



      {/* Footer */}
      <footer className="bg-[#2d2d2d] border-t-4 border-[#b8a492] text-[#b8a492] text-center py-6">
        <footer className="w-full py-6 text-center text-[#b8a492] bg-[#2d2d2d] text-sm flex flex-col items-center gap-2">
          <div>
            <a href="/privacy" className="underline hover:text-[#fff] transition-colors">Kebijakan Privasi</a>
            <span className="mx-2">|</span>
            <a href="/terms" className="underline hover:text-[#fff] transition-colors">Syarat & Ketentuan</a>
            <span className="mx-2">|</span>
            <a href="mailto:admin@nyumbangin.com" className="underline hover:text-[#fff] transition-colors">Hubungi kami</a>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Nyumbangin. Dibuat dengan ❤️ untuk kreator Indonesia.
          </div>
        </footer>
      </footer>
    </div>
  );
}
