import React from 'react';

const Header = ({ user, onLogout, openProfile }) => {
  return (
    <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <button
              onClick={openProfile}
              className="bg-transparent text-[#b8a492] border-[#b8a492] px-4 py-2 rounded-lg font-bold border-2 hover:bg-[#b8a492]/10 transition-all"
              title="Edit Profil"
            >
              👤 Profil
            </button>
            <button
              onClick={onLogout}
              className="bg-[#b8a492] text-[#2d2d2d] px-6 py-2 rounded-lg font-bold border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
