import { useState } from 'react';
import FeedbackDetailModal from './FeedbackDetailModal';
import StatsCard from '../molecules/StatsCard';
import Card from '../atoms/Card';

export default function FeedbackSection({
  feedbacks,
  loading,
  error,
  counts,
  onStatusChange,
  onDelete,
  onRefresh
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetail = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
    // Mark as read when opened
    if (feedback.status === 'unread') {
      onStatusChange(feedback._id, 'read');
    }
  };

  const filteredFeedbacks = (Array.isArray(feedbacks) ? feedbacks : []).filter(feedback => {
    const query = search.toLowerCase();
    const matchesSearch = search === '' ||
      feedback.name?.toLowerCase().includes(query) ||
      feedback.email?.toLowerCase().includes(query) ||
      feedback.subject?.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      unread: 'bg-amber-100 text-amber-800 border-amber-700',
      read: 'bg-[#f2e4d4] text-[#2d2d2d] border-[#2d2d2d]'
    };

    const labels = {
      unread: 'Belum Dibaca',
      read: 'Sudah Dibaca'
    };

    return (
      <span className={`inline-block rounded-md border-2 px-2 py-0.5 text-[11px] font-extrabold shadow-[1px_1px_0px_#2d2d2d] ${styles[status] || styles.read}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#2d2d2d] border-t-transparent" />
          <p className="text-xs font-medium text-[#696057]">Memuat feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b]">Komunikasi</p>
          <h1 className="text-2xl font-black tracking-tight text-[#2d2d2d] sm:text-3xl">Feedback &amp; Saran</h1>
          <p className="mt-0.5 text-sm font-medium text-[#696057]">
            Kelola pesan dan masukan dari pengguna platform.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border-2 border-[#2d2d2d] bg-[#fffdf9] px-4 py-2 text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] transition hover:bg-[#f2e4d4] cursor-pointer active:translate-y-0.5 sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Muat Ulang
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border-2 border-red-600 bg-red-50 p-4 text-red-700 shadow-[4px_4px_0px_#b91c1c]">
          <p className="text-sm font-extrabold">Gagal memuat feedback</p>
          <p className="mt-1 text-xs font-medium">{error}</p>
        </div>
      ) : null}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <StatsCard title="Total Feedback" value={counts?.all || 0} subtitle="Semua pesan masuk" accent="dark" />
        <StatsCard title="Belum Dibaca" value={counts?.unread || 0} subtitle="Perlu ditinjau" accent="accent" />
        <StatsCard title="Sudah Dibaca" value={counts?.read || 0} subtitle="Sudah ditinjau" accent="light" />
      </div>

      {/* Filters */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-[#8f857b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, atau subjek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] py-2.5 pl-9 pr-3 text-sm font-semibold text-[#2d2d2d] placeholder:text-[#a89c90] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8a492]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] px-3 py-2.5 text-sm font-bold text-[#2d2d2d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8a492] cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="unread">Belum Dibaca</option>
            <option value="read">Sudah Dibaca</option>
          </select>
        </div>
      </Card>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredFeedbacks.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] shadow-[2px_2px_0px_#2d2d2d]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-extrabold text-[#2d2d2d]">Tidak ada feedback ditemukan</p>
            <p className="mt-1 text-xs font-medium text-[#696057]">
              Coba ubah kata kunci atau filter status.
            </p>
          </Card>
        ) : (
          filteredFeedbacks.map((feedback, idx) => {
            const isUnread = feedback.status === 'unread';
            return (
              <button
                key={feedback._id || feedback.id || idx}
                type="button"
                onClick={() => handleViewDetail(feedback)}
                className={`w-full rounded-2xl border-2 border-[#2d2d2d] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#2d2d2d] cursor-pointer sm:p-5 ${
                  isUnread
                    ? 'bg-[#fffdf9] shadow-[4px_4px_0px_#b8a492]'
                    : 'bg-[#fffdf9] shadow-[4px_4px_0px_#2d2d2d]'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-[#2d2d2d] sm:text-base">
                        {feedback.name}
                      </h3>
                      {isUnread && (
                        <span className="rounded-md border-2 border-amber-700 bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800 shadow-[1px_1px_0px_#2d2d2d]">
                          BARU
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs font-medium text-[#696057]">
                      {feedback.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {getStatusBadge(feedback.status)}
                    <span className="text-[11px] font-bold text-[#8f857b]">
                      {formatDate(feedback.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold text-[#2d2d2d]">
                    {feedback.subject}
                  </p>
                  {feedback.imageUrl && (
                    <span className="rounded-md border border-[#2d2d2d]/20 bg-[#f2e4d4] px-1.5 py-0.5 text-[10px] font-extrabold text-[#696057]">
                      Ada gambar
                    </span>
                  )}
                </div>

                <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-[#696057] sm:text-sm">
                  {feedback.message}
                </p>

                {feedback.adminNotes && (
                  <div className="mt-3 rounded-xl border-2 border-[#2d2d2d]/20 bg-[#fbf8f3] p-2.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8f857b]">
                      Catatan Admin
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-[#2d2d2d]">
                      {feedback.adminNotes}
                    </p>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedFeedback(null);
          }}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
