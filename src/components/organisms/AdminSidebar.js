'use client';

export const adminSections = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    key: 'creator',
    label: 'Creator',
    icon: (
      <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    key: 'payout',
    label: 'Payout',
    icon: (
      <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    key: 'feedback',
    label: 'Feedback',
    icon: (
      <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ activeSection, setActiveSection, onLogout }) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col justify-between border-r-2 border-[#2d2d2d] bg-[#fffdf9] px-4 py-6 md:flex">
      <div className="space-y-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Nyumbangin" className="h-9 w-9 object-contain" />
          <div>
            <span className="block text-base font-black leading-tight tracking-tight text-[#2d2d2d]">
              nyumbangin
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8f857b]">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Identity */}
        <div className="flex items-center gap-3 rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] p-3 shadow-[2px_2px_0px_#2d2d2d]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#2d2d2d] bg-[#fffdf9] text-xs font-extrabold uppercase text-[#2d2d2d]">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-[#2d2d2d]">Administrator</p>
            <p className="font-mono text-[11px] font-bold text-[#696057]">@admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {adminSections.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left text-sm font-extrabold transition cursor-pointer ${
                  isActive
                    ? 'border-[#2d2d2d] bg-[#2d2d2d] text-[#fbf8f3] shadow-[3px_3px_0px_#b8a492]'
                    : 'border-transparent text-[#2d2d2d] hover:border-[#2d2d2d] hover:bg-[#f2e4d4] hover:shadow-[2px_2px_0px_#2d2d2d]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t-2 border-[#2d2d2d] pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl border-2 border-transparent px-3.5 py-2.5 text-left text-sm font-extrabold text-red-600 transition hover:border-[#2d2d2d] hover:bg-red-50 hover:shadow-[2px_2px_0px_#2d2d2d] cursor-pointer active:translate-y-0.5"
        >
          <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
