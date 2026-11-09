'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 5MB');
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleBack = () => {
    if (!isLoggedIn) {
      router.push('/');
    } else if (userType === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = { ...formData };
      if (imagePreview) {
        submitData.image = imagePreview;
      }

      const response = await axios.post('/api/contact', submitData);

      if (response.data.success) {
        toast.success('Pesan berhasil dikirim!');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Gagal mengirim pesan. Silakan coba lagi.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#2d2d2d] font-sans antialiased selection:bg-[#b8a492] selection:text-[#2d2d2d]">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <img src="/logo.png" alt="Nyumbangin" className="h-8 w-8 object-contain" />
            <span className="text-lg font-black tracking-tight text-[#2d2d2d]">nyumbangin</span>
          </Link>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] px-4 py-2 text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] transition hover:bg-[#e7d6c2] cursor-pointer active:translate-y-0.5"
          >
            ← Kembali
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-6 shadow-[6px_6px_0px_#2d2d2d] sm:p-8">
          <div className="border-b-2 border-[#2d2d2d]/15 pb-4">
            <span className="inline-block rounded-lg border-2 border-[#2d2d2d] bg-[#f2e4d4] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2d2d2d] shadow-[1px_1px_0px_#2d2d2d]">
              Layanan Dukungan
            </span>
            <h1 className="mt-2.5 text-2xl font-black tracking-tight text-[#2d2d2d] sm:text-3xl">
              Hubungi Kami
            </h1>
            <p className="mt-1 text-xs font-semibold text-[#696057]">
              Ada pertanyaan seputar transaksi QRIS, akun kreator, atau pencairan dana? Kirimkan pesan di bawah ini.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama */}
              <div>
                <label htmlFor="name" className="block text-xs font-extrabold text-[#2d2d2d] mb-1.5">
                  Nama Lengkap <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] px-3.5 py-2.5 text-sm font-bold text-[#2d2d2d] placeholder:text-[#8f857b] focus:bg-[#fffdf9] focus:outline-none focus:shadow-[3px_3px_0px_#2d2d2d] transition"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-extrabold text-[#2d2d2d] mb-1.5">
                  Alamat Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] px-3.5 py-2.5 text-sm font-bold text-[#2d2d2d] placeholder:text-[#8f857b] focus:bg-[#fffdf9] focus:outline-none focus:shadow-[3px_3px_0px_#2d2d2d] transition"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-xs font-extrabold text-[#2d2d2d] mb-1.5">
                Subjek <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] px-3.5 py-2.5 text-sm font-bold text-[#2d2d2d] placeholder:text-[#8f857b] focus:bg-[#fffdf9] focus:outline-none focus:shadow-[3px_3px_0px_#2d2d2d] transition"
                placeholder="Contoh: Kendala verifikasi pembayaran / Perubahan rekening payout"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-xs font-extrabold text-[#2d2d2d] mb-1.5">
                Detail Pesan <span className="text-red-600">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] px-3.5 py-2.5 text-sm font-bold text-[#2d2d2d] placeholder:text-[#8f857b] focus:bg-[#fffdf9] focus:outline-none focus:shadow-[3px_3px_0px_#2d2d2d] transition resize-none"
                placeholder="Tuliskan detail pertanyaan atau kendala yang Anda alami..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-xs font-extrabold text-[#2d2d2d] mb-1">
                Lampiran Bukti / Screenshot (Opsional)
              </label>
              <p className="text-[11px] font-medium text-[#696057] mb-2">
                Unggah tangkapan layar bukti transaksi atau kendala (PNG/JPG maks. 5MB).
              </p>

              {!imagePreview ? (
                <div>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full px-4 py-6 rounded-xl border-2 border-dashed border-[#2d2d2d] bg-[#fbf8f3] cursor-pointer hover:bg-[#f2e4d4]/60 transition"
                  >
                    <svg className="w-7 h-7 text-[#2d2d2d] mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-extrabold text-[#2d2d2d]">Klik untuk pilih gambar</span>
                    <span className="text-[11px] font-medium text-[#696057] mt-0.5">PNG, JPG, GIF hingga 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="relative rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] p-4 shadow-[2px_2px_0px_#2d2d2d]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-60 mx-auto rounded-lg border border-[#2d2d2d]/20 object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 rounded-lg border-2 border-[#2d2d2d] bg-red-500 px-3 py-1 text-xs font-extrabold text-white shadow-[2px_2px_0px_#2d2d2d] hover:bg-red-600 transition cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] py-3.5 px-6 text-sm font-black text-[#fbf8f3] shadow-[4px_4px_0px_#b8a492] hover:bg-black transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5"
            >
              {loading ? 'Mengirim Pesan...' : 'Kirim Pesan Sekarang'}
            </button>
          </form>

          {/* Info tambahan */}
          <div className="mt-6 rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] p-4 shadow-[3px_3px_0px_#2d2d2d]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#2d2d2d]">
              Tips Menghubungi Tim Dukungan
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-medium text-[#4a433d]">
              <li>Sertakan <strong>username kreator</strong> atau <strong>ID Pesanan (Order ID)</strong> untuk pengecekan transaksi yang lebih cepat.</li>
              <li>Untuk kendala pembayaran QRIS, lampirkan bukti mutasi yang menampilkan <strong>nominal beserta kode unik</strong>.</li>
            </ul>
          </div>

          {/* Footer Navigation inside Card */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-2 border-[#2d2d2d]/15 pt-5 text-xs font-semibold text-[#696057]">
            <span>© {new Date().getFullYear()} Nyumbangin</span>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-extrabold text-[#2d2d2d]">
              <Link href="/privacy" className="hover:underline">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="hover:underline">
                Syarat &amp; Ketentuan
              </Link>
              <Link href="/faq" className="hover:underline">
                FAQ &amp; Bantuan
              </Link>
              <Link href="/contact" className="underline decoration-[#b8a492] decoration-2">
                Hubungi Kami
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
