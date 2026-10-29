import React, { useState } from 'react';
import { Product, SelectedModifier } from '../../types/pos';
import { X, Check } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

interface ModifierModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number, selectedModifiers: SelectedModifier[], notes: string) => void;
}

export const ModifierModal: React.FC<ModifierModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMods, setSelectedMods] = useState<Record<string, { label: string; extraPrice: number }>>({});
  const [itemNotes, setItemNotes] = useState('');

  if (!isOpen || !product) return null;

  const handleSelectOption = (groupName: string, label: string, extraPrice: number) => {
    setSelectedMods((prev) => ({
      ...prev,
      [groupName]: { label, extraPrice },
    }));
  };

  const extraTotal = Object.values(selectedMods).reduce((sum, item) => sum + item.extraPrice, 0);
  const unitPrice = product.price + extraTotal;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = () => {
    const modList: SelectedModifier[] = Object.entries(selectedMods).map(([groupName, val]) => ({
      groupName,
      label: val.label,
      extraPrice: val.extraPrice,
    }));
    onConfirm(product, quantity, modList, itemNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="relative h-44 w-full bg-slate-900">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500 text-white inline-block mb-1">
                {product.category}
              </span>
              <h3 className="text-xl font-bold text-white drop-shadow-sm">{product.name}</h3>
              <p className="text-blue-200 font-bold text-sm">
                Mulai dari {formatRupiah(product.price)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[50vh] overflow-y-auto space-y-4">
          {product.modifiers && product.modifiers.length > 0 ? (
            product.modifiers.map((modGroup) => {
              const currentSelected = selectedMods[modGroup.name]?.label;
              return (
                <div key={modGroup.name}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    {modGroup.name}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {modGroup.options.map((opt) => {
                      const isChosen = currentSelected === opt.label;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleSelectOption(modGroup.name, opt.label, opt.extraPrice)}
                          className={`p-2.5 text-left rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                            isChosen
                              ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div>{opt.label}</div>
                            {opt.extraPrice > 0 && (
                              <div className="text-[11px] text-blue-600 font-normal">
                                +{formatRupiah(opt.extraPrice)}
                              </div>
                            )}
                          </div>
                          {isChosen && <Check className="w-4 h-4 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">Tidak ada varian tambahan untuk menu ini.</p>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Catatan Porsi (Opsional)
            </label>
            <input
              type="text"
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              placeholder="Contoh: Es dipisah, jangan terlalu manis"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Jumlah Pesanan
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl border border-slate-300 font-bold text-lg hover:bg-slate-100 flex items-center justify-center text-slate-700"
              >
                -
              </button>
              <div className="flex-1 py-2 text-center font-bold text-slate-800 bg-slate-100 rounded-xl text-base">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl border border-slate-300 font-bold text-lg hover:bg-slate-100 flex items-center justify-center text-slate-700"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Total Harga</div>
            <div className="text-lg font-bold text-[#1976d2]">{formatRupiah(totalPrice)}</div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-bold text-white bg-[#1976d2] hover:bg-blue-700 rounded-xl shadow-md transition"
          >
            Tambah ke Pesanan
          </button>
        </div>
      </div>
    </div>
  );
};
