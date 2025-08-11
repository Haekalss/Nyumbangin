"use client";

import CreatorDetailModal from '../../components/organisms/CreatorDetailModal';

import StatusBadge from '../../components/atoms/StatusBadge';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import StatsCard from "@/components/StatsCard";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    if (parsedUser.role !== "admin") {
      toast.error("Akses hanya untuk admin!");
      router.push("/");
      return;
    }
    fetchCreators(token);
  }, []);

  const fetchCreators = async (token) => {
    try {
      const res = await axios.get("/api/admin/creators", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCreators(res.data.creators || []);
    } catch (e) {
      toast.error("Gagal memuat data creator");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Konfirmasi hapus pakai toast
    const confirmDelete = () => {
      return new Promise((resolve) => {
        toast((t) => (
          <div className="flex flex-col gap-2 font-mono">
            <div className="font-bold">Yakin ingin menghapus akun creator ini?</div>
            <div className="flex gap-2">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Hapus
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm font-bold"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        ), { duration: Infinity });
      });
    };

    const confirmed = await confirmDelete();
    if (!confirmed) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/admin/creators/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCreators((prev) => prev.filter((c) => c._id !== id));
      toast.success("Akun creator berhasil dihapus");
    } catch (e) {
      toast.error("Gagal menghapus akun creator");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d2d2d]"></div>
      </div>
    );
  }

  // Filter creators by search
  const filteredCreators = creators.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.username?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.displayName?.toLowerCase().includes(q)
    );
  });

  // Logout handler
  const handleLogout = async () => {
    // Konfirmasi logout pakai toast
    const confirmLogout = () => {
      return new Promise((resolve) => {
        toast((t) => (
          <div className="flex flex-col gap-2 font-mono">
            <div className="font-bold">Yakin ingin logout dari admin panel?</div>
            <div className="flex gap-2">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Logout
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm font-bold"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        ), { duration: Infinity });
      });
    };
    const confirmed = await confirmLogout();
    if (!confirmed) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] text-[#2d2d2d] font-mono">
      {/* HEADER */}
      <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg font-mono">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-[#b8a492] tracking-wide font-mono">Nyumbangin Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold border-2 border-red-700 hover:bg-red-700 font-mono text-base transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow w-full font-mono">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Statistik ala dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard title="Total Creator" value={creators.length} />
            <StatsCard title="Payout Lengkap" value={creators.filter((c) => c.payoutAccountNumber && c.payoutAccountHolder).length} />
            <StatsCard title="Belum Lengkap" value={creators.filter((c) => !c.payoutAccountNumber || !c.payoutAccountHolder).length} />
          </div>

          {/* Search Bar */}
          {/* Search bar moved to table header below */}

          {/* Tabel ala dashboard */}
          <div className="bg-[#2d2d2d] border-4 border-[#b8a492] sm:rounded-xl overflow-hidden">
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
                  onChange={e => setSearch(e.target.value)}
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
                      onClick={() => {
                        setSelectedCreator(c);
                        setIsModalOpen(true);
                      }}
                    >
  {/* MODAL DETAIL CREATOR */}
      {isModalOpen && selectedCreator && (
        <CreatorDetailModal
          creator={selectedCreator}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCreator(null);
          }}
        />
      )}
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
                            handleDelete(c._id);
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
        </div>
        {/* MODAL DETAIL CREATOR */}
        {isModalOpen && selectedCreator && (
          <CreatorDetailModal
            creator={selectedCreator}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCreator(null);
            }}
          />
        )}
      </main>
      {/* FOOTER */}
      <footer className="bg-[#2d2d2d] border-t-4 border-[#b8a492] text-[#b8a492] text-center py-4 text-xs font-mono">
        &copy; {new Date().getFullYear()} Nyumbangin Admin Panel
      </footer>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-[#f9f5f0] rounded-lg shadow p-6 flex flex-col items-center font-mono">
      <span className="text-3xl font-extrabold text-[#b8a492]">{value}</span>
      <span className="text-base text-gray-600 mt-2 font-extrabold font-mono">{label}</span>
    </div>
  );
}
