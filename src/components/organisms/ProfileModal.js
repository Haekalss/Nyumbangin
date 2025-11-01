import Modal from '../atoms/Modal';
import SectionBox from '../molecules/SectionBox';
import Input from '../atoms/Input';
import Text from '../atoms/Text';
import Button from '../atoms/Button';
import PayoutFields from '../molecules/PayoutFields';

// Refactored ProfileModal using atomic components.
const ProfileModal = ({
  showProfile,
  onClose,
  profileFormData,
  onFormDataChange,
  onSubmit,
  loading,
  payoutLocked = false,
  onLogout
}) => {
  return (
    <Modal isOpen={showProfile} onClose={onClose} title="Edit Profil">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Profile Image Section - Paling Atas */}
        <div className="flex flex-col items-center py-4 border-b border-[#b8a492]/20">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#b8a492] bg-[#1a1a1a]">
              <img 
                src={profileFormData.profileImageUrl || '/default-avatar.png'} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/default-avatar.png'; }}
              />
            </div>
            <label className="absolute bottom-0 right-0 bg-[#b8a492] hover:bg-[#a89482] text-[#2d2d2d] rounded-full p-2 cursor-pointer transition-colors shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                  // Validate file size (max 2MB)
                  if (file.size > 2 * 1024 * 1024) {
                    alert('Ukuran gambar maksimal 2MB');
                    return;
                  }

                  // Validate file type
                  if (!file.type.startsWith('image/')) {
                    alert('File harus berupa gambar');
                    return;
                  }

                  // Show loading state
                  const originalImageUrl = profileFormData.profileImageUrl;
                  onFormDataChange({ 
                    ...profileFormData, 
                    profileImageUrl: null // Show loading
                  });

                  try {
                    // Convert to base64
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      try {
                        const base64Data = reader.result;
                        
                        // Preview immediately
                        onFormDataChange({ 
                          ...profileFormData, 
                          profileImageUrl: base64Data
                        });

                      // Upload to server
                      const token = localStorage.getItem('token');
                      const response = await fetch('/api/user/upload-image', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ imageData: base64Data }),
                      });                        const data = await response.json();

                        if (!response.ok) {
                          throw new Error(data.error || 'Failed to upload image');
                        }

                        // Update with server URL (add cache buster to force reload)
                        const imageUrlWithCache = `${data.imageUrl}?t=${Date.now()}`;
                        onFormDataChange({ 
                          ...profileFormData, 
                          profileImageUrl: imageUrlWithCache
                        });

                        // Refresh user profile from server to get updated profileImage
                        const profileResponse = await fetch('/api/user/profile', {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (profileResponse.ok) {
                          const profileData = await profileResponse.json();
                          if (profileData.user) {
                            // Update localStorage with fresh user data
                            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                            const updatedUser = { ...currentUser, ...profileData.user };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                          }
                        }

                        // Silent success - no alert popup
                      } catch (uploadError) {
                        console.error('Upload error:', uploadError);
                        alert('Gagal upload foto: ' + uploadError.message);
                        // Restore original image
                        onFormDataChange({ 
                          ...profileFormData, 
                          profileImageUrl: originalImageUrl
                        });
                      }
                    };

                    reader.onerror = () => {
                      alert('Gagal membaca file');
                      onFormDataChange({ 
                        ...profileFormData, 
                        profileImageUrl: originalImageUrl
                      });
                    };

                    reader.readAsDataURL(file);

                  } catch (error) {
                    console.error('File read error:', error);
                    alert('Gagal memproses file: ' + error.message);
                    // Restore original image
                    onFormDataChange({ 
                      ...profileFormData, 
                      profileImageUrl: originalImageUrl
                    });
                  }
                }}
              />
            </label>
          </div>
          <Text variant="base" weight="bold" className="mt-3">{profileFormData.displayName || 'Creator Name'}</Text>
          <Text variant="xs" color="secondary">@{profileFormData.username || 'username'}</Text>
          <Text variant="xs" color="secondary" className="mt-1 text-center max-w-xs">
            Klik icon kamera untuk upload foto profil (Max 2MB)
          </Text>
        </div>

        <SectionBox title="Informasi Dasar">
          <div className="space-y-3">
            <div>
              <Text variant="small" weight="bold" className="mb-1 block">Nama Tampilan</Text>
              <Input
                value={profileFormData.displayName}
                onChange={(e) => onFormDataChange({ ...profileFormData, displayName: e.target.value })}
                placeholder="Nama yang akan ditampilkan"
              />
            </div>
            <div>
              <Text variant="small" weight="bold" className="mb-1 block">Username</Text>
              <Input value={profileFormData.username} disabled placeholder="Username untuk link donasi" />
              <Text variant="xs" color="secondary" className="mt-1">Link donasi: /donate/{profileFormData.username || 'username'}</Text>
            </div>
            <div>
              <Text variant="small" weight="bold" className="mb-1 block">Email</Text>
              <Input value={profileFormData.email} disabled />
              <Text variant="xs" color="secondary" className="mt-1">Email tidak dapat diubah</Text>
            </div>
            <div>
              <Text variant="small" weight="bold" className="mb-1 block">Bio / Deskripsi</Text>
              <textarea
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#b8a492]/30 rounded text-sm font-mono text-white resize-none focus:outline-none focus:border-[#b8a492] transition-colors"
                rows={3}
                maxLength={500}
                value={profileFormData.bio || ''}
                onChange={(e) => onFormDataChange({ ...profileFormData, bio: e.target.value })}
                placeholder="Ceritakan tentang diri kamu..."
              />
              <Text variant="xs" color="secondary" className="mt-1">
                {(profileFormData.bio || '').length}/500 karakter
              </Text>
            </div>
          </div>
        </SectionBox>

        <SectionBox title="Social Media Links" description="Link akun social media kamu">
          <div className="space-y-3">
            <div>
              <Text variant="small" weight="bold" className="mb-1 flex items-center gap-2">
                <span className="text-purple-400">📺</span> Twitch
              </Text>
              <Input
                value={profileFormData.socialLinks?.twitch || ''}
                onChange={(e) => onFormDataChange({ 
                  ...profileFormData, 
                  socialLinks: { ...profileFormData.socialLinks, twitch: e.target.value }
                })}
                placeholder="https://twitch.tv/username"
              />
            </div>
            <div>
              <Text variant="small" weight="bold" className="mb-1 flex items-center gap-2">
                <span className="text-red-400">▶️</span> YouTube
              </Text>
              <Input
                value={profileFormData.socialLinks?.youtube || ''}
                onChange={(e) => onFormDataChange({ 
                  ...profileFormData, 
                  socialLinks: { ...profileFormData.socialLinks, youtube: e.target.value }
                })}
                placeholder="https://youtube.com/@username"
              />
            </div>
            <div>
              <Text variant="small" weight="bold" className="mb-1 flex items-center gap-2">
                <span className="text-pink-400">📷</span> Instagram
              </Text>
              <Input
                value={profileFormData.socialLinks?.instagram || ''}
                onChange={(e) => onFormDataChange({ 
                  ...profileFormData, 
                  socialLinks: { ...profileFormData.socialLinks, instagram: e.target.value }
                })}
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <Text variant="small" weight="bold" className="mb-1 flex items-center gap-2">
                <span>🎵</span> TikTok
              </Text>
              <Input
                value={profileFormData.socialLinks?.tiktok || ''}
                onChange={(e) => onFormDataChange({ 
                  ...profileFormData, 
                  socialLinks: { ...profileFormData.socialLinks, tiktok: e.target.value }
                })}
                placeholder="https://tiktok.com/@username"
              />
            </div>
            <div>
              <Text variant="small" weight="bold" className="mb-1 flex items-center gap-2">
                <span className="text-blue-400">🐦</span> Twitter / X
              </Text>
              <Input
                value={profileFormData.socialLinks?.twitter || ''}
                onChange={(e) => onFormDataChange({ 
                  ...profileFormData, 
                  socialLinks: { ...profileFormData.socialLinks, twitter: e.target.value }
                })}
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>
        </SectionBox>

        <SectionBox title="Ubah Password" description="Kosongkan jika tidak ingin mengubah password">
          <div className="space-y-3">
            <div>
              <Text variant="small" weight="bold" className="mb-1 block">Password Saat Ini</Text>
              <Input
                type="password"
                value={profileFormData.currentPassword}
                onChange={(e) => onFormDataChange({ ...profileFormData, currentPassword: e.target.value })}
                placeholder="Masukkan password lama"
              />
            </div>
            <div>
              <Text variant="small" weight="bold" className="mb-1 block">Password Baru</Text>
              <Input
                type="password"
                value={profileFormData.newPassword}
                onChange={(e) => onFormDataChange({ ...profileFormData, newPassword: e.target.value })}
                placeholder="Masukkan password baru"
              />
            </div>
            <div>
              <Text variant="small" weight="bold" className="mb-1 block">Konfirmasi Password Baru</Text>
              <Input
                type="password"
                value={profileFormData.confirmPassword}
                onChange={(e) => onFormDataChange({ ...profileFormData, confirmPassword: e.target.value })}
                placeholder="Ulangi password baru"
              />
            </div>
          </div>
        </SectionBox>

        <SectionBox title="Pengaturan Rekening Penarikan" description="Data ini digunakan saat pencairan dana.">
          {payoutLocked ? (
            <div className="mb-3 text-xs font-mono bg-green-900/30 text-green-300 border border-green-400/40 rounded p-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <div>
                  <div className="font-bold">Data Rekening Terkunci</div>
                  <div className="mt-1 opacity-80">Data rekening sudah tersimpan dan tidak dapat diubah. Hubungi support jika perlu koreksi.</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-3 text-xs font-mono bg-yellow-900/30 text-yellow-200 border border-yellow-400/40 rounded p-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <div className="font-bold">Perhatian!</div>
                  <div className="mt-1 opacity-80">Isi ketiga field di bawah (Bank/Channel, Nomor, Nama Pemilik) sekali saja. Setelah disimpan tidak bisa diubah.</div>
                </div>
              </div>
            </div>
          )}
          <PayoutFields formData={profileFormData} onChange={onFormDataChange} locked={payoutLocked} />
        </SectionBox>

        <div className="flex space-x-3 pt-2 sticky bottom-0 bg-[#2d2d2d] pb-2">
          <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Batal</Button>
          <Button variant="primary" className="flex-1" type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
        
        {/* Logout Button */}
        {onLogout && (
          <div className="pt-4 border-t border-[#b8a492]/20 mt-4">
            <Button 
              variant="danger" 
              className="w-full" 
              type="button" 
              onClick={onLogout}
            >
              Logout
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ProfileModal;
