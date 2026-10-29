/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { HeaderNav } from './components/pos/HeaderNav';
import { OrderCartPanel } from './components/pos/OrderCartPanel';
import { ProductCatalogPanel } from './components/pos/ProductCatalogPanel';
import { PaymentModal } from './components/pos/PaymentModal';
import { ThermalReceiptModal } from './components/pos/ThermalReceiptModal';
import { ThermalReceiptArea } from './components/common/ThermalReceiptArea';
import { TableSelectModal } from './components/pos/TableSelectModal';
import { KitchenDisplay } from './components/kitchen/KitchenDisplay';
import { StockManagement } from './components/stock/StockManagement';
import { DailyReport } from './components/reports/DailyReport';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { SettingsView } from './components/settings/SettingsView';

const POSAppContent: React.FC = () => {
  const { activeTab } = usePOS();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Blue Header matching reference image */}
      <HeaderNav
        onOpenTableModal={() => setIsTableModalOpen(true)}
        onOpenServedByModal={() => {}}
      />

      {/* Main Content Area depending on activeTab */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'pos' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
            {/* Left Order Cart / Bill Panel */}
            <OrderCartPanel onOpenPaymentModal={() => setIsPaymentModalOpen(true)} />

            {/* Right Product Grid Catalog Panel */}
            <ProductCatalogPanel />
          </div>
        )}

        {activeTab === 'kitchen' && <KitchenDisplay />}

        {activeTab === 'stock' && <StockManagement />}

        {activeTab === 'daily_report' && <DailyReport />}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      <TableSelectModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />

      <ThermalReceiptModal />

      {/* Hidden Print Container for 58mm / 80mm ESC-POS printer outputs */}
      <ThermalReceiptArea />
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <POSAppContent />
    </POSProvider>
  );
}
