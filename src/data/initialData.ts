import { Product, StaffUser, CafeInfo, PrinterSettings, Order } from '../types/pos';

export const INITIAL_CAFE_INFO: CafeInfo = {
  name: 'CAFE ARTHALOKA & ROASTERY',
  tagline: 'Artisan Coffee & Good Vibes',
  address: 'Jl. Boulevard Melati No. 42, Kota Baru',
  phone: '0812-3456-7890',
  wifiPassword: 'ngopidulu_bro',
  taxPercentage: 10,
  servicePercentage: 5,
};

export const INITIAL_STAFF_USERS: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Budi Santoso',
    role: 'owner',
    pin: '1234',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'staff-2',
    name: 'Siti Rahma',
    role: 'cashier',
    pin: '0000',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'staff-3',
    name: 'Dimas Pratama',
    role: 'cashier',
    pin: '1111',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_PRINTER_SETTINGS: PrinterSettings = {
  printerName: 'POS-58 Thermal Printer (ESC/POS)',
  paperWidth: '58mm',
  autoPrintReceipt: true,
  autoCut: true,
  showLogo: true,
  footerMessage: 'Terima kasih atas kunjungan Anda!\nFollow IG kami @arthaloka.cafe',
  connectionType: 'browser',
  isConnected: true,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Caramel Milkshake',
    category: 'Stand Minuman',
    price: 26000,
    costPrice: 12000,
    stock: 540,
    minStockAlert: 25,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80',
    barcode: '8991001',
    isPopular: true,
    isAvailable: true,
    modifiers: [
      {
        name: 'Ukuran',
        options: [
          { label: 'Regular', extraPrice: 0 },
          { label: 'Large', extraPrice: 5000 },
        ],
      },
      {
        name: 'Gula',
        options: [
          { label: 'Normal Sugar', extraPrice: 0 },
          { label: 'Less Sugar', extraPrice: 0 },
        ],
      },
    ],
  },
  {
    id: 'prod-2',
    name: 'Caramel Mochiato',
    category: 'Coffee',
    price: 30000,
    costPrice: 14000,
    stock: 420,
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    barcode: '8991002',
    isPopular: true,
    isAvailable: true,
    modifiers: [
      {
        name: 'Suhu',
        options: [
          { label: 'Hot', extraPrice: 0 },
          { label: 'Iced', extraPrice: 2000 },
        ],
      },
      {
        name: 'Extra Shot Espresso',
        options: [
          { label: 'Single Shot', extraPrice: 0 },
          { label: 'Double Shot (+Rp 6.000)', extraPrice: 6000 },
        ],
      },
    ],
  },
  {
    id: 'prod-3',
    name: 'Cha Tea Latte',
    category: 'Stand Minuman',
    price: 29000,
    costPrice: 13000,
    stock: 670,
    minStockAlert: 30,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
    barcode: '8991003',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 'prod-4',
    name: 'Chicken Popcorn',
    category: 'Snack',
    price: 23000,
    costPrice: 11000,
    stock: 1333,
    minStockAlert: 50,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80',
    barcode: '8991004',
    isPopular: true,
    isAvailable: true,
    modifiers: [
      {
        name: 'Bumbu Tabur',
        options: [
          { label: 'Original Savory', extraPrice: 0 },
          { label: 'BBQ Spicy', extraPrice: 1000 },
          { label: 'Cheese Delight', extraPrice: 1000 },
        ],
      },
    ],
  },
  {
    id: 'prod-5',
    name: 'Chicken Stick',
    category: 'Snack',
    price: 20000,
    costPrice: 9000,
    stock: 875,
    minStockAlert: 40,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
    barcode: '8991005',
    isPopular: false,
    isAvailable: true,
  },
  {
    id: 'prod-6',
    name: 'Chicken Wings',
    category: 'Snack',
    price: 32000,
    costPrice: 16000,
    stock: 883,
    minStockAlert: 40,
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&auto=format&fit=crop&q=80',
    barcode: '8991006',
    isPopular: true,
    isAvailable: true,
    modifiers: [
      {
        name: 'Saus Pilihan',
        options: [
          { label: 'Honey Garlic', extraPrice: 0 },
          { label: 'Fire Spicy Level 1', extraPrice: 0 },
          { label: 'Fire Spicy Level 3', extraPrice: 2000 },
        ],
      },
    ],
  },
  {
    id: 'prod-7',
    name: 'Chocolate Frapucino',
    category: 'Stand Minuman',
    price: 39000,
    costPrice: 18000,
    stock: 310,
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80',
    barcode: '8991007',
    isPopular: true,
    isAvailable: true,
    modifiers: [
      {
        name: 'Ukuran',
        options: [
          { label: 'Regular', extraPrice: 0 },
          { label: 'Large (+Rp 6.000)', extraPrice: 6000 },
        ],
      },
      {
        name: 'Whipped Cream',
        options: [
          { label: 'With Cream', extraPrice: 0 },
          { label: 'No Cream', extraPrice: 0 },
        ],
      },
    ],
  },
  {
    id: 'prod-8',
    name: 'Coffee Latte',
    category: 'Coffee',
    price: 30000,
    costPrice: 13000,
    stock: 580,
    minStockAlert: 30,
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80',
    barcode: '8991008',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 'prod-9',
    name: 'Custom Cake',
    category: 'Cake Pastries',
    price: 45000,
    costPrice: 22000,
    stock: 24,
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80',
    barcode: '8991009',
    isPopular: false,
    isAvailable: true,
  },
  {
    id: 'prod-10',
    name: 'Dancing Ice Cream',
    category: 'Stand Minuman',
    price: 18000,
    costPrice: 8000,
    stock: 120,
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop&q=80',
    barcode: '8991010',
    isPopular: false,
    isAvailable: true,
  },
  {
    id: 'prod-11',
    name: 'Dino Nugget',
    category: 'Snack',
    price: 12000,
    costPrice: 5000,
    stock: 950,
    minStockAlert: 50,
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&auto=format&fit=crop&q=80',
    barcode: '8991011',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 'prod-12',
    name: 'Double Chocolate Doughnut',
    category: 'Cake Pastries',
    price: 15000,
    costPrice: 6500,
    stock: 45,
    minStockAlert: 15,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80',
    barcode: '8991012',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 'prod-13',
    name: 'Nasi Goreng Cafe Spesial',
    category: 'Resto Cafe',
    price: 38000,
    costPrice: 17000,
    stock: 95,
    minStockAlert: 15,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80',
    barcode: '8991013',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 'prod-14',
    name: 'Spaghetti Creamy Carbonara',
    category: 'Resto Cafe',
    price: 42000,
    costPrice: 20000,
    stock: 60,
    minStockAlert: 15,
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&auto=format&fit=crop&q=80',
    barcode: '8991014',
    isPopular: false,
    isAvailable: true,
  },
  {
    id: 'prod-15',
    name: 'Combo Ngopi Santai (Latte + Donut)',
    category: 'Product Combo',
    price: 40000,
    costPrice: 19500,
    stock: 40,
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&auto=format&fit=crop&q=80',
    barcode: '8991015',
    isPopular: true,
    isAvailable: true,
  },
  {
    id: 'prod-16',
    name: 'Butter Croissant Premium',
    category: 'Cake Pastries',
    price: 22000,
    costPrice: 10000,
    stock: 18, // low stock example
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
    barcode: '8991016',
    isPopular: true,
    isAvailable: true,
  },
];

