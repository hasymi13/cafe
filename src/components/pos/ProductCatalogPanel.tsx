import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product, CategoryType, SelectedModifier } from '../../types/pos';
import {
  Search,
  SlidersHorizontal,
  ScanBarcode,
  Sparkles,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';
import { ModifierModal } from './ModifierModal';

const CATEGORIES: { label: CategoryType; subLabel?: string }[] = [
  { label: 'All Categories', subLabel: '' },
  { label: 'Popular', subLabel: '' },
  { label: 'Product Combo', subLabel: '' },
  { label: 'Resto Cafe', subLabel: 'Cafe' },
  { label: 'Cake Pastries', subLabel: 'Cafe' },
  { label: 'Stand Minuman', subLabel: 'Cafe' },
  { label: 'Snack', subLabel: 'Cafe' },
  { label: 'Coffee', subLabel: 'Cafe' },
];

export const ProductCatalogPanel: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
    catalogTab,
    setCatalogTab,
  } = usePOS();

  const [activeModifierProduct, setActiveModifierProduct] = useState<Product | null>(null);

  // Barcode search state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeFeedback, setBarcodeFeedback] = useState<string | null>(null);

  // Custom manual item state
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customCategory, setCustomCategory] = useState<CategoryType>('Resto Cafe');

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isAvailable) return false;

      // Category filter
      if (selectedCategory === 'Popular') {
        if (!p.isPopular) return false;
      } else if (selectedCategory !== 'All Categories') {
        if (p.category !== selectedCategory) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchBarcode = p.barcode?.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        if (!matchName && !matchBarcode && !matchCategory) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleProductClick = (product: Product) => {
    if (product.modifiers && product.modifiers.length > 0) {
      setActiveModifierProduct(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleModifierConfirm = (
    product: Product,
    quantity: number,
    selectedModifiers: SelectedModifier[],
    notes: string
  ) => {
    addToCart(product, quantity, selectedModifiers, notes);
  };

  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.id === barcodeInput.trim()
    );

    if (matched) {
      handleProductClick(matched);
      setBarcodeFeedback(`✓ Ditambahkan: ${matched.name}`);
      setBarcodeInput('');
      setTimeout(() => setBarcodeFeedback(null), 2000);
    } else {
      setBarcodeFeedback(`✕ Produk dengan kode "${barcodeInput}" tidak ditemukan`);
      setTimeout(() => setBarcodeFeedback(null), 3000);
    }
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(customPrice);
    if (!customName.trim() || isNaN(priceNum) || priceNum <= 0) {
      alert('Masukkan nama dan harga produk yang valid');
      return;
    }

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: customName,
      category: customCategory,
      price: priceNum,
      costPrice: Math.round(priceNum * 0.5),
      stock: 999,
      minStockAlert: 5,
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
    };

    addToCart(customProduct, 1);
    setCustomName('');
    setCustomPrice('');
    setCatalogTab('products');
  };

  return (
    <>
      <div className="flex-1 flex flex-col h-[calc(100vh-53px)] bg-[#f4f7f6] overflow-hidden">
        {/* Top Header of Right Panel: Search bar & Category dropdown */}
        <div className="bg-[#29b6f6] text-white px-3 py-2 flex items-center justify-between gap-3 shadow-xs">
          {/* Search Bar */}
          <div className="flex-1 relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-800" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu, kopi, snack..."
              className="w-full bg-white text-slate-800 pl-9 pr-8 py-1.5 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Current Category Title / Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                aria-label="Pilih Kategori Menu"
                className="appearance-none bg-sky-700/80 hover:bg-sky-700 text-white font-bold text-xs pl-3 pr-8 py-1.5 rounded-xl cursor-pointer border border-sky-400/50 focus:outline-none transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.label} value={cat.label} className="text-slate-800 bg-white">
                    {cat.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-sky-200" />
            </div>
          </div>
        </div>

        {/* Catalog Body Views */}
        {catalogTab === 'barcode' ? (
          /* Barcode Scanner View */
          <div className="flex-1 p-6 overflow-y-auto max-w-2xl mx-auto w-full">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ScanBarcode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Scan Barcode Menu</h3>
                  <p className="text-xs text-slate-500">Scan atau ketik kode barcode produk</p>
                </div>
              </div>

              <form onSubmit={handleBarcodeSubmit} className="space-y-3">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Ketik atau scan barcode (e.g. 8991006)"
                  autoFocus
                  className="w-full text-lg font-mono p-3 border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1976d2] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition"
                >
                  Cari & Tambahkan ke Order
                </button>
              </form>

              {barcodeFeedback && (
                <div
                  className={`mt-4 p-3 rounded-xl text-xs font-semibold ${
                    barcodeFeedback.startsWith('✓')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {barcodeFeedback}
                </div>
              )}

              <div className="mt-6 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Contoh Cepat Barcode:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {products.slice(0, 6).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setBarcodeInput(p.barcode || '');
                        handleProductClick(p);
                      }}
                      className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-xs transition"
                    >
                      <div className="font-bold truncate text-slate-800">{p.name}</div>
                      <div className="font-mono text-[10px] text-blue-600">{p.barcode}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : catalogTab === 'custom' ? (
          /* Custom Item Manual Entry */
          <div className="flex-1 p-6 overflow-y-auto max-w-xl mx-auto w-full">
            <form onSubmit={handleAddCustomItem} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Menu Custom / Manual</h3>
                  <p className="text-xs text-slate-500">Tambahkan item pesanan khusus langsung ke kasir</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nama Item Custom
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Paket Nasi Kotak Catering / Kue Ultah Custom"
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Harga Satuan (Rp)
                </label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Contoh: 75000"
                  className="w-full text-base font-bold p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Kategori
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as CategoryType)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="Resto Cafe">Resto Cafe</option>
                  <option value="Cake Pastries">Cake Pastries</option>
                  <option value="Stand Minuman">Stand Minuman</option>
                  <option value="Product Combo">Product Combo</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Tambahkan ke Pesanan
              </button>
            </form>
          </div>
        ) : (
          /* Main Product Cards Grid (Matching Reference Screenshot) */
          <div className="flex-1 overflow-y-auto p-2 sm:p-3">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Search className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">Tidak ada produk ditemukan</p>
                <p className="text-xs text-slate-400 mt-1">
                  Coba kata kunci lain atau pilih kategori &quot;All Categories&quot;
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock <= product.minStockAlert;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductClick(product)}
                      className="group bg-white rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-400 transition flex flex-col text-left cursor-pointer active:scale-[0.98] relative"
                    >
                      {/* Product Image */}
                      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />
                        {/* Green badge ribbon matching reference image */}
                        <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden pointer-events-none">
                          <div className="bg-[#4caf50] rotate-45 transform origin-bottom-left w-12 text-[7px] text-white font-bold text-center py-0.5 shadow-xs">
                            ✓
                          </div>
                        </div>

                        {/* Low stock warning indicator */}
                        {isLowStock && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Stok Menipis
                          </div>
                        )}
                      </div>

                      {/* Product Details (Matching Screenshot: Title, Stock count on left, Price bold on right) */}
                      <div className="p-2 flex-1 flex flex-col justify-between">
                        <h4 className="text-[12px] font-medium text-slate-800 line-clamp-1 leading-snug group-hover:text-blue-600 transition">
                          {product.name}
                        </h4>

                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          {/* Stock Counter in grey (e.g. 883, 875, 1,333) */}
                          <span className="text-slate-400 font-mono text-[10px]">
                            {product.stock.toLocaleString('id-ID')}
                          </span>

                          {/* Bold Price */}
                          <span className="font-extrabold text-slate-800 group-hover:text-blue-600 transition">
                            {formatRupiah(product.price, false)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom Category Quick-Switch Bar (Matching Screenshot Blue 2-Row Grid) */}
        <div className="bg-[#0288d1] p-1.5 border-t border-sky-400/40 select-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.label);
                    setCatalogTab('products');
                  }}
                  className={`py-2 px-2.5 rounded-lg text-left transition relative flex flex-col justify-center leading-tight cursor-pointer ${
                    isSelected
                      ? 'bg-white text-blue-900 shadow-sm font-bold border-l-4 border-blue-600'
                      : 'bg-[#039be5] text-white hover:bg-[#29b6f6] font-semibold'
                  }`}
                >
                  <span className="text-xs truncate">{cat.label}</span>
                  {cat.subLabel && (
                    <span className="text-[9px] opacity-75 font-normal">{cat.subLabel}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modifier / Customizer Modal */}
      <ModifierModal
        product={activeModifierProduct}
        isOpen={!!activeModifierProduct}
        onClose={() => setActiveModifierProduct(null)}
        onConfirm={handleModifierConfirm}
      />
    </>
  );
};
