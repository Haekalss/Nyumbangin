'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 * Membaca user yang tersimpan di localStorage.
 * Dipakai untuk menampilkan tombol Dashboard / Panel Admin di landing page.
 */
export default function useLandingSession() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    let parsed = null;

    if (token && rawUser) {
      try {
        parsed = JSON.parse(rawUser);
      } catch {
        // Data rusak → bersihkan
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setUser(parsed);
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <span className="font-medium">Yakin ingin keluar?</span>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              toast.success('Berhasil logout!');
            }}
            className="rounded bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
          >
            Ya, Keluar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded bg-gray-500 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
          >
            Batal
          </button>
        </div>
      </div>
    ));
  }, []);

  return { user, ready, logout };
}
