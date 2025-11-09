'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PrivacyPolicy() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'admin' || userData.isAdmin) {
          setUserType('admin');
        } else {
          setUserType('creator');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleBack = () => {
    if (!isLoggedIn) {
      router.push('/');
    } else if (userType === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 py-12">
      <div className="w-full max-w-2xl bg-white/80 rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#b8a492]">Kebijakan Privasi</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-bold font-mono transition-all rounded-lg border-2 bg-[#b8a492] text-[#2d2d2d] border-[#2d2d2d] hover:bg-[#d6c6b9]"
          >
            ← Kembali
          </button>
        </div>
        <p className="mb-4 text-[#2d2d2d]">Kami menghargai privasi Anda. Data yang Anda berikan hanya digunakan untuk keperluan donasi dan tidak akan dibagikan ke pihak ketiga tanpa izin Anda.</p>
        <h2 className="text-xl font-bold mt-8 mb-2 text-[#b8a492]">Data yang Dikumpulkan</h2>
        <ul className="list-disc ml-6 text-[#2d2d2d]">
          <li>Nama, email, dan username saat mendaftar</li>
          <li>Data donasi (jumlah, pesan, waktu)</li>
          <li>Data pembayaran (hanya untuk proses donasi, tidak disimpan permanen)</li>
        </ul>
        <h2 className="text-xl font-bold mt-8 mb-2 text-[#b8a492]">Hak Anda</h2>
        <ul className="list-disc ml-6 text-[#2d2d2d]">
          <li>Anda dapat meminta penghapusan akun dan data kapan saja</li>
          <li>Data Anda dilindungi dan tidak dijual ke pihak lain</li>
        </ul>
  <p className="mt-8 text-[#2d2d2d]">Untuk pertanyaan lebih lanjut, <a href="/contact" className="underline text-[#b8a492] hover:text-[#2d2d2d]">hubungi tim kami</a>.</p>
      </div>
    </div>
  );
}
