"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import HistoryFilters from '@/components/organisms/HistoryFilters';
import HistoryList from '@/components/organisms/HistoryList';
import MobileBlocker from '@/components/MobileBlocker';

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
      
      // Filter only PAID donations
      const paidDonations = allDonations.filter(d => d.status === 'PAID');
      
      // Group by date
      const grouped = paidDonations.reduce((acc, donation) => {
        const date = new Date(donation.createdAt).toLocaleDateString('id-ID');
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
        d.name.toLowerCase().includes(searchLower) ||
        (d.message && d.message.toLowerCase().includes(searchLower))
      )
    })).filter(day => day.donations.length > 0);

    // Recalculate totals
    filtered.forEach(day => {
      day.total = day.donations.reduce((sum, d) => sum + d.amount, 0);
      day.count = day.donations.length;
    });

    setFilteredData(filtered);
  };

  // Calculate total donations for display
  const totalDonations = filteredData.reduce((sum, day) => sum + day.count, 0);

  // Prepare date options for dropdown
  const dateOptions = historyData.map(day => ({
    value: day.date,
    label: `${day.date} • ${day.count} donasi`
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#b8a492]"></div>
      </div>
    );
  }

  return (
    <>
      <MobileBlocker />
      <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492]">
        {/* Header khusus Riwayat */}
        <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#333399] to-[#00fff7] flex items-center justify-center shadow-neon">
                  <span className="text-3xl">📜</span>
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-[#b8a492] tracking-wide font-mono">Riwayat</h1>
                  <p className="text-[#b8a492] text-lg mt-2 font-mono">Semua donasi yang telah kamu terima</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-[#b8a492] hover:bg-[#d6c6b9] text-[#2d2d2d] rounded-lg border-2 border-[#b8a492] font-bold font-mono transition-all"
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <HistoryFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            selectedDate={selectedDate}
            onDateChange={handleDateFilter}
            dateOptions={dateOptions}
            className="mb-6"
          />

          {/* Donation List */}
          <HistoryList
            data={filteredData}
            searchQuery={searchQuery}
            totalDonations={totalDonations}
          />
        </div>
      </div>
    </>
  );
}
