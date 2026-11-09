export default function StatsCard({ title, value, subtitle, icon, accent = 'light' }) {
  const accents = {
    light: 'bg-[#fffdf9] text-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d]',
    dark: 'bg-[#2d2d2d] text-white shadow-[4px_4px_0px_#b8a492]',
    accent: 'bg-[#f2e4d4] text-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d]',
  };

  const isDark = accent === 'dark';

  return (
    <div
      className={`rounded-2xl border-2 border-[#2d2d2d] p-5 sm:p-6 flex items-start justify-between gap-3 ${
        accents[accent] || accents.light
      }`}
    >
      <div className="min-w-0">
        <p
          className={`text-xs font-extrabold uppercase tracking-wider ${
            isDark ? 'text-[#b8a492]' : 'text-[#8f857b]'
          }`}
        >
          {title}
        </p>
        <p
          className={`mt-1 text-2xl sm:text-3xl font-black tracking-tight ${
            isDark ? 'text-white' : 'text-[#2d2d2d]'
          }`}
        >
          {value}
        </p>
        {subtitle ? (
          <p
            className={`mt-1 text-xs font-medium ${
              isDark ? 'text-white/60' : 'text-[#696057]'
            }`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {icon ? (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#2d2d2d] ${
            isDark
              ? 'bg-[#b8a492] text-[#2d2d2d] shadow-[2px_2px_0px_#fffdf9]'
              : 'bg-[#f2e4d4] text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]'
          }`}
        >
          {icon}
        </div>
      ) : null}
    </div>
  );
}
