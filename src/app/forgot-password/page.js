"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const requestOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Format email tidak valid!');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('Kode OTP telah dikirim ke email Anda');
      setStep('verify');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal mengirim kode OTP';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Password tidak cocok');
    if (password.length < 6) return toast.error('Password minimal 6 karakter');

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', { email, token: otp, password });
      toast.success(res.data.message || 'Password berhasil diubah');
      setTimeout(() => router.push('/login'), 1200);
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
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Nyumbangin Logo" className="w-20 h-20" />
          </div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-[#b8a492] font-mono">Lupa Password</h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#b8a492]/80">Masukkan email Anda untuk menerima kode OTP</p>
        </div>

        {step === 'request' ? (
          <form className="mt-8 space-y-6" onSubmit={requestOtp}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#b8a492] font-mono mb-2">Email Address</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492]/50 text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a492] focus:border-[#b8a492] text-sm sm:text-base font-mono" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="rounded-md bg-blue-900/20 p-3 border border-blue-400/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-blue-200 font-mono"><strong>Catatan:</strong> Jika Anda mendaftar dengan Google, Anda tidak memerlukan password. Silakan login menggunakan tombol "Masuk dengan Google".</p>
                </div>
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-[#2d2d2d] bg-[#b8a492] hover:bg-[#d6c6b9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492] disabled:opacity-50 font-mono transition-all duration-200">{loading ? 'Mengirim...' : 'Kirim Kode OTP'}</button>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <Link href="/login" className="text-[#b8a492] hover:text-[#d6c6b9] underline font-mono">← Kembali ke login</Link>
              <Link href="/creator/register" className="text-[#b8a492] hover:text-[#d6c6b9] underline font-mono">Belum punya akun?</Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={verifyOtp}>
            <div>
              <label className="block text-sm font-medium text-[#b8a492] font-mono mb-2">Kode OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492]/50 text-[#b8a492] bg-[#2d2d2d] rounded-md" />
            </div>
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
            <div className="text-xs text-[#b8a492]">Belum menerima kode? <button type="button" onClick={requestOtp} className="underline">Kirim ulang</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Format email tidak valid!');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });

      toast.success('Link reset password telah dikirim ke email Anda!');
      setSuccess(true);

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal mengirim email reset password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#2d2d2d] p-6 sm:p-8 rounded-xl border-4 border-[#b8a492]">
        <div>
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Nyumbangin Logo" className="w-20 h-20" />
          </div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-[#b8a492] font-mono">
            Lupa Password
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#b8a492]/80">
            Masukkan email Anda dan kami akan mengirimkan link untuk reset password
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-900/30 p-4 border border-green-400/40">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-300 font-mono">
                  Email terkirim!
                </h3>
                <div className="mt-2 text-sm text-green-200 font-mono">
                  <p>Silakan cek email Anda untuk link reset password. Anda akan diarahkan ke halaman login...</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#b8a492] font-mono mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492]/50 text-[#b8a492] bg-[#2d2d2d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a492] focus:border-[#b8a492] text-sm sm:text-base font-mono"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="rounded-md bg-blue-900/20 p-3 border border-blue-400/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-blue-200 font-mono">
                    <strong>Catatan:</strong> Jika Anda mendaftar dengan Google, Anda tidak memerlukan password. Silakan login menggunakan tombol "Masuk dengan Google".
                  </p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-[#2d2d2d] bg-[#b8a492] hover:bg-[#d6c6b9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492] disabled:opacity-50 font-mono transition-all duration-200"
              >
                {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <Link href="/login" className="text-[#b8a492] hover:text-[#d6c6b9] underline font-mono">
                ← Kembali ke login
              </Link>
              <Link href="/creator/register" className="text-[#b8a492] hover:text-[#d6c6b9] underline font-mono">
                Belum punya akun?
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
