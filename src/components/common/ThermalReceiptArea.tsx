import React from 'react';
import { usePOS } from '../../context/POSContext';
import { formatThermalReceiptText } from '../../utils/thermalPrinter';

export const ThermalReceiptArea: React.FC = () => {
  const { receiptOrderToView, cafeInfo, printerSettings } = usePOS();

  if (!receiptOrderToView) return null;

  const receiptContent = formatThermalReceiptText(receiptOrderToView, cafeInfo, printerSettings);

  return (
    <div id="thermal-receipt-print-area" className="hidden print:block p-2 text-black bg-white">
      <pre className="font-mono text-[11px] leading-tight whitespace-pre-wrap">{receiptContent}</pre>
    </div>
  );
};
