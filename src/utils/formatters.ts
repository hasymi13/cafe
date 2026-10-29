// Formatters for Indonesian POS

export function formatRupiah(amount: number, withPrefix = true): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(amount);

  return withPrefix ? `Rp ${formatted}` : formatted;
}

export function formatCompactNumber(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}Jt`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}Rb`;
  }
  return amount.toString();
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
