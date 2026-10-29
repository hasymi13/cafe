import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { OrderStatus, OrderType, Order } from '../../types/pos';
import {
  ChefHat,
  Clock,
  UtensilsCrossed,
  CheckCircle2,
  Flame,
  BellRing,
  ArrowRight,
  Filter,
  Volume2,
  ArrowLeft,
} from 'lucide-react';
import { playKitchenChime } from '../../utils/audio';
import { sendPushNotification } from '../../utils/notifications';

export const KitchenDisplay: React.FC = () => {
  const { orders, updateOrderStatus, setActiveTab } = usePOS();
  const [filterType, setFilterType] = useState<OrderType | 'ALL'>('ALL');

  // Active cooking orders filter (exclude cancelled)
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');

  const filteredOrders = activeOrders.filter((o) => {
    if (filterType === 'ALL') return true;
    return o.orderType === filterType;
  });

  const newOrders = filteredOrders.filter((o) => o.status === 'new');
  const cookingOrders = filteredOrders.filter((o) => o.status === 'cooking');
  const readyOrders = filteredOrders.filter((o) => o.status === 'ready');
  const completedOrders = filteredOrders.filter((o) => o.status === 'completed').slice(0, 8);

  const getElapsedMinutes = (dateStr: string): number => {
    const elapsedMs = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(elapsedMs / 60000));
  };

  const renderOrderCard = (order: Order, currentStatus: OrderStatus) => {
    const elapsed = getElapsedMinutes(order.createdAt);
    const isLate = elapsed > 15;

    return (
      <div
        key={order.id}
        className={`bg-white rounded-2xl border shadow-sm p-4 flex flex-col justify-between transition ${
          currentStatus === 'ready'
            ? 'border-emerald-400 bg-emerald-50/20'
            : currentStatus === 'cooking'
            ? 'border-amber-300'
            : 'border-blue-200'
        }`}
      >
        <div>
          {/* Card Top: Order Number + Table + Elapsed Time */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-800">
                  #{order.orderNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    order.orderType === 'DINE-IN'
                      ? 'bg-blue-100 text-blue-700'
                      : order.orderType === 'DELIVERY'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {order.orderType}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                {order.tableNumber && order.tableNumber !== '-'
                  ? `Meja ${order.tableNumber} (${order.pax} Pax)`
                  : order.customerName || 'Pelanggan'}
              </div>
            </div>

            <div
              className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-xl ${
                isLate
                  ? 'bg-rose-100 text-rose-700 animate-pulse'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{elapsed} mnt</span>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.cartItemId} className="text-xs">
                <div className="flex items-start justify-between font-bold text-slate-800">
                  <span>{item.product.name}</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-700 ml-2">
                    {item.quantity}x
                  </span>
                </div>
                {item.selectedModifiers.length > 0 && (
                  <div className="text-[10px] text-slate-500 pl-2 mt-0.5">
                    • {item.selectedModifiers.map((m) => m.label).join(', ')}
                  </div>
                )}
                {item.notes && (
                  <div className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-0.5 italic">
                    Note: {item.notes}
                  </div>
                )}
              </div>
            ))}

            {order.orderNotes && (
              <div className="p-2 bg-yellow-50 text-yellow-800 rounded-lg text-xs font-medium border border-yellow-200 mt-2">
                <strong>Catatan Meja:</strong> {order.orderNotes}
              </div>
            )}
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {currentStatus === 'new' && (
            <button
              type="button"
              onClick={() => updateOrderStatus(order.id, 'cooking')}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Flame className="w-4 h-4" />
              <span>Mulai Masak</span>
            </button>
          )}

          {currentStatus === 'cooking' && (
            <button
              type="button"
              onClick={() => updateOrderStatus(order.id, 'ready')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <BellRing className="w-4 h-4" />
              <span>Siap Saji (Notif Kasir)</span>
            </button>
          )}

          {currentStatus === 'ready' && (
            <button
              type="button"
              onClick={() => updateOrderStatus(order.id, 'completed')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Selesai Antar / Diambil</span>
            </button>
          )}

          {currentStatus === 'completed' && (
            <div className="w-full text-center py-1.5 bg-slate-100 text-slate-500 font-semibold text-xs rounded-xl">
              Pesanan Telah Selesai
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-53px)] bg-slate-100 overflow-hidden">
      {/* Top Bar Kitchen */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('pos')}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Kembali ke Layar Kasir"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-base leading-tight">
                Kitchen Display System (KDS) & Pelacakan Pesanan
              </h2>
              <p className="text-xs text-slate-500">
                Pantau proses memasak dan sajian pesanan cafe secara real-time
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Sound Tester */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {(['ALL', 'DINE-IN', 'TAKE-AWAY', 'DELIVERY'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg transition ${
                  filterType === t
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'Semua Tipe' : t}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              playKitchenChime();
              sendPushNotification('Tes Notifikasi Dapur', 'Audio bel dapur dan notifikasi aktif!');
            }}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="Tes Suara Lonceng Dapur"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Tes Lonceng</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto overflow-y-hidden">
        {/* Column 1: Baru Masuk (New) */}
        <div className="flex flex-col bg-slate-200/60 rounded-2xl p-3 border border-slate-300/60 overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-300">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-700 uppercase tracking-wider">
              <UtensilsCrossed className="w-4 h-4 text-blue-600" />
              <span>Baru Masuk</span>
            </div>
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {newOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {newOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400 text-center">
                Belum ada tiket baru
              </div>
            ) : (
              newOrders.map((ord) => renderOrderCard(ord, 'new'))
            )}
          </div>
        </div>

        {/* Column 2: Sedang Dimasak (Cooking) */}
        <div className="flex flex-col bg-amber-50/70 rounded-2xl p-3 border border-amber-200 overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-800 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Sedang Dimasak</span>
            </div>
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cookingOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {cookingOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-amber-600/50 text-center">
                Tidak ada pesanan dimasak
              </div>
            ) : (
              cookingOrders.map((ord) => renderOrderCard(ord, 'cooking'))
            )}
          </div>
        </div>

        {/* Column 3: Siap Saji (Ready to Serve) */}
        <div className="flex flex-col bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200 overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-200">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 uppercase tracking-wider">
              <BellRing className="w-4 h-4 text-emerald-600" />
              <span>Siap Saji</span>
            </div>
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {readyOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {readyOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-emerald-600/50 text-center">
                Tidak ada pesanan menunggu diantar
              </div>
            ) : (
              readyOrders.map((ord) => renderOrderCard(ord, 'ready'))
            )}
          </div>
        </div>

        {/* Column 4: Selesai (Completed Today) */}
        <div className="flex flex-col bg-slate-200/40 rounded-2xl p-3 border border-slate-300/40 overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-300">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-600 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              <span>Selesai (Hari Ini)</span>
            </div>
            <span className="bg-slate-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {completedOrders.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 opacity-80">
            {completedOrders.map((ord) => renderOrderCard(ord, 'completed'))}
          </div>
        </div>
      </div>
    </div>
  );
};
