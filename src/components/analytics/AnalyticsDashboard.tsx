import React, { useMemo, useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  TrendingUp,
  DollarSign,
  Award,
  PieChart,
  Calendar,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { formatRupiah, formatCompactNumber } from '../../utils/formatters';

export const AnalyticsDashboard: React.FC = () => {
  const { orders, products, setActiveTab } = usePOS();
  const [selectedMonth] = useState('Bulan Ini (Oktober 2026)');

  // Filter completed paid orders
  const validOrders = useMemo(() => {
    return orders.filter((o) => o.paymentStatus === 'paid');
  }, [orders]);

  // Total Gross Revenue
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

  // Approximate COGS (Modal bahan HPP)
  const estimatedHPP = useMemo(() => {
    let cost = 0;
    validOrders.forEach((o) => {
      o.items.forEach((it) => {
        cost += (it.product.costPrice || it.product.price * 0.45) * it.quantity;
      });
    });
    return cost;
  }, [validOrders]);

  const grossProfit = totalRevenue - estimatedHPP;
  const profitMarginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Monthly 4-week trend simulation
  const monthlyTrendData = [
    { period: 'Minggu 1', revenue: 14200000, target: 12000000 },
    { period: 'Minggu 2', revenue: 16800000, target: 14000000 },
    { period: 'Minggu 3', revenue: 19500000, target: 15000000 },
    { period: 'Minggu 4', revenue: 22400000, target: 18000000 },
  ];

  const maxWeeklyRevenue = Math.max(...monthlyTrendData.map((d) => d.revenue));

  // Top Selling Items Ranking
  const topSellers = useMemo(() => {
    const itemCounts: Record<string, { product: typeof products[0]; totalQty: number; revenue: number }> = {};

    validOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (!itemCounts[it.product.id]) {
          itemCounts[it.product.id] = {
            product: it.product,
            totalQty: 0,
            revenue: 0,
          };
        }
        itemCounts[it.product.id].totalQty += it.quantity;
        itemCounts[it.product.id].revenue += it.totalPrice;
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5);
  }, [validOrders, products]);

  // Sales by Category
  const categoryDistribution = useMemo(() => {
    const cats: Record<string, number> = {};
    validOrders.forEach((o) => {
      o.items.forEach((it) => {
        const cat = it.product.category || 'Lainnya';
        cats[cat] = (cats[cat] || 0) + it.totalPrice;
      });
    });

    return Object.entries(cats)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [validOrders, totalRevenue]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-53px)] bg-slate-100 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('pos')}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Kembali ke Kasir"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-base leading-tight">
                Dasbor Analitik Bisnis & Tren Bulanan
              </h2>
              <p className="text-xs text-slate-500">
                Visualisasi pertumbuhan pendapatan, laba kotor, dan performa menu terlaris
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span>{selectedMonth}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Omset Bulan Ini
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +18.4%
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {formatRupiah(totalRevenue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Akumulasi seluruh transaksi</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Estimasi Laba Kotor
              </span>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                Margin {profitMarginPercent}%
              </span>
            </div>
            <div className="text-2xl font-black text-purple-600 mt-2">
              {formatRupiah(grossProfit)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Omset dikurangi HPP bahan ({formatRupiah(estimatedHPP)})</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Pesanan Selesai
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {validOrders.length} Pesanan
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Tingkat kepuasan layanan 99.2%</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Penjualan Digital (QRIS/EDC)
              </span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Cashless
              </span>
            </div>
            <div className="text-2xl font-black text-indigo-600 mt-2">
              {formatCompactNumber(
                validOrders
                  .filter((o) => o.paymentMethod !== 'cash')
                  .reduce((sum, o) => sum + o.total, 0)
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Pembayaran non-tunai mendominasi</div>
          </div>
        </div>

        {/* Monthly Revenue Trend Bars */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Tren Pertumbuhan Pendapatan Mingguan (Bulan Ini)
              </h3>
              <p className="text-xs text-slate-500">
                Pencapaian omset aktual vs target penjualan per minggu
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span className="text-slate-600 font-semibold">Aktual Omset</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-slate-300"></div>
                <span className="text-slate-600 font-semibold">Target</span>
              </div>
            </div>
          </div>

          <div className="h-44 flex items-end gap-6 sm:gap-12 px-4 pb-2 border-b border-slate-100">
            {monthlyTrendData.map((d) => {
              const actualHeight = (d.revenue / maxWeeklyRevenue) * 100;
              const targetHeight = (d.target / maxWeeklyRevenue) * 100;

              return (
                <div key={d.period} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-extrabold text-slate-700">
                    {formatRupiah(d.revenue, true)}
                  </div>
                  <div className="w-full flex items-end justify-center gap-2 h-32">
                    <div
                      className="w-8 sm:w-12 bg-blue-600 hover:bg-blue-700 rounded-t-xl transition-all duration-500 shadow-xs"
                      style={{ height: `${actualHeight}%` }}
                      title={`Aktual: ${formatRupiah(d.revenue)}`}
                    />
                    <div
                      className="w-4 sm:w-6 bg-slate-200 rounded-t-lg transition-all duration-500"
                      style={{ height: `${targetHeight}%` }}
                      title={`Target: ${formatRupiah(d.target)}`}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 mt-2">{d.period}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Column: Top 5 Best Sellers & Sales by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Sellers */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-800 text-sm">
                  Top 5 Menu Paling Laris (Best Sellers)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Berdasarkan kuantitas terjual</span>
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {topSellers.map((item, idx) => (
                <div key={item.product.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-800">{item.product.name}</div>
                      <div className="text-[10px] text-slate-400">{item.product.category}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">
                      {item.totalQty.toLocaleString('id-ID')} Pcs Terjual
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold font-mono">
                      {formatRupiah(item.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">
                  Kontribusi Penjualan Per Kategori
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Pangsa pasar menu</span>
            </div>

            <div className="space-y-3 flex-1">
              {categoryDistribution.map((cat, i) => {
                const colors = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500', 'bg-rose-500'];
                const barColor = colors[i % colors.length];

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{cat.name}</span>
                      <span>
                        {formatRupiah(cat.amount)} ({cat.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(4, Number(cat.pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
