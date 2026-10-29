import { Order, CafeInfo, PrinterSettings } from '../types/pos';
import { formatRupiah, formatDateTime } from './formatters';

export function formatThermalReceiptText(
  order: Order,
  cafe: CafeInfo,
  settings: PrinterSettings
): string {
  const width = settings.paperWidth === '58mm' ? 32 : 48;
  const divider = '-'.repeat(width);
  const doubleDivider = '='.repeat(width);

  const center = (text: string) => {
    if (text.length >= width) return text.substring(0, width);
    const padding = Math.floor((width - text.length) / 2);
    return ' '.repeat(padding) + text;
  };

  const padRow = (left: string, right: string) => {
    const spaceCount = width - left.length - right.length;
    if (spaceCount <= 0) return `${left} ${right}`;
    return left + ' '.repeat(spaceCount) + right;
  };

  const lines: string[] = [];

  // Header
  lines.push(center(cafe.name));
  if (cafe.tagline) lines.push(center(cafe.tagline));
  lines.push(center(cafe.address));
  lines.push(center(`Telp: ${cafe.phone}`));
  lines.push(doubleDivider);

  // Order Details
  lines.push(padRow(`No. Order: #${order.orderNumber}`, order.orderType));
  if (order.tableNumber && order.tableNumber !== '-') {
    lines.push(padRow(`Meja: ${order.tableNumber}`, `Pax: ${order.pax || 1}`));
  }
  lines.push(padRow(`Kasir: ${order.cashierName}`, formatDateTime(order.createdAt)));
  lines.push(divider);

  // Items
  order.items.forEach((item) => {
    lines.push(item.product.name);
    const qtyPrice = `  ${item.quantity}x @${formatRupiah(item.unitPrice, false)}`;
    const lineTotal = formatRupiah(item.totalPrice, false);
    lines.push(padRow(qtyPrice, lineTotal));

    if (item.selectedModifiers && item.selectedModifiers.length > 0) {
      item.selectedModifiers.forEach((mod) => {
        lines.push(`   * ${mod.label}`);
      });
    }
    if (item.notes) {
      lines.push(`   Note: ${item.notes}`);
    }
  });

  lines.push(divider);

  // Totals
  lines.push(padRow('Subtotal', formatRupiah(order.subtotal)));
  if (order.serviceCharge > 0) {
    lines.push(padRow(`Service (${(order.serviceRate * 100).toFixed(0)}%)`, formatRupiah(order.serviceCharge)));
  }
  if (order.tax > 0) {
    lines.push(padRow(`PB1/Pajak (${(order.taxRate * 100).toFixed(0)}%)`, formatRupiah(order.tax)));
  }
  if (order.discountAmount > 0) {
    lines.push(padRow('Diskon', `-${formatRupiah(order.discountAmount)}`));
  }
  if (order.deliveryCost > 0) {
    lines.push(padRow('Ongkir', formatRupiah(order.deliveryCost)));
  }
  if (order.rounding !== 0) {
    lines.push(padRow('Rounding', (order.rounding > 0 ? '+' : '') + formatRupiah(order.rounding, false)));
  }

  lines.push(doubleDivider);
  lines.push(padRow('TOTAL', formatRupiah(order.total)));

  if (order.paymentMethod) {
    const methodMap: Record<string, string> = {
      cash: 'TUNAI (CASH)',
      qris: 'QRIS DIGITAL',
      debit: 'KARTU DEBIT',
      credit: 'KARTU KREDIT',
      ewallet: 'E-WALLET',
    };
    lines.push(padRow('Metode Bayar', methodMap[order.paymentMethod] || order.paymentMethod.toUpperCase()));

    if (order.paymentMethod === 'cash' && order.amountPaid) {
      lines.push(padRow('Bayar Tunai', formatRupiah(order.amountPaid)));
      lines.push(padRow('Kembalian', formatRupiah(order.changeDue || 0)));
    }
  }

  lines.push(divider);

  if (cafe.wifiPassword) {
    lines.push(center(`WiFi: ${cafe.name} | Pass: ${cafe.wifiPassword}`));
  }

  if (settings.footerMessage) {
    settings.footerMessage.split('\n').forEach((m) => lines.push(center(m)));
  }

  lines.push('\n\n\n'); // Feed lines for paper tear

  return lines.join('\n');
}

export function printThermalReceiptBrowser(): void {
  window.print();
}

export async function connectWebBluetoothPrinter(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
    try {
      // Prompt user to select ESC/POS thermal printer via Bluetooth
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '49535343-fe7d-4ae5-8fa9-9fafd205e455'],
      });
      return !!device;
    } catch {
      // User cancelled dialog or mock mode
      return false;
    }
  }
  return false;
}
