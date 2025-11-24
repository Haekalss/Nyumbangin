import { useMemo, useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import StatsCard from '../StatsCard';

Chart.register(...registerables);

export default function AdminDashboard({ creators, payouts, donations }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const creatorsArray = Array.isArray(creators) ? creators : [];
  const payoutsArray = Array.isArray(payouts) ? payouts : [];

  const topCreators = useMemo(() => {
    const donationByCreator = {};
    donations.forEach(d => {
      if (!donationByCreator[d.createdByUsername]) donationByCreator[d.createdByUsername] = 0;
      donationByCreator[d.createdByUsername] += d.amount || 0;
    });
    
    return creatorsArray
      .map(c => ({
        username: c.username,
        displayName: c.displayName,
        totalDonation: donationByCreator[c.username] || 0
      }))
      .sort((a, b) => b.totalDonation - a.totalDonation)
      .slice(0, 5);
  }, [donations, creatorsArray]);

  useEffect(() => {
    if (!chartRef.current || topCreators.length === 0) return;
    
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: topCreators.map(c => c.displayName || c.username),
        datasets: [{
          label: 'Total Donasi (Rp)',
          data: topCreators.map(c => c.totalDonation),
          backgroundColor: ['#b8a492', '#d6c6b9', '#f5e9da', '#b8a492aa', '#d6c6b9aa'],
          borderColor: '#2d2d2d',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: true,
            labels: { color: '#b8a492', font: { size: 14, weight: 'bold' } }
          },
          title: {
            display: true,
            text: 'Top 5 Creator Paling Aktif (Total Donasi)',
            color: '#b8a492',
            font: { size: 20, weight: 'bold' },
            padding: 20
          },
          tooltip: {
            backgroundColor: '#2d2d2d',
            titleColor: '#b8a492',
            bodyColor: '#ffffff',
            borderColor: '#b8a492',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `Total Donasi: ${context.parsed.y.toLocaleString('id-ID', { 
                  style: 'currency', 
                  currency: 'IDR' 
                })}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#b8a492', font: { weight: 'bold', size: 12 }, maxRotation: 45 },
            grid: { color: '#b8a49222', drawOnChartArea: false }
          },
          y: {
            ticks: { 
              color: '#b8a492',
              font: { size: 12 },
              callback: function(value) {
                return value.toLocaleString('id-ID', { 
                  style: 'currency', 
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
              }
            },
            grid: { color: '#b8a49222' },
            beginAtZero: true
          }
        },
        animation: { duration: 1000, easing: 'easeInOutQuart' }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [topCreators]);

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-extrabold text-[#2d2d2d] mb-4">Dashboard Admin</h2>
      <p className="text-[#2d2d2d] mb-2">Selamat datang di panel admin Nyumbangin. Silakan pilih menu di sidebar untuk mengelola data.</p>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
        <StatsCard title="Total Creator" value={creatorsArray.length} />
        <StatsCard title="Total Payout" value={payoutsArray.length} />
        <StatsCard 
          title="Payout Selesai" 
          value={payoutsArray.filter(p => p.status === 'PROCESSED').length} 
        />
      </div>

      {/* Bar Chart for Top Creators */}
      <div className="mt-10 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-xl p-6">
        {topCreators.length > 0 ? (
          <canvas ref={chartRef} style={{ height: '400px' }} />
        ) : (
          <div className="text-center py-12 text-[#b8a492]">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <p className="text-lg font-bold">Belum ada data donasi untuk ditampilkan</p>
            <p className="text-sm opacity-75 mt-2">Grafik akan muncul setelah ada donasi dari creator</p>
          </div>
        )}
      </div>
    </div>
  );
}
