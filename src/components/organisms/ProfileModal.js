"use client";

import { useState, useEffect, useRef } from 'react';
import Modal from '../atoms/Modal';
import SectionBox from '../molecules/SectionBox';
import Input from '../atoms/Input';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import PayoutFields from '../molecules/PayoutFields';
import ImageCropModal from '../molecules/ImageCropModal';

const ProfileModal = ({
  showProfile,
  onClose,
  profileFormData,
  onFormDataChange,
  onSubmit,
  loading,
  payoutLocked = false,
  onLogout,
  scrollToSection = null
}) => {
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  
  const payoutSectionRef = useRef(null);
  const basicSectionRef = useRef(null);
  const socialSectionRef = useRef(null);

  useEffect(() => {
    if (showProfile && scrollToSection) {
      setTimeout(() => {
        let targetRef = null;
        switch(scrollToSection) {
          case 'payout':
            targetRef = payoutSectionRef;
            break;
          case 'basic':
            targetRef = basicSectionRef;
            break;
          case 'social':
            targetRef = socialSectionRef;
            break;
        }
        
        if (targetRef?.current) {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [showProfile, scrollToSection]);

  return (
    <>
      <Modal isOpen={showProfile} onClose={onClose} title="Pengaturan Profil Kreator" maxWidth="max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Foto Profil & Header */}
          <div className="flex flex-col items-center py-3 border-b-2 border-[#2d2d2d]/10">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#2d2d2d] bg-[#f5e9da] shadow-[3px_3px_0px_#2d2d2d]">
                <img 
                  src={profileFormData.profileImageUrl || '/default-avatar.png'} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
              </div>
              <label 
                className="absolute bottom-0 right-0 bg-[#2d2d2d] hover:bg-black text-white rounded-full p-2 cursor-pointer transition-transform shadow-[2px_2px_0px_#b8a492] hover:scale-105 active:scale-95"
                title="Ganti foto profil"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = '';

                    if (file.size > 2 * 1024 * 1024) {
                      alert('Ukuran gambar maksimal 2MB');
                      return;
                    }

                    if (!file.type.startsWith('image/')) {
                      alert('File harus berupa gambar');
                      return;
                    }

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setTempImageSrc(reader.result);
                      setShowCropModal(true);
                    };
                    reader.onerror = () => {
                      alert('Gagal membaca file');
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
            <h4 className="mt-3 font-black text-base text-[#2d2d2d]">
              {profileFormData.displayName || 'Nama Kreator'}
            </h4>
            <span className="text-xs text-[#696057]">
              @{profileFormData.username || 'username'}
            </span>
          </div>

          {/* Informasi Dasar */}
          <SectionBox title="Informasi Dasar" ref={basicSectionRef}>
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d] mb-1">
                  Nama Tampilan
                </label>
                <Input
                  value={profileFormData.displayName || ''}
                  onChange={(e) => onFormDataChange({ ...profileFormData, displayName: e.target.value })}
                  placeholder="Nama yang akan dilihat donatur"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d] mb-1">
                  Username (Handle Donasi)
                </label>
                <Input 
                  value={profileFormData.username || ''} 
                  onChange={payoutLocked ? undefined : (e) => onFormDataChange({ ...profileFormData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  disabled={payoutLocked} 
                  placeholder="Username untuk tautan donasi" 
                />
                {!profileFormData.username || profileFormData.username === '' ? (
                  <p className="mt-1 text-xs font-bold text-amber-700">
                    Username belum diisi. Isi username untuk mengaktifkan tautan donasimu!
                  </p>
                ) : payoutLocked ? (
                  <p className="mt-1 text-xs text-[#696057]">
                    Username terkunci setelah data rekening payout tersimpan.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-[#696057]">
                    Tautan donasimu: nyumbangin.web.id/donate/{profileFormData.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d] mb-1">
                  Email Akun
                </label>
                <Input value={profileFormData.email || ''} disabled />
                <p className="mt-1 text-[11px] text-[#8c8276]">Email login tidak dapat diubah</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#2d2d2d]">
                    Bio / Deskripsi Kreator
                  </label>
                  <span className="text-[11px] text-[#8c8276]">
                    {(profileFormData.bio || '').length}/500 karakter
                  </span>
                </div>
                <textarea
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#2d2d2d] rounded-xl text-sm font-semibold text-[#2d2d2d] resize-none outline-none focus:bg-[#fffdf9] focus:shadow-[2px_2px_0px_#2d2d2d] placeholder:text-[#b4aba0]"
                  rows={3}
                  maxLength={500}
                  value={profileFormData.bio || ''}
                  onChange={(e) => onFormDataChange({ ...profileFormData, bio: e.target.value })}
                  placeholder="Ceritakan tentang karya atau konten yang kamu buat..."
                />
              </div>
            </div>
          </SectionBox>

          {/* Social Media Links */}
          <SectionBox title="Tautan Media Sosial" description="Akan tampil di halaman donasi publikmu" ref={socialSectionRef}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d] mb-1">
                  Twitch
                </label>
                <Input
                  value={profileFormData.socialLinks?.twitch || ''}
                  onChange={(e) => onFormDataChange({ 
                    ...profileFormData, 
                    socialLinks: { ...profileFormData.socialLinks, twitch: e.target.value }
                  })}
                  placeholder="https://twitch.tv/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d] mb-1">
                  YouTube
                </label>
                <Input
                  value={profileFormData.socialLinks?.youtube || ''}
                  onChange={(e) => onFormDataChange({ 
                    ...profileFormData, 
                    socialLinks: { ...profileFormData.socialLinks, youtube: e.target.value }
                  })}
                  placeholder="https://youtube.com/@..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d] mb-1">
                  Instagram
                </label>
                <Input
                  value={profileFormData.socialLinks?.instagram || ''}
                  onChange={(e) => onFormDataChange({ 
                    ...profileFormData, 
                    socialLinks: { ...profileFormData.socialLinks, instagram: e.target.value }
                  })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#2d2d2d] mb-1">
                  TikTok
                </label>
                <Input
                  value={profileFormData.socialLinks?.tiktok || ''}
                  onChange={(e) => onFormDataChange({ 
                    ...profileFormData, 
                    socialLinks: { ...profileFormData.socialLinks, tiktok: e.target.value }
                  })}
                  placeholder="https://tiktok.com/@..."
                />
              </div>
            </div>
          </SectionBox>

          {/* Rekening Payout */}
          <SectionBox title="Rekening Pencairan Dana" description="Data rekening/e-wallet untuk menerima saldo penarikan." ref={payoutSectionRef}>
            {payoutLocked ? (
              <div className="mb-3 text-xs bg-emerald-50 text-emerald-800 border-2 border-emerald-300 rounded-xl p-3 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <span className="font-extrabold block">Data Rekening Terkunci</span>
                  <span>Data rekening sudah tersimpan demi keamanan. Hubungi bantuan jika ada kekeliruan data.</span>
                </div>
              </div>
            ) : (
              <div className="mb-3 text-xs bg-amber-50 text-amber-900 border-2 border-amber-300 rounded-xl p-3 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <span className="font-extrabold block">Perhatian Rekening</span>
                  <span>Pastikan nomor dan nama pemilik rekening sesuai. Sekali disimpan data tidak bisa diganti sembarangan.</span>
                </div>
              </div>
            )}
            <PayoutFields formData={profileFormData} onChange={onFormDataChange} locked={payoutLocked} />
          </SectionBox>

          {/* Sticky Action Footer */}
          <div className="flex items-center gap-3 pt-3 sticky bottom-0 bg-[#fffdf9] pb-1 border-t-2 border-[#2d2d2d]/10">
            <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" className="flex-1" type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
          </div>
          
          {/* Logout Action in Profile */}
          {onLogout && (
            <div className="pt-3 border-t border-[#2d2d2d]/10 text-center">
              <button 
                type="button" 
                onClick={onLogout}
                className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
              >
                Keluar dari Akun (Logout)
              </button>
            </div>
          )}
        </form>
      </Modal>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setTempImageSrc(null);
        }}
        imageSrc={tempImageSrc}
        onCropComplete={async (croppedImage) => {
          const originalImageUrl = profileFormData.profileImageUrl;
          onFormDataChange({ ...profileFormData, profileImageUrl: null });

          try {
            onFormDataChange({ ...profileFormData, profileImageUrl: croppedImage });

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
              throw new Error(data.error || 'Failed to upload image');
            }

            const imageUrlWithCache = `${data.imageUrl}?t=${Date.now()}`;
            onFormDataChange({ ...profileFormData, profileImageUrl: imageUrlWithCache });

            const profileResponse = await fetch('/api/user/profile', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              if (profileData.user) {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...currentUser, ...profileData.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }
            }
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            alert('Gagal upload foto: ' + uploadError.message);
            onFormDataChange({ ...profileFormData, profileImageUrl: originalImageUrl });
          }
        }}
      />
    </>
  );
};

export default ProfileModal;
