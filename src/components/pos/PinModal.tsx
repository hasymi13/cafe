import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { X, ShieldCheck, Lock, UserCheck, AlertCircle } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'owner' | 'cashier';
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, targetRole }) => {
  const { currentUser, staffList, loginWithPin, switchUser } = usePOS();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const verifyPin = (pinToTest: string) => {
    const success = loginWithPin(pinToTest);
    if (success) {
      onClose();
      setPin('');
      setError('');
    } else {
      setError('PIN salah. Coba lagi (Pemilik: 1234, Kasir: 0000)');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-[#1976d2] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-base">
              {targetRole === 'owner' ? 'Akses Pemilik (Owner)' : 'Ganti Staf Kasir'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
            <Lock className="w-8 h-8" />
          </div>

          <h4 className="font-bold text-slate-800 text-lg">Masukkan 4-Digit PIN</h4>
          <p className="text-xs text-slate-500 text-center mt-1 mb-4">
            Akses saat ini: <strong className="text-blue-600">{currentUser.name}</strong> ({currentUser.role === 'owner' ? 'Pemilik' : 'Staf Kasir'})
          </p>

          {/* Quick Staff Switch Buttons */}
          <div className="w-full flex gap-2 mb-4">
            {staffList.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => switchUser(st.id)}
                className={`flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1 transition ${
                  currentUser.id === st.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                <span className="truncate">{st.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* PIN Indicators */}
          <div className="flex gap-4 mb-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition ${
                  pin.length > idx
                    ? 'bg-blue-600 border-blue-600 scale-110'
                    : 'border-slate-300 bg-white'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold mb-3">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Touch Numpad */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleNumberClick(digit)}
                className="h-12 rounded-2xl bg-slate-100 hover:bg-blue-100 active:scale-95 font-bold text-xl text-slate-800 transition flex items-center justify-center shadow-xs"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPin('');
                setError('');
              }}
              className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 flex items-center justify-center"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleNumberClick('0')}
              className="h-12 rounded-2xl bg-slate-100 hover:bg-blue-100 active:scale-95 font-bold text-xl text-slate-800 transition flex items-center justify-center shadow-xs"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-600 flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          <div className="mt-4 p-2 bg-blue-50/70 rounded-xl text-center w-full">
            <span className="text-[11px] text-blue-700">
              Demo PIN: <strong>1234</strong> (Pemilik/Owner) | <strong>0000</strong> (Kasir)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
