'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
  const [creators, setCreators] = useState([]);
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('Rp25.000');
  const [demoAlertActive, setDemoAlertActive] = useState(false);

  // Auto redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        JSON.parse(userData);
        router.replace('/dashboard');
        return;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    let cancelled = false;

    async function loadCreators() {
      try {
        const response = await fetch('/api/creators/list');
        const data = await response.json();
        if (!cancelled && data.success && Array.isArray(data.creators)) {
          setCreators(data.creators);
        }
      } catch (error) {
        console.error('Gagal memuat daftar kreator:', error);
      }
    }

    loadCreators();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLoginClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      toast.error('Dashboard hanya bisa diakses melalui desktop. Silakan buka website ini di komputer/laptop.', {
        duration: 5000,
        icon: '🖥️',
      });
      return;
    }
    router.push('/login');
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    const clean = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean) {
      router.push(`/creator/register?username=${encodeURIComponent(clean)}`);
    } else {
      router.push('/creator/register');
    }
  };

  const handleTestDonation = () => {
    setDemoAlertActive(true);
    setTimeout(() => {
      setDemoAlertActive(false);
    }, 4000);
  };

  const previewName = usernameInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'namamu';

  // Multiply creators list to guarantee a smooth, seamless infinite marquee
  const marqueeCreators = creators.length > 0 ? [...creators, ...creators, ...creators] : [];

  return (
    <main className="min-h-screen bg-[#fbf8f3] text-[#2d2d2d] font-sans antialiased selection:bg-[#b8a492] selection:text-[#2d2d2d]">
      {/* Navbar */}
      <header className="border-b-2 border-[#2d2d2d] bg-[#fbf8f3] sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <img src="/logo.png" alt="Nyumbangin" className="h-9 w-9 object-contain" />
            <span className="text-xl font-extrabold tracking-tight text-[#2d2d2d]">nyumbangin</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleLoginClick}
              className="rounded-xl px-4 py-2 text-sm font-bold text-[#2d2d2d] transition hover:bg-[#ede3d3]"
            >
              Masuk
            </button>
            <Link
              href="/creator/register"
              className="rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] px-4 py-2 text-sm font-bold text-[#fbf8f3] shadow-[3px_3px_0px_#b8a492] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#b8a492]"
            >
              Daftar
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-18 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Kolom Kiri: Headline & Input Klaim */}
          <div>
            <div className="inline-flex items-center rounded-full border-2 border-[#2d2d2d] bg-[#f2e4d4] px-3.5 py-1 text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]">
              Platform Saweran & Apresiasi Kreator
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#2d2d2d] sm:text-5xl lg:text-[3.75rem] lg:leading-[1.1]">
              Bikin karya. <br />
              <span className="underline decoration-[#b8a492] decoration-wavy decoration-2">
                Biar mereka dukung.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-[#5c544d]">
              Satu tautan praktis untuk menerima saweran dan apresiasi langsung dari penikmat karya atau siaranmu.
            </p>

            {/* Input Klaim Username (The Hook) */}
            <form
              onSubmit={handleClaimSubmit}
              className="mt-7 flex max-w-md flex-col gap-2 rounded-2xl border-2 border-[#2d2d2d] bg-white p-2 shadow-[4px_4px_0px_#2d2d2d] sm:flex-row sm:items-center"
            >
              <div className="flex flex-1 items-center px-3 py-1 font-mono text-sm">
                <span className="font-bold text-[#8f857b]">nyumbangin.id/</span>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="namamu"
                  maxLength={30}
                  className="w-full bg-transparent font-bold text-[#2d2d2d] outline-none placeholder:text-[#c4b9ad]"
                  aria-label="Nama pengguna"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl border-2 border-[#2d2d2d] bg-[#b8a492] px-5 py-2.5 text-sm font-extrabold text-[#2d2d2d] transition hover:bg-[#cabaa9] active:translate-y-0.5"
              >
                Buat Halaman
              </button>
            </form>

            {/* Micro Points */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-bold text-[#696057]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2d2d2d]" /> Gratis digunakan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2d2d2d]" /> Pembayaran instan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2d2d2d]" /> Langsung siap pakai
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Pratinjau Interaktif dengan Hook Notifikasi */}
          <div className="relative mx-auto w-full max-w-[390px]">
            {/* Kartu Halaman Kreator */}
            <div className="relative rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-5 shadow-[6px_6px_0px_#2d2d2d]">
              <div className="flex items-center justify-between border-b-2 border-[#2d2d2d] pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f56] border border-[#2d2d2d]" />
                  <span className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-[#2d2d2d]" />
                  <span className="h-3 w-3 rounded-full bg-[#27c93f] border border-[#2d2d2d]" />
                </div>
                <span className="font-mono text-xs font-bold text-[#696057]">
                  nyumbangin.id/{previewName}
                </span>
              </div>

              {/* Profil Kreator */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#2d2d2d] bg-[#b8a492] text-sm font-extrabold uppercase text-[#2d2d2d]">
                  {previewName.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-extrabold capitalize text-[#2d2d2d]">
                    {previewName}
                  </p>
                  <p className="truncate font-mono text-xs text-[#7d7369]">
                    @{previewName}
                  </p>
                </div>
              </div>

              {/* Simulasi Interaktif: Pop-up Notifikasi Alert */}
              {demoAlertActive ? (
                <div className="mt-4 rounded-xl border-2 border-[#2d2d2d] bg-[#b8a492] p-3.5 transition-all">
                  <div className="flex items-center justify-between font-mono text-xs font-extrabold">
                    <span>Saweran Masuk!</span>
                    <span className="rounded bg-[#2d2d2d] px-2 py-0.5 text-white">
                      {selectedAmount}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-[#2d2d2d]">
                    Budi <span className="font-normal">mendukung</span> @{previewName}
                  </p>
                  <div className="mt-1.5 rounded-lg border border-[#2d2d2d]/30 bg-white/70 p-2 text-xs italic text-[#2d2d2d]">
                    "Semangat terus ngontennya bang, ditunggu karya berikutnya!"
                  </div>
                </div>
              ) : (
                /* Pilihan Nominal Biasa */
                <div className="mt-4">
                  <p className="text-xs font-bold text-[#5c544d]">Pilih nominal dukungan</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {['Rp10.000', 'Rp25.000', 'Rp50.000'].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setSelectedAmount(amount)}
                        className={`rounded-xl border-2 py-2 text-center text-xs font-bold transition ${
                          selectedAmount === amount
                            ? 'border-[#2d2d2d] bg-[#b8a492] text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]'
                            : 'border-[#2d2d2d] bg-white text-[#5c544d] hover:bg-[#f5e9da]'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleTestDonation}
                    className="mt-3 w-full rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] py-2.5 text-center text-xs font-extrabold text-[#fbf8f3] shadow-[2px_2px_0px_#b8a492] transition hover:translate-x-[1px] hover:translate-y-[1px]"
                  >
                    Coba Kirim {selectedAmount}
                  </button>
                </div>
              )}

              <p className="mt-2 text-center text-[11px] font-medium text-[#8f857b]">
                {demoAlertActive ? 'Notifikasi otomatis tampil saat ada dukungan' : 'Klik tombol untuk melihat simulasi notifikasi'}
              </p>
            </div>

            {/* Maskot Karakter Nyumbangin */}
            <div className="absolute -bottom-8 -right-6 pointer-events-none w-28 sm:w-36 drop-shadow-md">
              <img
                src="/Logo2.png"
                alt="Maskot Nyumbangin"
                className="w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Kategori Kreator */}
      <section className="border-y-2 border-[#2d2d2d] bg-[#f4ebd9] py-3.5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-5 text-xs font-bold text-[#2d2d2d] sm:px-8 sm:gap-6">
          <span className="text-[#696057]">Untuk kamu yang:</span>
          <span className="rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-1 shadow-[2px_2px_0px_#2d2d2d]">
            Live Streaming
          </span>
          <span className="rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-1 shadow-[2px_2px_0px_#2d2d2d]">
            Bikin Komik & Ilustrasi
          </span>
          <span className="rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-1 shadow-[2px_2px_0px_#2d2d2d]">
            Rekam Podcast
          </span>
          <span className="rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-1 shadow-[2px_2px_0px_#2d2d2d]">
            Bikin Musik
          </span>
          <span className="rounded-lg border-2 border-[#2d2d2d] bg-white px-3 py-1 shadow-[2px_2px_0px_#2d2d2d]">
            Bangun Komunitas
          </span>
        </div>
      </section>

      {/* Auto-scrolling Marquee Kreator (Dengan margin kontainer sejajar) */}
      {creators.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 overflow-hidden">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-[#2d2d2d]">Kreator di Nyumbangin</h2>
          </div>

          <div className="carousel-wrapper py-3 [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]">
            <div className="carousel-marquee gap-6">
              {marqueeCreators.map((creator, index) => (
                <Link
                  key={`${creator.username}-${index}`}
                  href={creator.donationUrl || `/donate/${creator.username}`}
                  className="flex min-w-[220px] items-center gap-3.5 rounded-xl border-2 border-[#2d2d2d] bg-white p-3.5 shadow-[3px_3px_0px_#2d2d2d] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#2d2d2d]"
                >
                  <img
                    src={creator.profileImage || '/default-avatar.png'}
                    alt={creator.displayName || creator.username}
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.png';
                    }}
                    className="h-11 w-11 shrink-0 rounded-full border border-[#2d2d2d] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#2d2d2d]">
                      {creator.displayName || creator.username}
                    </p>
                    <p className="truncate font-mono text-xs text-[#82786e]">@{creator.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Manifesto Singkat dengan Maskot */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18">
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#2d2d2d] bg-[#f5e9da] p-8 sm:p-12 shadow-[6px_6px_0px_#2d2d2d]">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-block rounded-md border border-[#2d2d2d] bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-[#2d2d2d]">
                Manifesto Nyumbangin
              </span>
              <p className="mt-4 text-2xl font-extrabold tracking-tight text-[#2d2d2d] sm:text-3xl leading-snug">
                "Karya dan siaranmu selalu punya tempat di hati orang yang tepat."
              </p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[#5c544d]">
                Dukungan dari komunitas adalah bahan bakar terbesar untuk terus berkarya. Kami hadir agar apresiasi itu bisa sampai kepadamu dengan cara yang paling menyenangkan.
              </p>
            </div>

            {/* Maskot Nyumbangin */}
            <div className="shrink-0 w-32 sm:w-44 drop-shadow-md">
              <img
                src="/maskot.png"
                alt="Maskot Nyumbangin"
                className="w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#2d2d2d] bg-[#fbf8f3] py-8 text-xs font-semibold text-[#696057]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-5 w-5 object-contain" />
            <span>© {new Date().getFullYear()} Nyumbangin</span>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition hover:text-[#2d2d2d]">Privasi</Link>
            <Link href="/terms" className="transition hover:text-[#2d2d2d]">Syarat & Ketentuan</Link>
            <Link href="/faq" className="transition hover:text-[#2d2d2d]">FAQ</Link>
            <Link href="/contact" className="transition hover:text-[#2d2d2d]">Kontak</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
