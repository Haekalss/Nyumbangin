'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { formatRupiah } from '@/utils/format';
import { SOCKET_SERVER_URL } from '@/constants/realtime';
import io from 'socket.io-client';

export default function LeaderboardOverlay() {
  const params = useParams();
  const username = params?.username;
  
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [overlayConfig, setOverlayConfig] = useState({
    showLeaderboard: true,
    leaderboardSize: "medium",
    leaderboardPosition: "top-right"
  });

  // Fetch overlay configuration
  const fetchOverlayConfig = async () => {
    try {
      const response = await axios.get(`/api/overlay-config?username=${username}`);
      setOverlayConfig(response.data);
    } catch (error) {
      console.error('Error fetching overlay config:', error);
      // Use default config if API fails or user doesn't exist
      setOverlayConfig({
        showLeaderboard: true,
        leaderboardSize: "medium",
        leaderboardPosition: "top-right"
      });
    }
  };

  // Fetch leaderboard data - menggunakan perhitungan yang sama dengan dashboard
  const fetchLeaderboardData = async () => {
    try {
      // Ambil semua donasi untuk creator ini dengan parameter all=true
      const allDonationsResponse = await axios.get(`/api/donate/${username}?all=true`);
      if (!allDonationsResponse.data.success) {
        setLeaderboardData([]);
        return;
      }
      
      const allDonations = allDonationsResponse.data.donations || [];
      
      // Get current month and year for MONTHLY leaderboard (reset per bulan)
      const now = new Date();
      const currentMonth = now.getMonth(); // Juli = 6
      const currentYear = now.getFullYear(); // 2025
      
      // Filter donations for current month ONLY - leaderboard reset setiap bulan
      // Semua donasi di bulan Juli (termasuk tanggal 27, 28, dst) harus masuk
      // DAN hanya yang sudah PAID yang masuk leaderboard
      const thisMonthDonations = allDonations.filter(donation => {
        const donationDate = new Date(donation.createdAt);
        const donationMonth = donationDate.getMonth();
        const donationYear = donationDate.getFullYear();
        
        // Hanya donasi yang sudah paid dan di bulan ini
        return donationMonth === currentMonth && 
               donationYear === currentYear && 
               donation.payment_status === 'paid';
      });
      
      // Group donations by donor name and sum amounts - SAMA PERSIS DENGAN DASHBOARD
      const grouped = thisMonthDonations.reduce((acc, donation) => {
        // Check both name and donorName fields
        const name = donation.name || donation.donorName || 'Anonymous';
        
        if (!acc[name]) {
          acc[name] = {
            name,
            totalAmount: 0,
            donationCount: 0,
            lastDonation: donation.createdAt
          };
        }
        acc[name].totalAmount += donation.amount;
        acc[name].donationCount += 1;
        if (new Date(donation.createdAt) > new Date(acc[name].lastDonation)) {
          acc[name].lastDonation = donation.createdAt;
        }
        return acc;
      }, {});

      // Convert to array and sort by total amount - Top 5 for overlay
      const leaderboardArray = Object.values(grouped)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5); // Top 5 donors untuk overlay

      setLeaderboardData(leaderboardArray);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      // Set empty leaderboard if user doesn't exist or API fails
      setLeaderboardData([]);
    }
  };

  // Get leaderboard size classes
  const getLeaderboardSizeClasses = () => {
    switch (overlayConfig.leaderboardSize) {
      case 'small':
        return 'text-xs p-2 w-64';
      case 'large':
        return 'text-base p-4 w-80';
      default: // medium
        return 'text-sm p-3 w-72';
    }
  };

  // Get leaderboard position classes
  const getLeaderboardPositionClasses = () => {
    switch (overlayConfig.leaderboardPosition) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default: // top-right
        return 'top-4 right-4';
    }
  };

  useEffect(() => {
    if (!username) return;

    // Fetch initial data
    fetchOverlayConfig();
    fetchLeaderboardData();
    
    // Connect to socket.io server to refresh leaderboard when new donations come
  const socketUrl = SOCKET_SERVER_URL;
    const socket = io(socketUrl);
    
    socket.on('connect', () => {
      console.log('Leaderboard connected to socket server:', socketUrl);
    });
    
    socket.on('new-donation', (data) => {
      // Only refresh if donation is for this username
      if (data.ownerUsername && data.ownerUsername === username) {
        console.log('Refreshing leaderboard for new donation');
        fetchLeaderboardData();
      }
    });

    // Set up interval to refresh leaderboard data periodically
    const refreshInterval = setInterval(() => {
      fetchLeaderboardData();
      fetchOverlayConfig(); // Also refresh config in case it changes
    }, 60 * 1000); // Refresh every minute

    return () => {
      socket.disconnect();
      clearInterval(refreshInterval);
    };
  }, [username]);

  if (!username) {
    return null; // Don't render anything if no username
  }

  return (
    <div className="fixed inset-0 font-mono">
      {/* Leaderboard */}
      {overlayConfig.showLeaderboard && leaderboardData.length > 0 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 pointer-events-auto" style={{ minWidth: 400, maxWidth: 500 }}>
            <div className="text-center text-[#b8a492] font-mono font-bold mb-4 text-lg">
              🏆 Top Donatur Bulan Ini
            </div>
            <div className="space-y-2">
              {leaderboardData.map((donor, idx) => (
                <div key={idx} className="text-[#b8a492] font-mono flex justify-between items-center py-1">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-[#b8a492] text-[#2d2d2d] rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <span className="truncate text-base">{donor.name}</span>
                  </div>
                  <span className="text-sm font-bold">{formatRupiah(donor.totalAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show placeholder when no data */}
      {(!leaderboardData.length && overlayConfig.showLeaderboard) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 pointer-events-auto" style={{ minWidth: 400, maxWidth: 500 }}>
            <div className="text-center text-[#b8a492] font-mono font-bold mb-4 text-lg">
              🏆 Top Donatur Bulan Ini
            </div>
            <div className="text-center text-[#b8a492] font-mono text-base opacity-70 py-4">
              Belum ada donasi bulan ini
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        body, .font-mono { font-family: 'IBM Plex Mono', 'Fira Mono', 'Roboto Mono', monospace; }
      `}</style>
    </div>
  );
}
