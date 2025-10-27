'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FaqPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
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
          <h1 className="text-3xl font-bold text-[#b8a492]">FAQ & Bantuan Creator</h1>
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm font-bold font-mono transition-all rounded-lg border-2 bg-[#b8a492] text-[#2d2d2d] border-[#2d2d2d] hover:bg-[#d6c6b9]"
          >
            ← Kembali
          </button>
        </div>
        <div className="space-y-6 text-[#2d2d2d]">
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Bagaimana cara mengaktifkan donasi?</h2>
            <p>Isi data rekening/e-wallet di menu profil, lalu simpan. Setelah itu, link donasi akan aktif dan bisa dibagikan ke pendukung Anda.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Kapan dana donasi bisa dicairkan?</h2>
            <p>Dana bisa dicairkan setelah status donasi <span className="font-bold">PAID</span>. Proses payout biasanya 1-2 hari kerja setelah permintaan pencairan.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Bagaimana cara promosi link donasi?</h2>
            <p>Bagikan link donasi di media sosial, bio Instagram, deskripsi YouTube, atau saat live streaming. Semakin aktif promosi, semakin besar peluang mendapat dukungan.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Bagaimana jika ada masalah payout?</h2>
            <p>Pastikan data rekening/e-wallet sudah benar dan sesuai. Jika ada kendala, <a href="/contact" className="underline text-[#b8a492] hover:text-[#2d2d2d]">hubungi support kami</a>.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Apakah donasi bisa anonim?</h2>
            <p>Ya, donatur bisa memilih nama anonim saat melakukan donasi.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Tips agar donasi lebih banyak?</h2>
            <ul className="list-disc ml-6">
              <li>Aktif berinteraksi dengan pendukung.</li>
              <li>Berikan ucapan terima kasih di konten/live.</li>
              <li>Update konten secara rutin.</li>
              <li>Promosikan link donasi di berbagai platform.</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-[#2d2d2d]">Jika ada pertanyaan lain, silakan <a href="/contact" className="underline text-[#b8a492] hover:text-[#2d2d2d]">hubungi tim kami</a>.</p>
      </div>
    </div>
  );
}
