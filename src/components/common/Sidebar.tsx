import React, { useState } from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  LayoutGrid,
  Package,
  Clock,
  Navigation,
  Search,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  MoreHorizontal,
  Smartphone,
  CreditCard,
  Boxes,
  ClipboardCheck,
  BarChart3,
  Users,
  Calendar,
  User,
  Building2,
  ChevronDown,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
}) => {
  const { activeTab, setActiveTab, currentUser, userRole, logout } = useApp();
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);

  // Primary nav items matching the exact UI from the screenshot:
  // Dashboard, Jobs, Schedule, Live Map, Technicians, Customers, Invoices, Payments, Inventory, Reports, Settings
  const primaryNavItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: 'dispatch',
      label: 'Schedule',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'map',
      label: 'Live Map',
      icon: <Navigation className="w-5 h-5" />,
      badge: 'Live',
    },
    {
      id: 'technician',
      label: 'Technicians',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Boxes className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'audit',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  // Secondary utility modules (Map, Quotes, Forms, Mobile Android APK)
  const secondaryNavItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    { id: 'map', label: 'Fleet GPS Map', icon: <Navigation className="w-4 h-4" /> },
    { id: 'estimates', label: 'Estimates / Quotes', icon: <FileText className="w-4 h-4" /> },
    { id: 'forms', label: 'Forms & Safety', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'mobile', label: 'Android Kotlin Hub', icon: <Smartphone className="w-4 h-4" />, badge: 'Native' },
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0B1118] text-slate-300 flex flex-col transition-all duration-200 ease-in-out border-r border-[#1E293B]/70 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-[#1E293B]/60 bg-[#0B1118]">
          <div className="flex items-center">
            <BrandLogo size="md" showText={!collapsed} variant="dark" />
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1E293B] lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-6 space-y-2 scrollbar-none">
          {primaryNavItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-0 py-3' : 'justify-start px-3.5 py-2.5 gap-3.5'
                } rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#16202C] text-white border border-[#243447] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111A24]'
                }`}
              >
                <span
                  className={`transition-colors flex-shrink-0 ${
                    isActive
                      ? 'text-[#14B8A6]'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="truncate tracking-wide">{item.label}</span>
                )}

                {item.badge && !collapsed && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-950/80 text-[#14B8A6] border border-[#14B8A6]/40">
                    {item.badge}
                  </span>
                )}

                {/* Active marker indicator */}
                {isActive && !collapsed && !item.badge && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
                )}
              </button>
            );
          })}

          {/* More Tools Dropdown Toggle */}
          <div className="pt-3 mt-3 border-t border-[#1E293B]/50">
            <button
              onClick={() => setMoreToolsOpen(!moreToolsOpen)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3.5 py-2'
              } rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[#111A24] transition-colors`}
              title="More Modules"
            >
              <div className="flex items-center gap-3">
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                {!collapsed && <span>More Operations</span>}
              </div>
              {!collapsed && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {moreToolsOpen ? '▲' : '▼'}
                </span>
              )}
            </button>

            {/* Expanded secondary menu */}
            {moreToolsOpen && !collapsed && (
              <div className="mt-2 space-y-1 pl-2">
                {secondaryNavItems.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => handleNavClick(sec.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      activeTab === sec.id
                        ? 'bg-[#16202C] text-[#14B8A6] font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-[#111A24]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400">{sec.icon}</span>
                      <span>{sec.label}</span>
                    </div>
                    {sec.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/40">
                        {sec.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Section: Organization Card & Copyright matching KDBRi.jpg */}
        <div className="p-3 border-t border-[#1E293B]/70 bg-[#0B1118] space-y-2.5">
          {!collapsed && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#111A24] border border-[#1E293B]/80 hover:border-[#14B8A6]/40 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-[#0D2E2B] border border-[#14B8A6]/30 flex items-center justify-center text-[#14B8A6] flex-shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">Fieldnora Services Ltd.</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Nairobi, Kenya</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>
          )}

          {/* Copyright notice matching screenshot */}
          {!collapsed && (
            <div className="text-[11px] text-slate-500 font-normal px-1">
              © 2024 Fieldnora. All rights reserved.
            </div>
          )}

          {/* Sign Out Button */}
          <button
            id="sidebar-signout-btn"
            onClick={logout}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center p-2' : 'gap-2 px-2.5 py-1.5'
            } rounded-lg text-xs font-medium text-rose-400/90 hover:text-rose-200 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition-colors`}
            title="Sign out / Switch user role"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            {!collapsed && <span>Sign out</span>}
          </button>

          {/* Collapse Toggle */}
          <button
            id="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1.5'
            } rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-[#16202C] transition-colors`}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[11px]">Collapse menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
