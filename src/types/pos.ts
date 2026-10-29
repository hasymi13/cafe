export type UserRole = 'owner' | 'cashier';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
  avatar: string;
}

export type CategoryType =
  | 'All Categories'
  | 'Popular'
  | 'Product Combo'
  | 'Resto Cafe'
  | 'Cake Pastries'
  | 'Stand Minuman'
  | 'Snack'
  | 'Coffee';

export interface ProductModifier {
  name: string;
  options: { label: string; extraPrice: number }[];
}

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  price: number;
  costPrice: number; // Harga Pokok Penjualan (HPP)
  stock: number;
  minStockAlert: number;
  imageUrl: string;
  barcode?: string;
  description?: string;
  isPopular?: boolean;
  modifiers?: ProductModifier[];
  isAvailable: boolean;
}

export interface SelectedModifier {
  groupName: string;
  label: string;
  extraPrice: number;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
}

export type OrderType = 'DINE-IN' | 'TAKE-AWAY' | 'DELIVERY';

export type OrderStatus = 'new' | 'cooking' | 'ready' | 'completed' | 'cancelled';

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'credit' | 'ewallet';

export interface Order {
  id: string;
  orderNumber: number;
  orderType: OrderType;
  tableNumber: string;
  pax: number;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  serviceRate: number; // e.g. 0.05 (5%)
  serviceCharge: number;
  taxRate: number; // e.g. 0.10 (10%)
  tax: number;
  discountRate: number;
  discountAmount: number;
  deliveryCost: number;
  rounding: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  amountPaid?: number;
  changeDue?: number;
  cashierName: string;
  orderNotes?: string;
  createdAt: string; // ISO
  completedAt?: string;
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  endingCash?: number;
  cashSales: number;
  digitalSales: number;
  totalOrders: number;
  status: 'open' | 'closed';
}

export interface PrinterSettings {
  printerName: string;
  paperWidth: '58mm' | '80mm';
  autoPrintReceipt: boolean;
  autoCut: boolean;
  showLogo: boolean;
  footerMessage: string;
  connectionType: 'browser' | 'bluetooth' | 'usb';
  isConnected: boolean;
}

export interface CafeInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  wifiPassword?: string;
  taxPercentage: number;
  servicePercentage: number;
  logoUrl?: string;
}
