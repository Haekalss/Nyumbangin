/** @type {import('next').NextConfig} */
const nextConfig = {
  onDemandEntries: {
    // Keep compiled pages in memory longer during development to prevent ChunkLoadError
    maxInactiveAge: 15 * 60 * 1000,
    pagesBufferLength: 20,
  },
};

export default nextConfig;