// Generate some sample past orders to show rich analytics & reports immediately
export const generateSampleOrders = (): Order[] => {
  const now = new Date();
  const orders: Order[] = [];

  // Order #042 matching the image cart!
  orders.push({
    id: 'ORD-20261028-042',
    orderNumber: 42,
    orderType: 'DINE-IN',
    tableNumber: '05',
    pax: 1,
    customerName: 'Meja 5',
    items: [
      {
        cartItemId: 'c1',
        product: INITIAL_PRODUCTS[5], // Chicken Wings
        quantity: 1,
        selectedModifiers: [],
        unitPrice: 32000,
        totalPrice: 32000,
      },
      {
        cartItemId: 'c2',
        product: INITIAL_PRODUCTS[4], // Chicken Stick
        quantity: 1,
        selectedModifiers: [],
        unitPrice: 20000,
        totalPrice: 20000,
      },
      {
        cartItemId: 'c3',
        product: INITIAL_PRODUCTS[3], // Chicken Popcorn
        quantity: 1,
        selectedModifiers: [],
        unitPrice: 23000,
        totalPrice: 23000,
      },
      {
        cartItemId: 'c4',
        product: INITIAL_PRODUCTS[10], // Dino Nugget
        quantity: 1,
        selectedModifiers: [],
        unitPrice: 12000,
        totalPrice: 12000,
      },
      {
        cartItemId: 'c5',
        product: INITIAL_PRODUCTS[6], // Chocolate Frapucino
        quantity: 1,
        selectedModifiers: [{ groupName: 'Ukuran', label: 'Large, Coklat', extraPrice: 0 }],
        unitPrice: 39000,
        totalPrice: 39000,
      },
    ],
    subtotal: 126000,
    serviceRate: 0.05,
    serviceCharge: 6300,
    taxRate: 0.1,
    tax: 9330, // 10% of subtotal+service approx
    discountRate: 0,
    discountAmount: 0,
    deliveryCost: 0,
    rounding: -30,
    total: 141600,
    status: 'cooking',
    paymentStatus: 'paid',
    paymentMethod: 'qris',
    cashierName: 'Siti Rahma',
    createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
  });

  // Today previous completed orders
  const todayTimes = [50, 90, 140, 210, 300, 360, 420];
  const methods: ('cash' | 'qris' | 'debit' | 'ewallet')[] = ['cash', 'qris', 'qris', 'debit', 'cash', 'ewallet', 'qris'];

  todayTimes.forEach((minutesAgo, idx) => {
    const item1 = INITIAL_PRODUCTS[idx % INITIAL_PRODUCTS.length];
    const item2 = INITIAL_PRODUCTS[(idx + 2) % INITIAL_PRODUCTS.length];
    const sub = item1.price * 2 + item2.price;
    const serv = Math.round(sub * 0.05);
    const tax = Math.round((sub + serv) * 0.1);
    const tot = sub + serv + tax;
    const isCash = methods[idx] === 'cash';

    orders.push({
      id: `ORD-20261028-0${30 + idx}`,
      orderNumber: 30 + idx,
      orderType: idx % 2 === 0 ? 'DINE-IN' : 'TAKE-AWAY',
      tableNumber: idx % 2 === 0 ? `0${idx + 1}` : '-',
      pax: idx % 2 === 0 ? 2 : 1,
      customerName: idx % 2 === 0 ? `Meja 0${idx + 1}` : 'Takeaway Pelanggan',
      items: [
        {
          cartItemId: `sample-${idx}-1`,
          product: item1,
          quantity: 2,
          selectedModifiers: [],
          unitPrice: item1.price,
          totalPrice: item1.price * 2,
        },
        {
          cartItemId: `sample-${idx}-2`,
          product: item2,
          quantity: 1,
          selectedModifiers: [],
          unitPrice: item2.price,
          totalPrice: item2.price,
        },
      ],
      subtotal: sub,
      serviceRate: 0.05,
      serviceCharge: serv,
      taxRate: 0.1,
      tax: tax,
      discountRate: 0,
      discountAmount: 0,
      deliveryCost: 0,
      rounding: 0,
      total: tot,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod: methods[idx],
      amountPaid: isCash ? Math.ceil(tot / 10000) * 10000 : tot,
      changeDue: isCash ? Math.ceil(tot / 10000) * 10000 - tot : 0,
      cashierName: idx % 2 === 0 ? 'Siti Rahma' : 'Dimas Pratama',
      createdAt: new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - (minutesAgo - 15) * 60 * 1000).toISOString(),
    });
  });

  // Yesterday and older orders for monthly trends
  for (let day = 1; day <= 28; day++) {
    const orderCountPerDay = 15 + Math.floor(Math.sin(day) * 8) + (day % 7 === 0 || day % 7 === 6 ? 12 : 0);
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - day);
    dayDate.setHours(14, 0, 0, 0);

    const sub = 78000 + (day % 5) * 15000;
    const serv = Math.round(sub * 0.05);
    const tax = Math.round((sub + serv) * 0.1);

    orders.push({
      id: `ORD-PAST-${day}-1`,
      orderNumber: 100 + day,
      orderType: day % 3 === 0 ? 'TAKE-AWAY' : 'DINE-IN',
      tableNumber: `0${(day % 8) + 1}`,
      pax: 2,
      items: [
        {
          cartItemId: `hist-${day}-1`,
          product: INITIAL_PRODUCTS[day % INITIAL_PRODUCTS.length],
          quantity: 2,
          selectedModifiers: [],
          unitPrice: INITIAL_PRODUCTS[day % INITIAL_PRODUCTS.length].price,
          totalPrice: INITIAL_PRODUCTS[day % INITIAL_PRODUCTS.length].price * 2,
        },
      ],
      subtotal: sub * orderCountPerDay,
      serviceRate: 0.05,
      serviceCharge: serv * orderCountPerDay,
      taxRate: 0.1,
      tax: tax * orderCountPerDay,
      discountRate: 0,
      discountAmount: 0,
      deliveryCost: 0,
      rounding: 0,
      total: (sub + serv + tax) * orderCountPerDay,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod: day % 2 === 0 ? 'qris' : 'cash',
      cashierName: 'Siti Rahma',
      createdAt: dayDate.toISOString(),
      completedAt: dayDate.toISOString(),
    });
  }

  return orders;
};
