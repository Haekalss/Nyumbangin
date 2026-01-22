'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
        
        <h2 className="text-xl font-bold mt-8 mb-2 text-[#b8a492]">🔐 Login dengan Google OAuth</h2>
        <p className="text-[#2d2d2d] mb-2">
          Nyumbangin menggunakan <strong>Google OAuth 2.0</strong> sebagai opsi login untuk memberikan pengalaman yang lebih mudah dan aman.
        </p>
        <p className="text-[#2d2d2d] mb-3 font-semibold">Data yang Kami Akses dari Google:</p>
        <ul className="list-disc ml-6 text-[#2d2d2d] space-y-1">
          <li><strong>Email Address</strong> - Untuk identifikasi akun dan komunikasi terkait layanan</li>
          <li><strong>Nama Lengkap</strong> - Untuk ditampilkan di profil creator Anda</li>
          <li><strong>Foto Profil</strong> (opsional) - Dapat digunakan sebagai avatar profil</li>
        </ul>
        <p className="text-[#2d2d2d] mt-3 mb-3 font-semibold">Data yang TIDAK Kami Akses:</p>
        <ul className="list-disc ml-6 text-[#2d2d2d] space-y-1">
          <li>Kami <strong>TIDAK mengakses</strong> isi Gmail, email, atau kontak Anda</li>
          <li>Kami <strong>TIDAK mengakses</strong> Google Drive, Calendar, atau layanan Google lainnya</li>
          <li>Kami <strong>TIDAK menyimpan</strong> password atau token OAuth Anda</li>
        </ul>
        <p className="text-[#2d2d2d] mt-3">
          <strong>Tujuan Penggunaan:</strong> Data dari Google hanya digunakan untuk autentikasi dan membuat profil creator Anda di platform Nyumbangin. 
          Anda dapat mencabut akses kapan saja melalui <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800">Google Account Permissions</a>.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-2 text-[#b8a492]">Data yang Dikumpulkan</h2>
        <ul className="list-disc ml-6 text-[#2d2d2d]">
          <li>Nama, email, dan username saat mendaftar (baik melalui OAuth atau registrasi manual)</li>
          <li>Data donasi (jumlah, pesan, waktu)</li>
          <li>Data pembayaran (diproses melalui <strong>Midtrans</strong> dan <strong>GoPay</strong> - payment gateway tersertifikasi, tidak disimpan di server kami)</li>
          <li>Informasi profil creator (bio, foto, social media links) - opsional</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-8 mb-2 text-[#b8a492]">Bagaimana Kami Menggunakan Data Anda</h2>
        <ul className="list-disc ml-6 text-[#2d2d2d]">
          <li>Membuat dan mengelola akun Anda</li>
          <li>Memproses transaksi donasi</li>
          <li>Mengirim notifikasi terkait donasi dan aktivitas akun</li>
          <li>Meningkatkan layanan dan pengalaman pengguna</li>
          <li>Mencegah fraud dan menjaga keamanan platform</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-2 text-[#b8a492]">Keamanan Data</h2>
        <ul className="list-disc ml-6 text-[#2d2d2d]">
          <li>Data disimpan dengan aman menggunakan database terenkripsi (MongoDB)</li>
          <li>Koneksi menggunakan HTTPS/SSL untuk melindungi data dalam transit</li>
          <li>Password di-hash menggunakan algoritma bcrypt (untuk akun non-OAuth)</li>
          <li>Token OAuth tidak pernah disimpan di database kami</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-2 text-[#b8a492]">Hak Anda</h2>
        <ul className="list-disc ml-6 text-[#2d2d2d]">
          <li>Mengakses dan melihat data pribadi Anda kapan saja</li>
          <li>Mengubah atau memperbarui informasi profil</li>
          <li>Mencabut akses Google OAuth melalui pengaturan Google Account</li>
          <li>Menghapus akun dan semua data terkait secara permanen</li>
          <li>Data Anda dilindungi dan <strong>tidak akan pernah dijual</strong> ke pihak ketiga</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-2 text-[#b8a492]">Pembagian Data dengan Pihak Ketiga</h2>
        <p className="text-[#2d2d2d] mb-2">Kami hanya membagikan data dengan pihak ketiga dalam konteks berikut:</p>
        <ul className="list-disc ml-6 text-[#2d2d2d]">
          <li><strong>Midtrans</strong> & <strong>GoPay</strong> - Payment gateway untuk memproses transaksi donasi secara aman (GoPay dapat digunakan langsung atau melalui Midtrans)</li>
          <li><strong>Google OAuth</strong> - Hanya untuk autentikasi, tidak ada data tambahan yang dibagikan</li>
          <li>Kami <strong>tidak menjual, menyewakan, atau membagikan</strong> data Anda untuk tujuan marketing</li>
        </ul>

  <p className="mt-8 text-[#2d2d2d]">Untuk pertanyaan lebih lanjut, <a href="/contact" className="underline text-[#b8a492] hover:text-[#2d2d2d]">hubungi tim kami</a>.</p>
      </div>
    </div>
  );
}
