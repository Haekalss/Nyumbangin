'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/contact', formData);
      
      if (response.data.success) {
        toast.success('Pesan berhasil dikirim!');
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Gagal mengirim pesan. Silakan coba lagi.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono">
      
      {/* Header */}
      <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Nyumbangin Logo" className="w-16 h-16" />
              <div>
                <h1 className="text-4xl font-extrabold text-[#b8a492] tracking-wide font-mono">Hubungi Kami</h1>
                <p className="text-[#b8a492] text-lg mt-2 font-mono">Kami siap membantu Anda</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-base font-bold font-mono transition-all rounded-lg border-2 bg-transparent text-[#b8a492] border-[#b8a492] hover:bg-[#b8a492]/10"
            >
              ← Kembali ke Beranda
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-[#2d2d2d] border-4 border-[#b8a492] sm:rounded-xl p-6 sm:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#b8a492] mb-4">Kirim Pesan kepada Tim Nyumbangin</h2>
            <p className="text-[#b8a492]/80 font-mono text-sm">
              Ada pertanyaan, saran, atau butuh bantuan? Jangan ragu untuk menghubungi kami. 
              Kami akan merespons dalam waktu 1x24 jam.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Nama */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-[#b8a492] font-mono mb-2">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-lg text-[#b8a492] placeholder-[#b8a492]/60 focus:outline-none focus:ring-2 focus:ring-[#b8a492] font-mono"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-[#b8a492] font-mono mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-3 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-lg text-[#b8a492] placeholder-[#b8a492]/60 focus:outline-none focus:ring-2 focus:ring-[#b8a492] font-mono"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-bold text-[#b8a492] font-mono mb-2">
                Subjek <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-lg text-[#b8a492] placeholder-[#b8a492]/60 focus:outline-none focus:ring-2 focus:ring-[#b8a492] font-mono"
                placeholder="Contoh: Pertanyaan tentang payout"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-bold text-[#b8a492] font-mono mb-2">
                Pesan <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-3 py-3 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-lg text-[#b8a492] placeholder-[#b8a492]/60 focus:outline-none focus:ring-2 focus:ring-[#b8a492] font-mono resize-none"
                placeholder="Tulis pesan Anda dengan detail..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b8a492] text-[#2d2d2d] py-3 px-6 rounded-lg font-extrabold text-lg border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] focus:outline-none focus:ring-2 focus:ring-[#b8a492] disabled:opacity-50 disabled:cursor-not-allowed font-mono transition-all duration-200"
            >
              {loading ? 'Mengirim...' : '📧 Kirim Pesan'}
            </button>
          </form>

          {/* Info tambahan */}
          <div className="mt-8 p-4 bg-[#b8a492]/10 border-2 border-[#b8a492] rounded-lg">
            <h3 className="text-lg font-bold text-[#b8a492] mb-2">💡 Tips Menghubungi Kami:</h3>
            <ul className="text-sm text-[#b8a492]/80 font-mono space-y-1">
              <li>• Berikan detail yang jelas agar kami bisa membantu dengan lebih baik</li>
              <li>• Untuk masalah teknis, sertakan screenshot jika memungkinkan</li>
              <li>• Untuk pertanyaan payout, sertakan username Anda</li>
              <li>• Kami akan merespons melalui email dalam 1x24 jam</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-[#b8a492] bg-[#2d2d2d] text-sm mt-8 flex flex-col items-center gap-2">
        <div>
          <a href="/privacy" className="underline hover:text-[#fff] transition-colors">Kebijakan Privasi</a>
          <span className="mx-2">|</span>
          <a href="/terms" className="underline hover:text-[#fff] transition-colors">Syarat & Ketentuan</a>
          <span className="mx-2">|</span>
          <a href="/faq" className="underline hover:text-[#fff] transition-colors">FAQ & Bantuan</a>
        </div>
        <div>
          &copy; {new Date().getFullYear()} Nyumbangin.
        </div>
      </footer>
      
      <style jsx global>{`
        body, .font-mono { font-family: 'IBM Plex Mono', 'Fira Mono', 'Roboto Mono', monospace; }
      `}</style>
    </div>
  );
}