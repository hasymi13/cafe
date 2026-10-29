import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  Menu,
  Grid,
  ScanBarcode,
  Sparkles,
  ChefHat,
  Boxes,
  FileText,
  TrendingUp,
  Printer,
  ShieldCheck,
  LogOut,
  Bell,
  Clock,
  Receipt,
  RotateCcw,
  Store,
  ChevronDown,
} from 'lucide-react';
import { PinModal } from './PinModal';
import { requestNotificationPermission } from '../../utils/notifications';

interface HeaderNavProps {
  onOpenTableModal: () => void;
  onOpenServedByModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onOpenTableModal }) => {
  const {
    activeTab,
    setActiveTab,
    catalogTab,
    setCatalogTab,
    currentUser,
    orders,
    orderType,
    setOrderType,
  } = usePOS();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);

  // Active cooking/ready orders count for badge
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'cooking' || o.status === 'new' || o.status === 'ready'
  ).length;

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      alert('Notifikasi pesanan dapur berhasil diaktifkan!');
    }
  };

  return (
    <>
      <header className="bg-[#1e88e5] text-white shadow-md select-none sticky top-0 z-30">
        <div className="flex items-center justify-between px-3 py-2 border-b border-blue-400/40">
          {/* Left Navigation Buttons (Matching Screenshot) */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Menu Drawer Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuDropdownOpen(!isMenuDropdownOpen)}
                className="p-2 rounded-xl bg-blue-700/60 hover:bg-blue-700 active:scale-95 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Menu Modul Aplikasi"
              >
                <Menu className="w-5 h-5" />
                <span className="hidden sm:inline font-bold">Modul</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Navigation Dropdown */}
              {isMenuDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95"
                  onClick={() => setIsMenuDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Navigasi Cepat
                  </div>
                  <button
                    onClick={() => setActiveTab('pos')}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition ${
                      activeTab === 'pos' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-blue-600" />
                    Kasir POS (Front Desk)
                  </button>
                  <button
                    onClick={() => setActiveTab('kitchen')}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition ${
                      activeTab === 'kitchen' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <ChefHat className="w-4 h-4 text-amber-500" />
                      Layar Dapur (Kitchen Display)
                    </span>
                    {pendingOrdersCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {pendingOrdersCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('stock')}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition ${
                      activeTab === 'stock' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Boxes className="w-4 h-4 text-emerald-600" />
                    Manajemen Stok & Menu
                  </button>
                  <button
                    onClick={() => setActiveTab('daily_report')}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition ${
                      activeTab === 'daily_report' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Laporan Penjualan Harian
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition ${
                      activeTab === 'analytics' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Dasbor Analitik Bulanan
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition ${
                      activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Printer className="w-4 h-4 text-cyan-600" />
                    Pengaturan Struk Thermal
                  </button>
                </div>
              )}
            </div>

            {/* Table Button */}
            <button
              type="button"
              onClick={onOpenTableModal}
              className="px-2.5 py-1.5 rounded-xl bg-blue-700/40 hover:bg-blue-700/70 border border-blue-400/40 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <Store className="w-4 h-4" />
              <span>Table</span>
            </button>

            {/* In / Away Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setOrderType(orderType === 'DINE-IN' ? 'TAKE-AWAY' : 'DINE-IN');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-blue-700/40 hover:bg-blue-700/70 border border-blue-400/40 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Ganti Dine-In / Takeaway"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{orderType === 'DINE-IN' ? 'In/Away' : 'Away (Takeaway)'}</span>
            </button>

            {/* Orders tracking button with active count badge */}
            <button
              type="button"
              onClick={() => setActiveTab('kitchen')}
              className="px-2.5 py-1.5 rounded-xl bg-blue-700/40 hover:bg-blue-700/70 border border-blue-400/40 transition flex items-center gap-1.5 text-xs font-semibold relative"
            >
              <ChefHat className="w-4 h-4" />
              <span>Orders</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* Rem / Bills button */}
            <button
              type="button"
              onClick={() => setActiveTab('daily_report')}
              className="px-2.5 py-1.5 rounded-xl bg-blue-700/40 hover:bg-blue-700/70 border border-blue-400/40 transition hidden md:flex items-center gap-1 text-xs font-semibold"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Rem / Bills</span>
            </button>

            {/* Timer button */}
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className="px-2 py-1.5 rounded-xl bg-blue-700/40 hover:bg-blue-700/70 border border-blue-400/40 transition hidden md:flex items-center text-xs font-semibold"
              title="Waktu Operasional & Shift"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>

          {/* Center Tabs: Products | Barcode | Custom (From Reference Screenshot) */}
          <div className="hidden lg:flex items-center gap-1 bg-blue-900/40 p-1 rounded-2xl border border-blue-400/30">
            <button
              type="button"
              onClick={() => {
                setActiveTab('pos');
                setCatalogTab('products');
              }}
              className={`px-4 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'pos' && catalogTab === 'products'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Products
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('pos');
                setCatalogTab('barcode');
              }}
              className={`px-4 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'pos' && catalogTab === 'barcode'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <ScanBarcode className="w-3.5 h-3.5" />
              Barcode
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('pos');
                setCatalogTab('custom');
              }}
              className={`px-4 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'pos' && catalogTab === 'custom'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Custom
            </button>
          </div>

          {/* Right Side: Role Badge & Quick Switch */}
          <div className="flex items-center gap-2">
            {/* Push Notifications Opt-in */}
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="p-1.5 rounded-xl bg-blue-700/50 hover:bg-blue-700 text-blue-100 hover:text-white transition"
              title="Aktifkan Notifikasi Suara/Push Dapur"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Active Staff / Role Pill */}
            <button
              type="button"
              onClick={() => setIsPinModalOpen(true)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-white/15 hover:bg-white/25 rounded-2xl border border-white/20 transition cursor-pointer text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-white/40"
              />
              <div className="text-[11px] leading-tight">
                <div className="font-bold text-white flex items-center gap-1">
                  <span>{currentUser.name.split(' ')[0]}</span>
                  {currentUser.role === 'owner' && (
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  )}
                </div>
                <div className="text-blue-100 text-[10px] capitalize">
                  {currentUser.role === 'owner' ? 'Owner / Pemilik' : 'Kasir'}
                </div>
              </div>
              <LogOut className="w-3.5 h-3.5 ml-1 text-blue-200" />
            </button>
          </div>
        </div>
      </header>

      {/* Role / PIN Auth Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />
    </>
  );
};
