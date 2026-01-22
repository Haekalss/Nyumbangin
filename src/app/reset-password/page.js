"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('otp'); // 'otp' | 'password'
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
      if (t && e) {
        setStep('password'); // If both token and email are in URL, go directly to password step
      } else if (!e) {
        // If no email in URL, redirect to forgot-password
        toast.error('Email tidak ditemukan. Silakan mulai dari forgot password.');
        router.push('/forgot-password');
      }
    } catch (err) {
      // ignore
    }
  }, [router]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) return toast.error('Masukkan kode OTP');
    if (!email) return toast.error('Email tidak ditemukan');

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', { email, token });
      toast.success('Kode OTP valid! Silakan masukkan password baru.');
      setStep('password');
    } catch (err) {
      const msg = err.response?.data?.error || 'Kode OTP tidak valid';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
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
          <p className="mt-2 text-center text-xs sm:text-sm text-[#b8a492]/80">
            {step === 'otp' ? 'Masukkan kode OTP yang dikirim ke email Anda.' : 'Masukkan password baru untuk akun Anda.'}
          </p>
        </div>

        {email && (
          <div className="flex items-center gap-2 bg-[#23201c] border border-[#b8a492]/30 rounded-md px-3 py-2 mb-2">
            <svg className="h-5 w-5 text-[#b8a492] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold text-[#b8a492] font-mono uppercase tracking-wide">Email Tujuan Reset:</span>
            <span className="text-sm font-mono text-[#b8a492] break-all">{email}</span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></span>
          </div>
        )}

        {step === 'otp' ? (
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#b8a492] font-mono mb-2">Kode OTP</label>
              <input 
                type="text" 
                value={token} 
                onChange={(e) => setToken(e.target.value)} 
                required 
                className="w-full px-3 py-3 border border-[#b8a492] placeholder-[#b8a492]/50 text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a492] focus:border-[#b8a492] text-sm font-mono" 
                placeholder="Masukkan 6 digit kode OTP"
                maxLength={6}
              />
            </div>

            <div>
              <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-[#2d2d2d] bg-[#b8a492] hover:bg-[#d6c6b9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492] disabled:opacity-50 font-mono transition-all duration-200">
                {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#b8a492] font-mono mb-2">Password Baru</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full px-3 py-3 border border-[#b8a492] placeholder-[#b8a492]/50 text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a492] focus:border-[#b8a492] text-sm font-mono" 
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#b8a492] font-mono mb-2">Konfirmasi Password</label>
              <input 
                type="password" 
                value={confirm} 
                onChange={(e) => setConfirm(e.target.value)} 
                required 
                className="w-full px-3 py-3 border border-[#b8a492] placeholder-[#b8a492]/50 text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a492] focus:border-[#b8a492] text-sm font-mono" 
                placeholder="Ulangi password baru"
              />
            </div>

            <div>
              <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-[#2d2d2d] bg-[#b8a492] hover:bg-[#d6c6b9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492] disabled:opacity-50 font-mono transition-all duration-200">
                {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </div>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => setStep('otp')} 
                className="text-xs text-[#b8a492] hover:text-[#d6c6b9] underline font-mono"
              >
                ← Kembali ke OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
