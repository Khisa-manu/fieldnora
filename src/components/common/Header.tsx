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
  Cloud,
  Camera,
  User as UserIcon,
  LogOut,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    currentOrg,
    organizations,
    currentUser,
    userRole,
    setUserRole,
    activeTab,
    unreadNotifCount,
    setSearchModalOpen,
    setNotificationDrawerOpen,
    setNewJobModalOpen,
    setUserProfileModalOpen,
    selectedRegion,
    setSelectedRegion,
    switchOrganization,
    logout,
    loginAsRole,
  } = useApp();

  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
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

            {/* Dispatcher • Kenya / User Profile */}
            <div
              id="header-map-user-profile-btn"
              onClick={() => setUserProfileModalOpen(true)}
              className="flex items-center gap-2.5 pl-1 cursor-pointer group"
              title="Click to view & upload profile picture"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[11px] text-slate-400 leading-tight capitalize">
                  {currentUser?.role || 'Dispatcher'} • Kenya
                </span>
                <span className="text-xs font-semibold text-white leading-tight group-hover:text-[#14B8A6] transition-colors">
                  {currentUser?.name || 'Faith Wanjiku'}
                </span>
              </div>
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#1E293B] group-hover:ring-[#14B8A6] bg-slate-800 flex items-center justify-center transition-all">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-teal-400">
                    {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'FW'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
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
              onClick={() => setHelpModalOpen(true)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#16202C] border border-[#1E293B] transition-colors cursor-pointer"
              title="Dispatch Guide & Shortcuts"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* User Profile Badge (Click to open UserProfileModal) */}
            <div
              id="header-user-profile-badge"
              onClick={() => setUserProfileModalOpen(true)}
              className="flex items-center gap-2.5 pl-1 cursor-pointer group"
              title="Click to view & upload profile picture"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#1E293B] group-hover:ring-[#14B8A6] bg-slate-800 flex items-center justify-center transition-all">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-teal-400">
                    {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'FW'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight group-hover:text-[#14B8A6] transition-colors flex items-center gap-1">
                  {currentUser?.name || 'Faith Wanjiku'}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight capitalize">
                  {currentUser?.role ? `${currentUser.role} Operations` : 'Operations Admin'}
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
                Switch Role Account
              </div>
              <button
                type="button"
                onClick={() => {
                  loginAsRole('admin');
                  setRoleDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#16202C] text-slate-300 hover:text-teal-400"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Admin (Faith Wanjiku)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsRole('dispatcher');
                  setRoleDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#16202C] text-slate-300 hover:text-teal-400"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Dispatcher (Kevin Omondi)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsRole('technician');
                  setRoleDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#16202C] text-slate-300 hover:text-teal-400"
              >
                <Wrench className="w-3.5 h-3.5 text-teal-400" />
                <span>Technician (Brian Kiprop)</span>
              </button>
            </div>
          )}
        </div>

        {/* Header Quick Sign Out Button */}
        <button
          id="header-signout-btn"
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111A24] hover:bg-rose-950/40 border border-[#1E293B] hover:border-rose-900/40 text-xs font-medium text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
          title="Sign out / Return to login screen"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline text-[11px]">Sign out</span>
        </button>
      </div>

      {/* Dispatch Operations Guide Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#111A24] border border-[#1E293B] rounded-2xl shadow-2xl p-6 text-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setHelpModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16202C] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-950/80 border border-teal-800/60 flex items-center justify-center text-teal-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Operations Center Guide</h3>
                <p className="text-xs text-slate-400">Fieldnora Dispatch & Operations Shortcuts</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-[#0B1118] border border-[#1E293B]/80 space-y-2">
                <div className="font-semibold text-teal-400 flex items-center gap-1.5">
                  <span>• Drag & Drop Dispatch Board</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Move work orders smoothly between Unassigned, Scheduled, En Route, In Progress, and Completed columns.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1118] border border-[#1E293B]/80 space-y-2">
                <div className="font-semibold text-teal-400 flex items-center gap-1.5">
                  <span>• Live GPS & Fleet Locations</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Inspect real-time Nairobi coordinates for active technicians (Kilimani, Westlands, Upper Hill, Industrial Area).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1118] border border-[#1E293B]/80 space-y-2">
                <div className="font-semibold text-teal-400 flex items-center gap-1.5">
                  <span>• Fast Search & Profile Switching</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Press Search icon or click your avatar to upload profile pictures, switch role accounts, or sign out to the login page.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#1E293B] flex justify-end">
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-slate-950 font-bold text-xs transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
