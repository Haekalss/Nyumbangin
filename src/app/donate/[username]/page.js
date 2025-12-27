
'use client'

import { useState, useEffect } from 'react';
import { formatRupiah } from '@/utils/format';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import ShareModal from '@/components/organisms/ShareModal';


export default function DonatePage() {
  const params = useParams();
  const username = params.username;
  
  // All state and variables must be declared before any useEffect
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', amount: '', message: '' });
  const [donating, setDonating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [enableMediaShare, setEnableMediaShare] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [mediaDuration, setMediaDuration] = useState(30);
  const [pendingRef, setPendingRef] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [completedDonationId, setCompletedDonationId] = useState(null);
  const [todayShares, setTodayShares] = useState(0);
  const presetAmounts = [5000, 10000, 25000, 50000, 100000];

  useEffect(() => {
    if (username) {
      fetchCreatorData();
      fetchShareStats();
    }
  }, [username]);

  const fetchCreatorData = async () => {
    try {
      const response = await axios.get(`/api/donate/${username}`);
      const data = response.data;
      setCreator(data.creator);
    } catch (error) {
      console.error('Error fetching creator data:', error);
      if (error.response?.status === 403) {
        setError('Creator belum mengaktifkan donasi');
      } else if (error.response?.status === 404) {
        setError('Creator tidak ditemukan');
      } else {
        setError('Gagal memuat data creator');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchShareStats = async () => {
    try {
      const response = await axios.get(`/api/donate/share-stats/${username}`);
      setTodayShares(response.data.today.totalShares);
    } catch (error) {
      console.error('Error fetching share stats:', error);
      // Silently fail, tidak perlu show error
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

  // Calculate max duration based on amount
  const getMaxDuration = (amount) => {
    const amt = parseInt(amount) || 0;
    if (amt >= 100000) return 300; // 5 minutes
    if (amt >= 50000) return 120;  // 2 minutes
    if (amt >= 20000) return 60;   // 1 minute
    if (amt >= 10000) return 30;   // 30 seconds
    return 15; // 15 seconds minimum
  };

  // Update media duration when amount changes
  useEffect(() => {
    if (formData.amount && enableMediaShare) {
      const maxDur = getMaxDuration(formData.amount);
      if (mediaDuration > maxDur) {
        setMediaDuration(maxDur);
      }
    }
  }, [formData.amount, enableMediaShare]);

  const loadSnapScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('midtrans-snap')) return resolve();
      const script = document.createElement('script');
      script.id = 'midtrans-snap';
  // Force sandbox usage
  script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
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

    if (!agreedToTerms) {
      toast.error('Anda harus menyetujui syarat dan ketentuan!');
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

    // Validate media share if enabled
    if (enableMediaShare) {
      if (!youtubeUrl) {
        toast.error('URL YouTube wajib diisi untuk Media Share!');
        setDonating(false);
        return;
      }
      
      const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
      if (!youtubePattern.test(youtubeUrl)) {
        toast.error('Format URL YouTube tidak valid!');
        setDonating(false);
        return;
      }

      const maxDur = getMaxDuration(amount);
      if (mediaDuration > maxDur) {
        toast.error(`Maksimal durasi untuk donasi Rp ${amount.toLocaleString('id-ID')} adalah ${maxDur} detik!`);
        setDonating(false);
        return;
      }

      if (mediaDuration < 10) {
        toast.error('Minimal durasi video adalah 10 detik!');
        setDonating(false);
        return;
      }
    }

    try {
      // Prepare donation data
      const donationData = {
        ...formData
      };

      // Add media share request if enabled
      if (enableMediaShare && youtubeUrl) {
        donationData.mediaShare = {
          enabled: true,
          youtubeUrl: youtubeUrl,
          duration: mediaDuration
        };
      }

  const response = await axios.post(`/api/donate/${username}`, donationData);
      if (response.data.success) {
        const token = response.data.payment?.token;
        const merchantRef = response.data.donation.merchant_ref;
        const donationId = response.data.donation._id;
        
        await loadSnapScript();
    if (window.snap && token) {
          window.snap.pay(token, {
            onSuccess: async function() {
              toast.success('Pembayaran berhasil!');
              
              // Check payment status to update database
              try {
                await axios.post('/api/check-payment-status', { merchant_ref: merchantRef });
                
                // Media share will be auto-created by webhook after payment confirmed
                if (enableMediaShare) {
                  toast.success('Media share akan segera diproses!');
                }
              } catch (err) {
                console.error('Failed to check payment status:', err);
              }
              fetchShareStats(); // Refresh share count
              
              setSuccess(true);
              setCompletedDonationId(donationId);
              setShowShareModal(true);
              setFormData({ name: '', amount: '', message: '' });
              setAgreedToTerms(false);
              setEnableMediaShare(false);
              setYoutubeUrl('');
              setMediaDuration(30);
              setPendingRef(null);
            },
            onPending: function() {
      toast('Menunggu pembayaran...');
              setPendingRef(merchantRef);
            },
            onError: function() {
              toast.error('Pembayaran gagal');
              setPendingRef(null);
            },
            onClose: async function() {
              // When user closes popup, check payment status
              toast('Mengecek status pembayaran...');
              
              try {
                const statusCheck = await axios.post('/api/check-payment-status', { 
                  merchant_ref: merchantRef 
                });
                
                if (statusCheck.data.status === 'PAID') {
                  toast.success('Pembayaran berhasil!');
                  setSuccess(true);
                  setCompletedDonationId(donationId);
                  setShowShareModal(true);
                  setFormData({ name: '', amount: '', message: '' });
                  setAgreedToTerms(false);
                  setPendingRef(null);
                } else if (statusCheck.data.status === 'PENDING') {
                  toast('Pembayaran masih pending. Silakan selesaikan pembayaran.');
                  setPendingRef(merchantRef);
                } else {
                  toast('Popup pembayaran ditutup');
                }
              } catch (err) {
                console.error('Failed to check payment status:', err);
                toast('Popup pembayaran ditutup');
              }
            }
          });
        } else {
          toast.error('Gagal memuat pembayaran');
        }
      }      
    } catch (error) {
      let errorMessage = error.response?.data?.error || 'Terjadi kesalahan';
      if (error.response?.status === 403) {
        errorMessage = 'Donasi belum aktif untuk creator ini';
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDonating(false);
    }
  };

  // (Simulation helpers removed for production)

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

  // Jika creator ada tapi error karena belum aktifkan donasi
  if (creator && error === 'Creator belum mengaktifkan donasi') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4">
        <div className="max-w-md w-full mx-auto py-8">
          <div className="bg-[#2d2d2d] rounded-xl border-4 border-[#b8a492] shadow-lg p-6 text-center">
            <h2 className="text-2xl font-extrabold text-[#b8a492] mb-4">Donasi Belum Aktif</h2>
            <p className="text-[#b8a492]/80 mb-6">Creator ini belum mengisi informasi rekening / e-wallet untuk menerima donasi.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 sm:px-6 lg:px-8">
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            fetchShareStats(); // Refresh share count when modal closed
          }}
          creatorUsername={creator?.username}
          donationId={completedDonationId}
        />
      )}

      <div className="max-w-md w-full mx-auto py-6 sm:py-8">
        <div className="bg-[#2d2d2d] rounded-xl border-4 border-[#b8a492] shadow-lg p-4 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#b8a492] mb-4 sm:mb-6 font-mono text-center">
            Dukung <span className="font-bold">{creator.displayName}</span>
          </h2>
          {error && (
            <div className="bg-[#b8a492]/20 border-l-4 border-[#b8a492] p-3 sm:p-4 mb-4 sm:mb-6 rounded-md">
              <div className="text-xs sm:text-sm text-[#b8a492] font-mono">{error}</div>
            </div>
          )}

          {/* Share Stats - Simple Text */}
          {todayShares > 0 && (
            <div className="bg-[#b8a492]/10 border border-[#b8a492]/30 rounded-lg p-3 mb-4 sm:mb-6 text-center">
              <p className="text-xs sm:text-sm text-[#b8a492] font-mono">
                🔗 <span className="font-bold">{todayShares} orang</span> sudah membagikan link ini hari ini
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-bold text-[#b8a492] font-mono mb-1">
                Nama Anda <span className="text-red-400">*</span>
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
                Jumlah Donasi <span className="text-red-400">*</span>
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
                    {formatRupiah(amount)}
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

            {/* Media Share Section */}
            <div className="border-2 border-[#b8a492]/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#b8a492] font-mono">
                  🎥 Media Share (YouTube)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setEnableMediaShare(!enableMediaShare);
                    if (!enableMediaShare) {
                      const maxDur = getMaxDuration(formData.amount);
                      setMediaDuration(Math.min(30, maxDur));
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    enableMediaShare
                      ? 'bg-[#b8a492] text-[#2d2d2d]'
                      : 'bg-[#2d2d2d] text-[#b8a492] border border-[#b8a492]'
                  }`}
                >
                  {enableMediaShare ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              {enableMediaShare && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label htmlFor="youtubeUrl" className="block text-xs font-bold text-[#b8a492] font-mono mb-1">
                      URL YouTube <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="youtubeUrl"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-lg text-[#b8a492] placeholder-[#b8a492]/50 focus:outline-none focus:ring-2 focus:ring-[#b8a492] font-mono text-sm"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="mediaDuration" className="block text-xs font-bold text-[#b8a492] font-mono">
                        Durasi Video (detik)
                      </label>
                      <span className="text-xs text-[#b8a492]/70 font-mono">
                        Max: {getMaxDuration(formData.amount)}s
                      </span>
                    </div>
                    <input
                      type="range"
                      id="mediaDuration"
                      min="10"
                      max={getMaxDuration(formData.amount)}
                      value={mediaDuration}
                      onChange={(e) => setMediaDuration(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#b8a492]/20 rounded-lg appearance-none cursor-pointer accent-[#b8a492]"
                    />
                    <div className="text-center mt-1">
                      <span className="text-lg font-bold text-[#b8a492] font-mono">{mediaDuration}s</span>
                    </div>
                  </div>

                  <div className="bg-[#b8a492]/10 rounded-lg p-3">
                    <p className="text-xs text-[#b8a492]/80 font-mono leading-relaxed">
                      💡 <strong>Info:</strong><br/>
                      • Rp 10.000 = 30 detik<br/>
                      • Rp 20.000 = 1 menit<br/>
                      • Rp 50.000 = 2 menit<br/>
                      • Rp 100.000+ = 5 menit
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox Persetujuan */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 accent-[#b8a492] cursor-pointer flex-shrink-0"
              />
              <label htmlFor="terms" className="text-[10px] sm:text-xs text-[#b8a492] font-mono leading-relaxed cursor-pointer">
                Saya menyetujui bahwa donasi ini bersifat sukarela dan tidak dapat dikembalikan. Saya telah membaca dan menyetujui{' '}
                <a href="/terms" target="_blank" className="underline hover:text-[#d6c6b9]">syarat dan ketentuan</a> Nyumbangin.
              </label>
            </div>

            <button
              type="submit"
              disabled={donating || !agreedToTerms}
              className="w-full bg-[#b8a492] text-[#2d2d2d] py-3 sm:py-4 px-4 rounded-lg font-extrabold text-base sm:text-lg border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] focus:outline-none focus:ring-2 focus:ring-[#b8a492] disabled:opacity-50 disabled:cursor-not-allowed font-mono transition-all duration-200"
            >
              {donating ? 'Mengirim...' : `Donasi ${formatRupiah(formData.amount ? parseInt(formData.amount) : 0)}`}
            </button>

            {/* Removed sandbox simulation controls */}
          </form>
        </div>
      </div>
    </div>
  );
}
