import Card from '../atoms/Card';

export default function PayoutSection({ 
  payouts, 
  loading, 
  error, 
  onOpenNotesModal 
}) {
  const payoutsArray = Array.isArray(payouts) ? payouts : [];

  return (
    <Card as="section" id="payout" className="sm:rounded-xl overflow-hidden mb-8">
      <div className="px-4 py-5 sm:px-6 border-b border-[#00fff7]/20">
        <h3 className="text-2xl leading-6 font-extrabold text-[#b8a492] tracking-wide font-mono">
          Riwayat Pengajuan Payout Creator
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-[#b8a492] font-mono">
          Kelola dan proses pengajuan pencairan dana dari para creator
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#b8a492]/20">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Username</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Tanggal Request</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Nominal</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Tanggal Proses</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Catatan</th>
              <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-6 text-[#b8a492]">Memuat...</td></tr>
            ) : payoutsArray.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-6 text-[#b8a492]">Belum ada pengajuan payout</td></tr>
            ) : (
              payoutsArray.map(p => (
                <tr key={p._id}>
                  <td className="px-4 py-2 text-sm text-white">{p.creatorUsername}</td>
                  <td className="px-4 py-2 text-sm text-white">
                    {new Date(p.requestedAt).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-2 text-sm text-white">
                    {p.amount?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                  </td>
                  <td className="px-4 py-2 text-sm font-bold">
                    {p.status === 'PENDING' && <span className="bg-yellow-900/30 text-yellow-200 border border-yellow-400/40 rounded px-2 py-1">Pending</span>}
                    {p.status === 'APPROVED' && <span className="bg-blue-900/30 text-blue-300 border border-blue-400/40 rounded px-2 py-1">Disetujui</span>}
                    {p.status === 'PROCESSED' && <span className="bg-green-900/30 text-green-300 border border-green-400/40 rounded px-2 py-1">Selesai</span>}
                    {p.status === 'REJECTED' && <span className="bg-red-900/30 text-red-300 border border-red-400/40 rounded px-2 py-1">Ditolak</span>}
                  </td>
                  <td className="px-4 py-2 text-sm text-white">
                    {p.processedAt ? new Date(p.processedAt).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-white">{p.adminNote || '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    {p.status === 'PENDING' && (
                      <>
                        <button 
                          className="bg-green-700 text-white px-3 py-1 rounded mr-2 cursor-pointer hover:bg-green-600" 
                          onClick={() => onOpenNotesModal(p._id, 'PROCESSED')}
                        >
                          Proses
                        </button>
                        <button 
                          className="bg-red-700 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600" 
                          onClick={() => onOpenNotesModal(p._id, 'REJECTED')}
                        >
                          Tolak
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {error && <div className="text-red-500 mt-2 text-sm px-4 py-2">{error}</div>}
      </div>
    </Card>
  );
}
