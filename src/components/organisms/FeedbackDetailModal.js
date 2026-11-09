import { useState } from 'react';
import Modal from '../atoms/Modal';
import Button from '../atoms/Button';
import { confirmToast } from '@/utils/confirmToast';

export default function FeedbackDetailModal({
  feedback,
  onClose,
  onStatusChange,
  onDelete,
  onRefresh
}) {
  const [adminNotes, setAdminNotes] = useState(feedback.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await onStatusChange(feedback._id, feedback.status, adminNotes);
      onRefresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    await onStatusChange(feedback._id, newStatus, adminNotes);
    onRefresh();
  };

  const handleDelete = async () => {
    const confirmed = await confirmToast({
      title: 'Hapus feedback ini?',
      description: 'Pesan feedback akan dihapus permanen dan tidak bisa dikembalikan.',
      confirmLabel: 'Hapus',
      danger: true,
    });

    if (!confirmed) return;

    await onDelete(feedback._id);
    onClose();
    onRefresh();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUnread = feedback.status === 'unread';

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Detail Feedback"
      maxWidth="max-w-3xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="danger" size="small" onClick={handleDelete}>
            Hapus Feedback
          </Button>
          <Button variant="secondary" size="small" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#2d2d2d]/10 pb-3">
          <p className="text-xs font-bold text-[#8f857b]">
            Diterima pada {formatDate(feedback.createdAt)}
          </p>
          <span
            className={`inline-block rounded-md border-2 px-2 py-0.5 text-[11px] font-extrabold shadow-[1px_1px_0px_#2d2d2d] ${
              isUnread
                ? 'border-amber-700 bg-amber-100 text-amber-800'
                : 'border-[#2d2d2d] bg-[#f2e4d4] text-[#2d2d2d]'
            }`}
          >
            {isUnread ? 'Belum Dibaca' : 'Sudah Dibaca'}
          </span>
        </div>

        {/* Sender */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border-2 border-[#2d2d2d]/15 bg-[#fbf8f3] p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8f857b]">Nama</p>
            <p className="mt-0.5 text-sm font-extrabold text-[#2d2d2d]">{feedback.name}</p>
          </div>
          <div className="rounded-xl border-2 border-[#2d2d2d]/15 bg-[#fbf8f3] p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8f857b]">Email</p>
            <a
              href={`mailto:${feedback.email}`}
              className="mt-0.5 block truncate text-sm font-extrabold text-[#2d2d2d] underline decoration-[#b8a492] decoration-2 hover:text-[#696057]"
            >
              {feedback.email}
            </a>
          </div>
        </div>

        {/* Subject */}
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8f857b]">Subjek</p>
          <p className="mt-1 text-base font-extrabold text-[#2d2d2d]">{feedback.subject}</p>
        </div>

        {/* Message */}
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8f857b]">Pesan</p>
          <div className="mt-1 rounded-xl border-2 border-[#2d2d2d]/15 bg-[#fbf8f3] p-4">
            <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#2d2d2d]">
              {feedback.message}
            </p>
          </div>
        </div>

        {/* Attached Image */}
        {feedback.imageUrl && (
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8f857b]">
              Lampiran Gambar
            </p>
            <div className="mt-1 rounded-xl border-2 border-[#2d2d2d]/15 bg-[#fbf8f3] p-3">
              <img
                src={feedback.imageUrl}
                alt="Lampiran feedback"
                className="mx-auto max-h-80 max-w-full rounded-lg border-2 border-[#2d2d2d]/20 object-contain"
              />
              <a
                href={feedback.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-center text-xs font-extrabold text-[#2d2d2d] underline decoration-[#b8a492] decoration-2 hover:text-[#696057]"
              >
                Buka gambar di tab baru
              </a>
            </div>
          </div>
        )}

        {/* Status */}
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#8f857b]">Status</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleStatusChange('unread')}
              className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-extrabold transition cursor-pointer active:translate-y-0.5 ${
                isUnread
                  ? 'border-[#2d2d2d] bg-amber-100 text-amber-900 shadow-[2px_2px_0px_#2d2d2d]'
                  : 'border-[#2d2d2d]/30 bg-[#fffdf9] text-[#696057] hover:border-[#2d2d2d] hover:bg-[#f2e4d4]'
              }`}
            >
              Belum Dibaca
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('read')}
              className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-extrabold transition cursor-pointer active:translate-y-0.5 ${
                !isUnread
                  ? 'border-[#2d2d2d] bg-[#2d2d2d] text-[#fbf8f3] shadow-[2px_2px_0px_#b8a492]'
                  : 'border-[#2d2d2d]/30 bg-[#fffdf9] text-[#696057] hover:border-[#2d2d2d] hover:bg-[#f2e4d4]'
              }`}
            >
              Sudah Dibaca
            </button>
          </div>
        </div>

        {/* Admin Notes */}
        <div>
          <label
            htmlFor="feedback-notes"
            className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-[#8f857b]"
          >
            Catatan Admin (Internal)
          </label>
          <textarea
            id="feedback-notes"
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Tulis catatan internal untuk feedback ini..."
            className="w-full resize-none rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] px-3.5 py-2.5 text-sm font-medium text-[#2d2d2d] placeholder:text-[#a89c90] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8a492]"
          />
          <Button
            variant="primary"
            size="small"
            className="mt-2"
            onClick={handleSaveNotes}
            disabled={isSaving}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Catatan'}
          </Button>
        </div>

        {/* Technical Info */}
        <div className="rounded-xl border-2 border-[#2d2d2d]/15 bg-[#f2e4d4] p-3">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8f857b]">
            Informasi Teknis
          </p>
          <div className="mt-1 space-y-0.5 font-mono text-[11px] font-medium text-[#696057]">
            <p className="break-all"><strong className="text-[#2d2d2d]">IP:</strong> {feedback.ipAddress || 'N/A'}</p>
            <p className="break-all"><strong className="text-[#2d2d2d]">User Agent:</strong> {feedback.userAgent || 'N/A'}</p>
            <p className="break-all"><strong className="text-[#2d2d2d]">ID:</strong> {feedback._id}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
