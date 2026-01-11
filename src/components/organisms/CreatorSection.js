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
    return creatorsArray.filter(c =>
      c.username?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.displayName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [creatorsArray, search]);

  return (
    <Card as="section" id="creator" className="sm:rounded-xl overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-[#00fff7]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-2xl leading-6 font-extrabold text-[#b8a492] tracking-wide font-mono">Daftar Creator</h3>
          <p className="mt-1 max-w-2xl text-sm text-[#b8a492] font-mono">Kelola akun creator yang terdaftar di platform</p>
        </div>
        <div className="relative w-full sm:w-80 mt-2 sm:mt-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-[#b8a492]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari creator..."
            value={search}
            onChange={onSearchChange}
            className="block w-full pl-10 pr-4 py-2 rounded-lg border-2 border-[#b8a492] bg-[#fbe8d4] text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#b8a492] placeholder-[#b8a492] font-mono text-base shadow-sm transition-all"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#b8a492]/20">
          <thead className="bg-[#2d2d2d]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Username</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Email</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Payout</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-[#2d2d2d] divide-y divide-[#b8a492]/10">
            {filteredCreators.map((c) => (
              <tr
                key={c._id}
                className="hover:bg-[#d6c6b9]/20 transition-all cursor-pointer"
                onClick={() => onCreatorClick(c)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-[#b8a492] font-mono">{c.username}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-[#b8a492] font-mono">{c.email}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-[#b8a492] font-mono">{c.displayName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {c.payoutAccountNumber && c.payoutAccountHolder ? (
                    <StatusBadge status="PAID">Lengkap</StatusBadge>
                  ) : (
                    <StatusBadge status="FAILED">Belum</StatusBadge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDelete(c._id);
                    }}
                    className="text-[#b8a492] hover:text-[#2d2d2d] transition-all font-mono"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCreators.length === 0 && (
          <div className="text-center py-12 text-[#b8a492] font-mono">
            Belum ada creator terdaftar.
          </div>
        )}
      </div>
    </div>
  );
}
