import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

/**
 * Encapsulate profile form state & submit logic.
 */
export function useProfileForm(initialUser, onSuccess) {
  const [formData, setFormData] = useState({
    displayName: initialUser?.displayName || '',
    username: initialUser?.username || '',
    email: initialUser?.email || '',
    bio: initialUser?.bio || '',
    profileImageUrl: initialUser?.profileImage || '',
    socialLinks: {
      twitch: initialUser?.socialLinks?.twitch || '',
      youtube: initialUser?.socialLinks?.youtube || '',
      instagram: initialUser?.socialLinks?.instagram || '',
      tiktok: initialUser?.socialLinks?.tiktok || '',
      twitter: initialUser?.socialLinks?.twitter || ''
    },
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    payoutBankName: initialUser?.payoutBankName || '',
    payoutAccountNumber: initialUser?.payoutAccountNumber || '',
    payoutAccountHolder: initialUser?.payoutAccountHolder || ''
  });
  const [loading, setLoading] = useState(false);
  const payoutLocked = !!(initialUser?.payoutAccountNumber && initialUser?.payoutAccountHolder);

  // Sync form data whenever a new initialUser is provided (e.g., reopening modal after save)
  // BUT: Don't override profileImageUrl if it was recently uploaded (has cache buster)
  useEffect(() => {
    if (!initialUser) return;
    setFormData(prev => {
      // Check if profileImageUrl has cache buster (was just uploaded)
      const hasRecentUpload = prev.profileImageUrl && prev.profileImageUrl.includes('?t=');
      
      return {
        ...prev,
        displayName: initialUser.displayName || '',
        username: initialUser.username || '',
        email: initialUser.email || '',
        bio: initialUser.bio || '',
        // Only update profileImageUrl if no recent upload
        profileImageUrl: hasRecentUpload ? prev.profileImageUrl : (initialUser.profileImage || ''),
        socialLinks: {
          twitch: initialUser.socialLinks?.twitch || '',
          youtube: initialUser.socialLinks?.youtube || '',
          instagram: initialUser.socialLinks?.instagram || '',
          tiktok: initialUser.socialLinks?.tiktok || '',
          twitter: initialUser.socialLinks?.twitter || ''
        },
        payoutBankName: initialUser.payoutBankName || '',
        payoutAccountNumber: initialUser.payoutAccountNumber || '',
        payoutAccountHolder: initialUser.payoutAccountHolder || ''
      };
    });
  }, [initialUser]);

  const validate = () => {
    if (!formData.displayName || !formData.username) {
      toast.error('Nama tampilan dan username wajib diisi!');
      return false;
    }
    if (!/^[-_a-zA-Z0-9]+$/.test(formData.username)) {
      toast.error('Username hanya boleh berisi huruf, angka, underscore, dan dash!');
      return false;
    }
    if (formData.newPassword || formData.currentPassword || formData.confirmPassword) {
      if (!formData.currentPassword) { toast.error('Password lama wajib diisi'); return false; }
      if (!formData.newPassword) { toast.error('Password baru wajib diisi'); return false; }
      if (formData.newPassword.length < 6) { toast.error('Password baru minimal 6 karakter'); return false; }
      if (formData.newPassword !== formData.confirmPassword) { toast.error('Password baru dan konfirmasi tidak sama'); return false; }
    }
    return true;
  };

  const submit = async (user) => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      let profileUpdate = { 
        displayName: formData.displayName, 
        username: formData.username,
        bio: formData.bio,
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
      
      if (formData.newPassword && formData.currentPassword) {
        await axios.put('/api/user/password', { currentPassword: formData.currentPassword, newPassword: formData.newPassword }, config);
        toast.success('Profil dan password berhasil diupdate');
      } else {
        toast.success('Profil berhasil diupdate');
      }
      
      const updatedUser = { ...user, ...response.data.user };
      onSuccess && onSuccess(updatedUser);
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal mengupdate profil');
    } finally {
      setLoading(false);
    }
  };

  return { formData, setFormData, submit, loading, payoutLocked };
}
