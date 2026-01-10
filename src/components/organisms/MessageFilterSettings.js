"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function MessageFilterSettings() {
  const router = useRouter();
  const [filteredWords, setFilteredWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    fetchFilteredWords();
  }, []);

  const fetchFilteredWords = async () => {
    try {
      const res = await api.get('/api/creator/filtered-words');
      setFilteredWords(res.data.filteredWords || []);
    } catch (error) {
      console.error('Error fetching filtered words:', error);
      // 401 will be handled by axios interceptor
      if (error.response?.status !== 401) {
        toast.error('Gagal memuat data filter');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = () => {
    const word = newWord.trim().toLowerCase();
    
    if (!word) {
      toast.error('Kata tidak boleh kosong');
      return;
    }

    if (word.length > 50) {
      toast.error('Kata maksimal 50 karakter');
      return;
    }

    if (filteredWords.includes(word)) {
      toast.error('Kata sudah ada dalam daftar');
      return;
    }

    if (filteredWords.length >= 100) {
      toast.error('Maksimal 100 kata yang bisa difilter');
      return;
    }

    setFilteredWords([...filteredWords, word]);
    setNewWord('');
  };

  const handleRemoveWord = (word) => {
    setFilteredWords(filteredWords.filter(w => w !== word));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await api.put('/api/creator/filtered-words', { filteredWords });

      toast.success('Filter kata berhasil disimpan');
    } catch (error) {
      console.error('Error saving filtered words:', error);
      if (error.response?.status !== 401) {
        toast.error('Gagal menyimpan filter kata');
      }
    } finally {
      setSaving(false);
    }
  };

  const getFilteredPreview = (message) => {
    if (!message) return '';
    
    let filtered = message;
    filteredWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, (match) => '*'.repeat(match.length));
    });
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6">
        <div className="text-center text-[#b8a492]">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#b8a492] mb-2 font-mono">Filter Pesan Donasi</h3>
        <p className="text-sm text-[#b8a492]/70 font-mono">
          Tambahkan kata-kata yang ingin difilter dari pesan donasi. Kata yang difilter akan diganti dengan *** (bintang).
        </p>
      </div>

      {/* Add Word Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#b8a492] mb-2 font-mono">
          Tambah Kata Filter
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
            placeholder="Ketik kata yang ingin difilter..."
            className="flex-1 px-3 py-2 bg-[#1a1a1a] border-2 border-[#b8a492] rounded-lg text-[#b8a492] placeholder-[#b8a492]/50 focus:outline-none focus:ring-2 focus:ring-[#b8a492] font-mono text-sm"
          />
          <button
            onClick={handleAddWord}
            className="px-4 py-2 bg-[#b8a492] text-[#2d2d2d] rounded-lg font-bold hover:bg-[#d6c6b9] transition-colors font-mono text-sm"
          >
            + Tambah
          </button>
        </div>
        <p className="text-xs text-[#b8a492]/50 mt-1 font-mono">
          {filteredWords.length}/100 kata
        </p>
      </div>

      {/* Filtered Words List */}
      {filteredWords.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#b8a492] mb-2 font-mono">
            Daftar Kata yang Difilter ({filteredWords.length})
          </label>
          <div className="bg-[#1a1a1a] border-2 border-[#b8a492]/30 rounded-lg p-3 max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {filteredWords.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-[#2d2d2d] border border-[#b8a492]/50 rounded px-3 py-1"
                >
                  <span className="text-sm text-[#b8a492] font-mono">{word}</span>
                  <button
                    onClick={() => handleRemoveWord(word)}
                    className="text-red-400 hover:text-red-300 font-bold"
                    title="Hapus kata"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test Preview */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#b8a492] mb-2 font-mono">
          Test Preview Filter
        </label>
        <textarea
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Ketik pesan untuk test filter..."
          rows="3"
          className="w-full px-3 py-2 bg-[#1a1a1a] border-2 border-[#b8a492] rounded-lg text-[#b8a492] placeholder-[#b8a492]/50 focus:outline-none focus:ring-2 focus:ring-[#b8a492] font-mono text-sm resize-none"
        />
        {testMessage && (
          <div className="mt-2 p-3 bg-[#1a1a1a] border-2 border-green-500/30 rounded-lg">
            <p className="text-xs text-[#b8a492]/70 mb-1 font-mono">Hasil filter:</p>
            <p className="text-sm text-[#b8a492] font-mono">{getFilteredPreview(testMessage)}</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#b8a492] text-[#2d2d2d] rounded-lg font-bold hover:bg-[#d6c6b9] transition-colors disabled:opacity-50 font-mono"
        >
          {saving ? 'Menyimpan...' : 'Simpan Filter'}
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-[#b8a492]/70 font-mono">
          💡 <span className="font-bold">Tips:</span> Filter bekerja pada kata utuh (whole word). 
          Contoh: filter "anjing" tidak akan mempengaruhi kata "anjingga".
        </p>
      </div>
    </div>
  );
}
