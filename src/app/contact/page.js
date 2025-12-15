'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const router = useRouter();  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'creator' or 'admin'

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        // Detect user type from user data
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
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

  // Handle back navigation based on user status
  const handleBack = () => {
    if (!isLoggedIn) {
      // Not logged in -> go to landing page
      router.push('/');
    } else if (userType === 'admin') {
      // Admin -> go to admin dashboard
      router.push('/admin');
    } else {
      // Creator -> go to creator dashboard
      router.push('/dashboard');
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = { ...formData };
      
      // Add image if selected
      if (imagePreview) {
        submitData.image = imagePreview;
      }

      const response = await axios.post('/api/contact', submitData);
      
      if (response.data.success) {
        toast.success('Pesan berhasil dikirim!');
        // Reset form
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
              onClick={handleBack}
              className="px-4 py-2 text-base font-bold font-mono transition-all rounded-lg border-2 bg-transparent text-[#b8a492] border-[#b8a492] hover:bg-[#b8a492]/10"
            >
              ← Kembali ke {isLoggedIn ? 'Dashboard' : 'Beranda'}
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
            </div>            {/* Message */}
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

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-bold text-[#b8a492] font-mono mb-2">
                Lampiran Gambar (Opsional)
              </label>
              <p className="text-xs text-[#b8a492]/60 mb-2">
                Upload screenshot atau gambar pendukung (Max 5MB)
              </p>
              
              {!imagePreview ? (
                <div className="relative">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="flex items-center justify-center w-full px-4 py-8 bg-[#2d2d2d] border-2 border-dashed border-[#b8a492] rounded-lg cursor-pointer hover:bg-[#3d3d3d] transition-all"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-[#b8a492] font-bold">Klik untuk upload gambar</p>
                      <p className="text-xs text-[#b8a492]/60 mt-1">PNG, JPG, GIF hingga 5MB</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative border-2 border-[#b8a492] rounded-lg p-4 bg-[#2d2d2d]">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-700 transition-all text-sm"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              )}
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