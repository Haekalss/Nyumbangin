'use client';

import useReveal from '@/hooks/useReveal';
import { SectionContainer, SectionHeading } from './Section';
import { STAGGER } from './motion';
import { DonatePageMockup, OverlayMockup, DashboardMockup } from './Mockups';
import { IconBolt, IconHeart, IconUsers } from './icons';

const ROLES = [
  {
    id: 'streamer',
    icon: IconBolt,
    accent: 'text-sand-300',
    chipBg: 'bg-sand-400/15',
    title: 'Untuk Streamer',
    description: 'Pasang overlay ke stream, donasi langsung masuk dan tampil real-time.',
    bullets: ['Notifikasi real-time & leaderboard', 'QR donasi statis di stream', 'Pencairan transparan'],
    mockup: <OverlayMockup />,
  },
  {
    id: 'donatur',
    icon: IconHeart,
    accent: 'text-rose-400',
    chipBg: 'bg-rose-400/15',
    title: 'Untuk Pendukung',
    description: 'Buka link, pilih nominal, bayar via QRIS atau e-wallet favoritmu.',
    bullets: ['Bayar QRIS, GoPay, e-wallet', 'Bisa donasi tanpa daftar akun', 'Kirim pesan ke stream'],
    mockup: <DonatePageMockup />,
  },
  {
    id: 'studio',
    icon: IconUsers,
    accent: 'text-teal-400',
    chipBg: 'bg-teal-400/15',
    title: 'Untuk Studio & Admin',
    description: 'Kelola banyak creator dari satu dashboard dengan proses payout terlacak.',
    bullets: ['Dashboard multi-creator', 'Verifikasi & proses payout', 'Riwayat dan arsip donasi'],
    mockup: <DashboardMockup />,
  },
];

function RoleCard({ role, index, visible }) {
  const Icon = role.icon;

  return (
    <article
      className={`nb-reveal nb-panel nb-panel-hover nb-sweep-border group flex flex-col rounded-3xl p-5 ${
        visible ? 'is-visible' : ''
      }`}
      style={{ transitionDelay: `${index * STAGGER.card}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${role.chipBg} ${role.accent}`}
        >
          <Icon className="nb-icon-tilt h-4 w-4" />
        </span>
        <h3 className="font-sans text-[17px] font-bold tracking-tight text-sand-100">{role.title}</h3>
      </div>

      <p className="mt-2.5 font-sans text-[13px] leading-relaxed text-sand-300/75">{role.description}</p>

      <ul className="mt-3 space-y-1.5">
        {role.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 font-sans text-[12.5px] text-sand-300/80">
            <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-sand-400" />
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex-1">{role.mockup}</div>
    </article>
  );
}

export default function AudienceSection() {
  const { ref, visible } = useReveal({ threshold: 0.1 });

  return (
    <section id="untuk-siapa" className="relative border-t border-white/5 bg-ink-950">
      <SectionContainer>
        <div ref={ref}>
          <SectionHeading eyebrow="Untuk Siapa" visible={visible}>
            Satu platform, <span className="nb-gradient-text">tiga pihak</span>
          </SectionHeading>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((role, i) => (
            <RoleCard key={role.id} role={role} index={i} visible={visible} />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
}
