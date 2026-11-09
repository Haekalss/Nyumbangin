"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminData } from "@/hooks/useAdminData";
import AdminSidebar, { adminSections } from "@/components/organisms/AdminSidebar";
import AdminDashboard from "@/components/organisms/AdminDashboard";
import PayoutSection from "@/components/organisms/PayoutSection";
import CreatorSection from "@/components/organisms/CreatorSection";
import FeedbackSection from "@/components/organisms/FeedbackSection";
import PayoutNotesModal from "@/components/organisms/PayoutNotesModal";
import CreatorDetailModal from "../../components/organisms/CreatorDetailModal";
import { confirmToast } from "@/utils/confirmToast";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthChecking } = useAdminAuth();
  const { data, loading, errors, refetch } = useAdminData();

  // UI state
  const [activeSection, setActiveSection] = useState('dashboard');
  const [search, setSearch] = useState("");

  // Modal state
  const [modalState, setModalState] = useState({
    showNotes: false,
    notesType: '',
    notesId: null,
    notesInput: '',
    showCreatorDetail: false,
    selectedCreator: null
  });

  // Handlers
  const openNotesModal = (id, type) => {
    setModalState(prev => ({
      ...prev,
      showNotes: true,
      notesType: type,
      notesId: id,
      notesInput: ''
    }));
  };

  const handleSubmitNotes = async () => {
    if (!modalState.notesId) return;

    try {
      await axios.put(`/api/admin/payouts`, {
        id: modalState.notesId,
        status: modalState.notesType,
        notes: modalState.notesInput
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      toast.success(modalState.notesType === 'PROCESSED' ? 'Payout berhasil diproses!' : 'Payout ditolak!');
      setModalState(prev => ({ ...prev, showNotes: false, notesId: null, notesType: '', notesInput: '' }));
      refetch.payouts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memproses payout!');
    }
  };

  const handleDelete = async (creatorId) => {
    const confirmed = await confirmToast({
      title: 'Hapus creator ini?',
      description: 'Akun creator akan dihapus permanen beserta seluruh data terkait.',
      confirmLabel: 'Hapus',
      danger: true,
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/creators/${creatorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Creator berhasil dihapus!');
      refetch.creators();
    } catch (err) {
      console.error('Delete creator error:', err);
      toast.error(err.response?.data?.error || 'Gagal menghapus creator!');
    }
  };

  const handleFeedbackStatusChange = async (id, status, adminNotes) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put('/api/admin/feedback',
        { id, status, adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Status feedback berhasil diupdate!');
      refetch.feedbacks();
    } catch (err) {
      console.error('Update feedback error:', err);
      toast.error(err.response?.data?.error || 'Gagal mengupdate feedback!');
    }
  };

  const handleFeedbackDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/feedback?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Feedback berhasil dihapus!');
      refetch.feedbacks();
    } catch (err) {
      console.error('Delete feedback error:', err);
      toast.error(err.response?.data?.error || 'Gagal menghapus feedback!');
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirmToast({
      title: 'Yakin ingin keluar?',
      description: 'Kamu perlu masuk kembali untuk mengakses panel admin.',
      confirmLabel: 'Ya, Keluar',
      danger: true,
    });

    if (!confirmed) return;

    try {
      // Set manual logout flag FIRST to prevent "sesi berakhir" toast
      const { sessionManager } = await import('@/utils/sessionManager');
      sessionManager.isManualLogout = true;

      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();

      toast.success('Berhasil logout!', { duration: 1000 });

      setTimeout(() => {
        router.replace('/login');
        sessionManager.isManualLogout = false; // Reset flag
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Gagal logout. Silakan coba lagi.');
    }
  };

  if (isAuthChecking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf8f3] text-[#2d2d2d]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#2d2d2d] border-t-transparent" />
          <p className="text-xs font-medium text-[#8c8276]">Memuat panel admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#2d2d2d] font-sans antialiased">
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 border-b-2 border-[#2d2d2d] bg-[#fffdf9] md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Nyumbangin" className="h-7 w-7 object-contain" />
            <div>
              <span className="block text-sm font-black leading-tight tracking-tight text-[#2d2d2d]">
                nyumbangin
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#8f857b]">
                Admin Panel
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border-2 border-[#2d2d2d] bg-[#fffdf9] px-3 py-1.5 text-xs font-extrabold text-red-600 shadow-[2px_2px_0px_#2d2d2d] transition hover:bg-red-50 cursor-pointer active:translate-y-0.5"
          >
            Keluar
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto px-3 pb-3">
          {adminSections.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`shrink-0 rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                  isActive
                    ? 'border-[#2d2d2d] bg-[#2d2d2d] text-[#fbf8f3] shadow-[2px_2px_0px_#b8a492]'
                    : 'border-[#2d2d2d]/20 bg-[#fffdf9] text-[#2d2d2d] hover:border-[#2d2d2d] hover:bg-[#f2e4d4]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="min-w-0 md:ml-72 min-h-screen flex flex-col justify-between px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-6xl flex-1">
          {activeSection === 'dashboard' && (
            <AdminDashboard
              creators={data.creators}
              payouts={data.payouts}
              donations={data.donations}
            />
          )}

          {activeSection === 'payout' && (
            <PayoutSection
              payouts={data.payouts}
              loading={loading.payouts}
              error={errors.payouts}
              onOpenNotesModal={openNotesModal}
            />
          )}

          {activeSection === 'creator' && (
            <CreatorSection
              creators={data.creators}
              search={search}
              onSearchChange={(e) => setSearch(e.target.value)}
              onCreatorClick={(creator) => setModalState(prev => ({
                ...prev,
                showCreatorDetail: true,
                selectedCreator: creator
              }))}
              onDelete={handleDelete}
            />
          )}

          {activeSection === 'feedback' && (
            <FeedbackSection
              feedbacks={data.feedbacks}
              loading={loading.feedbacks}
              error={errors.feedbacks}
              counts={data.feedbackCounts}
              onStatusChange={handleFeedbackStatusChange}
              onDelete={handleFeedbackDelete}
              onRefresh={refetch.feedbacks}
            />
          )}
        </div>

        {/* Footer Info & Tautan Resmi */}
        <footer className="mx-auto w-full max-w-6xl mt-12 pt-6 border-t-2 border-[#2d2d2d]/15 text-xs font-semibold text-[#696057]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Nyumbangin" className="h-5 w-5 object-contain" />
              <span className="font-extrabold text-[#2d2d2d]">© {new Date().getFullYear()} Nyumbangin</span>
              <span className="hidden sm:inline text-[#8f857b]">• Admin Panel</span>
            </div>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-bold">
              <a href="/privacy" className="transition hover:text-[#2d2d2d] hover:underline">
                Kebijakan Privasi
              </a>
              <a href="/terms" className="transition hover:text-[#2d2d2d] hover:underline">
                Syarat &amp; Ketentuan
              </a>
              <a href="/faq" className="transition hover:text-[#2d2d2d] hover:underline">
                FAQ &amp; Bantuan
              </a>
              <a href="/contact" className="transition hover:text-[#2d2d2d] hover:underline">
                Hubungi Kami
              </a>
            </nav>
          </div>
        </footer>
      </main>

      <PayoutNotesModal
        isOpen={modalState.showNotes}
        type={modalState.notesType}
        notes={modalState.notesInput}
        onNotesChange={(e) => setModalState(prev => ({ ...prev, notesInput: e.target.value }))}
        onClose={() => setModalState(prev => ({ ...prev, showNotes: false }))}
        onSubmit={handleSubmitNotes}
      />

      {modalState.showCreatorDetail && modalState.selectedCreator && (
        <CreatorDetailModal
          creator={modalState.selectedCreator}
          onClose={() => setModalState(prev => ({
            ...prev,
            showCreatorDetail: false,
            selectedCreator: null
          }))}
        />
      )}
    </div>
  );
}
