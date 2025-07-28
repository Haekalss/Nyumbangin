'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DonatePage() {
  const params = useParams();
  const username = params.username;
  
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    message: ''
  });
  const [donating, setDonating] = useState(false);
  const [success, setSuccess] = useState(false);
  const presetAmounts = [5000, 10000, 25000, 50000, 100000];

  useEffect(() => {
    if (username) {
      fetchCreatorData();
    }
  }, [username]);

  const fetchCreatorData = async () => {
    try {
      const response = await axios.get(`/api/donate/${username}`);
      const data = response.data;
      setCreator(data.creator);
    } catch (error) {
      console.error('Error fetching creator data:', error);
      setError('Creator tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAmountSelect = (amount) => {
    setFormData({
      ...formData,
      amount: amount.toString()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDonating(true);
    setError('');

    // Frontend validation
    if (!formData.name || !formData.amount) {
      toast.error('Semua field wajib diisi!');
      setDonating(false);
      return;
    }

    const amount = parseInt(formData.amount);
    if (isNaN(amount) || amount < 1000) {
      toast.error('Minimal donasi adalah Rp 1.000!');
      setDonating(false);
      return;
    }

    if (amount > 10000000) {
      toast.error('Maksimal donasi adalah Rp 10.000.000!');
      setDonating(false);
      return;
    }

    if (formData.name.length < 2) {
      toast.error('Nama minimal 2 karakter!');
      setDonating(false);
      return;
    }

    try {
      const response = await axios.post(`/api/donate/${username}`, formData);
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({ name: '', amount: '', message: '' });
        toast.success('Donasi berhasil dikirim! Terima kasih atas dukungannya.');
        // Refresh data to show new donation
        fetchCreatorData();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Terjadi kesalahan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Creator Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-8">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto py-6 sm:py-8">
        <div className="bg-[#2d2d2d] rounded-xl border-4 border-[#b8a492] shadow-lg p-4 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#b8a492] mb-4 sm:mb-6 font-mono text-center">
            Dukung <span className="font-bold">{creator.displayName}</span>
          </h2>
          {success && (
            <div className="bg-[#b8a492]/20 border-l-4 border-[#b8a492] p-3 sm:p-4 mb-4 sm:mb-6 rounded-md">
              <div className="text-xs sm:text-sm text-[#b8a492] font-mono">
                Terima kasih! Donasi Anda berhasil dikirim.
              </div>
            </div>
          )}
          {error && (
            <div className="bg-[#b8a492]/20 border-l-4 border-[#b8a492] p-3 sm:p-4 mb-4 sm:mb-6 rounded-md">
              <div className="text-xs sm:text-sm text-[#b8a492] font-mono">{error}</div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-bold text-[#b8a492] font-mono mb-1">
                Nama Anda
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 sm:py-3 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-lg text-[#b8a492] placeholder-[#b8a492] focus:outline-none focus:ring-2 focus:ring-[#b8a492] font-mono text-sm sm:text-base"
                placeholder="Masukkan nama Anda"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-xs sm:text-sm font-bold text-[#b8a492] font-mono mb-2">
                Jumlah Donasi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleAmountSelect(amount)}
                    className={`px-3 py-2 rounded-lg border-2 font-mono text-xs sm:text-sm font-bold transition-all ${
                      formData.amount === amount.toString()
                        ? 'bg-[#b8a492] text-[#2d2d2d] border-[#b8a492]'
                        : 'bg-[#2d2d2d] text-[#b8a492] border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d]'
                    }`}
                  >
                    Rp {amount.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="1000"
                className="w-full px-3 py-2 sm:py-3 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-lg text-[#b8a492] placeholder-[#b8a492] focus:outline-none focus:ring-2 focus:ring-[#b8a492] font-mono text-sm sm:text-base"
                placeholder="Atau masukkan jumlah custom"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-xs sm:text-sm font-bold text-[#b8a492] font-mono mb-1">
                Pesan (Opsional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 sm:py-3 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-lg text-[#b8a492] placeholder-[#b8a492] focus:outline-none focus:ring-2 focus:ring-[#b8a492] font-mono text-sm sm:text-base resize-none"
                placeholder="Tulis pesan dukungan Anda..."
              />
            </div>

            <button
              type="submit"
              disabled={donating}
              className="w-full bg-[#b8a492] text-[#2d2d2d] py-3 sm:py-4 px-4 rounded-lg font-extrabold text-base sm:text-lg border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] focus:outline-none focus:ring-2 focus:ring-[#b8a492] disabled:opacity-50 font-mono transition-all duration-200"
            >
              {donating ? 'Mengirim...' : `Donasi Rp ${formData.amount ? parseInt(formData.amount).toLocaleString('id-ID') : '0'}`}
            </button>

            <div className="text-center">
              <Link href="/" className="text-[#b8a492] hover:text-[#d6c6b9] underline font-mono text-xs sm:text-sm">
                ← Kembali ke beranda
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
