// src/app/login/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Frontend validation
    if (!email || !password) {
      toast.error('Email dan password wajib diisi!');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Format email tidak valid!');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success('Login berhasil!');
      if (res.data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login gagal";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#2d2d2d] p-6 sm:p-8 rounded-xl border-4 border-[#b8a492]">
        <div>
          <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-[#b8a492] font-mono">
            Masuk ke akun Anda
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#b8a492]">
            Atau{' '}
            <Link href="/register" className="font-bold text-[#b8a492] underline hover:text-[#d6c6b9]">
              buat akun baru
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-t-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="Alamat email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 sm:py-3 border border-[#b8a492] placeholder-[#b8a492] text-[#b8a492] bg-[#2d2d2d] rounded-b-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492] focus:z-10 text-sm sm:text-base font-mono"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-[#b8a492]/20 p-3 sm:p-4 border border-[#b8a492]">
              <div className="text-xs sm:text-sm text-[#b8a492]">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-[#2d2d2d] bg-[#b8a492] hover:bg-[#d6c6b9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492] disabled:opacity-50 font-mono transition-all duration-200"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-[#b8a492] hover:text-[#d6c6b9] underline font-mono text-xs sm:text-sm">
              ← Kembali ke beranda
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
