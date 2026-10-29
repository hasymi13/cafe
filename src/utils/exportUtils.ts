import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Order, Product, CafeInfo } from '../types/pos';
import { formatRupiah, formatDateTime } from './formatters';

// Export daily / filtered orders to Excel (.xlsx)
export function exportOrdersToExcel(orders: Order[], cafe: CafeInfo, dateTitle: string): void {
  // Sheet 1: Transactions
  const transactionRows = orders.map((ord, idx) => ({
    'No': idx + 1,
    'No. Order': `#${ord.orderNumber}`,
    'ID Transaksi': ord.id,
    'Waktu': formatDateTime(ord.createdAt),
    'Tipe': ord.orderType,
    'Meja / Pelanggan': ord.tableNumber || ord.customerName || '-',
    'Jumlah Item': ord.items.reduce((sum, it) => sum + it.quantity, 0),
    'Detail Menu': ord.items.map((it) => `${it.product.name} (${it.quantity}x)`).join(', '),
    'Subtotal': ord.subtotal,
    'Service Charge (5%)': ord.serviceCharge,
    'Pajak PB1 (10%)': ord.tax,
    'Diskon': ord.discountAmount,
    'Ongkir': ord.deliveryCost,
    'Rounding': ord.rounding,
    'Total Pembayaran': ord.total,
    'Metode Bayar': ord.paymentMethod ? ord.paymentMethod.toUpperCase() : 'BELUM BAYAR',
    'Status': ord.status.toUpperCase(),
    'Kasir': ord.cashierName,
  }));

  // Summary Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const totalTax = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.tax : 0), 0);
  const totalService = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.serviceCharge : 0), 0);
  const cashTotal = orders.filter((o) => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.total, 0);
  const qrisTotal = orders.filter((o) => o.paymentMethod === 'qris').reduce((sum, o) => sum + o.total, 0);
  const debitTotal = orders.filter((o) => o.paymentMethod === 'debit' || o.paymentMethod === 'credit').reduce((sum, o) => sum + o.total, 0);
  const ewalletTotal = orders.filter((o) => o.paymentMethod === 'ewallet').reduce((sum, o) => sum + o.total, 0);

  const summaryRows = [
    { Parameter: 'Nama Cafe', Nilai: cafe.name },
    { Parameter: 'Periode / Tanggal', Nilai: dateTitle },
    { Parameter: 'Total Transaksi', Nilai: orders.length },
    { Parameter: 'Total Omset (Gross Revenue)', Nilai: formatRupiah(totalRevenue) },
    { Parameter: 'Total Pajak PB1', Nilai: formatRupiah(totalTax) },
    { Parameter: 'Total Service Charge', Nilai: formatRupiah(totalService) },
    { Parameter: 'Pembayaran Tunai (Cash)', Nilai: formatRupiah(cashTotal) },
    { Parameter: 'Pembayaran QRIS', Nilai: formatRupiah(qrisTotal) },
    { Parameter: 'Pembayaran Kartu EDC/Debit', Nilai: formatRupiah(debitTotal) },
    { Parameter: 'Pembayaran E-Wallet', Nilai: formatRupiah(ewalletTotal) },
  ];

  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');

  const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Daftar Transaksi');

  // Trigger download
  const fileName = `Laporan_Penjualan_${cafe.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Export Inventory & Stock report to Excel
export function exportStockToExcel(products: Product[], cafe: CafeInfo): void {
  const stockRows = products.map((p, idx) => {
    const assetValue = p.stock * p.costPrice;
    const potentialRevenue = p.stock * p.price;
    const isLow = p.stock <= p.minStockAlert;

    return {
      'No': idx + 1,
      'Kode Barcode': p.barcode || '-',
      'Nama Menu': p.name,
      'Kategori': p.category,
      'Sisa Stok': p.stock,
      'Batas Minimal Stok': p.minStockAlert,
      'Status Stok': isLow ? 'MENIPIS (PERLU RESTOCK)' : 'AMAN',
      'HPP (Modal / Pcs)': p.costPrice,
      'Harga Jual / Pcs': p.price,
      'Margin Laba Kotor / Pcs': p.price - p.costPrice,
      'Total Nilai Modal Stok': assetValue,
      'Potensi Omset': potentialRevenue,
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(stockRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Stok & HPP');

  const fileName = `Audit_Stok_${cafe.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// Export Sales Report to PDF using jsPDF
export function exportOrdersToPDF(orders: Order[], cafe: CafeInfo, dateTitle: string): void {
  const doc = new jsPDF();
  let y = 20;

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(cafe.name, 14, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${cafe.address} | Telp: ${cafe.phone}`, 14, y);
  y += 5;
  doc.text(`LAPORAN KEUANGAN & PENJUALAN HARIAN (${dateTitle})`, 14, y);
  y += 4;
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 8;

  // Key Financial Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const totalTax = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.tax : 0), 0);
  const totalService = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.serviceCharge : 0), 0);
  const completedOrders = orders.filter((o) => o.status === 'completed' || o.paymentStatus === 'paid').length;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN KEUANGAN:', 14, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.text(`* Total Omset Kotor (Gross): ${formatRupiah(totalRevenue)}`, 14, y);
  y += 6;
  doc.text(`* Total Pajak PB1 (10%): ${formatRupiah(totalTax)}`, 14, y);
  y += 6;
  doc.text(`* Total Service Charge (5%): ${formatRupiah(totalService)}`, 14, y);
  y += 6;
  doc.text(`* Total Transaksi Selesai: ${completedOrders} pesanan`, 14, y);
  y += 10;

  // Table header
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 244, 248);
  doc.rect(14, y - 4, 182, 8, 'F');
  doc.text('#', 16, y);
  doc.text('Order', 25, y);
  doc.text('Waktu', 48, y);
  doc.text('Tipe', 75, y);
  doc.text('Metode', 105, y);
  doc.text('Kasir', 135, y);
  doc.text('Total (Rp)', 165, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  orders.slice(0, 24).forEach((ord, i) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${i + 1}`, 16, y);
    doc.text(`#${ord.orderNumber}`, 25, y);
    doc.text(new Date(ord.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), 48, y);
    doc.text(ord.orderType, 75, y);
    doc.text((ord.paymentMethod || 'Unpaid').toUpperCase(), 105, y);
    doc.text(ord.cashierName.substring(0, 12), 135, y);
    doc.text(formatRupiah(ord.total, false), 165, y);
    y += 7;
  });

  if (orders.length > 24) {
    doc.setFont('helvetica', 'italic');
    doc.text(`... dan ${orders.length - 24} transaksi lainnya (unduh Excel untuk daftar lengkap)`, 14, y + 4);
    y += 10;
  }

  y += 10;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'normal');
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, y);
  doc.text('Mengetahui / Penanggung Jawab Outlet:', 125, y);
  y += 20;
  doc.text('( .................................................. )', 125, y);
  y += 5;
  doc.text('Manager / Pemilik Cafe', 135, y);

  const fileName = `Laporan_Keuangan_${cafe.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
