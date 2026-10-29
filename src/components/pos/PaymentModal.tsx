import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethod } from '../../types/pos';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
  CheckCircle2,
  Printer,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { cartTotals, checkoutOrder, printerSettings, updatePrinterSettings, cafeInfo, customerName, setCustomerName } = usePOS();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [cashAmountInput, setCashAmountInput] = useState<string>('');
  const [qrisStatus, setQrisStatus] = useState<'waiting' | 'paid'>('waiting');
  const [cardRef, setCardRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cartTotals.total;

  // Initialize cash input to exact amount
  useEffect(() => {
    if (isOpen) {
      setCashAmountInput(total.toString());
      setQrisStatus('waiting');
      setCardRef(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const cashPaid = Number(cashAmountInput) || 0;
  const changeDue = Math.max(0, cashPaid - total);
  const isCashSufficient = cashPaid >= total;

  // Quick cash buttons
  const quickCashOptions = [
    { label: 'Uang Pas', amount: total },
    { label: '50.000', amount: 50000 },
    { label: '100.000', amount: 100000 },
    { label: '150.000', amount: 150000 },
    { label: '200.000', amount: 200000 },
    { label: '500.000', amount: 500000 },
  ].filter((opt) => opt.amount >= total || opt.label === 'Uang Pas');

  const handleCompletePayment = () => {
    setIsProcessing(true);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      checkoutOrder(selectedMethod, selectedMethod === 'cash' ? cashPaid : total, cardRef);
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  const handleSimulateQRISScan = () => {
    setQrisStatus('paid');
    setTimeout(() => {
      handleCompletePayment();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#1976d2] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Penyelesaian Pembayaran Kasir</h3>
            <p className="text-xs text-blue-100">Pilih metode bayar digital atau tunai</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total & Customer Name Banner */}
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Nama Pelanggan (Tercetak di Struk)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Pak Budi / Ibu Sarah / Meja 05"
              className="w-full text-xs font-bold text-slate-800 bg-white border border-blue-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Tagihan
            </span>
            <span className="text-2xl font-black text-[#1976d2]">
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Payment Method Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'cash', label: 'Tunai / Cash', icon: Banknote },
              { id: 'qris', label: 'QRIS Digital', icon: QrCode },
              { id: 'debit', label: 'Kartu EDC', icon: CreditCard },
              { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedMethod === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedMethod(tab.id as PaymentMethod)}
                  className={`py-3 px-2 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-bold leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Tunai / Cash */}
          {selectedMethod === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Nominal Uang Diterima (Rp)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={cashAmountInput}
                    onChange={(e) => setCashAmountInput(e.target.value)}
                    placeholder="0"
                    className="w-full text-2xl font-bold px-4 py-3 border-2 border-slate-300 rounded-2xl focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                  {cashAmountInput && (
                    <button
                      type="button"
                      onClick={() => setCashAmountInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Pilihan Cepat Uang Pas & Pecahan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {quickCashOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setCashAmountInput(opt.amount.toString())}
                      className="py-2.5 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-xl text-xs font-bold transition text-center"
                    >
                      {opt.label === 'Uang Pas' ? 'Uang Pas' : formatRupiah(opt.amount, false)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Due (Kembalian) Box */}
              <div
                className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                  isCashSufficient
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    {isCashSufficient ? 'Uang Kembalian Pelanggan' : 'Uang Masih Kurang'}
                  </div>
                  <div className="text-2xl font-black mt-0.5">
                    {formatRupiah(
                      isCashSufficient ? changeDue : Math.abs(total - cashPaid)
                    )}
                  </div>
                </div>
                {isCashSufficient ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                ) : (
                  <span className="text-xs font-bold bg-rose-200 text-rose-800 px-2 py-1 rounded-lg">
                    Kurang
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: QRIS Digital */}
          {selectedMethod === 'qris' && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-3 relative">
                {/* Simulated dynamic QRIS image */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=QRIS-${cafeInfo.name}-${total}`}
                  alt="QRIS Code"
                  className="w-40 h-40 object-contain mx-auto"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 px-2 py-0.5 rounded shadow-xs text-[10px] font-bold text-red-600 border border-red-200">
                  QRIS ASPI
                </div>
              </div>

              <div className="text-xs font-bold text-slate-800 mb-1">
                Scan QRIS dengan BCA, GoPay, OVO, ShopeePay, Dana, dll.
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mb-3">
                Merchant: <strong>{cafeInfo.name}</strong> • Nominal: {formatRupiah(total)}
              </p>

              {qrisStatus === 'waiting' ? (
                <button
                  type="button"
                  onClick={handleSimulateQRISScan}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Simulasikan Pelanggan Scan & Bayar
                </button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-100 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                  Pembayaran QRIS Terverifikasi Berhasil!
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Kartu Debit / EDC */}
          {selectedMethod === 'debit' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nomor Referensi / Approval Code Mesin EDC
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="Contoh: APPR-893821"
                  className="w-full font-mono text-base font-bold p-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  Gesek atau masukkan kartu BCA, Mandiri, BRI, BNI pada terminal EDC cafe, lalu catat kode approval.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: E-Wallet */}
          {selectedMethod === 'ewallet' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Pilih Provider Dompet Digital
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['GoPay', 'OVO', 'DANA', 'ShopeePay'].map((ew) => (
                  <button
                    key={ew}
                    type="button"
                    onClick={() => setCardRef(`${ew}-${Math.floor(100000 + Math.random() * 900000)}`)}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-left font-bold text-xs text-slate-800 transition flex items-center justify-between"
                  >
                    <span>{ew}</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={cardRef}
                onChange={(e) => setCardRef(e.target.value)}
                placeholder="ID Transaksi E-Wallet"
                className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-xl bg-slate-50"
              />
            </div>
          )}

          {/* Printer auto-print toggle checkbox */}
          <div className="flex items-center justify-between p-3 bg-slate-100 rounded-2xl text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-blue-600" />
              Cetak Struk Thermal Otomatis Selesai Bayar
            </span>
            <input
              type="checkbox"
              checked={printerSettings.autoPrintReceipt}
              onChange={(e) =>
                updatePrinterSettings({ autoPrintReceipt: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleCompletePayment}
            disabled={selectedMethod === 'cash' && !isCashSufficient}
            className={`px-8 py-3 rounded-2xl font-extrabold text-sm text-white shadow-lg transition flex items-center gap-2 ${
              selectedMethod === 'cash' && !isCashSufficient
                ? 'bg-slate-300 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Konfirmasi Pembayaran ({formatRupiah(total)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
