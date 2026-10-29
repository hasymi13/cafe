import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { X, Users, UtensilsCrossed } from 'lucide-react';

interface TableSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableSelectModal: React.FC<TableSelectModalProps> = ({ isOpen, onClose }) => {
  const { tableNumber, setTableNumber, pax, setPax, orderType, setOrderType, customerName, setCustomerName } = usePOS();
  const [selectedTable, setSelectedTable] = useState(tableNumber);
  const [selectedPax, setSelectedPax] = useState(pax);
  const [custName, setCustName] = useState(customerName);
  const [type, setType] = useState(orderType);

  if (!isOpen) return null;

  const tables = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'VIP 1', 'VIP 2', 'Outdoor 1', 'Outdoor 2'];

  const handleSave = () => {
    setTableNumber(type === 'TAKE-AWAY' ? '-' : selectedTable);
    setPax(selectedPax);
    setOrderType(type);
    setCustomerName(custName || (type === 'TAKE-AWAY' ? 'Pelanggan Takeaway' : `Meja ${selectedTable}`));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#1976d2] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            <h3 className="font-bold text-lg">Pilih Meja & Tipe Pesanan</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Order Type Toggle */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tipe Layanan</label>
            <div className="grid grid-cols-3 gap-2">
              {(['DINE-IN', 'TAKE-AWAY', 'DELIVERY'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                    type === t
                      ? 'bg-[#1976d2] text-white border-[#1976d2] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Table selection for Dine-in */}
          {type === 'DINE-IN' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Pilih Meja</label>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                {tables.map((tbl) => (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => setSelectedTable(tbl)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition text-center ${
                      selectedTable === tbl
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {tbl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pax Counter */}
          {type === 'DINE-IN' && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Jumlah Tamu (Pax)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPax(Math.max(1, selectedPax - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 font-bold text-lg hover:bg-slate-100 flex items-center justify-center text-slate-700"
                >
                  -
                </button>
                <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 rounded-xl font-bold text-slate-800">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{selectedPax} Orang</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPax(selectedPax + 1)}
                  className="w-10 h-10 rounded-xl border border-slate-200 font-bold text-lg hover:bg-slate-100 flex items-center justify-center text-slate-700"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nama Pelanggan (Opsional)</label>
            <input
              type="text"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="Contoh: Pak Anton / Meja 05"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            onClick={handleSave}
            className="px-6 py-2 text-sm font-bold text-white bg-[#1976d2] hover:bg-blue-700 rounded-xl shadow-md transition"
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
};
