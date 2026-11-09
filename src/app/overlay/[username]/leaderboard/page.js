'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { formatRupiah } from '@/utils/format';
import Card from '@/components/atoms/Card';

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

  // Fetch leaderboard data dari database (sudah pre-computed)
  const fetchLeaderboardData = async () => {
    try {
      const response = await axios.get(`/api/overlay/leaderboard?username=${username}`);
      
      if (response.data.success && response.data.leaderboard) {
        setLeaderboardData(response.data.leaderboard);
      } else {
        setLeaderboardData([]);
      }
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
    
    // Auto-refresh leaderboard every 10 seconds (polling replacement for socket.io)
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing leaderboard (polling)');
      fetchLeaderboardData();
      fetchOverlayConfig(); // Also refresh config in case it changes
    }, 10000); // Refresh every 10 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [username]);

  if (!username) {
    return null; // Don't render anything if no username
  }

  return (
    <div className="fixed inset-0 font-sans">
      {/* Leaderboard */}
      {overlayConfig.showLeaderboard && leaderboardData.length > 0 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <Card className="p-6 pointer-events-auto" style={{ minWidth: 400, maxWidth: 500 }}>
            <div className="mb-4 flex items-center justify-center gap-2 border-b-2 border-[#2d2d2d]/10 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] text-base shadow-[1px_1px_0px_#2d2d2d]">🏆</span>
              <div className="text-center">
                <p className="text-base font-black text-[#2d2d2d]">Sultan Bulan Ini</p>
                <p className="text-[11px] font-bold text-[#8f857b]">Top donatur leaderboard</p>
              </div>
            </div>
            <div className="space-y-1">
              {leaderboardData.map((donor, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 border-b-2 border-[#2d2d2d]/10 py-2 text-[#2d2d2d] last:border-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-[#2d2d2d] bg-[#b8a492] text-xs font-black shadow-[1px_1px_0px_#2d2d2d]">
                      {idx + 1}
                    </span>
                    <span className="truncate text-sm font-extrabold">{donor.name}</span>
                  </div>
                  <span className="shrink-0 font-mono text-xs font-black">{formatRupiah(donor.totalAmount)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Show placeholder when no data */}
      {(!leaderboardData.length && overlayConfig.showLeaderboard) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <Card className="p-6 pointer-events-auto" style={{ minWidth: 400, maxWidth: 500 }}>
            <div className="mb-4 flex items-center justify-center gap-2 border-b-2 border-[#2d2d2d]/10 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] text-base shadow-[1px_1px_0px_#2d2d2d]">🏆</span>
              <div className="text-center">
                <p className="text-base font-black text-[#2d2d2d]">Sultan Bulan Ini</p>
                <p className="text-[11px] font-bold text-[#8f857b]">Top donatur leaderboard</p>
              </div>
            </div>
            <div className="py-4 text-center text-sm font-medium text-[#696057]">
              Belum ada donasi bulan ini
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
