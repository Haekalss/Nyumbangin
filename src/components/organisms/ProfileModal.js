import React from 'react';

const ProfileModal = ({ 
  showProfile, 
  onClose, 
  profileFormData, 
  onFormDataChange, 
  onSubmit, 
  loading 
}) => {
  if (!showProfile) return null;

  return (
    <div className="fixed inset-1 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 max-w-2xl w-full max-h-full overflow-hidden shadow-xl relative">
        <h3 className="text-2xl font-extrabold text-[#b8a492] mb-4 font-mono text-center">Edit Profil</h3>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 px-3 py-1 rounded border-2 border-[#b8a492] bg-[#b8a492] text-[#2d2d2d] font-bold font-mono hover:bg-[#d6c6b9] transition-all"
        >
          Tutup
        </button>
        
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
          <form onSubmit={onSubmit} className="space-y-4 mt-6">
            {/* Basic Info */}
            <div className="bg-[#b8a492]/10 p-4 rounded-lg border border-[#b8a492]/30">
              <h4 className="text-lg font-bold text-[#b8a492] mb-3 font-mono">Informasi Dasar</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                    Nama Tampilan
                  </label>
                  <input
                    type="text"
                    value={profileFormData.displayName}
                    onChange={(e) => onFormDataChange({...profileFormData, displayName: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#b8a492] bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                    placeholder="Nama yang akan ditampilkan"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileFormData.username}
                    disabled
                    className="w-full px-3 py-2 border-2 border-[#b8a492]/50 bg-[#2d2d2d]/50 text-[#b8a492]/70 font-mono rounded-md cursor-not-allowed"
                    placeholder="Username untuk link donasi"
                  />
                  <p className="text-xs text-[#b8a492]/70 mt-1 font-mono">
                    Link donasi: /donate/{profileFormData.username || 'username'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileFormData.email}
                    disabled
                    className="w-full px-3 py-2 border-2 border-[#b8a492]/50 bg-[#2d2d2d]/50 text-[#b8a492]/70 font-mono rounded-md cursor-not-allowed"
                  />
                  <p className="text-xs text-[#b8a492]/70 mt-1 font-mono">
                    Email tidak dapat diubah
                  </p>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="bg-[#b8a492]/10 p-4 rounded-lg border border-[#b8a492]/30">
              <h4 className="text-lg font-bold text-[#b8a492] mb-3 font-mono">Ubah Password</h4>
              <p className="text-xs text-[#b8a492]/70 mb-3 font-mono">
                Kosongkan jika tidak ingin mengubah password
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                    Password Saat Ini
                  </label>
                  <input
                    type="password"
                    value={profileFormData.currentPassword}
                    onChange={(e) => onFormDataChange({...profileFormData, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#b8a492] bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                    placeholder="Masukkan password lama"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={profileFormData.newPassword}
                    onChange={(e) => onFormDataChange({...profileFormData, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#b8a492] bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                    placeholder="Masukkan password baru"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={profileFormData.confirmPassword}
                    onChange={(e) => onFormDataChange({...profileFormData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-[#b8a492] bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 sticky bottom-0 bg-[#2d2d2d] pb-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-transparent text-[#b8a492] border-[#b8a492] px-4 py-3 rounded-lg font-bold border-2 hover:bg-[#b8a492]/10 transition-all font-mono"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#b8a492] text-[#2d2d2d] px-4 py-3 rounded-lg font-bold border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-all font-mono disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
