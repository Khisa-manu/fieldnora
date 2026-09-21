import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  MapPin,
  ChevronDown,
  Plus,
  ShieldCheck,
  UserCheck,
  Wrench,
  Calculator,
  Eye,
  Menu,
  Building2,
  Calendar,
  HelpCircle,
  Cloud
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentOrg,
    organizations,
    userRole,
    setUserRole,
    activeTab,
    unreadNotifCount,
    setSearchModalOpen,
    setNotificationDrawerOpen,
    setNewJobModalOpen,
    selectedRegion,
    setSelectedRegion,
    switchOrganization,
  } = useApp();

  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [eatTime, setEatTime] = useState<string>('');

  // Live EAT (East Africa Time: UTC+3) Clock matching screenshot: "• EAT 15:42"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as 24-hour EAT time (UTC+3)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Nairobi',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      const formatted = new Intl.DateTimeFormat('en-GB', options).format(now);
      setEatTime(`EAT ${formatted}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const availableRegions = [
    'Nairobi Westlands',
    'Kilimani & Kileleshwa',
    'Upper Hill & CBD',
    'Industrial Area & South C',
    'Karen & Langata',
    'Thika Road & Kasarani',
    'All Nairobi Fleet',
  ];

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode }> = {
    admin: { label: 'Admin', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    dispatcher: { label: 'Dispatcher', icon: <UserCheck className="w-3.5 h-3.5" /> },
    technician: { label: 'Technician', icon: <Wrench className="w-3.5 h-3.5" /> },
    accountant: { label: 'Accountant', icon: <Calculator className="w-3.5 h-3.5" /> },
    readonly: { label: 'Observer', icon: <Eye className="w-3.5 h-3.5" /> },
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Operations Center';
      case 'dispatch':
        return 'Dispatch Board';
      case 'jobs':
        return 'Jobs & Work Orders';
      case 'map':
        return 'Fleet GPS Telemetry';
      case 'technician':
        return 'Technicians & Field Force';
      case 'invoices':
        return 'Invoices & Billing';
      case 'customers':
        return 'Customer CRM';
      case 'estimates':
        return 'Estimates & Quotes';
      case 'inventory':
        return 'Parts & Inventory';
      case 'forms':
        return 'Forms & Checklists';
      case 'reports':
        return 'Analytics & Reports';
      default:
        return 'Operations Center';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 bg-[#0B1118] border-b border-[#1E293B]/70 shadow-sm">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3.5">
        <button
          id="mobile-menu-toggle"
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#16202C] lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {activeTab === 'map' ? 'Live Operations' : activeTab === 'dispatch' ? 'Dispatch Board' : getPageTitle()}
            </h1>
            {activeTab === 'map' && (
              <p className="text-xs text-slate-400 font-medium leading-none mt-0.5">Nairobi Metro</p>
            )}
          </div>
          {activeTab === 'dispatch' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-[#14B8A6] bg-[#0E2A27] border border-[#14B8A6]/40">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
              <span>Live</span>
            </span>
          ) : activeTab === 'dashboard' ? (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-950/70 text-[#14B8A6] border border-teal-800/40">
              Live Operations
            </span>
          ) : null}
        </div>
      </div>

      {/* Right side controls matching screenshot */}
      <div className="flex items-center gap-3 sm:gap-4">
        {activeTab === 'map' ? (
          <>
            {/* Weather Widget matching screenshot: ☁️ 24°C Partly Cloudy */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111A24] border border-[#1E293B] text-xs font-medium text-slate-200 shadow-2xs">
              <Cloud className="w-4 h-4 text-slate-300" />
              <div className="flex items-baseline gap-1.5">
                <span className="font-semibold text-white">24°C</span>
                <span className="text-slate-400 text-[11px]">Partly Cloudy</span>
              </div>
            </div>

            {/* Notifications with blue dot indicator */}
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#16202C] border border-[#1E293B] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3B82F6] rounded-full ring-2 ring-[#0B1118]" />
            </button>

            {/* Dispatcher • Kenya / John Mwangi Profile matching screenshot mrrdB.jpg */}
            <div className="flex items-center gap-2.5 pl-1 cursor-pointer group">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[11px] text-slate-400 leading-tight">
                  Dispatcher • Kenya
                </span>
                <span className="text-xs font-semibold text-white leading-tight group-hover:text-[#14B8A6] transition-colors">
                  John Mwangi
                </span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                alt="John Mwangi"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#1E293B] group-hover:ring-[#14B8A6] transition-all"
              />
            </div>
          </>
        ) : (
          <>
            {/* Date Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111A24] hover:bg-[#16202C] border border-[#1E293B] text-xs font-medium text-slate-200 transition-colors shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Today</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Notifications Trigger with badge '3' */}
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#16202C] border border-[#1E293B] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#14B8A6] text-black text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0B1118]">
                3
              </span>
            </button>

            {/* Help icon button '?' */}
            <button
              onClick={() => {
                alert('Fieldnora Dispatch Operations Center\n\n• Drag and drop work orders between columns\n• Click any card to inspect and update details\n• View live technician GPS status on the right panel\n• Fast search across jobs and field technicians');
              }}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#16202C] border border-[#1E293B] transition-colors"
              title="Dispatch Guide & Shortcuts"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Profile Badge */}
            <div
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 pl-1 cursor-pointer group"
              title="Operations Admin Settings"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                alt="Daniel K."
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#1E293B] group-hover:ring-[#14B8A6] transition-all"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight group-hover:text-[#14B8A6] transition-colors">
                  Daniel K.
                </span>
                <span className="text-[11px] text-slate-400 leading-tight">
                  Operations Admin
                </span>
              </div>
            </div>

            {/* Fast '+ New Work Order' action */}
            {activeTab !== 'dispatch' && (
              <button
                id="header-new-work-order-btn"
                onClick={() => setNewJobModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#14B8A6] text-white text-xs font-semibold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Work Order</span>
              </button>
            )}
          </>
        )}

        {/* Role Switcher Pill */}
        <div className="relative hidden xl:block">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setRegionDropdownOpen(false);
              setOrgDropdownOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#111A24] border border-[#1E293B]/70 text-xs font-medium text-slate-300 hover:bg-[#16202C] transition-colors"
          >
            <span className="text-[#14B8A6]">{roleLabels[userRole]?.icon}</span>
            <span className="capitalize">{roleLabels[userRole]?.label}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#111A24] border border-[#1E293B] rounded-xl shadow-2xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1E293B]/70">
                Simulate Workspace Role
              </div>
              {(Object.keys(roleLabels) as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#16202C] transition-colors ${
                    userRole === r ? 'text-[#14B8A6] font-semibold bg-[#16202C]/60' : 'text-slate-300'
                  }`}
                >
                  <span>{roleLabels[r].icon}</span>
                  <span>{roleLabels[r].label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
