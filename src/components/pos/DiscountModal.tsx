import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { X, Percent, Tag } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({ isOpen, onClose }) => {
  const { discountPercentage, setDiscountPercentage, cartTotals } = usePOS();
  const [discountVal, setDiscountVal] = useState(discountPercentage);

  if (!isOpen) return null;

  const presets = [5, 10, 15, 20, 25, 50];

  const handleApply = () => {
    setDiscountPercentage(discountVal);
    onClose();
  };

  const calculatedDiscount = Math.round((cartTotals.subtotal * discountVal) / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#1976d2] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            <h3 className="font-bold text-lg">Diskon Pesanan</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Persentase Diskon (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={discountVal || ''}
                onChange={(e) => setDiscountVal(Math.min(100, Math.max(0, Number(e.target.value))))}
                placeholder="0"
                className="w-full text-2xl font-bold px-4 py-2 text-center border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">%</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Pilihan Cepat Diskon</label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountVal(pct)}
                  className={`py-2 text-sm font-bold rounded-xl border transition ${
                    discountVal === pct
                      ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center gap-1.5 font-medium">
              <Tag className="w-4 h-4 text-amber-600" />
              Potongan Harga:
            </span>
            <span className="font-bold text-sm text-amber-700">{formatRupiah(calculatedDiscount)}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              setDiscountVal(0);
              setDiscountPercentage(0);
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            Hapus Diskon
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2 text-sm font-bold text-white bg-[#1976d2] hover:bg-blue-700 rounded-xl shadow-md transition"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
};
