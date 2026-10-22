"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import CreatorAppLayout from '@/components/dashboard/CreatorAppLayout';
import ImageCropModal from '@/components/molecules/ImageCropModal';
import PayoutFields from '@/components/molecules/PayoutFields';

export const dynamic = 'force-dynamic';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get('section');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);

  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    bio: '',
    profileImageUrl: '',
    socialLinks: {
      twitch: '',
      youtube: '',
      instagram: '',
      tiktok: '',
      twitter: ''
    },
    payoutBankName: '',
    payoutAccountNumber: '',
    payoutAccountHolder: ''
  });

  const payoutSectionRef = useRef(null);
  const basicSectionRef = useRef(null);
  const socialSectionRef = useRef(null);

  const payoutLocked = !!(user?.payoutAccountNumber && user?.payoutAccountHolder);

  // Check auth and load user profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.replace('/login');
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      loadUserProfile(token, parsed);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  // Handle URL section scroll (e.g. ?section=payout or #payout)
  useEffect(() => {
    if (!loading) {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      if (sectionParam === 'payout' || hash === '#payout') {
        setTimeout(() => {
          payoutSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    }
  }, [loading, sectionParam]);

  const loadUserProfile = async (token, initialUser) => {
    try {
      const res = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedUser = res.data.user || initialUser;
      setUser(fetchedUser);

      setFormData({
        displayName: fetchedUser.displayName || '',
        username: fetchedUser.username || '',
        email: fetchedUser.email || '',
        bio: fetchedUser.bio || '',
        profileImageUrl: fetchedUser.profileImage || fetchedUser.profileImageUrl || '',
        socialLinks: {
          twitch: fetchedUser.socialLinks?.twitch || '',
          youtube: fetchedUser.socialLinks?.youtube || '',
          instagram: fetchedUser.socialLinks?.instagram || '',
          tiktok: fetchedUser.socialLinks?.tiktok || '',
          twitter: fetchedUser.socialLinks?.twitter || ''
        },
        payoutBankName: fetchedUser.payoutBankName || fetchedUser.payoutBank || '',
        payoutAccountNumber: fetchedUser.payoutAccountNumber || '',
        payoutAccountHolder: fetchedUser.payoutAccountHolder || fetchedUser.payoutAccountName || ''
      });
    } catch (error) {
      console.error('Failed to load full profile:', error);
      // Fallback to cached initialUser
      setFormData({
        displayName: initialUser.displayName || '',
        username: initialUser.username || '',
        email: initialUser.email || '',
        bio: initialUser.bio || '',
        profileImageUrl: initialUser.profileImage || initialUser.profileImageUrl || '',
        socialLinks: {
          twitch: initialUser.socialLinks?.twitch || '',
          youtube: initialUser.socialLinks?.youtube || '',
          instagram: initialUser.socialLinks?.instagram || '',
          tiktok: initialUser.socialLinks?.tiktok || '',
          twitter: initialUser.socialLinks?.twitter || ''
        },
        payoutBankName: initialUser.payoutBankName || initialUser.payoutBank || '',
        payoutAccountNumber: initialUser.payoutAccountNumber || '',
        payoutAccountHolder: initialUser.payoutAccountHolder || initialUser.payoutAccountName || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImageSrc(reader.result);
      setShowCropModal(true);
    };
    reader.onerror = () => {
      toast.error('Gagal membaca file gambar');
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImage) => {
    const originalImage = formData.profileImageUrl;
    setFormData(prev => ({ ...prev, profileImageUrl: croppedImage }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageData: croppedImage }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengunggah foto');
      }

      const imageUrlWithCache = `${data.imageUrl}?t=${Date.now()}`;
      setFormData(prev => ({ ...prev, profileImageUrl: imageUrlWithCache }));

      // Update cached user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, profileImage: imageUrlWithCache, profileImageUrl: imageUrlWithCache };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Foto profil berhasil diperbarui!');
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error(uploadError.message || 'Gagal mengunggah foto');
      setFormData(prev => ({ ...prev, profileImageUrl: originalImage }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.displayName?.trim() || !formData.username?.trim()) {
      toast.error('Nama tampilan dan username wajib diisi!');
      return;
    }

    if (!/^[-_a-zA-Z0-9]+$/.test(formData.username)) {
      toast.error('Username hanya boleh berisi huruf, angka, underscore, dan dash!');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let profileUpdate = {
        displayName: formData.displayName.trim(),
        username: formData.username.trim().toLowerCase(),
        bio: formData.bio || '',
        profileImageUrl: formData.profileImageUrl,
        socialLinks: formData.socialLinks
      };

      if (!payoutLocked) {
        profileUpdate = {
          ...profileUpdate,
          payoutBankName: formData.payoutBankName || '',
          payoutAccountNumber: formData.payoutAccountNumber || '',
          payoutAccountHolder: formData.payoutAccountHolder || ''
        };
      }

      const response = await axios.put('/api/user/profile', profileUpdate, config);
      toast.success('Profil berhasil disimpan!');

      const updatedUser = { ...user, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error(err.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbf8f3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2d2d2d] border-t-transparent mx-auto mb-3"></div>
          <p className="text-xs font-bold text-[#8f857b]">Memuat pengaturan akun...</p>
        </div>
      </div>
    );
  }

  return (
    <CreatorAppLayout user={user}>
      {/* Header Halaman */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#8f857b] mb-1">
          <Link href="/dashboard" className="hover:text-[#2d2d2d] transition">Dashboard</Link>
          <span>/</span>
          <span className="text-[#2d2d2d] font-extrabold">Profil & Akun</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2d2d2d] tracking-tight">Pengaturan Profil</h1>
        <p className="text-sm font-medium text-[#696057] mt-0.5">
          Kelola informasi kreator, halaman donasi publik, dan data rekening pencairan saweran.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero Card: Avatar & Overview */}
        <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#2d2d2d] bg-[#f2e4d4] shadow-[3px_3px_0px_#2d2d2d]">
                <img
                  src={formData.profileImageUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
              </div>
              <label
                className="absolute bottom-0 right-0 bg-[#2d2d2d] hover:bg-black text-[#fbf8f3] rounded-full p-2.5 cursor-pointer border-2 border-[#2d2d2d] shadow-[2px_2px_0px_#b8a492] hover:scale-105 active:scale-95 transition"
                title="Ganti foto profil"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileSelect}
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2d2d2d] tracking-tight truncate">
                    {formData.displayName || 'Nama Kreator'}
                  </h3>
                  <p className="font-mono text-sm font-bold text-[#8f857b]">
                    @{formData.username || 'username'}
                  </p>
                </div>

                {formData.username && (
                  <a
                    href={`/donate/${formData.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] text-[#2d2d2d] text-xs font-extrabold shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#ede3d3] transition active:translate-y-0.5"
                  >
                    <span>Lihat Halaman Donasi</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              <p className="mt-3 text-xs text-[#696057] font-medium max-w-xl">
                Format foto JPG, PNG, atau WebP maks. 2MB. Foto profil akan tampil pada kartu donasi dan widget overlay penonton siaranmu.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Informasi Dasar */}
        <div ref={basicSectionRef} className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-6 sm:p-7 space-y-4">
          <div className="border-b-2 border-[#2d2d2d]/10 pb-3">
            <h3 className="font-black text-base text-[#2d2d2d]">Informasi Dasar</h3>
            <p className="text-xs font-medium text-[#696057] mt-0.5">
              Identitas publik yang akan ditampilkan kepada para pendukung karya atau penontonmu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-[#2d2d2d] mb-1.5">
                Nama Tampilan (Display Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Contoh: Gus Creator"
                className="w-full px-4 py-2.5 bg-[#fbf8f3] border-2 border-[#2d2d2d] rounded-xl text-sm font-bold text-[#2d2d2d] placeholder:text-[#8f857b] outline-none focus:bg-white focus:shadow-[2px_2px_0px_#2d2d2d] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-[#2d2d2d] mb-1.5">
                Username / Handle Donasi <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-mono text-sm font-bold text-[#8f857b]">@</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={payoutLocked ? undefined : (e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  disabled={payoutLocked}
                  placeholder="namamu"
                  className={`w-full pl-8 pr-4 py-2.5 bg-[#fbf8f3] border-2 border-[#2d2d2d] rounded-xl text-sm font-mono font-bold text-[#2d2d2d] placeholder:text-[#8f857b] outline-none transition ${
                    payoutLocked ? 'bg-[#ede3d3] cursor-not-allowed opacity-80' : 'focus:bg-white focus:shadow-[2px_2px_0px_#2d2d2d]'
                  }`}
                  required
                />
              </div>
              {payoutLocked ? (
                <p className="mt-1 text-[11px] font-bold text-[#8f857b]">
                  🔒 Username dikunci otomatis demi konsistensi rekening pencairan dana.
                </p>
              ) : (
                <p className="mt-1 text-[11px] font-medium text-[#696057]">
                  Tautan donasi publik: <span className="font-mono font-bold text-[#2d2d2d]">nyumbangin.web.id/donate/{formData.username || 'namamu'}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-[#2d2d2d] mb-1.5">
              Email Akun
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2.5 bg-[#ede3d3] border-2 border-[#2d2d2d] rounded-xl text-sm font-bold text-[#696057] cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] font-medium text-[#8f857b]">
              Email login utama terikat akun dan tidak dapat diubah secara langsung.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wide text-[#2d2d2d]">
                Bio / Pesan Kreator
              </label>
              <span className="text-[11px] font-mono font-bold text-[#8f857b]">
                {(formData.bio || '').length}/500
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Ceritakan tentang karya, jadwal live streaming, atau tujuan donasimu..."
              className="w-full px-4 py-3 bg-[#fbf8f3] border-2 border-[#2d2d2d] rounded-xl text-sm font-medium text-[#2d2d2d] placeholder:text-[#8f857b] outline-none focus:bg-white focus:shadow-[2px_2px_0px_#2d2d2d] resize-none transition"
            />
          </div>
        </div>

        {/* Section 2: Media Sosial */}
        <div ref={socialSectionRef} className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-6 sm:p-7 space-y-4">
          <div className="border-b-2 border-[#2d2d2d]/10 pb-3">
            <h3 className="font-black text-base text-[#2d2d2d]">Tautan Media Sosial</h3>
            <p className="text-xs font-medium text-[#696057] mt-0.5">
              Ikon media sosial ini akan otomatis terpasang pada halaman donasi publikmu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-[#2d2d2d] mb-1.5">
                YouTube Channel
              </label>
              <input
                type="url"
                value={formData.socialLinks?.youtube || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                })}
                placeholder="https://youtube.com/@channelmu"
                className="w-full px-4 py-2.5 bg-[#fbf8f3] border-2 border-[#2d2d2d] rounded-xl text-sm font-medium text-[#2d2d2d] placeholder:text-[#8f857b] outline-none focus:bg-white focus:shadow-[2px_2px_0px_#2d2d2d] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-[#2d2d2d] mb-1.5">
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                })}
                placeholder="https://instagram.com/username"
                className="w-full px-4 py-2.5 bg-[#fbf8f3] border-2 border-[#2d2d2d] rounded-xl text-sm font-medium text-[#2d2d2d] placeholder:text-[#8f857b] outline-none focus:bg-white focus:shadow-[2px_2px_0px_#2d2d2d] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-[#2d2d2d] mb-1.5">
                TikTok
              </label>
              <input
                type="url"
                value={formData.socialLinks?.tiktok || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, tiktok: e.target.value }
                })}
                placeholder="https://tiktok.com/@username"
                className="w-full px-4 py-2.5 bg-[#fbf8f3] border-2 border-[#2d2d2d] rounded-xl text-sm font-medium text-[#2d2d2d] placeholder:text-[#8f857b] outline-none focus:bg-white focus:shadow-[2px_2px_0px_#2d2d2d] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wide text-[#2d2d2d] mb-1.5">
                Twitch Stream
              </label>
              <input
                type="url"
                value={formData.socialLinks?.twitch || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, twitch: e.target.value }
                })}
                placeholder="https://twitch.tv/username"
                className="w-full px-4 py-2.5 bg-[#fbf8f3] border-2 border-[#2d2d2d] rounded-xl text-sm font-medium text-[#2d2d2d] placeholder:text-[#8f857b] outline-none focus:bg-white focus:shadow-[2px_2px_0px_#2d2d2d] transition"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Rekening Pencairan */}
        <div ref={payoutSectionRef} className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-6 sm:p-7 space-y-4">
          <div className="border-b-2 border-[#2d2d2d]/10 pb-3">
            <h3 className="font-black text-base text-[#2d2d2d]">Rekening Pencairan Dana (Payout)</h3>
            <p className="text-xs font-medium text-[#696057] mt-0.5">
              Data rekening bank atau e-wallet tujuan saat kamu melakukan penarikan saldo saweran.
            </p>
          </div>

          {payoutLocked ? (
            <div className="rounded-xl border-2 border-[#2d2d2d] bg-emerald-100 p-4 shadow-[2px_2px_0px_#2d2d2d] flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h5 className="font-black text-sm text-emerald-950">Rekening Sudah Terverifikasi & Terkunci</h5>
                <p className="text-xs font-medium text-emerald-900 mt-0.5">
                  Demi keamanan saldo donasimu, data rekening yang telah tersimpan tidak dapat diubah secara bebas. Hubungi tim dukungan apabila ada kesalahan penulisan.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-[#2d2d2d] bg-amber-100 p-4 shadow-[2px_2px_0px_#2d2d2d] flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h5 className="font-black text-sm text-amber-950">Perhatian Sebelum Mengisi</h5>
                <p className="text-xs font-medium text-amber-900 mt-0.5">
                  Pastikan nama pemilik rekening sama persis dengan nama pada akun perbankan/e-wallet milikmu untuk kelancaran verifikasi pencairan dana.
                </p>
              </div>
            </div>
          )}

          <PayoutFields formData={formData} onChange={setFormData} locked={payoutLocked} />
        </div>

        {/* Action Buttons Bar */}
        <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-[#696057] text-center sm:text-left">
            Pastikan seluruh data sudah benar sebelum menyimpan perubahan.
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] text-[#2d2d2d] text-xs font-extrabold shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#ede3d3] transition text-center active:translate-y-0.5"
            >
              Kembali
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border-2 border-[#2d2d2d] bg-[#b8a492] text-[#2d2d2d] text-xs font-black shadow-[3px_3px_0px_#2d2d2d] hover:bg-[#cabaa9] transition cursor-pointer active:translate-y-0.5 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </div>
      </form>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setTempImageSrc(null);
        }}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
      />
    </CreatorAppLayout>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fbf8f3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2d2d2d] border-t-transparent mx-auto mb-3"></div>
          <p className="text-xs font-bold text-[#8f857b]">Memuat profil...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
