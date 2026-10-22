"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';

const Header = ({ user, openProfile, onLogout }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', active: pathname === '/dashboard' },
    { label: 'Riwayat Donasi', href: '/history', active: pathname === '/history' },
    { label: 'Pencairan Dana', href: '/dashboard/payout', active: pathname === '/dashboard/payout' },
    { 
      label: 'Pengaturan Overlay', 
      href: user?.username ? `/overlay/${user.username}` : '#', 
      active: pathname?.startsWith('/overlay'),
      disabled: !user?.username
    },
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-2 p-1">
        <span className="font-bold text-sm text-[#2d2d2d]">Yakin ingin keluar?</span>
        <div className="flex gap-2 mt-1">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                await signOut({ redirect: false });
                toast.success('Berhasil keluar!');
                router.replace('/');
              } catch {
                router.replace('/login');
              }
            }}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
          >
            Ya, Keluar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-1.5 text-xs font-bold text-[#2d2d2d] hover:bg-gray-100 cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#2d2d2d] bg-[#fffdf9]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 transition hover:opacity-85">
              <img src="/logo.png" alt="Nyumbangin" className="h-9 w-9 object-contain" />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-[#2d2d2d]">nyumbangin</span>
                <span className="text-[10px] font-bold text-[#8c8276] uppercase tracking-wider -mt-1">Kreator Hub</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) {
                      toast.error('Lengkapi username profil terlebih dahulu!');
                    } else {
                      router.push(item.href);
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    item.active
                      ? 'bg-[#2d2d2d] text-[#fbf8f3] border-2 border-[#2d2d2d] shadow-[2px_2px_0px_#b8a492]'
                      : 'text-[#696057] hover:text-[#2d2d2d] hover:bg-[#2d2d2d]/5 border-2 border-transparent'
                  } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Action Menu */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Tombol Preview Halaman Donasi */}
            {user?.username && (
              <a
                href={`/donate/${user.username}`}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#2d2d2d] bg-white text-xs font-bold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] transition hover:bg-[#fbf8f3] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-0.5"
                title="Buka halaman donasi publikmu"
              >
                <span>Halaman Donasi</span>
                <span className="text-xs">↗</span>
              </a>
            )}

            {/* Profil Button */}
            <button
              onClick={() => openProfile && openProfile()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#2d2d2d] bg-white text-xs font-bold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] transition hover:bg-[#fbf8f3] cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-0.5"
            >
              <div className="h-6 w-6 rounded-full border border-[#2d2d2d] bg-[#b8a492] flex items-center justify-center text-[10px] font-black uppercase text-[#2d2d2d] overflow-hidden">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'
                )}
              </div>
              <span className="max-w-[120px] truncate">{user?.displayName || user?.username || 'Profil'}</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] text-xs font-bold text-red-600 hover:bg-red-50 shadow-[2px_2px_0px_#2d2d2d] transition cursor-pointer hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-0.5"
              title="Keluar dari akun"
            >
              Keluar
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => openProfile && openProfile()}
              className="p-1.5 rounded-xl border-2 border-[#2d2d2d] bg-white text-xs font-bold"
            >
              <div className="h-6 w-6 rounded-full border border-[#2d2d2d] bg-[#b8a492] flex items-center justify-center text-[10px] font-black uppercase text-[#2d2d2d]">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border-2 border-[#2d2d2d] bg-white text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t-2 border-[#2d2d2d]/15 flex flex-col gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (item.disabled) {
                    toast.error('Lengkapi username profil terlebih dahulu!');
                  } else {
                    router.push(item.href);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  item.active
                    ? 'bg-[#2d2d2d] text-white border-2 border-[#2d2d2d]'
                    : 'text-[#5c544d] hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            {user?.username && (
              <a
                href={`/donate/${user.username}`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#2d2d2d] bg-[#f5e9da] border border-[#2d2d2d]/20"
              >
                Halaman Donasi Publik ↗
              </a>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50"
            >
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
