import LandingPage from '@/components/landing/LandingPage';

export const metadata = {
  title: 'Nyumbangin — Platform Donasi Digital & Overlay Streaming Real-Time',
  description:
    'Terima donasi dari QRIS, GoPay, E-Wallet, dan Virtual Account. Notifikasi real-time untuk OBS Studio, Streamlabs, dan vMix. Gratis daftar, pencairan transparan.',
  keywords: [
    'donasi digital',
    'donasi streamer',
    'overlay obs',
    'streamlabs',
    'qris donasi',
    'minta donasi',
    'nyumbangin',
    'real-time donation alert',
  ],
  authors: [{ name: 'Nyumbangin Team' }],
  openGraph: {
    title: 'Nyumbangin — Platform Donasi Digital & Overlay Streaming Real-Time',
    description:
      'Donasi masuk langsung tampil di stream kamu. Bayar via QRIS & e-wallet, alert real-time untuk OBS Studio, Streamlabs, dan vMix.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Nyumbangin',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nyumbangin — Platform Donasi Digital & Overlay Streaming Real-Time',
    description:
      'Donasi masuk langsung tampil di stream kamu. Bayar via QRIS & e-wallet, alert real-time untuk OBS Studio, Streamlabs, dan vMix.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return <LandingPage />;
}
