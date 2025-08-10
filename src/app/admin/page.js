"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] text-[#2d2d2d] font-mono">
      {/* HEADER */}
      <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg font-mono">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
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
  <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8 space-y-8 font-mono">
        {/* Statistik */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatBox label="Total Creator" value={creators.length} />
          <StatBox
            label="Payout Lengkap"
            value={creators.filter(
              (c) => c.payoutAccountNumber && c.payoutAccountHolder
            ).length}
          />
          <StatBox
            label="Belum Lengkap"
            value={creators.filter(
              (c) => !c.payoutAccountNumber || !c.payoutAccountHolder
            ).length}
          />
        </div>

        {/* Search Bar */}
  <div className="mb-4">
          <input
            type="text"
            placeholder="Cari creator..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:max-w-xs px-4 py-2 rounded border-2 border-[#b8a492] bg-[#f5e9da] text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#b8a492] placeholder-[#b8a492] font-mono text-base"
          />
        </div>

        {/* Tabel Creator */}
  <div className="bg-[#f9f5f0] rounded-xl shadow overflow-hidden border-2 border-[#b8a492] text-base">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#2d2d2d] text-[#b8a492] text-base font-extrabold">
              <tr>
                <th className="py-3 px-3 text-left">Username</th>
                <th className="py-3 px-3 text-left">Email</th>
                <th className="py-3 px-3 text-left">Nama</th>
                <th className="py-3 px-3 text-left">Payout</th>
                <th className="py-3 px-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCreators.map((c, i) => (
                <tr
                  key={c._id}
                  className={i % 2 === 0 ? "bg-[#f5e9da]" : "bg-[#f9f5f0]"}
                >
                  <td className="py-3 px-3 border-b border-[#b8a492]/40">{c.username}</td>
                  <td className="py-3 px-3 border-b border-[#b8a492]/40">{c.email}</td>
                  <td className="py-3 px-3 border-b border-[#b8a492]/40">{c.displayName}</td>
                  <td className="py-3 px-3 border-b border-[#b8a492]/40">
                    {c.payoutAccountNumber && c.payoutAccountHolder ? (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                        Lengkap
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">
                        Belum
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 border-b border-[#b8a492]/40">
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-1.5 rounded shadow hover:scale-105 transition-transform text-sm font-bold font-mono"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCreators.length === 0 && (
            <div className="text-center text-gray-600 py-6">
              Belum ada creator terdaftar.
            </div>
          )}
        </div>
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
