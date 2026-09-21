import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  MapPin,
  FileText,
  Receipt,
  CreditCard,
  Boxes,
  ClipboardCheck,
  BarChart3,
  ExternalLink,
  ShieldAlert,
  X,
  Sparkles,
  Wrench,
  Smartphone
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, userRole, currentOrg } = useApp();

  const navSections: Array<{
    title: string;
    items: Array<{
      id: ActiveTab;
      label: string;
      icon: React.ReactNode;
      badge?: string;
      highlight?: boolean;
    }>;
  }> = [
    {
      title: 'Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
        { id: 'customers', label: 'Customers / CRM', icon: <Users className="w-4.5 h-4.5" /> },
        { id: 'jobs', label: 'Jobs / Work Orders', icon: <Briefcase className="w-4.5 h-4.5" /> },
        { id: 'dispatch', label: 'Schedule & Dispatch', icon: <Calendar className="w-4.5 h-4.5" /> },
        {
          id: 'services',
          label: 'Services & Trades',
          icon: <Wrench className="w-4.5 h-4.5" />,
        },
        { id: 'map', label: 'GPS & Location Map', icon: <MapPin className="w-4.5 h-4.5" /> },
        { id: 'technician', label: 'Technician Mobile App', icon: <Smartphone className="w-4.5 h-4.5" />, highlight: true },
        { id: 'mobile', label: 'Android Kotlin Hub', icon: <Smartphone className="w-4.5 h-4.5" />, badge: 'Native' },
      ],
    },
    {
      title: 'Finance & Payments',
      items: [
        { id: 'estimates', label: 'Estimates / Quotes', icon: <FileText className="w-4.5 h-4.5" /> },
        { id: 'invoices', label: 'Invoices & eTIMS', icon: <Receipt className="w-4.5 h-4.5" /> },
        { id: 'payments', label: 'Payments & Billing', icon: <CreditCard className="w-4.5 h-4.5" /> },
      ],
    },
    {
      title: 'Management & Standards',
      items: [
        { id: 'inventory', label: 'Inventory & Parts', icon: <Boxes className="w-4.5 h-4.5" /> },
        { id: 'forms', label: 'Forms & Checklists', icon: <ClipboardCheck className="w-4.5 h-4.5" /> },
        { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4.5 h-4.5" /> },
        { id: 'portal', label: 'Customer Portal', icon: <ExternalLink className="w-4.5 h-4.5" /> },
        { id: 'audit', label: 'Audit Trail', icon: <ShieldAlert className="w-4.5 h-4.5" /> },
      ],
    },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0F172A] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/80 bg-[#0A101D]">
          <BrandLogo size="md" />
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {navSections.map(section => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {section.title}
              </div>
              {section.items.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-[#14B8A6] text-white font-semibold shadow-xs'
                        : item.highlight
                        ? 'text-teal-300 hover:bg-slate-800/80 hover:text-teal-200'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`transition-colors ${
                          isActive
                            ? 'text-white'
                            : item.highlight
                            ? 'text-[#14B8A6]'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-teal-950 text-teal-300 border border-teal-800/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Workspace & Connectivity Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0A101D]/70">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              System Operational
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800/50">
              {userRole}
            </span>
          </div>
          <div className="mt-1 px-2 text-[10px] text-slate-500 truncate">
            {currentOrg?.name || 'fieldnora SaaS'}
          </div>
        </div>
      </aside>
    </>
  );
};
