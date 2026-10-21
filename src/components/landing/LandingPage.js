'use client';

import { useRouter } from 'next/navigation';
import useLandingSession from '@/hooks/useLandingSession';

import LandingNav from './LandingNav';
import ScrollProgress from './ScrollProgress';
import HeroSection from './HeroSection';
import StatsStrip from './StatsStrip';
import CreatorShowcase from './CreatorShowcase';
import AudienceSection from './AudienceSection';
import HowItWorksSection from './HowItWorksSection';
import IntegrationsSection from './IntegrationsSection';
import CtaSection from './CtaSection';
import LandingFooter from './LandingFooter';

/** Panel session melayang untuk user yang sudah login. */
function SessionBar({ user, onLogout }) {
  const router = useRouter();
  const isAdmin = user.userType === 'admin' || user.role === 'admin';
  const isCreator = user.userType === 'creator' || user.role === 'user';

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-ink-850/90 p-1.5 pl-3 shadow-2xl backdrop-blur">
      <span className="max-w-[140px] truncate font-sans text-[13px] font-semibold text-sand-200">
        {user.displayName || user.email}
      </span>

      {isAdmin && (
        <button
          onClick={() => router.push('/admin')}
          className="rounded-full bg-sand-300 px-3 py-1.5 font-sans text-[12px] font-bold text-ink-900 transition-colors hover:bg-sand-200"
        >
          Admin
        </button>
      )}

      {isCreator && (
        <button
          onClick={() => router.push('/dashboard')}
          className="rounded-full bg-sand-300 px-3 py-1.5 font-sans text-[12px] font-bold text-ink-900 transition-colors hover:bg-sand-200"
        >
          Dashboard
        </button>
      )}

      <button
        onClick={onLogout}
        className="rounded-full border border-white/10 px-3 py-1.5 font-sans text-[12px] font-semibold text-sand-400 transition-colors hover:border-rose-400/40 hover:text-rose-300"
      >
        Keluar
      </button>
    </div>
  );
}

export default function LandingPage() {
  const { user, ready, logout } = useLandingSession();

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-sand-100 antialiased">
      <ScrollProgress />
      <LandingNav user={user} />

      <main>
        {/* ① Hero + social proof */}
        <HeroSection />
        <StatsStrip />
        <div id="kreator">
          <CreatorShowcase />
        </div>

        {/* ② Tiga pihak (fitur & audiens digabung) */}
        <AudienceSection />

        {/* ③ Cara kerja + integrasi */}
        <HowItWorksSection />
        <IntegrationsSection />

        {/* ④ CTA penutup */}
        <CtaSection />
      </main>

      <LandingFooter />

      {ready && user && <SessionBar user={user} onLogout={logout} />}
    </div>
  );
}
