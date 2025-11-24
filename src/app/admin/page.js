"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminData } from "@/hooks/useAdminData";
import AdminSidebar from "@/components/organisms/AdminSidebar";
import AdminDashboard from "@/components/organisms/AdminDashboard";
import PayoutSection from "@/components/organisms/PayoutSection";
import CreatorSection from "@/components/organisms/CreatorSection";
import PayoutNotesModal from "@/components/organisms/PayoutNotesModal";
import CreatorDetailModal from '../../components/organisms/CreatorDetailModal';

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
    if (!confirm('Apakah Anda yakin ingin menghapus creator ini?')) return;
    
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

  const handleLogout = () => {
    toast.dismiss();
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <span className="font-medium">Yakin ingin keluar?</span>
        <div className="flex space-x-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              
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
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Ya, Keluar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Batal
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  if (isAuthChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2d2d2d] mx-auto mb-4"></div>
          <p className="text-[#2d2d2d] font-mono font-bold">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] text-[#2d2d2d] font-mono">
      <AdminSidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow w-full font-mono">
        <div className="ml-72 max-w-6xl mx-auto py-8 px-4 h-screen overflow-y-auto">
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
        </div>
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
