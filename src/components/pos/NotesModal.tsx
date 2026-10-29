import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { X, MessageSquareQuote } from 'lucide-react';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose }) => {
  const { orderNotes, setOrderNotes } = usePOS();
  const [notes, setNotes] = useState(orderNotes);

  if (!isOpen) return null;

  const quickPresets = [
    'Pisahkan sambal / saus',
    'Gula sedikit (Less sugar)',
    'Jangan pakai sedotan plastik',
    'Sajikan bersamaan',
    'Bungkus rapi (Takeaway)',
    'Alergi kacang / seafood',
  ];

  const handleApply = () => {
    setOrderNotes(notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#1976d2] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5" />
            <h3 className="font-bold text-lg">Catatan Pesanan / Dapur</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Catatan Khusus</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tulis catatan pelanggan atau instruksi khusus untuk koki/barista..."
              className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Pilihan Cepat Catatan</label>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => setNotes((prev) => (prev ? `${prev}, ${qp}` : qp))}
                  className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-lg transition"
                >
                  + {qp}
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
            Simpan Catatan
          </button>
        </div>
      </div>
    </div>
  );
};
