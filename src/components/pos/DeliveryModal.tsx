import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { X, Truck } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({ isOpen, onClose }) => {
  const { deliveryCost, setDeliveryCost } = usePOS();
  const [cost, setCost] = useState(deliveryCost);

  if (!isOpen) return null;

  const presets = [0, 5000, 10000, 15000, 20000, 25000];

  const handleApply = () => {
    setDeliveryCost(cost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#1976d2] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <h3 className="font-bold text-lg">Biaya Pengiriman / Ongkir</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nominal Ongkir (Rp)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={cost || ''}
              onChange={(e) => setCost(Math.max(0, Number(e.target.value)))}
              placeholder="0"
              className="w-full text-xl font-bold px-4 py-2.5 text-center border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Preset Ongkir</label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCost(p)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    cost === p
                      ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p === 0 ? 'Gratis' : formatRupiah(p, false)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2 text-sm font-bold text-white bg-[#1976d2] hover:bg-blue-700 rounded-xl shadow-md transition"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
