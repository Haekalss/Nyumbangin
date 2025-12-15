import { useState } from 'react';

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
    if (confirm('Apakah Anda yakin ingin menghapus feedback ini?')) {
      await onDelete(feedback._id);
      onClose();
      onRefresh();
    }
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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg border-4 border-[#2d2d2d] max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#2d2d2d] text-[#b8a492] p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold mb-2">💬 Detail Feedback</h2>
            <p className="text-[#b8a492]/80 text-sm">
              Diterima pada {formatDate(feedback.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#b8a492] hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sender Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-[#2d2d2d]/60 block mb-1">
                Nama
              </label>
              <p className="text-[#2d2d2d] font-bold">{feedback.name}</p>
            </div>
            <div>              <label className="text-sm font-bold text-[#2d2d2d]/60 block mb-1">
                Email
              </label>
              <p className="text-[#2d2d2d] font-bold">
                <a 
                  href={`mailto:${feedback.email}`}
                  className="text-[#b8a492] hover:underline hover:text-[#d6c6b9]"
                >
                  {feedback.email}
                </a>
              </p>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-bold text-[#2d2d2d]/60 block mb-1">
              Subjek
            </label>
            <p className="text-[#2d2d2d] font-bold text-lg">{feedback.subject}</p>
          </div>          {/* Message */}
          <div>
            <label className="text-sm font-bold text-[#2d2d2d]/60 block mb-1">
              Pesan
            </label>
            <div className="bg-[#f5e9da] border-2 border-[#b8a492] rounded-lg p-4">
              <p className="text-[#2d2d2d] whitespace-pre-wrap">{feedback.message}</p>
            </div>
          </div>          {/* Status */}
          <div>
            <label className="text-sm font-bold text-[#2d2d2d]/60 block mb-2">
              Status
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleStatusChange('unread')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${
                  feedback.status === 'unread'
                    ? 'bg-[#d4a574] text-[#2d2d2d] border-[#d4a574]'
                    : 'bg-transparent text-[#2d2d2d] border-[#b8a492] hover:bg-[#f5e9da]'
                }`}
              >
                🔔 Belum Dibaca
              </button>
              <button
                onClick={() => handleStatusChange('read')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${
                  feedback.status === 'read'
                    ? 'bg-[#b8a492] text-[#2d2d2d] border-[#b8a492]'
                    : 'bg-transparent text-[#2d2d2d] border-[#b8a492] hover:bg-[#d6c6b9]'
                }`}
              >
                👁️ Sudah Dibaca
              </button>
            </div>
          </div>{/* Admin Notes */}
          <div>
            <label className="text-sm font-bold text-[#2d2d2d]/60 block mb-2">
              Catatan Admin (Internal)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows="4"
              placeholder="Tulis catatan internal untuk feedback ini..."
              className="w-full px-4 py-3 bg-[#f5e9da] border-2 border-[#b8a492] rounded-lg text-[#2d2d2d] placeholder-[#2d2d2d]/60 focus:outline-none focus:ring-2 focus:ring-[#b8a492] resize-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="mt-2 px-4 py-2 bg-[#b8a492] text-[#2d2d2d] rounded-lg font-bold hover:bg-[#d6c6b9] disabled:opacity-50 transition-all border-2 border-[#2d2d2d]"
            >
              {isSaving ? '💾 Menyimpan...' : '💾 Simpan Catatan'}
            </button>
          </div>

          {/* Technical Info */}
          <div className="bg-[#f5e9da] border-2 border-[#b8a492] rounded-lg p-4">
            <p className="text-xs font-bold text-[#2d2d2d] mb-2">ℹ️ Informasi Teknis</p>
            <div className="text-xs text-[#2d2d2d]/70 space-y-1">
              <p><strong>IP Address:</strong> {feedback.ipAddress || 'N/A'}</p>
              <p><strong>User Agent:</strong> {feedback.userAgent || 'N/A'}</p>
              <p><strong>ID:</strong> {feedback._id}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#b8a492] p-6 flex justify-between flex-wrap gap-3">
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all border-2 border-red-700"
          >
            🗑️ Hapus Feedback
          </button>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#2d2d2d] text-[#b8a492] rounded-lg font-bold hover:bg-[#3d3d3d] transition-all border-2 border-[#b8a492]"
            >
              Tutup
            </button>            <a
              href={`mailto:${feedback.email}?subject=Re: ${feedback.subject}`}
              className="px-6 py-2 bg-[#b8a492] text-[#2d2d2d] rounded-lg font-bold hover:bg-[#d6c6b9] transition-all border-2 border-[#2d2d2d]"
            >
              📧 Balas via Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
