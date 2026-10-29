import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product, CategoryType } from '../../types/pos';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowLeft,
  X,
  PackagePlus,
  ShieldAlert,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';
import { exportStockToExcel } from '../../utils/exportUtils';

export const StockManagement: React.FC = () => {
  const {
    products,
    updateProductStock,
    addProduct,
    updateProduct,
    deleteProduct,
    currentUser,
    cafeInfo,
    setActiveTab,
  } = usePOS();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(50);

  // Form states for new or edit item
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryType>('Resto Cafe');
  const [formPrice, setFormPrice] = useState(0);
  const [formCostPrice, setFormCostPrice] = useState(0);
  const [formStock, setFormStock] = useState(100);
  const [formMinStock, setFormMinStock] = useState(20);
  const [formBarcode, setFormBarcode] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  const isOwner = currentUser.role === 'owner';

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === 'ALL' || p.category === selectedCat;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCat]);

  // Overall Inventory stats
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const totalStockAssetValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Resto Cafe');
    setFormPrice(25000);
    setFormCostPrice(12000);
    setFormStock(100);
    setFormMinStock(20);
    setFormBarcode(`89910${products.length + 1}`);
    setFormImageUrl('https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormCostPrice(p.costPrice);
    setFormStock(p.stock);
    setFormMinStock(p.minStockAlert);
    setFormBarcode(p.barcode || '');
    setFormImageUrl(p.imageUrl);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) {
      alert('Nama produk dan harga jual harus diisi!');
      return;
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: formName,
        category: formCategory,
        price: formPrice,
        costPrice: formCostPrice,
        stock: formStock,
        minStockAlert: formMinStock,
        barcode: formBarcode,
        imageUrl: formImageUrl || editingProduct.imageUrl,
      });
    } else {
      addProduct({
        name: formName,
        category: formCategory,
        price: formPrice,
        costPrice: formCostPrice,
        stock: formStock,
        minStockAlert: formMinStock,
        barcode: formBarcode,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
        isAvailable: true,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleConfirmRestock = () => {
    if (!restockProduct) return;
    updateProductStock(restockProduct.id, restockProduct.stock + Number(restockAmount));
    setRestockProduct(null);
  };

  const handleExportExcel = () => {
    exportStockToExcel(products, cafeInfo);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-53px)] bg-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('pos')}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Kembali ke Kasir"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-base leading-tight">
                Manajemen Stok & Inventaris Cafe
              </h2>
              <p className="text-xs text-slate-500">
                Pantau sisa bahan, peringatan stok menipis, HPP modal, dan margin keuntungan
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="Unduh Data Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#1976d2] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Total Varian Menu</div>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{products.length} Item</div>
            <div className="text-[11px] text-slate-400 mt-1">Total unit stok: {totalStockCount.toLocaleString('id-ID')} pcs</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Nilai Aset Modal (HPP)</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {formatRupiah(totalStockAssetValue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Estimasi modal persediaan bahan</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <PackagePlus className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Peringatan Stok Menipis</div>
            <div className={`text-2xl font-black mt-0.5 ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {lowStockCount} Item
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Perlu segera restock bahan</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 pb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama menu atau barcode..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto max-w-full">
          {['ALL', 'Stand Minuman', 'Coffee', 'Snack', 'Resto Cafe', 'Cake Pastries', 'Product Combo'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCat === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs h-full flex flex-col overflow-hidden">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4">Menu & Barcode</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-right">Sisa Stok</th>
                  <th className="py-3 px-3 text-right">Batas Min</th>
                  <th className="py-3 px-3 text-right">HPP (Modal)</th>
                  <th className="py-3 px-3 text-right">Harga Jual</th>
                  <th className="py-3 px-3 text-right">Margin Laba</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStockAlert;
                  const marginRp = p.price - p.costPrice;
                  const marginPct = p.price > 0 ? ((marginRp / p.price) * 100).toFixed(0) : '0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-800 text-xs">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Barcode: {p.barcode || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-lg text-[10px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                            isLow
                              ? 'bg-rose-100 text-rose-700 animate-pulse'
                              : 'text-slate-800'
                          }`}
                        >
                          {p.stock.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {p.minStockAlert}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 font-mono">
                        {isOwner ? formatRupiah(p.costPrice) : '***'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800 font-mono">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {isOwner ? (
                          <div>
                            <span className="text-emerald-700 font-bold">+{formatRupiah(marginRp)}</span>
                            <span className="text-[10px] text-slate-400 block">({marginPct}%)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Akses Pemilik</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Restock Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setRestockProduct(p);
                              setRestockAmount(50);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                            title="Tambah Stok Masuk"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            <span>Restock</span>
                          </button>

                          {/* Edit Product (Owner only) */}
                          {isOwner && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                title="Edit Menu & Harga"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Hapus menu "${p.name}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Hapus Menu"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-600 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5" />
                <h3 className="font-bold text-base">Restock Menu: {restockProduct.name}</h3>
              </div>
              <button onClick={() => setRestockProduct(null)} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-xs text-slate-500">
                Stok saat ini: <strong>{restockProduct.stock} pcs</strong>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Jumlah Tambahan Stok Masuk (Pcs)
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xl font-bold p-3 border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none text-center"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRestockAmount(num)}
                    className="py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-emerald-50 text-slate-700"
                  >
                    +{num}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl">
                Stok setelah restock: <strong>{restockProduct.stock + Number(restockAmount)} pcs</strong>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
              >
                Simpan Stok Masuk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Menu Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="bg-[#1976d2] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProduct ? 'Edit Menu & Harga' : 'Tambah Menu Baru'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Nama Menu
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Matcha Green Tea Latte"
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Kategori
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CategoryType)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Stand Minuman">Stand Minuman</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Snack">Snack</option>
                    <option value="Resto Cafe">Resto Cafe</option>
                    <option value="Cake Pastries">Cake Pastries</option>
                    <option value="Product Combo">Product Combo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Kode Barcode
                  </label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="8991001"
                    className="w-full font-mono text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Harga Jual Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full text-sm font-bold p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    HPP / Modal Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(Number(e.target.value))}
                    className="w-full text-sm font-bold p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Stok Saat Ini
                  </label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Batas Peringatan Min. Stok
                  </label>
                  <input
                    type="number"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  URL Foto Produk
                </label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-[#1976d2] hover:bg-blue-700 rounded-xl shadow-md"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
