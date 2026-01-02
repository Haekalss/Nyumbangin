'use client';

import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] flex items-center justify-center px-4 font-mono">
      <div className="max-w-2xl w-full text-center space-y-6">
        {/* 404 and Bear - Horizontal Layout */}
        <div className="flex items-center justify-center gap-6 md:gap-8">
          {/* 404 Number */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#2d2d2d] leading-none">
            404
          </h1>

          {/* Divider */}
          <div className="h-16 md:h-20 lg:h-24 w-1 bg-[#2d2d2d]/30 rounded-full"></div>

          {/* Sad Bear Image */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 drop-shadow-lg">
            <Image 
              src="/404-sad-bear.png" 
              alt="404 Not Found"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-[#2d2d2d]">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-sm md:text-base text-[#2d2d2d]/70">
            Maaf, halaman yang Anda cari tidak ada.
          </p>
        </div>
      </div>
    </div>
  );
}
