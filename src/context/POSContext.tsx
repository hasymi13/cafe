import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  StaffUser,
  PrinterSettings,
  CafeInfo,
  Shift,
  CategoryType,
  SelectedModifier,
} from '../types/pos';
import {
  INITIAL_CAFE_INFO,
  INITIAL_STAFF_USERS,
  INITIAL_PRINTER_SETTINGS,
  INITIAL_PRODUCTS,
  generateSampleOrders,
} from '../data/initialData';
import { playBeep, playKitchenChime, playSuccessChime } from '../utils/audio';
import { sendPushNotification } from '../utils/notifications';

interface CartTotals {
  subtotal: number;
  serviceCharge: number;
  tax: number;
  discountAmount: number;
  deliveryCost: number;
  rounding: number;
  total: number;
}

interface POSContextType {
  // Navigation & View
  activeTab: 'pos' | 'kitchen' | 'stock' | 'daily_report' | 'analytics' | 'settings';
  setActiveTab: (tab: 'pos' | 'kitchen' | 'stock' | 'daily_report' | 'analytics' | 'settings') => void;
  catalogTab: 'products' | 'barcode' | 'custom';
  setCatalogTab: (tab: 'products' | 'barcode' | 'custom') => void;

  // Staff & Role
  currentUser: StaffUser;
  staffList: StaffUser[];
  loginWithPin: (pin: string) => boolean;
  switchUser: (userId: string) => void;

  // Cafe & Printer Settings
  cafeInfo: CafeInfo;
  updateCafeInfo: (info: Partial<CafeInfo>) => void;
  printerSettings: PrinterSettings;
  updatePrinterSettings: (settings: Partial<PrinterSettings>) => void;

  // Products
  products: Product[];
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  // Cart & Active Bill
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  pax: number;
  setPax: (p: number) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  discountPercentage: number;
  setDiscountPercentage: (disc: number) => void;
  deliveryCost: number;
  setDeliveryCost: (cost: number) => void;

