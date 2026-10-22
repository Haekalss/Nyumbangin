'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';

export default function CreatorAppLayout({ user, onLogout, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      active: pathname === '/dashboard',
      icon: (
        <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      label: 'Pencairan Saldo',
      href: '/dashboard/payout',
      active: pathname === '/dashboard/payout',
      icon: (
        <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      label: 'Riwayat Donasi',
      href: '/history',
      active: pathname === '/history',
      icon: (
        <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: 'Overlay & OBS',
      href: user?.username ? `/overlay/${user.username}` : '#',
      active: pathname?.startsWith('/overlay'),
      disabled: !user?.username,
      icon: (
        <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Pengaturan Akun',
      href: '/dashboard/profile',
      active: pathname === '/dashboard/profile',
      icon: (
        <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-2 p-1">
        <span className="font-extrabold text-sm text-[#2d2d2d]">Keluar dari akun kreator?</span>
        <div className="flex gap-2 mt-1">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                await signOut({ redirect: false });
                toast.success('Berhasil keluar');
                router.replace('/');
              } catch {
                router.replace('/login');
              }
            }}
            className="rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-[2px_2px_0px_#2d2d2d] hover:bg-black cursor-pointer active:translate-y-0.5"
          >
            Ya, Keluar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-xl border-2 border-[#2d2d2d] bg-[#fffdf9] px-3.5 py-1.5 text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#f2e4d4] cursor-pointer active:translate-y-0.5"
          >
            Batal
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#2d2d2d] font-sans antialiased flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-[#fffdf9] border-b-2 border-[#2d2d2d] px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="Nyumbangin" className="h-7 w-7 object-contain" />
          <span className="font-extrabold text-base tracking-tight text-[#2d2d2d]">nyumbangin</span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg border-2 border-[#2d2d2d] bg-[#fbf8f3] text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#ede3d3] transition active:translate-y-0.5"
          aria-label="Toggle navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-[260px] bg-[#fffdf9] border-r-2 border-[#2d2d2d] flex flex-col justify-between shrink-0 overflow-y-auto transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 transition hover:opacity-85">
              <img src="/logo.png" alt="Nyumbangin" className="h-8 w-8 object-contain" />
              <div>
                <span className="text-base font-black tracking-tight text-[#2d2d2d] block leading-tight">nyumbangin</span>
                <span className="text-[10px] font-extrabold text-[#8f857b] uppercase tracking-widest">Kreator Studio</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-[#2d2d2d] p-1 hover:text-black"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Clean Creator Identity */}
          <div className="p-3 rounded-xl bg-[#f2e4d4] border-2 border-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#fffdf9] border-2 border-[#2d2d2d] flex items-center justify-center font-extrabold text-xs uppercase text-[#2d2d2d] overflow-hidden shrink-0">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'K'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-sm text-[#2d2d2d] truncate">
                {user?.displayName || 'Kreator'}
              </h4>
              <p className="text-[11px] font-mono font-bold text-[#696057] truncate">
                @{user?.username || 'namamu'}
              </p>
            </div>
          </div>

          {/* Navigation - Zero Redundancy */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setSidebarOpen(false);
                  if (item.disabled) {
                    toast.error('Lengkapi username terlebih dahulu');
                  } else {
                    router.push(item.href);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-extrabold transition cursor-pointer text-left border-2 ${
                  item.active
                    ? 'bg-[#2d2d2d] text-[#fbf8f3] border-[#2d2d2d] shadow-[3px_3px_0px_#b8a492]'
                    : 'text-[#2d2d2d] border-transparent hover:border-[#2d2d2d] hover:bg-[#f2e4d4] hover:shadow-[2px_2px_0px_#2d2d2d]'
                } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer - Only Logout Action */}
        <div className="p-5 border-t-2 border-[#2d2d2d]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-extrabold text-red-600 border-2 border-transparent hover:border-[#2d2d2d] hover:bg-red-50 hover:shadow-[2px_2px_0px_#2d2d2d] cursor-pointer transition text-left active:translate-y-0.5"
          >
            <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
