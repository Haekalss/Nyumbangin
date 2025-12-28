'use client'

import { useEffect, useState } from 'react';

export default function MobileBlocker({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center border-4 border-[#2d2d2d]">
          <div className="text-6xl mb-6">🖥️</div>
          <h1 className="text-3xl font-extrabold text-[#2d2d2d] mb-4">
            Desktop Only
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Halaman dashboard dan admin hanya bisa diakses melalui <strong>desktop</strong> atau <strong>laptop</strong>.
          </p>
          <div className="bg-[#b8a492] rounded-lg p-4 mb-6">
            <p className="text-[#2d2d2d] font-medium">
              Silakan buka website ini di komputer/laptop untuk mengakses fitur lengkap.
            </p>
          </div>
          <a
            href="/"
            className="inline-block bg-[#2d2d2d] text-[#b8a492] px-8 py-3 rounded-xl font-bold border-2 border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] transition-all"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
