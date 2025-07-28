'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DonatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/donate', {
        name: formData.name,
        message: formData.message,
        amount: parseInt(formData.amount)
      });
      
      setSuccess(true);
      setFormData({ name: '', message: '', amount: '' });
      toast.success('Donasi berhasil dibuat! Terima kasih atas dukungannya.');
      
      // Redirect to success page or show payment info
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal membuat donasi';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const predefinedAmounts = [10000, 25000, 50000, 100000, 250000, 500000];

  const handlePredefinedAmount = (amount) => {
    setFormData({ ...formData, amount: amount.toString() });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Donasi Berhasil!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Terima kasih atas donasi Anda. Anda akan diarahkan ke halaman utama dalam beberapa detik.
          </p>
          <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] py-12 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="mt-6 text-3xl font-extrabold text-[#2d2d2d] font-mono">
            Berikan Donasi
          </h2>
          <p className="mt-2 text-sm text-[#2d2d2d] font-mono">
            Dukung platform ini dengan donasi Anda
          </p>
        </div>

        <div className="bg-[#2d2d2d] py-8 px-6 rounded-lg border-4 border-[#b8a492]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nama Anda
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-[#b8a492] rounded-md bg-[#2d2d2d] text-[#b8a492] font-mono focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                placeholder="Masukkan nama Anda"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Jumlah Donasi (Rupiah)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  required
                  min="1000"
                  className="block w-full px-3 py-2 border border-[#b8a492] rounded-md bg-[#2d2d2d] text-[#b8a492] font-mono focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                  placeholder="Masukkan jumlah donasi"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>
              
              {/* Predefined amounts */}
              <div className="mt-3">
                <p className="text-sm text-gray-700 mb-2">Atau pilih jumlah:</p>
                <div className="grid grid-cols-3 gap-2">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handlePredefinedAmount(amount)}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        formData.amount === amount.toString()
                        ? 'bg-[#b8a492] text-[#2d2d2d] border-[#b8a492]'
                        : 'bg-[#2d2d2d] text-[#b8a492] border-[#b8a492] hover:bg-[#d6c6b9]'
                      }`}
                    >
                      {amount.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Pesan (Opsional)
              </label>
              <textarea
                name="message"
                id="message"
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-[#b8a492] rounded-md bg-[#2d2d2d] text-[#b8a492] font-mono focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                placeholder="Tulis pesan untuk donasi Anda..."
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="rounded-md bg-[#b8a492]/20 p-4 border border-[#b8a492]">
                <div className="text-sm text-[#b8a492]">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
              className="w-full flex justify-center py-2 px-4 border-2 border-[#b8a492] rounded-md text-sm font-bold text-[#b8a492] bg-[#2d2d2d] hover:bg-[#b8a492] hover:text-[#2d2d2d] font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492] disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Donasi Sekarang'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[#b8a492] underline hover:text-[#d6c6b9] text-sm font-mono">
              ← Kembali ke beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
