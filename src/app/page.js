'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // If already logged in, redirect to dashboard
        router.push('/dashboard');
        return;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    
    // Fetch creators list
    fetchCreators();
  }, [router]);

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/creators/list');
      const data = await response.json();
      if (data.success && data.creators.length > 0) {
        setCreators(data.creators);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    }
  };

  // Hitung gap dinamis berdasarkan jumlah creator
  const getGapClass = () => {
    const count = creators.length;
    if (count <= 2) return 'gap-12';
    if (count <= 5) return 'gap-8';
    if (count <= 10) return 'gap-6';
    return 'gap-4';
  };

  const scrollToCreators = () => {
    const creatorSection = document.getElementById('creator-section');
    if (creatorSection) {
      const targetPosition = creatorSection.getBoundingClientRect().top + window.pageYOffset - 100;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1500; // 1.5 detik
      let start = null;

      const animation = (currentTime) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function untuk smooth animation
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, startPosition + distance * ease);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  };

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <span className="font-medium">Yakin ingin keluar?</span>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              toast.success('Berhasil logout!');
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Ya, Keluar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Batal
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono">
      {/* Header */}
      <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-3xl font-extrabold text-[#b8a492] tracking-wide hover:text-[#d6c6b9] transition-colors cursor-pointer">
              Nyumbangin
            </Link>
            <nav className="flex items-center gap-3">
            {user ? (
              <>
                {(user.userType === 'admin' || user.role === 'admin') && (
                  <Link href="/dashboard" className="bg-[#b8a492] text-[#2d2d2d] px-4 py-2 rounded-lg font-bold border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-all">
                    Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold border-2 border-red-700 hover:bg-red-700 transition-all">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="bg-[#2d2d2d] text-[#b8a492] px-4 py-2 rounded-lg font-bold border-2 border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] transition-all">
                Login
              </Link>
            )}
          </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Nyumbangin Logo" className="w-32 h-32 animate-bounce" />
        </div>
        <h2 className="text-5xl font-extrabold text-[#2d2d2d]">Buat Halaman Donasi Pribadi Anda</h2>
        <p className="mt-4 text-lg text-[#2d2d2d] max-w-2xl mx-auto">
          Nyumbangin adalah platform donasi digital yang memudahkan kreator menerima dukungan dari fans dan followers dengan aman, cepat, dan transparan.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/creator/register" className="bg-[#b8a492] text-[#2d2d2d] px-8 py-4 rounded-xl font-extrabold text-lg border-2 border-[#2d2d2d] hover:bg-[#d6c6b9]">
            Mulai Sebagai Creator
          </Link>
          <button onClick={scrollToCreators} className="bg-[#2d2d2d] text-[#b8a492] px-8 py-4 rounded-xl font-extrabold text-lg border-2 border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d]">
            Lihat Creator
          </button>
        </div>
      </section>

      {/* Creator Carousel */}
      <section id="creator-section" className="bg-[#2d2d2d] border-t-4 border-[#b8a492] py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#b8a492]">
          <h3 className="text-2xl font-bold text-center mb-6">Siapa Saja yang Sudah Bergabung?</h3>
          
          {creators.length > 0 ? (
            <div className="relative carousel-wrapper">
              <div 
                className={`flex ${getGapClass()} carousel-track-seamless`}
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
              >
                {/* Render 3x untuk truly seamless loop */}
                {[...creators, ...creators, ...creators].map((creator, index) => (
                  <div
                    key={`${creator.username}-${index}`}
                    className="creator-card flex-shrink-0 w-48 bg-[#b8a492] text-[#2d2d2d] rounded-lg p-4 border-2 border-[#2d2d2d] hover:scale-105 transition-transform duration-300"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <Link href={creator.donationUrl}>
                        <img 
                          src={creator.profileImage} 
                          alt={creator.displayName}
                          className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-[#2d2d2d] cursor-pointer"
                          onError={(e) => e.target.src = '/default-avatar.png'}
                        />
                      </Link>
                      <Link href={creator.donationUrl}>
                        <h4 className="text-lg font-bold mb-1 hover:underline cursor-pointer">{creator.displayName}</h4>
                      </Link>
                      <p className="text-xs opacity-80 mb-2">@{creator.username}</p>
                      
                      {/* Social Media Icons */}
                      {(creator.socialLinks?.twitch || creator.socialLinks?.youtube || 
                        creator.socialLinks?.instagram || creator.socialLinks?.tiktok || 
                        creator.socialLinks?.twitter) && (
                        <div className="flex gap-2 mb-2">
                          {creator.socialLinks?.twitch && (
                            <a
                              href={creator.socialLinks.twitch.startsWith('http') ? creator.socialLinks.twitch : `https://twitch.tv/${creator.socialLinks.twitch}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 hover:scale-110 transition-transform"
                              title="Twitch"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg viewBox="0 0 24 24" fill="#2d2d2d" className="w-full h-full">
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                              </svg>
                            </a>
                          )}
                          {creator.socialLinks?.youtube && (
                            <a
                              href={creator.socialLinks.youtube.startsWith('http') ? creator.socialLinks.youtube : `https://youtube.com/@${creator.socialLinks.youtube}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 hover:scale-110 transition-transform"
                              title="YouTube"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg viewBox="0 0 24 24" fill="#2d2d2d" className="w-full h-full">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </a>
                          )}
                          {creator.socialLinks?.instagram && (
                            <a
                              href={creator.socialLinks.instagram.startsWith('http') ? creator.socialLinks.instagram : `https://instagram.com/${creator.socialLinks.instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 hover:scale-110 transition-transform"
                              title="Instagram"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg viewBox="0 0 24 24" fill="#2d2d2d" className="w-full h-full">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </a>
                          )}
                          {creator.socialLinks?.tiktok && (
                            <a
                              href={creator.socialLinks.tiktok.startsWith('http') ? creator.socialLinks.tiktok : `https://tiktok.com/@${creator.socialLinks.tiktok}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 hover:scale-110 transition-transform"
                              title="TikTok"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg viewBox="0 0 24 24" fill="#2d2d2d" className="w-full h-full">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                              </svg>
                            </a>
                          )}
                          {creator.socialLinks?.twitter && (
                            <a
                              href={creator.socialLinks.twitter.startsWith('http') ? creator.socialLinks.twitter : `https://twitter.com/${creator.socialLinks.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-6 h-6 hover:scale-110 transition-transform"
                              title="Twitter"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg viewBox="0 0 24 24" fill="#2d2d2d" className="w-full h-full">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                      
                      {creator.bio && (
                        <p className="text-xs line-clamp-2 mt-1">{creator.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-[#b8a492]">
              <p className="text-sm">Memuat creator...</p>
            </div>
          )}
        </div>
      </section>

      {/* Keunggulan */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t-4 border-[#b8a492]">
  <h3 className="text-3xl font-extrabold text-center text-[#2d2d2d] mb-3">
    Kenapa Pilih Nyumbangin?
  </h3>
  <p className="text-center text-[#2d2d2d] text-base mb-8 max-w-2xl mx-auto">
    Platform donasi terpercaya dengan fitur lengkap untuk mendukung kreator favorit Anda
  </p>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="feature-card bg-gradient-to-br from-[#b8a492] to-[#d6c6b9] p-6 rounded-xl border-2 border-[#2d2d2d] hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
      <div className="text-5xl mb-4 group-hover:animate-bounce">🎨</div>
      <h4 className="text-xl font-bold text-[#2d2d2d] mb-2">Desain Modern</h4>
      <p className="text-[#2d2d2d]">Tampilan responsif dan keren di semua perangkat, dari mobile hingga desktop</p>
    </div>
    
    <div className="feature-card bg-gradient-to-br from-[#d6c6b9] to-[#b8a492] p-6 rounded-xl border-2 border-[#2d2d2d] hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
      <div className="text-5xl mb-4 group-hover:animate-bounce">🔒</div>
      <h4 className="text-xl font-bold text-[#2d2d2d] mb-2">Aman & Terpercaya</h4>
      <p className="text-[#2d2d2d]">Pembayaran terenkripsi melalui Midtrans dengan keamanan tingkat bank</p>
    </div>
    
    <div className="feature-card bg-gradient-to-br from-[#b8a492] to-[#d6c6b9] p-6 rounded-xl border-2 border-[#2d2d2d] hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
      <div className="text-5xl mb-4 group-hover:animate-bounce">⚡</div>
      <h4 className="text-xl font-bold text-[#2d2d2d] mb-2">Real-Time</h4>
      <p className="text-[#2d2d2d]">Notifikasi instan saat donasi masuk, langsung tampil di overlay stream</p>
    </div>
    
    <div className="feature-card bg-gradient-to-br from-[#d6c6b9] to-[#b8a492] p-6 rounded-xl border-2 border-[#2d2d2d] hover:scale-105 hover:shadow-2xl transition-all duration-300 group">
      <div className="text-5xl mb-4 group-hover:animate-bounce">💰</div>
      <h4 className="text-xl font-bold text-[#2d2d2d] mb-2">Mudah Dicairkan</h4>
      <p className="text-[#2d2d2d]">Proses payout cepat dan transparan, dana langsung ke rekening Anda</p>
    </div>
  </div>
</section>

      {/* How It Works */}
<section className="bg-[#2d2d2d] py-12 border-t-4 border-[#b8a492]">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <h3 className="text-3xl font-extrabold text-center text-[#b8a492] mb-3">
      Cara Kerjanya Mudah!
    </h3>
    <p className="text-center text-[#b8a492] text-base mb-8">
      Hanya 3 langkah untuk mulai menerima donasi
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="text-center step-card">
        <div className="w-20 h-20 bg-[#b8a492] rounded-full flex items-center justify-center text-[#2d2d2d] text-4xl font-extrabold mx-auto mb-4 border-4 border-[#d6c6b9] hover:scale-110 transition-transform duration-300">
          1
        </div>
        <h4 className="text-xl font-bold text-[#b8a492] mb-3">Daftar Gratis</h4>
        <p className="text-[#d6c6b9] text-base">
          Buat akun creator dan atur profil Anda dengan mudah dalam hitungan menit
        </p>
      </div>
      
      <div className="text-center step-card">
        <div className="w-20 h-20 bg-[#b8a492] rounded-full flex items-center justify-center text-[#2d2d2d] text-4xl font-extrabold mx-auto mb-4 border-4 border-[#d6c6b9] hover:scale-110 transition-transform duration-300">
          2
        </div>
        <h4 className="text-xl font-bold text-[#b8a492] mb-3">Bagikan Link</h4>
        <p className="text-[#d6c6b9] text-base">
          Share halaman donasi Anda di social media, bio, atau stream overlay
        </p>
      </div>
      
      <div className="text-center step-card">
        <div className="w-20 h-20 bg-[#b8a492] rounded-full flex items-center justify-center text-[#2d2d2d] text-4xl font-extrabold mx-auto mb-4 border-4 border-[#d6c6b9] hover:scale-110 transition-transform duration-300">
          3
        </div>
        <h4 className="text-xl font-bold text-[#b8a492] mb-3">Terima Donasi</h4>
        <p className="text-[#d6c6b9] text-base">
          Fans bisa donasi dengan mudah, Anda langsung dapat notifikasi dan dana masuk
        </p>
      </div>
    </div>
    
    <div className="text-center mt-12">
      <p className="text-[#d6c6b9] text-lg mb-4">Punya pertanyaan? Cek panduan lengkap kami</p>
      <Link href="/faq" className="inline-block bg-transparent text-[#b8a492] px-8 py-3 rounded-xl font-bold text-lg border-2 border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] transition-all duration-300">
        Lihat FAQ & Bantuan
      </Link>
    </div>
  </div>
</section>

      {/* CTA Section with Mascot */}
<section className="py-12 border-t-4 border-[#b8a492]">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="bg-gradient-to-r from-[#2d2d2d] to-[#4a4a4a] rounded-2xl border-4 border-[#b8a492] p-8 md:p-12">
    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-3xl font-extrabold text-[#b8a492] mb-3">
          Siap Mulai Perjalanan Anda?
        </h3>
        <p className="text-[#d6c6b9] text-base mb-5">
          Daftar sekarang dan mulai terima donasi dari supporters Anda dengan mudah dan aman.
        </p>
        <Link href="/creator/register" className="inline-block bg-[#b8a492] text-[#2d2d2d] px-10 py-4 rounded-xl font-extrabold text-xl border-2 border-[#d6c6b9] hover:bg-[#d6c6b9] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl">
          🚀 Mulai Sekarang - Gratis!
        </Link>
      </div>
      <div className="flex-shrink-0">
        <img 
          src="/maskot.png" 
          alt="Maskot Nyumbangin" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain animate-bounce-slow"
        />
      </div>
    </div>
  </div>
  </div>
</section>



      {/* Footer */}
      <footer className="bg-[#2d2d2d] border-t-4 border-[#b8a492] text-[#b8a492] text-center py-6">
        <footer className="w-full py-6 text-center text-[#b8a492] bg-[#2d2d2d] text-sm flex flex-col items-center gap-2">
          <div>
            <a href="/privacy" className="underline hover:text-[#fff] transition-colors">Kebijakan Privasi</a>
            <span className="mx-2">|</span>
            <a href="/terms" className="underline hover:text-[#fff] transition-colors">Syarat & Ketentuan</a>
            <span className="mx-2">|</span>
            <a href="/faq" className="underline hover:text-[#fff] transition-colors">FAQ & Bantuan</a>
            <span className="mx-2">|</span>
            <a href="/contact" className="underline hover:text-[#fff] transition-colors">Hubungi kami</a>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Nyumbangin.
          </div>
        </footer>
      </footer>
    </div>
  );
}
