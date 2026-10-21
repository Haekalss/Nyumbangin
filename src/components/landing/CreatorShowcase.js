'use client';

import Link from 'next/link';
import useFetchJson from '@/hooks/useFetchJson';
import { formatCompactIDR } from './format';
import { SkeletonChipRow } from './Skeleton';

/** Ikon media sosial yang didukung (SVG path, `currentColor`). */
const SOCIALS = [
  { key: 'twitch', label: 'Twitch', path: 'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z' },
  { key: 'youtube', label: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { key: 'instagram', label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.059 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.072-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
  { key: 'tiktok', label: 'TikTok', path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' },
  { key: 'twitter', label: 'X', path: 'M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z' },
];

/** Bangun URL profil sosial dari nilai yang disimpan creator. */
const socialUrl = (platform, value) =>
  value.startsWith('http') ? value : `https://${platform}.com/${value}`;

/**
 * Strip kreator — social proof dari data nyata (API /api/creators/list).
 * Dirender sebagai marquee tipis di bawah hero.
 */
export default function CreatorShowcase() {
  const { data, loading } = useFetchJson('/api/creators/list');

  const creators = data?.success && Array.isArray(data.creators) ? data.creators.slice(0, 16) : [];

  if (loading) {
    return (
      <div className="border-t border-white/5 bg-ink-900/60 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 sm:px-6 lg:flex-row lg:px-8">
          <p className="shrink-0 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-sand-400">
            Sudah dipakai
          </p>
          <div className="nb-no-scrollbar w-full overflow-hidden">
            <SkeletonChipRow count={6} />
          </div>
        </div>
      </div>
    );
  }

  if (creators.length === 0) return null;

  // Duplikasi list untuk seamless loop marquee
  const loop = [...creators, ...creators];

  return (
    <div className="nb-anim-slide-l border-t border-white/5 bg-ink-900/60 py-5">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 sm:px-6 lg:flex-row lg:px-8">
        <p className="shrink-0 font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-sand-400">
          Sudah dipakai
        </p>

        <div className="nb-no-scrollbar w-full overflow-hidden">
          <div className="nb-marquee-track flex w-max gap-2.5">
            {loop.map((creator, index) => (
              <CreatorChip key={`${creator.username}-${index}`} creator={creator} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatorChip({ creator }) {
  const links = SOCIALS.filter((s) => creator.socialLinks?.[s.key]);

  return (
    <div className="nb-panel flex w-max shrink-0 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3.5">
      <Link href={creator.donationUrl} className="block shrink-0">
        <img
          src={creator.profileImage || '/default-avatar.png'}
          alt={creator.displayName}
          loading="lazy"
          width={30}
          height={30}
          className="h-[30px] w-[30px] rounded-full border border-sand-400/30 object-cover"
          onError={(e) => {
            e.currentTarget.src = '/default-avatar.png';
          }}
        />
      </Link>

      <div className="leading-tight">
        <Link
          href={creator.donationUrl}
          className="font-sans text-[12.5px] font-bold text-sand-100 transition-colors hover:text-sand-300"
        >
          {creator.displayName}
        </Link>
        {creator.totalDonations > 0 && (
          <p className="font-sans text-[10.5px] text-sand-400">
            {creator.totalDonations} donasi · {formatCompactIDR(creator.totalAmount)}
          </p>
        )}
      </div>

      {links.length > 0 && (
        <div className="ml-1 flex gap-1">
          {links.map((s) => (
            <a
              key={s.key}
              href={socialUrl(s.key, creator.socialLinks[s.key])}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className="grid h-5 w-5 place-items-center rounded-md bg-white/5 text-sand-400 transition-colors hover:bg-sand-400/20 hover:text-sand-100"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
                <path d={s.path} />
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
