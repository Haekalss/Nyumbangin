'use client';

import useReveal from '@/hooks/useReveal';
import { SectionContainer, SectionHeading } from './Section';
import { STAGGER } from './motion';

const STEPS = [
  {
    num: '01',
    title: 'Daftar & atur profil',
    body: 'Buat akun creator, isi bio, sambungkan akun sosial, tentukan nominal min/max.',
  },
  {
    num: '02',
    title: 'Bagikan link & pasang overlay',
    body: 'Dapatkan URL halaman donasi dan tempel widget ke OBS, Streamlabs, atau vMix.',
  },
  {
    num: '03',
    title: 'Terima donasi real-time',
    body: 'Notifikasi muncul seketika di stream, dana masuk ke saldo, bisa dicairkan kapan saja.',
  },
];

function StepCard({ step, index, visible }) {
  return (
    <li
      className={`nb-reveal nb-panel nb-panel-hover nb-sweep-border rounded-2xl p-4 sm:p-5 ${
        visible ? 'is-visible' : ''
      }`}
      style={{ transitionDelay: `${index * STAGGER.step}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="nb-anim-pop grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sand-200 to-sand-500 font-sans text-[13px] font-black text-ink-900"
          style={{ animationDelay: `${STAGGER.integrationBase + index * STAGGER.integration}ms` }}
        >
          {step.num}
        </span>
        <h3 className="font-sans text-[15px] font-bold tracking-tight text-sand-100">{step.title}</h3>
      </div>
      <p className="mt-2.5 font-sans text-[13px] leading-relaxed text-sand-300/75">{step.body}</p>
    </li>
  );
}

export default function HowItWorksSection() {
  const { ref, visible } = useReveal({ threshold: 0.1 });

  return (
    <section id="cara-kerja" className="relative border-t border-white/5 bg-ink-950">
      <SectionContainer>
        <div ref={ref}>
          <SectionHeading eyebrow="Cara Kerja" visible={visible}>
            Tiga langkah, <span className="nb-gradient-text">langsung jalan</span>
          </SectionHeading>
        </div>

        <ol className="mt-9 grid gap-3.5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} visible={visible} />
          ))}
        </ol>
      </SectionContainer>
    </section>
  );
}
