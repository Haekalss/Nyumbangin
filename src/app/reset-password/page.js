"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Read token/email from URL on client-side to avoid SSR hooks
    try {
      const p = new URLSearchParams(window.location.search);
      const t = p.get('token') || '';
      const e = p.get('email') || '';
      setToken(t);
      setEmail(e);
    } catch (err) {
      // ignore
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Password tidak cocok');
    if (password.length < 6) return toast.error('Password minimal 6 karakter');

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', { email, token, password });
      toast.success(res.data.message || 'Password berhasil diubah');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || 'Gagal mengganti password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#2d2d2d] p-6 sm:p-8 rounded-xl border-4 border-[#b8a492]">
        <div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-[#b8a492] font-mono">Reset Password</h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#b8a492]/80">Masukkan password baru untuk akun Anda.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="text-sm text-[#b8a492]">
            {email ? (
              <p>Reset untuk: <strong className="font-mono">{email}</strong></p>
            ) : (
              <p>Masukkan kode OTP yang dikirim ke email Anda.</p>
            )}
          </div>

          { !token && (
            <div>
              <label className="block text-sm font-medium text-[#b8a492] font-mono mb-2">Kode OTP</label>
              <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required className="w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492]/50 text-[#b8a492] bg-[#2d2d2d] rounded-md" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#b8a492] font-mono mb-2">Password Baru</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492]/50 text-[#b8a492] bg-[#2d2d2d] rounded-md" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#b8a492] font-mono mb-2">Konfirmasi Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492]/50 text-[#b8a492] bg-[#2d2d2d] rounded-md" />
          </div>

          <div>
            <button type="submit" disabled={loading} className="w-full py-3 text-[#2d2d2d] bg-[#b8a492] rounded-md">{loading ? 'Menyimpan...' : 'Simpan Password Baru'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