  addToCart: (product: Product, quantity?: number, selectedModifiers?: SelectedModifier[], notes?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  cartTotals: CartTotals;

  // Orders & Kitchen
  orders: Order[];
  sendCartToKitchen: () => Order;
  checkoutOrder: (
    paymentMethod: PaymentMethod,
    amountPaid?: number,
    reference?: string,
    existingOrderId?: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  loadOrderToCart: (order: Order) => void;

  // Receipts
  receiptOrderToView: Order | null;
  setReceiptOrderToView: (order: Order | null) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;

  // Shifts
  currentShift: Shift;
  closeShift: (endingCash: number) => void;
  openNewShift: (startingCash: number) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'cafepos_products_v1',
  ORDERS: 'cafepos_orders_v1',
  CAFE: 'cafepos_cafe_v1',
  PRINTER: 'cafepos_printer_v1',
  CART: 'cafepos_cart_v1',
  USER: 'cafepos_current_user_v1',
};

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'pos' | 'kitchen' | 'stock' | 'daily_report' | 'analytics' | 'settings'>('pos');
  const [catalogTab, setCatalogTab] = useState<'products' | 'barcode' | 'custom'>('products');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  // Staff
  const [staffList] = useState<StaffUser[]>(INITIAL_STAFF_USERS);
  const [currentUser, setCurrentUser] = useState<StaffUser>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    // Default to cashier Siti Rahma
    return INITIAL_STAFF_USERS[1];
  });

  // Cafe & Printer Settings
  const [cafeInfo, setCafeInfo] = useState<CafeInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAFE);
    return saved ? JSON.parse(saved) : INITIAL_CAFE_INFO;
  });

  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRINTER);
    return saved ? JSON.parse(saved) : INITIAL_PRINTER_SETTINGS;
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : generateSampleOrders();
  });

  // Cart / Bill State
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Seed initial cart matching user attachment picture!
    return [
      {
        cartItemId: 'item-1',
        product: INITIAL_PRODUCTS[5], // Chicken Wings
        quantity: 1,
        selectedModifiers: [],
        unitPrice: 32000,
        totalPrice: 32000,
      },
      {
        cartItemId: 'item-2',
        product: INITIAL_PRODUCTS[4], // Chicken Stick
        quantity: 1,
        selectedModifiers: [],
        unitPrice: 20000,
        totalPrice: 20000,
      },
      {
        cartItemId: 'item-3',
        product: INITIAL_PRODUCTS[3], // Chicken Popcorn
        quantity: 1,
        selectedModifiers: [],
        unitPrice: 23000,
        totalPrice: 23000,
      },
      {
        cartItemId: 'item-4',
        product: INITIAL_PRODUCTS[10], // Dino Nugget
        quantity: 1,
        selectedModifiers: [],
        unitPrice: 12000,
        totalPrice: 12000,
      },
      {
        cartItemId: 'item-5',
        product: INITIAL_PRODUCTS[6], // Chocolate Frapucino
        quantity: 1,
        selectedModifiers: [{ groupName: 'Ukuran', label: 'Large, Coklat', extraPrice: 0 }],
        unitPrice: 39000,
        totalPrice: 39000,
      },
    ];
  });

  const [orderType, setOrderType] = useState<OrderType>('DINE-IN');
  const [tableNumber, setTableNumber] = useState('05');
  const [pax, setPax] = useState(1);
  const [customerName, setCustomerName] = useState('Meja 05');
  const [orderNotes, setOrderNotes] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(0);

  // Receipt modal
  const [receiptOrderToView, setReceiptOrderToView] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Shift Management
  const [currentShift, setCurrentShift] = useState<Shift>({
    id: 'SHIFT-TODAY-01',
    cashierId: currentUser.id,
    cashierName: currentUser.name,
    startTime: new Date().toISOString(),
    startingCash: 500000, // Rp 500.000 modal awal
    cashSales: 0,
    digitalSales: 0,
    totalOrders: 0,
    status: 'open',
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAFE, JSON.stringify(cafeInfo));
  }, [cafeInfo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRINTER, JSON.stringify(printerSettings));
  }, [printerSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Recalculate shift sales from today's orders
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(
      (o) => o.createdAt.startsWith(today) && o.paymentStatus === 'paid'
    );
    const cashSales = todayOrders
      .filter((o) => o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + o.total, 0);
    const digitalSales = todayOrders
      .filter((o) => o.paymentMethod !== 'cash')
      .reduce((sum, o) => sum + o.total, 0);

    setCurrentShift((prev) => ({
      ...prev,
      cashSales,
      digitalSales,
      totalOrders: todayOrders.length,
    }));
  }, [orders]);

  // Cart Totals Calculation
  const cartTotals: CartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = Math.round((subtotal * discountPercentage) / 100);
    const afterDiscount = Math.max(0, subtotal - discountAmount);

    const serviceCharge = Math.round(afterDiscount * (cafeInfo.servicePercentage / 100));
    const tax = Math.round((afterDiscount + serviceCharge) * (cafeInfo.taxPercentage / 100));

    // Special match for screenshot: 126k + 6.3k (5%) + 9.33k (pax tax approx) - 30 rounding = 141,600
    // If standard:
    let rawTotal = afterDiscount + serviceCharge + tax + deliveryCost;
    // Calculate rounding to nearest 100
    const remainder = rawTotal % 100;
    let rounding = 0;
    if (remainder > 0) {
      if (remainder <= 50) {
        rounding = -remainder;
      } else {
        rounding = 100 - remainder;
      }
    }
    const total = rawTotal + rounding;

    return {
      subtotal,
      serviceCharge,
      tax,
      discountAmount,
      deliveryCost,
      rounding,
      total,
    };
  }, [cart, discountPercentage, deliveryCost, cafeInfo.servicePercentage, cafeInfo.taxPercentage]);

  // Cart operations
  const addToCart = (
    product: Product,
    quantity = 1,
    selectedModifiers: SelectedModifier[] = [],
    notes = ''
  ) => {
    playBeep();
    setCart((prev) => {
      // Check if product with identical modifiers exists
      const modKey = selectedModifiers.map((m) => `${m.groupName}:${m.label}`).sort().join('|');
      const existingIdx = prev.findIndex(
        (it) =>
          it.product.id === product.id &&
          it.notes === notes &&
          it.selectedModifiers.map((m) => `${m.groupName}:${m.label}`).sort().join('|') === modKey
      );

      const modExtra = selectedModifiers.reduce((sum, m) => sum + m.extraPrice, 0);
      const unitPrice = product.price + modExtra;

      if (existingIdx > -1) {
        const copy = [...prev];
        const updatedQty = copy[existingIdx].quantity + quantity;
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: updatedQty,
          totalPrice: updatedQty * copy[existingIdx].unitPrice,
        };
        return copy;
      }

      const newItem: CartItem = {
        cartItemId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        product,
        quantity,
        selectedModifiers,
        notes,
        unitPrice,
        totalPrice: unitPrice * quantity,
      };

      return [...prev, newItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    playBeep();
    setCart((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    playBeep();
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((it) =>
        it.cartItemId === cartItemId
          ? { ...it, quantity: newQty, totalPrice: newQty * it.unitPrice }
          : it
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercentage(0);
    setDeliveryCost(0);
    setOrderNotes('');
  };

  // Staff authentication & PIN
  const loginWithPin = (pin: string): boolean => {
    const found = staffList.find((s) => s.pin === pin);
    if (found) {
      setCurrentUser(found);
      playSuccessChime();
      return true;
    }
    return false;
  };

  const switchUser = (userId: string) => {
    const found = staffList.find((s) => s.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  // Kitchen and Orders
  const sendCartToKitchen = (): Order => {
    if (cart.length === 0) throw new Error('Keranjang kosong');

    const nextOrderNumber = orders.length > 0 ? Math.max(...orders.map((o) => o.orderNumber)) + 1 : 1;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: `ORD-${now.split('T')[0].replace(/-/g, '')}-${String(nextOrderNumber).padStart(3, '0')}`,
      orderNumber: nextOrderNumber,
      orderType,
      tableNumber,
      pax,
      customerName: customerName || `Meja ${tableNumber}`,
      items: [...cart],
      subtotal: cartTotals.subtotal,
      serviceRate: cafeInfo.servicePercentage / 100,
      serviceCharge: cartTotals.serviceCharge,
      taxRate: cafeInfo.taxPercentage / 100,
      tax: cartTotals.tax,
      discountRate: discountPercentage,
      discountAmount: cartTotals.discountAmount,
      deliveryCost: cartTotals.deliveryCost,
      rounding: cartTotals.rounding,
      total: cartTotals.total,
      status: 'cooking',
      paymentStatus: 'unpaid',
      cashierName: currentUser.name,
      orderNotes,
      createdAt: now,
    };

    // Deduct stock for ordered items
    cart.forEach((item) => {
      updateProductStock(item.product.id, Math.max(0, item.product.stock - item.quantity));
    });

    setOrders((prev) => [newOrder, ...prev]);
    playKitchenChime();
    sendPushNotification(
      'Pesanan Baru Terkirim ke Dapur!',
      `Order #${newOrder.orderNumber} (${newOrder.orderType} - ${newOrder.tableNumber}) siap diproses dapur.`
    );

    clearCart();
    return newOrder;
  };

  const checkoutOrder = (
    paymentMethod: PaymentMethod,
    amountPaid?: number,
    reference?: string,
    existingOrderId?: string
  ): Order => {
    playSuccessChime();
    const now = new Date().toISOString();

    if (existingOrderId) {
      const existing = orders.find((o) => o.id === existingOrderId);
      if (existing) {
        const changeDue = paymentMethod === 'cash' && amountPaid ? Math.max(0, amountPaid - existing.total) : 0;
        const updated: Order = {
          ...existing,
          paymentStatus: 'paid',
          paymentMethod,
          paymentReference: reference,
          amountPaid: amountPaid || existing.total,
          changeDue,
          completedAt: now,
        };
        setOrders((prev) => prev.map((o) => (o.id === existingOrderId ? updated : o)));
        setReceiptOrderToView(updated);
        setIsReceiptModalOpen(true);
        return updated;
      }
    }

    // Checkout directly from cart
    const nextOrderNumber = orders.length > 0 ? Math.max(...orders.map((o) => o.orderNumber)) + 1 : 1;
    const paidAmount = amountPaid || cartTotals.total;
    const changeDue = paymentMethod === 'cash' ? Math.max(0, paidAmount - cartTotals.total) : 0;

    const completedOrder: Order = {
      id: `ORD-${now.split('T')[0].replace(/-/g, '')}-${String(nextOrderNumber).padStart(3, '0')}`,
      orderNumber: nextOrderNumber,
      orderType,
      tableNumber,
      pax,
      customerName: customerName || `Meja ${tableNumber}`,
      items: [...cart],
      subtotal: cartTotals.subtotal,
      serviceRate: cafeInfo.servicePercentage / 100,
      serviceCharge: cartTotals.serviceCharge,
      taxRate: cafeInfo.taxPercentage / 100,
      tax: cartTotals.tax,
      discountRate: discountPercentage,
      discountAmount: cartTotals.discountAmount,
      deliveryCost: cartTotals.deliveryCost,
      rounding: cartTotals.rounding,
      total: cartTotals.total,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod,
      paymentReference: reference,
      amountPaid: paidAmount,
      changeDue,
      cashierName: currentUser.name,
      orderNotes,
      createdAt: now,
      completedAt: now,
    };

    // Deduct stock
    cart.forEach((item) => {
      updateProductStock(item.product.id, Math.max(0, item.product.stock - item.quantity));
    });

    setOrders((prev) => [completedOrder, ...prev]);
    setReceiptOrderToView(completedOrder);
    setIsReceiptModalOpen(true);
    clearCart();

    sendPushNotification(
      'Pembayaran Berhasil Diterima!',
      `Order #${completedOrder.orderNumber} senilai ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(completedOrder.total)} via ${paymentMethod.toUpperCase()}`
    );

    return completedOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updated = { ...o, status, updatedAt: new Date().toISOString() };
          if (status === 'ready') {
            playKitchenChime();
            sendPushNotification(
              'Pesanan Siap Saji!',
              `Order #${o.orderNumber} (${o.tableNumber}) siap diantar ke meja pelanggan!`
            );
          }
          return updated;
        }
        return o;
      })
    );
  };

  const cancelOrder = (orderId: string) => {
    playBeep();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
  };

  const loadOrderToCart = (order: Order) => {
    setCart(order.items);
    setOrderType(order.orderType);
    setTableNumber(order.tableNumber);
    setPax(order.pax);
    setCustomerName(order.customerName || '');
    setOrderNotes(order.orderNotes || '');
    setActiveTab('pos');
  };

  // Stock operations
  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    playSuccessChime();
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    playSuccessChime();
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Settings
  const updateCafeInfo = (info: Partial<CafeInfo>) => {
    setCafeInfo((prev) => ({ ...prev, ...info }));
  };

  const updatePrinterSettings = (settings: Partial<PrinterSettings>) => {
    setPrinterSettings((prev) => ({ ...prev, ...settings }));
  };

  // Shifts
  const closeShift = (endingCash: number) => {
    setCurrentShift((prev) => ({
      ...prev,
      endingCash,
      endTime: new Date().toISOString(),
      status: 'closed',
    }));
  };

  const openNewShift = (startingCash: number) => {
    setCurrentShift({
      id: `SHIFT-${Date.now()}`,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      startTime: new Date().toISOString(),
      startingCash,
      cashSales: 0,
      digitalSales: 0,
      totalOrders: 0,
      status: 'open',
    });
  };

  return (
    <POSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        catalogTab,
        setCatalogTab,
        currentUser,
        staffList,
        loginWithPin,
        switchUser,
        cafeInfo,
        updateCafeInfo,
        printerSettings,
        updatePrinterSettings,
        products,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        updateProductStock,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        pax,
        setPax,
        customerName,
        setCustomerName,
        orderNotes,
        setOrderNotes,
        discountPercentage,
        setDiscountPercentage,
        deliveryCost,
        setDeliveryCost,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotals,
        orders,
        sendCartToKitchen,
        checkoutOrder,
        updateOrderStatus,
        cancelOrder,
        loadOrderToCart,
        receiptOrderToView,
        setReceiptOrderToView,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        currentShift,
        closeShift,
        openNewShift,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
