import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
  TrendingUp,
  Receipt,
  ArrowLeft,
  Printer,
} from 'lucide-react';
import { formatRupiah, formatDateTime, formatTime } from '../../utils/formatters';
import { exportOrdersToExcel, exportOrdersToPDF } from '../../utils/exportUtils';

export const DailyReport: React.FC = () => {
  const { orders, cafeInfo, setActiveTab, setReceiptOrderToView, setIsReceiptModalOpen, currentShift } = usePOS();

  // Date filter (defaults to today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => o.createdAt.startsWith(selectedDate));
  }, [orders, selectedDate]);

  const paidOrders = useMemo(() => {
    return filteredOrders.filter((o) => o.paymentStatus === 'paid');
  }, [filteredOrders]);

  // Aggregate metrics
  const totalGrossRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSubtotal = paidOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalTax = paidOrders.reduce((sum, o) => sum + o.tax, 0);
  const totalService = paidOrders.reduce((sum, o) => sum + o.serviceCharge, 0);
  const totalDiscount = paidOrders.reduce((sum, o) => sum + o.discountAmount, 0);
  const averageOrderValue = paidOrders.length > 0 ? Math.round(totalGrossRevenue / paidOrders.length) : 0;

  // Breakdown by payment methods
  const cashTotal = paidOrders.filter((o) => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0);
  const qrisTotal = paidOrders.filter((o) => o.paymentMethod === 'qris').reduce((sum, o) => sum + o.total, 0);
  const debitTotal = paidOrders.filter((o) => o.paymentMethod === 'debit' || o.paymentMethod === 'credit').reduce((sum, o) => sum + o.total, 0);
  const ewalletTotal = paidOrders.filter((o) => o.paymentMethod === 'ewallet').reduce((sum, o) => sum + o.total, 0);

  // Hourly distribution
  const hourlyData = useMemo(() => {
    const hours: Record<number, number> = {};
    for (let h = 8; h <= 22; h++) hours[h] = 0;

    paidOrders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      if (hours[h] !== undefined) {
        hours[h] += o.total;
      }
    });

    const maxVal = Math.max(...Object.values(hours), 1);
    return Object.entries(hours).map(([hour, val]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      val,
      pct: (val / maxVal) * 100,
    }));
  }, [paidOrders]);

  const handleExportExcel = () => {
    exportOrdersToExcel(filteredOrders, cafeInfo, `Tanggal ${selectedDate}`);
  };

  const handleExportPDF = () => {
    exportOrdersToPDF(filteredOrders, cafeInfo, `Tanggal ${selectedDate}`);
  };

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
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-base leading-tight">
                Laporan Penjualan Harian & Kas Kasir
              </h2>
              <p className="text-xs text-slate-500">
                Data rekonsiliasi transaksi, rincian pembayaran digital, dan penutupan shift
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter & Export Triggers */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>Ekspor PDF Resmi</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Omset Penjualan (Gross)
            </div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {formatRupiah(totalGrossRevenue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Dari {paidOrders.length} transaksi selesai
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Rata-Rata Nilai Tiket (AOV)
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {formatRupiah(averageOrderValue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Rata-rata belanja per meja
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pajak Resto PB1 (10%)
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {formatRupiah(totalTax)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Kewajiban setoran pajak daerah
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Service Charge (5%)
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {formatRupiah(totalService)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Alokasi tim barista & service
            </div>
          </div>
        </div>

        {/* Breakdown by Payment Methods */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <h3 className="font-extrabold text-slate-800 text-sm mb-4">
            Rincian Penerimaan Menurut Metode Pembayaran
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-semibold uppercase">Uang Tunai (Cash)</div>
                <div className="text-base font-black text-slate-800">{formatRupiah(cashTotal)}</div>
                <div className="text-[10px] text-slate-400">
                  {totalGrossRevenue > 0 ? ((cashTotal / totalGrossRevenue) * 100).toFixed(1) : 0}% dari total
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-semibold uppercase">QRIS Digital</div>
                <div className="text-base font-black text-slate-800">{formatRupiah(qrisTotal)}</div>
                <div className="text-[10px] text-slate-400">
                  {totalGrossRevenue > 0 ? ((qrisTotal / totalGrossRevenue) * 100).toFixed(1) : 0}% dari total
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-semibold uppercase">Kartu Debit / EDC</div>
                <div className="text-base font-black text-slate-800">{formatRupiah(debitTotal)}</div>
                <div className="text-[10px] text-slate-400">
                  {totalGrossRevenue > 0 ? ((debitTotal / totalGrossRevenue) * 100).toFixed(1) : 0}% dari total
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-semibold uppercase">E-Wallet Apps</div>
                <div className="text-base font-black text-slate-800">{formatRupiah(ewalletTotal)}</div>
                <div className="text-[10px] text-slate-400">
                  {totalGrossRevenue > 0 ? ((ewalletTotal / totalGrossRevenue) * 100).toFixed(1) : 0}% dari total
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Peak Hours Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm">
              Tren Volume Penjualan Jam Per Jam (Peak Hours)
            </h3>
            <span className="text-xs text-slate-500">Jam Operasional: 08:00 - 22:00</span>
          </div>
          <div className="h-32 flex items-end gap-1.5 sm:gap-2 pt-4">
            {hourlyData.map((d) => (
              <div key={d.hour} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {formatRupiah(d.val, false)}
                </div>
                <div
                  className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all duration-300 min-h-[4px]"
                  style={{ height: `${Math.max(6, d.pct)}%` }}
                />
                <span className="text-[10px] text-slate-400 font-mono -rotate-45 sm:rotate-0 mt-1">
                  {d.hour.slice(0, 2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Cashier Balance Box */}
        <div className="bg-blue-50/80 rounded-2xl p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-blue-900 text-sm">
              Rekonsiliasi Kas Laci Kasir (Shift Aktif)
            </h3>
            <span className="text-xs bg-blue-200/80 text-blue-900 px-2.5 py-0.5 rounded-full font-bold">
              Kasir: {currentShift.cashierName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-blue-100">
              <span className="text-slate-500">Modal Kas Awal:</span>
              <div className="text-base font-bold text-slate-800 mt-0.5">
                {formatRupiah(currentShift.startingCash)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-100">
              <span className="text-slate-500">Total Penjualan Tunai Hari Ini:</span>
              <div className="text-base font-bold text-emerald-600 mt-0.5">
                +{formatRupiah(cashTotal)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-100">
              <span className="text-slate-500">Total Fisik Uang di Laci:</span>
              <div className="text-base font-black text-blue-700 mt-0.5">
                {formatRupiah(currentShift.startingCash + cashTotal)}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table for selected day */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm">
              Daftar Riwayat Transaksi ({filteredOrders.length} Pesanan)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">No. Order</th>
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3">Tipe & Meja</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Metode</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-center">Cetak Ulang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada transaksi pada tanggal ini
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">
                        {formatTime(ord.createdAt)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-800">{ord.orderType}</span>
                        {ord.tableNumber && ord.tableNumber !== '-' && (
                          <span className="text-slate-400 text-[10px] ml-1">
                            (M{ord.tableNumber})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate">
                        {ord.items.map((it) => `${it.product.name} (${it.quantity}x)`).join(', ')}
                      </td>
                      <td className="py-2.5 px-3 uppercase text-[11px] font-bold text-slate-700">
                        {ord.paymentMethod || 'Belum Bayar'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-800 font-mono">
                        {formatRupiah(ord.total)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'cooking'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptOrderToView(ord);
                            setIsReceiptModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Pratinjau / Cetak Struk Ulang"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
