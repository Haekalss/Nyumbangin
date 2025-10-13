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
            <div className="mb-3 text-xs font-mono bg-green-900/30 text-green-300 border border-green-400/40 rounded p-2">
              Data rekening sudah terkunci dan tidak dapat diubah. Hubungi support jika perlu koreksi.
            </div>
          ) : (
            <div className="mb-3 text-xs font-mono bg-yellow-900/30 text-yellow-200 border border-yellow-400/40 rounded p-2">
              Isi ketiga field di bawah (Bank/Channel, Nomor, Nama Pemilik) sekali saja. Setelah disimpan tidak bisa diubah.
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
