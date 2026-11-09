import Card from '../atoms/Card';
import { formatRupiah } from '@/utils/format';

const statusConfig = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-700' },
  APPROVED: { label: 'Disetujui', className: 'bg-blue-100 text-blue-800 border-blue-700' },
  PROCESSED: { label: 'Selesai', className: 'bg-emerald-100 text-emerald-800 border-emerald-700' },
  REJECTED: { label: 'Ditolak', className: 'bg-red-100 text-red-800 border-red-700' },
};

function PayoutStatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-[#f2e4d4] text-[#2d2d2d] border-[#2d2d2d]',
  };

  return (
    <span
      className={`inline-block rounded-md border-2 px-2 py-0.5 text-[11px] font-extrabold shadow-[1px_1px_0px_#2d2d2d] ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function PayoutSection({
  payouts,
  loading,
  error,
  onOpenNotesModal
}) {
  const payoutsArray = Array.isArray(payouts) ? payouts : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b]">Keuangan</p>
        <h1 className="text-2xl font-black tracking-tight text-[#2d2d2d] sm:text-3xl">Payout Creator</h1>
        <p className="mt-0.5 text-sm font-medium text-[#696057]">
          Kelola dan proses pengajuan pencairan dana dari para creator.
        </p>
      </div>

      <Card as="section" id="payout" className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b-2 border-[#2d2d2d] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-black text-[#2d2d2d] sm:text-lg">Riwayat Pengajuan Payout</h2>
            <p className="text-xs font-medium text-[#696057]">
              {payoutsArray.length} pengajuan terdaftar
            </p>
          </div>
          <span className="self-start rounded-lg border-2 border-[#2d2d2d] bg-[#f2e4d4] px-2.5 py-1 text-[11px] font-extrabold text-[#2d2d2d] shadow-[1px_1px_0px_#2d2d2d] sm:self-auto">
            {payoutsArray.filter(p => p.status === 'PENDING').length} menunggu
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b-2 border-[#2d2d2d]/15 bg-[#fbf8f3]">
              <tr>
                {['Username', 'Tanggal Request', 'Nominal', 'Status', 'Tanggal Proses', 'Catatan', 'Aksi'].map((label) => (
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-[#2d2d2d] border-t-transparent" />
                    <p className="text-xs font-medium text-[#696057]">Memuat payout...</p>
                  </td>
                </tr>
              ) : payoutsArray.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <p className="text-sm font-extrabold text-[#2d2d2d]">Belum ada pengajuan payout</p>
                    <p className="mt-1 text-xs font-medium text-[#696057]">
                      Pengajuan dari creator akan tampil di sini.
                    </p>
                  </td>
                </tr>
              ) : (
                payoutsArray.map(p => (
                  <tr key={p._id} className="transition hover:bg-[#fbf8f3]">
                    <td className="px-4 py-3 text-sm font-extrabold text-[#2d2d2d] whitespace-nowrap">
                      @{p.creatorUsername}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-[#696057] whitespace-nowrap">
                      {new Date(p.requestedAt).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-sm font-black text-[#2d2d2d] whitespace-nowrap">
                      {formatRupiah(p.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PayoutStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-[#696057] whitespace-nowrap">
                      {p.processedAt ? new Date(p.processedAt).toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="max-w-[220px] px-4 py-3 text-xs font-medium text-[#696057]">
                      {p.adminNote || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg border-2 border-[#2d2d2d] bg-[#2d2d2d] px-3 py-1.5 text-xs font-extrabold text-[#fbf8f3] shadow-[2px_2px_0px_#b8a492] transition hover:bg-black cursor-pointer active:translate-y-0.5"
                            onClick={() => onOpenNotesModal(p._id, 'PROCESSED')}
                          >
                            Proses
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border-2 border-red-600 bg-red-50 px-3 py-1.5 text-xs font-extrabold text-red-700 shadow-[2px_2px_0px_#b91c1c] transition hover:bg-red-100 cursor-pointer active:translate-y-0.5"
                            onClick={() => onOpenNotesModal(p._id, 'REJECTED')}
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-[#a89c90]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {error && (
          <div className="border-t-2 border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
            {error}
          </div>
        )}
      </Card>
    </div>
  );
}
