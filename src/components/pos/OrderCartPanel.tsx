import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  User,
  Plus,
  Trash2,
  Printer,
  Percent,
  Truck,
  MessageSquare,
  UserCheck,
  UtensilsCrossed,
  X,
  PlusCircle,
  MinusCircle,
  Receipt,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';
import { TableSelectModal } from './TableSelectModal';
import { DiscountModal } from './DiscountModal';
import { DeliveryModal } from './DeliveryModal';
import { NotesModal } from './NotesModal';

interface OrderCartPanelProps {
  onOpenPaymentModal: () => void;
}

export const OrderCartPanel: React.FC<OrderCartPanelProps> = ({ onOpenPaymentModal }) => {
  const {
    cart,
    orderType,
    tableNumber,
    pax,
    cartTotals,
    customerName,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    sendCartToKitchen,
    currentUser,
    cafeInfo,
    setReceiptOrderToView,
    setIsReceiptModalOpen,
  } = usePOS();

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [servedByNotice, setServedByNotice] = useState(false);

  const handlePrintCheck = () => {
    if (cart.length === 0) {
      alert('Pilih menu terlebih dahulu untuk mencetak slip tagihan / check!');
      return;
    }

    // Build temporary check bill
    const mockOrder = {
      id: `CHK-${Date.now().toString().slice(-4)}`,
      orderNumber: 999,
      orderType,
      tableNumber,
      pax,
      customerName: customerName || (tableNumber && tableNumber !== '-' ? `Meja ${tableNumber}` : 'Pelanggan'),
      items: cart,
      subtotal: cartTotals.subtotal,
      serviceRate: cafeInfo.servicePercentage / 100,
      serviceCharge: cartTotals.serviceCharge,
      taxRate: cafeInfo.taxPercentage / 100,
      tax: cartTotals.tax,
      discountRate: 0,
      discountAmount: cartTotals.discountAmount,
      deliveryCost: cartTotals.deliveryCost,
      rounding: cartTotals.rounding,
      total: cartTotals.total,
      status: 'new' as const,
      paymentStatus: 'unpaid' as const,
      cashierName: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    setReceiptOrderToView(mockOrder);
    setIsReceiptModalOpen(true);
  };

  const handleSendToKitchen = () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }
    try {
      const created = sendCartToKitchen();
      alert(`Pesanan #${created.orderNumber} berhasil dikirim ke Dapur!`);
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  };

  const handleCancelOrder = () => {
    if (cart.length === 0) return;
    if (confirm('Batalkan pesanan dan kosongkan keranjang?')) {
      clearCart();
    }
  };

  const handleServedBy = () => {
    setServedByNotice(true);
    setTimeout(() => setServedByNotice(false), 2500);
  };

  return (
    <>
      <div className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-53px)] shadow-xs">
        {/* Top Header: Avatar | DINE-IN (1 Pax) | (+) Button */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            className="w-10 h-10 rounded-full border border-blue-200 bg-blue-50/80 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition shadow-xs"
            title="Info Pelanggan & Meja"
          >
            <User className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            className="text-center group cursor-pointer"
          >
            <div className="font-extrabold text-[#1976d2] text-sm tracking-wide group-hover:underline flex items-center justify-center gap-1">
              <span>{orderType}</span>
              {orderType === 'DINE-IN' && (
                <span>({pax} Pax - M{tableNumber})</span>
              )}
            </div>
            <div className="text-[11px] font-bold text-slate-700 truncate max-w-[220px]">
              Pelanggan: <span className="text-blue-600 font-extrabold">{customerName || `Meja ${tableNumber}`}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            className="w-10 h-10 rounded-full bg-[#1e88e5] text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition shadow-sm"
            title="Tambah Tamu / Atur Meja"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Column Headers: Item | Qty | Total */}
        <div className="bg-[#b0bec5] text-slate-800 text-xs font-bold px-4 py-2 flex items-center justify-between select-none">
          <div className="w-1/2">Item</div>
          <div className="w-1/4 text-center">Qty</div>
          <div className="w-1/4 text-right">Total</div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Receipt className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
              <p className="font-semibold text-sm text-slate-600">Belum ada item pesanan</p>
              <p className="text-xs text-slate-400 max-w-[200px] mt-1">
                Pilih menu dari panel kanan untuk menambahkan ke tagihan kasir.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartItemId}
                className="py-2.5 px-3 hover:bg-blue-50/40 transition group"
              >
                {/* Top line: Name & Total */}
                <div className="flex items-start justify-between">
                  <div className="w-1/2 pr-2">
                    <div className="font-bold text-slate-800 text-xs leading-tight">
                      {item.product.name}
                    </div>
                    {/* Modifiers subtitle if any */}
                    {item.selectedModifiers.length > 0 && (
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {item.selectedModifiers.map((m) => m.label).join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-[10px] text-amber-600 italic mt-0.5">
                        * {item.notes}
                      </div>
                    )}
                  </div>

                  {/* Quantity and unit price */}
                  <div className="w-1/4 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                        className="text-slate-400 hover:text-rose-500 transition"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 min-w-[20px] text-center">
                        {item.quantity}x
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                        className="text-slate-400 hover:text-blue-600 transition"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {formatRupiah(item.unitPrice, false)}
                    </span>
                  </div>

                  {/* Line Total & Delete */}
                  <div className="w-1/4 text-right flex items-center justify-end gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900">
                      {formatRupiah(item.totalPrice, false)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition p-0.5"
                      title="Hapus Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Rows (Matching Screenshot) */}
        <div className="bg-slate-50/80 border-t border-slate-200 px-4 py-2.5 text-xs space-y-1.5">
          {/* Subtotal (if discount or delivery exists) */}
          {(cartTotals.discountAmount > 0 || cartTotals.deliveryCost > 0) && (
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatRupiah(cartTotals.subtotal, false)}</span>
            </div>
          )}

          {cartTotals.discountAmount > 0 && (
            <div className="flex justify-between text-rose-600 font-medium">
              <span>Diskon Order:</span>
              <span>-{formatRupiah(cartTotals.discountAmount, false)}</span>
            </div>
          )}

          {cartTotals.deliveryCost > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Biaya Pengiriman:</span>
              <span className="font-semibold">{formatRupiah(cartTotals.deliveryCost, false)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Service Charge {cafeInfo.servicePercentage}%</span>
            <span className="font-bold text-slate-800">
              {formatRupiah(cartTotals.serviceCharge, false)}
            </span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Pajak {cafeInfo.taxPercentage}%</span>
            <span className="font-bold text-slate-800">{formatRupiah(cartTotals.tax, false)}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Rounding</span>
            <span className="font-bold text-slate-800">
              {cartTotals.rounding > 0 ? `+${cartTotals.rounding}` : cartTotals.rounding}
            </span>
          </div>
        </div>

        {/* Action Icon Buttons Row (Matching Screenshot) */}
        <div className="p-2 border-t border-slate-200 bg-white">
          {servedByNotice && (
            <div className="text-[11px] bg-blue-50 text-blue-700 py-1 px-2 rounded mb-1 text-center font-medium animate-in fade-in">
              Dilayani oleh: <strong>{currentUser.name}</strong> ({currentUser.role})
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            {/* Print Check */}
            <button
              type="button"
              onClick={handlePrintCheck}
              className="flex-1 flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-slate-100 transition group"
              title="Cetak Struk Sementara (Check)"
            >
              <div className="w-8 h-8 rounded-full border border-blue-400 text-blue-600 flex items-center justify-center group-hover:bg-blue-50 transition">
                <Printer className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-slate-500 font-medium mt-1 leading-tight text-center">
                Print Check
              </span>
            </button>

            {/* Disc. Order */}
            <button
              type="button"
              onClick={() => setIsDiscountModalOpen(true)}
              className="flex-1 flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-slate-100 transition group"
              title="Beri Diskon"
            >
              <div className="w-8 h-8 rounded-full border border-blue-400 text-blue-600 flex items-center justify-center group-hover:bg-blue-50 transition">
                <Percent className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-slate-500 font-medium mt-1 leading-tight text-center">
                Disc. Order
              </span>
            </button>

            {/* Delivery Cost */}
            <button
              type="button"
              onClick={() => setIsDeliveryModalOpen(true)}
              className="flex-1 flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-slate-100 transition group"
              title="Biaya Pengiriman"
            >
              <div className="w-8 h-8 rounded-full border border-blue-400 text-blue-600 flex items-center justify-center group-hover:bg-blue-50 transition">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-slate-500 font-medium mt-1 leading-tight text-center">
                Delivery Cost
              </span>
            </button>

            {/* Order Notes */}
            <button
              type="button"
              onClick={() => setIsNotesModalOpen(true)}
              className="flex-1 flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-slate-100 transition group"
              title="Catatan Pesanan"
            >
              <div className="w-8 h-8 rounded-full border border-blue-400 text-blue-600 flex items-center justify-center group-hover:bg-blue-50 transition">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-slate-500 font-medium mt-1 leading-tight text-center">
                Order Notes
              </span>
            </button>

            {/* Served By */}
            <button
              type="button"
              onClick={handleServedBy}
              className="flex-1 flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-slate-100 transition group"
              title="Staf Kasir"
            >
              <div className="w-8 h-8 rounded-full border border-blue-400 text-blue-600 flex items-center justify-center group-hover:bg-blue-50 transition">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-slate-500 font-medium mt-1 leading-tight text-center">
                Served By
              </span>
            </button>

            {/* Send to Kitchen */}
            <button
              type="button"
              onClick={handleSendToKitchen}
              className="flex-1 flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-slate-100 transition group"
              title="Kirim ke Dapur"
            >
              <div className="w-8 h-8 rounded-full border border-blue-400 text-blue-600 flex items-center justify-center group-hover:bg-blue-50 transition">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-slate-500 font-medium mt-1 leading-tight text-center">
                Send to Kitchen
              </span>
            </button>

            {/* Cancel Order (Red Button) */}
            <button
              type="button"
              onClick={handleCancelOrder}
              className="flex-1 flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-rose-50 transition group"
              title="Batalkan Pesanan"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center group-hover:bg-rose-600 transition shadow-xs">
                <X className="w-4 h-4" />
              </div>
              <span className="text-[9px] text-rose-600 font-medium mt-1 leading-tight text-center">
                Cancel Order
              </span>
            </button>
          </div>
        </div>

        {/* Big Bottom Pay Button: "Rp 141,600" (Matching Screenshot) */}
        <button
          type="button"
          onClick={onOpenPaymentModal}
          disabled={cart.length === 0}
          className={`w-full py-4 px-6 text-center text-xl font-extrabold text-white transition flex items-center justify-center gap-2 shadow-inner select-none ${
            cart.length > 0
              ? 'bg-[#5cb85c] hover:bg-[#4cae4c] active:bg-[#449d44] cursor-pointer'
              : 'bg-slate-300 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>{formatRupiah(cartTotals.total)}</span>
        </button>
      </div>

      {/* Sub-modals */}
      <TableSelectModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
      />
      <DeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
      />
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
      />
    </>
  );
};
