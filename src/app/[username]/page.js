'use client'

import { useState, useEffect } from 'react';
import { formatRupiah } from '@/utils/format';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { redirectTo } from '@/utils/navigation';

function InactiveDonationCard({ title, description, note }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf8f3] px-4 py-12 text-[#2d2d2d] font-sans antialiased">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-6 text-center shadow-[6px_6px_0px_#2d2d2d]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#2d2d2d] bg-[#f2e4d4] shadow-[3px_3px_0px_#2d2d2d]">
            <svg className="h-7 w-7 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#2d2d2d] sm:text-2xl">{title}</h1>
          <p className="mt-2 text-sm font-medium leading-relaxed text-[#696057]">{description}</p>
          {note ? (
            <p className="mt-1 text-xs font-medium leading-relaxed text-[#8f857b]">{note}</p>
          ) : null}
          <Link
            href="/"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] px-4 py-2.5 text-xs font-extrabold text-[#fbf8f3] shadow-[2px_2px_0px_#b8a492] transition hover:bg-black cursor-pointer active:translate-y-0.5"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DonatePage() {
  const params = useParams();
  const username = params.username;

  // All state and variables must be declared before any useEffect
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', amount: '', message: '' });
  const [donating, setDonating] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [mediaDuration, setMediaDuration] = useState(30);
  const [todayShares, setTodayShares] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const presetAmounts = [5000, 10000, 25000, 50000, 100000];

  // Check if media share is enabled for this creator
  const isMediaShareEnabled = creator?.donationSettings?.mediaShareEnabled !== false;

  // QRISGate mendukung nominal mulai Rp 1. Batas maksimum diambil dari database creator.
  const minDonation = 1;
  const maxDonation = Math.max(
    minDonation,
    Number(creator?.donationSettings?.maxAmount) || 10000000
  );

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

      // Check if donation is disabled (status 200 but disabled flag)
      if (data.disabled) {
        setCreator(data.creator);
        setError(data.error);
      } else {
        setCreator(data.creator);
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);

      if (error.response?.status === 404) {
        setError('Creator tidak ditemukan');
      } else if (error.response?.status === 403) {
        setError('Creator belum mengaktifkan donasi');
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

  const handleAnonymousToggle = (e) => {
    const checked = e.target.checked;
    setIsAnonymous(checked);
    if (checked) {
      setFormData({ ...formData, name: 'Anonim' });
    } else {
      setFormData({ ...formData, name: '' });
    }
  };

  const handleAmountSelect = (amount) => {
    setFormData({
      ...formData,
      amount: amount.toString()
    });
  };

  // Format amount with thousand separator for display
  const formatAmountDisplay = (value) => {
    if (!value) return '';
    const numericValue = value.toString().replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Handle amount input change - strip non-numeric and store raw value
  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setFormData({
      ...formData,
      amount: rawValue
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
    if (formData.amount && youtubeUrl) {
      const maxDur = getMaxDuration(formData.amount);
      if (mediaDuration > maxDur) {
        setMediaDuration(maxDur);
      }
    }
  }, [formData.amount, youtubeUrl]);

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

    const amount = parseInt(formData.amount, 10);
    if (!Number.isSafeInteger(amount) || amount < minDonation) {
      toast.error(`Minimal donasi adalah Rp ${minDonation.toLocaleString('id-ID')}!`);
      setDonating(false);
      return;
    }

    if (amount > maxDonation) {
      toast.error(`Maksimal donasi adalah Rp ${maxDonation.toLocaleString('id-ID')}!`);
      setDonating(false);
      return;
    }

    if (formData.name.length < 2) {
      toast.error('Nama minimal 2 karakter!');
      setDonating(false);
      return;
    }

    // Validate media share if URL is provided
    if (youtubeUrl) {
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
      // Prepare donation data. Nominal & total akhir dihitung di server
      // menggunakan pengaturan creator di database + kode unik dari QRISGate.
      const donationData = {
        name: formData.name,
        amount,
        message: formData.message,
        payment_method: 'QRIS'
      };

      // Add media share request if URL provided
      if (youtubeUrl) {
        donationData.mediaShare = {
          enabled: true,
          youtubeUrl: youtubeUrl,
          duration: mediaDuration
        };
      }

      const response = await axios.post(`/api/donate/${username}`, donationData);
      const checkoutUrl =
        response.data?.data?.checkout_url ||
        response.data?.payment?.checkout_url ||
        response.data?.checkout_url;

      if (!response.data?.success || !checkoutUrl) {
        throw new Error('Checkout URL tidak tersedia');
      }

      // QRISGate menyediakan halaman pembayaran sendiri. Jangan render QR di sini.
      redirectTo(checkoutUrl);
    } catch (error) {
      let errorMessage = error.response?.data?.error || 'Terjadi kesalahan';

      // Check if donation is disabled
      if (error.response?.data?.disabled) {
        setError(error.response.data.error);
      } else if (error.response?.status === 403) {
        errorMessage = 'Donasi belum aktif untuk creator ini';
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }

      toast.error(errorMessage);
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf8f3]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#2d2d2d] border-t-transparent" />
          <p className="text-xs font-medium text-[#8c8276]">Memuat halaman donasi...</p>
        </div>
      </div>
    );
  }

  if (error && !creator) {
    return (
      <InactiveDonationCard
        title="Creator Tidak Ditemukan"
        description={error}
        note="Periksa kembali tautan donasi yang kamu buka."
      />
    );
  }

  // Jika creator ada tapi error karena belum aktifkan donasi
  if (creator && error === 'Creator belum mengaktifkan donasi') {
    return (
      <InactiveDonationCard
        title="Donasi Belum Aktif"
        description="Creator ini belum mengisi informasi rekening / e-wallet untuk menerima donasi."
        note="Silakan coba lagi nanti."
      />
    );
  }

  // Jika creator menonaktifkan donasi
  if (creator && error === 'Donasi sedang tidak aktif') {
    return (
      <InactiveDonationCard
        title="Donasi Sedang Tidak Aktif"
        description="Creator sedang menonaktifkan fitur donasi untuk sementara waktu."
        note="Silakan coba lagi nanti. Terima kasih atas pengertiannya!"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#2d2d2d] font-sans antialiased selection:bg-[#b8a492] selection:text-[#2d2d2d]">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Brand bar */}
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <img src="/logo.png" alt="Nyumbangin" className="h-8 w-8 object-contain" />
            <span className="text-lg font-black tracking-tight text-[#2d2d2d]">nyumbangin</span>
          </Link>
          <span className="rounded-full border-2 border-[#2d2d2d] bg-[#f2e4d4] px-3 py-1 text-[11px] font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]">
            Halaman Donasi
          </span>
        </div>

        {/* Main Container - wider on desktop only when media share enabled */}
        <div className={`mx-auto ${isMediaShareEnabled ? 'max-w-md lg:max-w-3xl' : 'max-w-md'}`}>
          <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-5 shadow-[6px_6px_0px_#2d2d2d] sm:p-7">
            {/* Creator Header */}
            <div className="flex flex-col gap-3 border-b-2 border-[#2d2d2d]/15 pb-5 sm:flex-row sm:items-center">
              <div className="mx-auto flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#2d2d2d] bg-[#b8a492] text-base font-black uppercase text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] sm:mx-0">
                {creator.profileImage ? (
                  <img
                    src={creator.profileImage}
                    alt={creator.displayName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  creator.displayName?.charAt(0) || 'N'
                )}
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8f857b]">
                  Dukung Kreator
                </p>
                <h1 className="mt-0.5 text-xl font-black tracking-tight text-[#2d2d2d] sm:text-2xl">
                  {creator.displayName}
                </h1>
                <p className="font-mono text-xs font-bold text-[#696057]">
                  @{creator.username}
                </p>
                {creator.description && (
                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#696057]">
                    {creator.description}
                  </p>
                )}
              </div>
              <span className="mx-auto shrink-0 rounded-lg border-2 border-[#2d2d2d] bg-[#f2e4d4] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2d2d2d] shadow-[1px_1px_0px_#2d2d2d] sm:mx-0">
                QRISGate Verified
              </span>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border-2 border-red-600 bg-red-50 px-3.5 py-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-xs font-bold leading-relaxed text-red-700">{error}</p>
              </div>
            )}

            {/* Share Stats */}
            {todayShares > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] px-3 py-2.5 shadow-[2px_2px_0px_#2d2d2d]">
                <svg className="h-4 w-4 shrink-0 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342a3 3 0 100 5.316m0-5.316a3 3 0 110-5.316m0 5.316l6.632 3.684M8.684 8.658l6.632-3.684m0 12.684a3 3 0 100-5.316m0 5.316a3 3 0 110-5.316" />
                </svg>
                <p className="text-xs font-bold text-[#2d2d2d]">
                  <span className="font-black">{todayShares} orang</span> sudah membagikan tautan ini hari ini
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5">
              <div className={isMediaShareEnabled ? 'lg:grid lg:grid-cols-5 lg:gap-7' : ''}>
                {/* Left Column - Basic Info */}
                <div className={`space-y-5 ${isMediaShareEnabled ? 'lg:col-span-3' : ''}`}>
                  {/* Nama */}
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-[#8f857b]">
                      Nama Anda <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isAnonymous}
                      className="w-full rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] px-3.5 py-2.5 text-sm font-semibold text-[#2d2d2d] placeholder:text-[#a89c90] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8a492] disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Masukkan nama Anda"
                    />
                    <label className="mt-2 flex w-fit cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={handleAnonymousToggle}
                        className="h-4 w-4 cursor-pointer accent-[#2d2d2d]"
                      />
                      <span className="text-xs font-bold text-[#696057]">Donasi sebagai Anonim</span>
                    </label>
                  </div>

                  {/* Jumlah */}
                  <div>
                    <label htmlFor="amount" className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-[#8f857b]">
                      Jumlah Donasi <span className="text-red-500">*</span>
                    </label>
                    <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {presetAmounts.map((amount) => {
                        const isSelected = formData.amount === amount.toString();
                        return (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => handleAmountSelect(amount)}
                            className={`rounded-xl border-2 px-2 py-2 text-xs font-extrabold transition cursor-pointer active:translate-y-0.5 ${
                              isSelected
                                ? 'border-[#2d2d2d] bg-[#2d2d2d] text-[#fbf8f3] shadow-[2px_2px_0px_#b8a492]'
                                : 'border-[#2d2d2d]/30 bg-[#fffdf9] text-[#2d2d2d] hover:border-[#2d2d2d] hover:bg-[#f2e4d4]'
                            }`}
                          >
                            {formatRupiah(amount)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#8f857b]">Rp</span>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={formatAmountDisplay(formData.amount)}
                        onChange={handleAmountChange}
                        required
                        inputMode="numeric"
                        className="w-full rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] py-2.5 pl-10 pr-3.5 text-sm font-extrabold text-[#2d2d2d] placeholder:font-semibold placeholder:text-[#a89c90] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8a492]"
                        placeholder="Jumlah custom (min. Rp 1)"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold text-[#8f857b]">
                      Nominal bulat Rupiah (mulai Rp 1 s/d {formatRupiah(maxDonation)}).
                    </p>
                  </div>

                  {/* Pesan */}
                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-[#8f857b]">
                      Pesan (Opsional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="3"
                      className="w-full resize-none rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] px-3.5 py-2.5 text-sm font-medium text-[#2d2d2d] placeholder:text-[#a89c90] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8a492]"
                      placeholder="Tulis pesan dukungan Anda..."
                    />
                  </div>
                </div>

                {/* Right Column - Media Share */}
                {isMediaShareEnabled && (
                  <div className="mt-5 lg:col-span-2 lg:mt-0">
                    <div className="h-full rounded-2xl border-2 border-[#2d2d2d]/20 bg-[#fbf8f3] p-4">
                      <div className="mb-3 flex items-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-[#2d2d2d] bg-[#f2e4d4] shadow-[1px_1px_0px_#2d2d2d]">
                          <svg className="h-4 w-4 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b]">
                            Media Share (Opsional)
                          </p>
                          <p className="mt-0.5 text-[11px] font-medium text-[#8f857b]">
                            Kosongkan jika tidak ingin memutar video
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* YouTube URL Input */}
                        <div>
                          <label htmlFor="youtubeUrl" className="mb-1.5 block text-[11px] font-extrabold text-[#696057]">
                            URL YouTube
                          </label>
                          <input
                            type="text"
                            id="youtubeUrl"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className="w-full rounded-xl border-2 border-[#2d2d2d] bg-[#fffdf9] px-3 py-2 text-xs font-medium text-[#2d2d2d] placeholder:text-[#a89c90] transition focus:outline-none focus:ring-2 focus:ring-[#b8a492]"
                            placeholder="https://youtube.com/watch?v=..."
                          />
                        </div>

                        {/* Duration Slider - only show if URL entered */}
                        {youtubeUrl && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <label htmlFor="mediaDuration" className="text-[11px] font-extrabold text-[#696057]">
                                Durasi
                              </label>
                              <span className="text-[10px] font-bold text-[#8f857b]">
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
                              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e5dcd3] accent-[#2d2d2d]"
                            />
                            <div className="mt-2 text-center">
                              <span className="inline-block rounded-lg border-2 border-[#2d2d2d] bg-[#fffdf9] px-3 py-1 text-sm font-black text-[#2d2d2d] shadow-[1px_1px_0px_#2d2d2d]">
                                {mediaDuration}s
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Info Box */}
                        <div className="rounded-xl border border-[#2d2d2d]/15 bg-[#f2e4d4] p-2">
                          <p className="text-center text-[10px] font-bold text-[#696057]">
                            10rb → 30s • 20rb → 1m • 50rb → 2m • 100rb+ → 5m
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method (QRISGate) */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b]">
                    Metode Pembayaran
                  </p>
                  <span className="rounded-md border border-[#2d2d2d] bg-[#f2e4d4] px-2 py-0.5 text-[10px] font-extrabold text-[#2d2d2d]">
                    QRISGate • Otomatis
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] px-3.5 py-3 shadow-[2px_2px_0px_#2d2d2d]">
                  <input
                    type="radio"
                    name="payment"
                    value="QRIS"
                    checked
                    readOnly
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#2d2d2d]"
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-extrabold text-[#2d2d2d]">
                      QRIS (QRISGate)
                    </span>
                    <span className="block text-[10px] font-medium text-[#696057]">
                      GoPay, OVO, DANA, ShopeePay, LinkAja, dan semua Mobile Banking
                    </span>
                  </span>
                </div>

                {/* Ringkasan informasi kode unik QRISGate */}
                <div className="mt-3 rounded-xl border-2 border-[#2d2d2d]/20 bg-[#fbf8f3] px-3.5 py-3 text-[11px] font-medium text-[#696057]">
                  <div className="flex items-center justify-between gap-2">
                    <span>Nominal donasi</span>
                    <span className="font-mono font-extrabold text-[#2d2d2d]">
                      {formatRupiah(formData.amount ? parseInt(formData.amount, 10) : 0)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span>Kode unik otomatis (QRISGate)</span>
                    <span className="font-mono font-bold text-[#2d2d2d]">+ Rp 1 – Rp 99</span>
                  </div>
                  <p className="mt-2 border-t border-[#2d2d2d]/10 pt-2 text-[10px] leading-relaxed text-[#696057]">
                    Setelah klik tombol di bawah, Anda akan diarahkan ke halaman QRIS resmi{' '}
                    <span className="font-extrabold text-[#2d2d2d]">QRISGate</span> (berlaku 15 menit). Wajib membayar nominal tepat termasuk kode unik agar pembayaran terdeteksi otomatis.
                  </p>
                </div>
              </div>

              {/* Terms & Submit */}
              <div className="mt-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#2d2d2d] sm:h-5 sm:w-5"
                  />
                  <span className="text-[11px] font-medium leading-relaxed text-[#696057] sm:text-xs">
                    Saya menyetujui bahwa donasi ini bersifat sukarela dan tidak dapat dikembalikan. Saya telah membaca dan menyetujui{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      className="font-extrabold text-[#2d2d2d] underline decoration-[#b8a492] decoration-2 hover:text-[#8f857b]"
                    >
                      syarat dan ketentuan
                    </a>{' '}
                    Nyumbangin.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={donating || !agreedToTerms}
                  className="mt-4 w-full rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] py-3.5 px-4 text-sm font-black text-[#fbf8f3] shadow-[4px_4px_0px_#b8a492] transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#b8a492] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none active:translate-y-0.5 sm:text-base"
                >
                  {donating ? 'Mengirim...' : `Donasi ${formatRupiah(formData.amount ? parseInt(formData.amount) : 0)}`}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-5 text-center text-[11px] font-medium text-[#8f857b]">
            Apresiasi yang diberikan diteruskan langsung ke creator.
          </p>
        </div>
      </div>

    </div>
  );
}
