"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import HistoryFilters from '@/components/organisms/HistoryFilters';
import HistoryList from '@/components/organisms/HistoryList';
import CreatorAppLayout from '@/components/dashboard/CreatorAppLayout';
import Link from 'next/link';
import { formatRupiah } from '@/utils/format';

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
    fetchHistoryData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
  };

  const fetchHistoryData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/dashboard/donations?limit=1000', config);
      const allDonations = response.data.data || [];
      
      const paidDonations = allDonations.filter(d => d.status === 'PAID');
      
      const grouped = paidDonations.reduce((acc, donation) => {
        const date = new Date(donation.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        if (!acc[date]) {
          acc[date] = { date, total: 0, count: 0, donations: [] };
        }
        acc[date].total += donation.amount;
        acc[date].count += 1;
        acc[date].donations.push(donation);
        return acc;
      }, {});

      const historyArray = Object.values(grouped).sort((a, b) => 
        new Date(b.donations[0]?.createdAt) - new Date(a.donations[0]?.createdAt)
      );
      
      setHistoryData(historyArray);
      setFilteredData(historyArray);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (date) => {
    setSelectedDate(date);
    if (!date) {
      setFilteredData(historyData);
    } else {
      setFilteredData(historyData.filter(day => day.date === date));
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      handleDateFilter(selectedDate);
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = historyData.map(day => ({
      ...day,
      donations: day.donations.filter(d => 
        (d.name && d.name.toLowerCase().includes(searchLower)) ||
        (d.message && d.message.toLowerCase().includes(searchLower))
      )
    })).filter(day => day.donations.length > 0);

    filtered.forEach(day => {
      day.total = day.donations.reduce((sum, d) => sum + d.amount, 0);
      day.count = day.donations.length;
    });

    setFilteredData(filtered);
  };

  const totalDonations = filteredData.reduce((sum, day) => sum + day.count, 0);
  const totalAmount = filteredData.reduce((sum, day) => sum + day.total, 0);

  const dateOptions = historyData.map(day => ({
    value: day.date,
    label: `${day.date} (${day.count} donasi)`
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f4f0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2d2d2d] border-t-transparent mx-auto mb-3"></div>
          <p className="text-xs font-medium text-[#8c8276]">Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <CreatorAppLayout user={user}>
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#8f857b] mb-1">
          <Link href="/dashboard" className="hover:text-[#2d2d2d] transition">Dashboard</Link>
          <span>/</span>
          <span className="text-[#2d2d2d] font-extrabold">Riwayat</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2d2d2d] tracking-tight">Riwayat Donasi</h1>
        <p className="text-sm font-medium text-[#696057] mt-0.5">Seluruh apresiasi yang berhasil diterima.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-5 shadow-[4px_4px_0px_#2d2d2d]">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b] block">Total Transaksi</span>
          <span className="text-2xl font-black text-[#2d2d2d] mt-1 block">{totalDonations} donasi</span>
        </div>
        <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#2d2d2d] p-5 shadow-[4px_4px_0px_#b8a492] text-white">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#b8a492] block">Total Nominal</span>
          <span className="text-2xl font-black text-white mt-1 block">{formatRupiah(totalAmount)}</span>
        </div>
        <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-5 shadow-[4px_4px_0px_#2d2d2d]">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b] block">Periode Aktif</span>
          <span className="text-2xl font-black text-[#2d2d2d] mt-1 block">{filteredData.length} hari</span>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5">
        <HistoryFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          selectedDate={selectedDate}
          onDateChange={handleDateFilter}
          dateOptions={dateOptions}
        />
      </div>

      {/* List */}
      <HistoryList
        data={filteredData}
        searchQuery={searchQuery}
        totalDonations={totalDonations}
      />
    </CreatorAppLayout>
  );
}
