'use client';

export default function ComingSoon() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] flex items-center justify-center px-4 font-mono">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Coming Soon Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#2d2d2d] leading-tight">
            Coming Soon
          </h1>
          <div className="flex justify-center">
            <div className="h-1.5 w-32 bg-[#2d2d2d] rounded-full"></div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4 py-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#2d2d2d]">
            Halaman Sedang Dalam Pengembangan
          </h2>
          <p className="text-base md:text-lg text-[#2d2d2d] max-w-xl mx-auto leading-relaxed">
            Kami sedang mempersiapkan sesuatu yang menarik untuk Anda. Nantikan pembaruan selanjutnya!
          </p>
        </div>
      </div>
    </div>
  );
}
