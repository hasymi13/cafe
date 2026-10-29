import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  Printer,
  Store,
  Users,
  ShieldCheck,
  Save,
  Bluetooth,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { connectWebBluetoothPrinter, printThermalReceiptBrowser } from '../../utils/thermalPrinter';

export const SettingsView: React.FC = () => {
  const {
    cafeInfo,
    updateCafeInfo,
    printerSettings,
    updatePrinterSettings,
    staffList,
    currentUser,
    setActiveTab,
  } = usePOS();

  // Local form states
  const [cafeName, setCafeName] = useState(cafeInfo.name);
  const [tagline, setTagline] = useState(cafeInfo.tagline);
  const [address, setAddress] = useState(cafeInfo.address);
  const [phone, setPhone] = useState(cafeInfo.phone);
  const [wifiPassword, setWifiPassword] = useState(cafeInfo.wifiPassword || '');
  const [taxPct, setTaxPct] = useState(cafeInfo.taxPercentage);
  const [servicePct, setServicePct] = useState(cafeInfo.servicePercentage);

  // Printer states
  const [printerName, setPrinterName] = useState(printerSettings.printerName);
  const [paperWidth, setPaperWidth] = useState(printerSettings.paperWidth);
  const [autoPrint, setAutoPrint] = useState(printerSettings.autoPrintReceipt);
  const [footerMsg, setFooterMsg] = useState(printerSettings.footerMessage);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const isOwner = currentUser.role === 'owner';

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateCafeInfo({
      name: cafeName,
      tagline,
      address,
      phone,
      wifiPassword,
      taxPercentage: Number(taxPct),
      servicePercentage: Number(servicePct),
    });

    updatePrinterSettings({
      printerName,
      paperWidth,
      autoPrintReceipt: autoPrint,
      footerMessage: footerMsg,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleBluetoothPair = async () => {
    const success = await connectWebBluetoothPrinter();
    if (success) {
      alert('Printer thermal berhasil terhubung via Bluetooth!');
    } else {
      alert('Simulasi printer thermal ESC/POS aktif dan siap digunakan.');
    }
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
            <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-base leading-tight">
                Pengaturan Sistem Kasir & Printer Thermal
              </h2>
              <p className="text-xs text-slate-500">
                Konfigurasi profil kafe, koneksi printer ESC/POS, dan hak akses pengguna
              </p>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
        <form onSubmit={handleSaveAll} className="space-y-6">
          {/* Section 1: Printer Thermal Integration */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">
                    Konfigurasi Printer Thermal & ESC/POS
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mendukung printer kasir USB, Bluetooth, dan driver sistem (58mm / 80mm)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBluetoothPair}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Bluetooth className="w-3.5 h-3.5" />
                <span>Pasangkan Printer Bluetooth</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nama Printer Thermal
                </label>
                <input
                  type="text"
                  value={printerName}
                  onChange={(e) => setPrinterName(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. POS-58 Mini Thermal"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Format Lebar Kertas Struk
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperWidth('58mm')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      paperWidth === '58mm'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    58mm (Standar Portabel)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperWidth('80mm')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      paperWidth === '80mm'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    80mm (Lebar POS Kasir)
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Cetak Struk Otomatis Saat Transaksi Selesai
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Printer akan langsung mengeluarkan kertas struk tanpa perlu klik tombol cetak
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoPrint}
                    onChange={(e) => setAutoPrint(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Pesan Catatan Kaki Struk (Footer Message)
                </label>
                <textarea
                  rows={2}
                  value={footerMsg}
                  onChange={(e) => setFooterMsg(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Terima kasih atas kunjungan Anda!"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Profil & Tarif Pajak Kafe */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">
                  Identitas Outlet Kafe & Pajak Restoran
                </h3>
                <p className="text-xs text-slate-400">
                  Data ini dicetak pada bagian kop atas struk thermal
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nama Kafe / Usaha
                </label>
                <input
                  type="text"
                  value={cafeName}
                  onChange={(e) => setCafeName(e.target.value)}
                  disabled={!isOwner}
                  className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Slogan / Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  disabled={!isOwner}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Alamat Lengkap Outlet
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!isOwner}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nomor Telepon Outlet
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isOwner}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Kata Sandi WiFi Pelanggan
                </label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  disabled={!isOwner}
                  className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Tarif Pajak Restoran PB1 (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={taxPct}
                  onChange={(e) => setTaxPct(Number(e.target.value))}
                  disabled={!isOwner}
                  className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Tarif Service Charge (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={servicePct}
                  onChange={(e) => setServicePct(Number(e.target.value))}
                  disabled={!isOwner}
                  className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Staff Accounts & Privilege Levels */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">
                  Daftar Hak Akses Staf Kasir & Pemilik (RBAC)
                </h3>
                <p className="text-xs text-slate-400">
                  Pemilik memiliki akses ke laporan laba & analitik; Kasir dibatasi untuk operasional
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {staffList.map((st) => (
                <div
                  key={st.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${
                    currentUser.id === st.id
                      ? 'bg-blue-50/80 border-blue-400'
                      : 'bg-slate-50/60 border-slate-200'
                  }`}
                >
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-1">
                      <span>{st.name}</span>
                      {st.role === 'owner' && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 capitalize">
                      Tingkat: <strong>{st.role === 'owner' ? 'Pemilik (Full)' : 'Kasir (POS)'}</strong>
                    </div>
                    <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                      PIN: ****{st.pin.slice(-2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-3 bg-[#1976d2] hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Semua Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
