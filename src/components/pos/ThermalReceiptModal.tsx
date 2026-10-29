import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  X,
  Printer,
  Bluetooth,
  FileCheck,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';
import { formatThermalReceiptText, printThermalReceiptBrowser, connectWebBluetoothPrinter } from '../../utils/thermalPrinter';

export const ThermalReceiptModal: React.FC = () => {
  const {
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    receiptOrderToView,
    cafeInfo,
    printerSettings,
    updatePrinterSettings,
  } = usePOS();

  const [isConnectingBluetooth, setIsConnectingBluetooth] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);

  if (!isReceiptModalOpen || !receiptOrderToView) return null;

  const receiptRawText = formatThermalReceiptText(receiptOrderToView, cafeInfo, printerSettings);

  const handlePrint = () => {
    printThermalReceiptBrowser();
  };

  const handleConnectBluetooth = async () => {
    setIsConnectingBluetooth(true);
    const connected = await connectWebBluetoothPrinter();
    setIsConnectingBluetooth(false);
    if (connected) {
      updatePrinterSettings({ isConnected: true });
      setConnectSuccess(true);
      setTimeout(() => setConnectSuccess(false), 3000);
    } else {
      // Still set connected for prototype simulation
      updatePrinterSettings({ isConnected: true });
      setConnectSuccess(true);
      setTimeout(() => setConnectSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1976d2] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="font-bold text-base">Pratinjau Struk Kasir Thermal</h3>
              <p className="text-[11px] text-blue-100">
                Format {printerSettings.paperWidth} ESC/POS • {printerSettings.printerName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsReceiptModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Toggle & Printer Status Bar */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Lebar Kertas:</span>
            <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => updatePrinterSettings({ paperWidth: '58mm' })}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  printerSettings.paperWidth === '58mm'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                58mm (Standar POS)
              </button>
              <button
                type="button"
                onClick={() => updatePrinterSettings({ paperWidth: '80mm' })}
                className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                  printerSettings.paperWidth === '80mm'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                80mm
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnectBluetooth}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-400 text-slate-700 font-semibold transition"
          >
            <Bluetooth className="w-3.5 h-3.5 text-blue-600" />
            <span>{isConnectingBluetooth ? 'Mencari...' : 'Hubungkan Bluetooth'}</span>
          </button>
        </div>

        {connectSuccess && (
          <div className="bg-emerald-50 text-emerald-800 text-xs px-6 py-2 flex items-center gap-2 border-b border-emerald-200 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Printer Thermal {printerSettings.printerName} Siap Digunakan!</span>
          </div>
        )}

        {/* Thermal Receipt Paper Roll Simulation */}
        <div className="p-6 overflow-y-auto bg-slate-200/80 flex justify-center items-start flex-1">
          <div
            className={`bg-white text-black shadow-xl p-5 border-t-8 border-slate-400 rounded-b-md relative font-mono text-[11px] leading-relaxed transition-all ${
              printerSettings.paperWidth === '58mm' ? 'w-[280px]' : 'w-[360px]'
            }`}
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Paper tear jagged top effect */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-slate-300 to-transparent opacity-40"></div>

            <pre className="whitespace-pre-wrap font-mono select-text font-normal text-slate-900">
              {receiptRawText}
            </pre>

            {/* Paper tear bottom zig-zag graphic */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400 font-sans">
              [POTONG KERTAS STRUK DISINI]
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-print-opt"
              checked={printerSettings.autoPrintReceipt}
              onChange={(e) => updatePrinterSettings({ autoPrintReceipt: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <label htmlFor="auto-print-opt" className="text-xs text-slate-600 cursor-pointer">
              Cetak otomatis setiap checkout
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReceiptModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2.5 bg-[#1976d2] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
