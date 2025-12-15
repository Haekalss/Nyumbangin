import { useState } from 'react';
import FeedbackDetailModal from './FeedbackDetailModal';

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

  const filteredFeedbacks = feedbacks?.filter(feedback => {
    const matchesSearch = search === '' || 
      feedback.name.toLowerCase().includes(search.toLowerCase()) ||
      feedback.email.toLowerCase().includes(search.toLowerCase()) ||
      feedback.subject.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      unread: 'bg-yellow-500 text-white',
      read: 'bg-blue-500 text-white',
      replied: 'bg-green-500 text-white'
    };
    
    const labels = {
      unread: '🔔 Belum Dibaca',
      read: '👁️ Sudah Dibaca',
      replied: '✅ Sudah Dibalas'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
        {labels[status]}
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#b8a492]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 text-red-700">
        <p className="font-bold">❌ Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-[#2d2d2d]">💬 Feedback & Saran</h2>
          <p className="text-[#2d2d2d]/70 mt-1">Kelola pesan dari pengguna</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-[#b8a492] text-[#2d2d2d] rounded-lg font-bold hover:bg-[#d6c6b9] transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border-2 border-[#2d2d2d] rounded-lg p-4">
          <div className="text-[#2d2d2d]/60 text-sm font-bold">Total</div>
          <div className="text-3xl font-extrabold text-[#2d2d2d]">{counts?.all || 0}</div>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
          <div className="text-yellow-700 text-sm font-bold">Belum Dibaca</div>
          <div className="text-3xl font-extrabold text-yellow-600">{counts?.unread || 0}</div>
        </div>
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
          <div className="text-blue-700 text-sm font-bold">Sudah Dibaca</div>
          <div className="text-3xl font-extrabold text-blue-600">{counts?.read || 0}</div>
        </div>
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
          <div className="text-green-700 text-sm font-bold">Sudah Dibalas</div>
          <div className="text-3xl font-extrabold text-green-600">{counts?.replied || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-[#2d2d2d] rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Cari berdasarkan nama, email, atau subjek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border-2 border-[#b8a492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b8a492]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-[#b8a492] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b8a492]"
          >
            <option value="all">Semua Status</option>
            <option value="unread">Belum Dibaca</option>
            <option value="read">Sudah Dibaca</option>
            <option value="replied">Sudah Dibalas</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredFeedbacks?.length === 0 ? (
          <div className="bg-white border-2 border-[#2d2d2d] rounded-lg p-8 text-center">
            <p className="text-[#2d2d2d]/60 font-bold">📭 Tidak ada feedback ditemukan</p>
          </div>
        ) : (
          filteredFeedbacks?.map((feedback) => (
            <div
              key={feedback._id}
              className={`bg-white border-2 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
                feedback.status === 'unread' 
                  ? 'border-yellow-500 bg-yellow-50' 
                  : 'border-[#2d2d2d]'
              }`}
              onClick={() => handleViewDetail(feedback)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#2d2d2d] text-lg">{feedback.name}</h3>
                    {feedback.status === 'unread' && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#2d2d2d]/60">{feedback.email}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(feedback.status)}
                  <span className="text-xs text-[#2d2d2d]/60">
                    {formatDate(feedback.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="mb-2">
                <p className="font-bold text-[#2d2d2d]">📋 {feedback.subject}</p>
              </div>
              
              <p className="text-[#2d2d2d]/70 text-sm line-clamp-2">
                {feedback.message}
              </p>

              {feedback.adminNotes && (
                <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-xs font-bold text-blue-700 mb-1">📝 Catatan Admin:</p>
                  <p className="text-xs text-blue-600">{feedback.adminNotes}</p>
                </div>
              )}
            </div>
          ))
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
