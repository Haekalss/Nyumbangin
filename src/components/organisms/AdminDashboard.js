import { useMemo, useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import StatsCard from '../molecules/StatsCard';

Chart.register(...registerables);

export default function AdminDashboard({ creators, payouts, donations }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const creatorsArray = Array.isArray(creators) ? creators : [];
  const payoutsArray = Array.isArray(payouts) ? payouts : [];
  const donationsArray = Array.isArray(donations) ? donations : [];

  const topCreators = useMemo(() => {
    const donationByCreator = {};
    donationsArray.forEach(d => {
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
  }, [donationsArray, creatorsArray]);

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
          label: 'Total Donasi',
          data: topCreators.map(c => c.totalDonation),
          backgroundColor: ['#b8a492', '#d6c6b9', '#f2e4d4', '#b8a492aa', '#d6c6b9aa'],
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
            display: false
          },
          tooltip: {
            backgroundColor: '#2d2d2d',
            titleColor: '#fffdf9',
            bodyColor: '#fffdf9',
            borderColor: '#b8a492',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
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
            ticks: { color: '#696057', font: { weight: 'bold', size: 12 }, maxRotation: 45 },
            grid: { color: '#2d2d2d11', drawOnChartArea: false },
            border: { color: '#2d2d2d' }
          },
          y: {
            ticks: {
              color: '#696057',
              font: { size: 11 },
              callback: function(value) {
                return value.toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
              }
            },
            grid: { color: '#2d2d2d11' },
            border: { color: '#2d2d2d' },
            beginAtZero: true
          }
        },
        animation: { duration: 800, easing: 'easeInOutQuart' }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [topCreators]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b]">Panel Admin</p>
        <h1 className="text-2xl font-black tracking-tight text-[#2d2d2d] sm:text-3xl">Dashboard Admin</h1>
        <p className="mt-0.5 text-sm font-medium text-[#696057]">
          Ringkasan performa platform dan aktivitas creator Nyumbangin.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <StatsCard
          title="Total Creator"
          value={creatorsArray.length}
          subtitle="Akun terdaftar"
          accent="dark"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Payout"
          value={payoutsArray.length}
          subtitle="Pengajuan pencairan"
          accent="light"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatsCard
          title="Payout Selesai"
          value={payoutsArray.filter(p => p.status === 'PROCESSED').length}
          subtitle="Berhasil dicairkan"
          accent="accent"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Chart */}
      <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] shadow-[4px_4px_0px_#2d2d2d]">
        <div className="flex flex-col gap-1 border-b-2 border-[#2d2d2d] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-black text-[#2d2d2d] sm:text-lg">Top 5 Creator Paling Aktif</h2>
            <p className="text-xs font-medium text-[#696057]">Berdasarkan total donasi yang diterima</p>
          </div>
          <span className="mt-1 self-start rounded-lg border-2 border-[#2d2d2d] bg-[#f2e4d4] px-2.5 py-1 text-[11px] font-extrabold text-[#2d2d2d] shadow-[1px_1px_0px_#2d2d2d] sm:mt-0 sm:self-auto">
            {donationsArray.length} donasi
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {topCreators.length > 0 ? (
            <div className="h-[320px] sm:h-[380px]">
              <canvas ref={chartRef} />
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-extrabold text-[#2d2d2d]">Belum ada data donasi</p>
              <p className="mx-auto mt-1 max-w-xs text-xs font-medium text-[#696057]">
                Grafik akan muncul setelah ada donasi dari creator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
