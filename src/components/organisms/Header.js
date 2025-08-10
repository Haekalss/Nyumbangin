import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '../atoms/Button';

const Header = ({ user, onLogout, openProfile }) => {
  const router = useRouter();

  return (
    <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[#b8a492] tracking-wide font-mono">Nyumbangin</h1>
            <p className="text-[#b8a492] text-lg mt-2 font-mono">Selamat datang, <span className="font-bold">{user?.displayName || user?.email}</span></p>
            {user?.username && (
              <p className="text-sm text-[#b8a492] mt-1 font-mono flex items-center gap-2">
                Link donasi Anda:
                <a
                  href={`/donate/${user.username}`}
                  className="ml-1 underline hover:text-[#d6c6b9]"
                >
                  /donate/{user.username}
                </a>
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              size="medium"
              onClick={() => router.push(`/overlay/${user?.username}`)}
              title="Buka Overlay"
            >
              🎥 Live Widget
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onClick={openProfile}
              title="Edit Profil"
            >
              👤 Profil
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={onLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
