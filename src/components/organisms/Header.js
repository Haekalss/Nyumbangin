import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../atoms/Button';

const Header = ({ user, openProfile }) => {
  const router = useRouter();

  return (
    <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Nyumbangin Logo" className="w-16 h-16" />
            <div>
              <h1 className="text-4xl font-extrabold text-[#b8a492] tracking-wide font-mono">Nyumbangin</h1>
              <p className="text-[#b8a492] text-lg mt-2 font-mono">Selamat datang, <span className="font-bold">{user?.displayName || user?.email}</span></p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              size="medium"
              onClick={() => router.push(`/overlay/${user?.username}`)}
              title="Pengaturan Overlay & Filter"
            >
              ⚙️ Pengaturan Overlay
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => router.push('/dashboard/payout')}
              title="Kelola Pencairan Dana"
            >
              💰 Pencairan Dana
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onClick={openProfile}
              title="Edit Profil"
            >
              👤 Profil
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
