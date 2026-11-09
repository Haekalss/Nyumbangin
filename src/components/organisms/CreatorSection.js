import { useMemo } from 'react';
import StatusBadge from '../atoms/StatusBadge';
import Card from '../atoms/Card';

export default function CreatorSection({
  creators,
  search,
  onSearchChange,
  onCreatorClick,
  onDelete
}) {
  const creatorsArray = Array.isArray(creators) ? creators : [];

  const filteredCreators = useMemo(() => {
    const query = (search || '').toLowerCase();
    return creatorsArray.filter(c =>
      c.username?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.displayName?.toLowerCase().includes(query)
    );
  }, [creatorsArray, search]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b]">Manajemen</p>
        <h1 className="text-2xl font-black tracking-tight text-[#2d2d2d] sm:text-3xl">Daftar Creator</h1>
        <p className="mt-0.5 text-sm font-medium text-[#696057]">
          Kelola akun creator yang terdaftar di platform.
        </p>
      </div>

      <Card as="section" id="creator" className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b-2 border-[#2d2d2d] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-black text-[#2d2d2d] sm:text-lg">Akun Creator</h2>
            <p className="text-xs font-medium text-[#696057]">
              {filteredCreators.length} dari {creatorsArray.length} creator
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-[#8f857b]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari username, email, atau nama..."
              value={search}
              onChange={onSearchChange}
              className="block w-full rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] py-2 pl-9 pr-3 text-sm font-semibold text-[#2d2d2d] placeholder:text-[#a89c90] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8a492]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b-2 border-[#2d2d2d]/15 bg-[#fbf8f3]">
              <tr>
                {['Username', 'Email', 'Nama', 'Payout', 'Aksi'].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#8f857b] whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#2d2d2d]/10">
              {filteredCreators.map((c, idx) => {
                const hasPayout = Boolean(c.payoutAccountNumber && c.payoutAccountHolder);
                return (
                  <tr
                    key={c._id || c.id || idx}
                    className="cursor-pointer transition hover:bg-[#fbf8f3]"
                    onClick={() => onCreatorClick(c)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-sm font-extrabold text-[#2d2d2d]">
                        @{c.username}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-[#2d2d2d]">{c.email}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-[#2d2d2d]">
                        {c.displayName || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {hasPayout ? (
                        <StatusBadge status="PAID">Lengkap</StatusBadge>
                      ) : (
                        <StatusBadge status="FAILED">Belum</StatusBadge>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(c._id);
                        }}
                        className="rounded-lg border-2 border-red-600 bg-red-50 px-2.5 py-1 text-xs font-extrabold text-red-700 shadow-[1px_1px_0px_#b91c1c] transition hover:bg-red-100 cursor-pointer active:translate-y-0.5"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCreators.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-extrabold text-[#2d2d2d]">
                {search ? 'Creator tidak ditemukan' : 'Belum ada creator terdaftar'}
              </p>
              <p className="mt-1 text-xs font-medium text-[#696057]">
                {search
                  ? 'Coba kata kunci lain untuk menemukan creator.'
                  : 'Akun creator baru akan tampil di sini.'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
