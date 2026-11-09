/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Tautan lama /donate/username diarahkan ke URL pendek /username
    return [
      {
        source: '/donate/:username',
        destination: '/:username',
        permanent: true,
      },
    ];
  },
  onDemandEntries: {
    // Keep compiled pages in memory longer during development to prevent ChunkLoadError
    maxInactiveAge: 15 * 60 * 1000,
    pagesBufferLength: 20,
  },
};

export default nextConfig;
