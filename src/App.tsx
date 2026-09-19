import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { AuthModal } from './components/auth/AuthModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { CustomersView } from './components/customers/CustomersView';
import { JobsView } from './components/jobs/JobsView';
import { DispatchView } from './components/dispatch/DispatchView';
import { TechnicianMobileView } from './components/technician/TechnicianMobileView';
import { GpsMapView } from './components/map/GpsMapView';
import { EstimatesView } from './components/estimates/EstimatesView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { PaymentsView } from './components/payments/PaymentsView';
import { InventoryView } from './components/inventory/InventoryView';
import { FormsView } from './components/forms/FormsView';
import { CustomerPortalView } from './components/portal/CustomerPortalView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { ServicesCatalogView } from './components/services/ServicesCatalogView';

const MainLayout: React.FC = () => {
  const { activeTab, technicianViewMode } = useApp();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'customers':
        return <CustomersView />;
      case 'jobs':
        return <JobsView />;
      case 'dispatch':
        return <DispatchView />;
      case 'technician':
        return <TechnicianMobileView />;
      case 'services':
        return <ServicesCatalogView />;
      case 'map':
        return <GpsMapView />;
      case 'estimates':
        return <EstimatesView />;
      case 'invoices':
        return <InvoicesView />;
      case 'payments':
        return <PaymentsView />;
      case 'inventory':
        return <InventoryView />;
      case 'forms':
        return <FormsView />;
      case 'portal':
        return <CustomerPortalView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditLogsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-[#0F172A] overflow-hidden antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top App Header */}
        <Header onToggleMobileSidebar={() => setMobileOpen(prev => !prev)} />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Modals & Drawers */}
      <GlobalSearchModal />
      <NotificationDrawer />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
