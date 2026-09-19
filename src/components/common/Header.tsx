import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  Search,
  Bell,
  Smartphone,
  ChevronDown,
  Building2,
  Plus,
  ShieldCheck,
  UserCheck,
  Wrench,
  Calculator,
  Eye,
  Wifi,
  Menu
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
    setActiveTab,
    switchOrganization,
    unreadNotifCount,
    setSearchModalOpen,
    setNotificationDrawerOpen,
    technicianViewMode,
    setTechnicianViewMode,
    createOrganization,
    showToast,
  } = useApp();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [newOrgModal, setNewOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCounty, setNewOrgCounty] = useState('Nairobi');

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    admin: { label: 'Admin', icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'bg-indigo-100 text-indigo-800' },
    dispatcher: { label: 'Dispatcher', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-800' },
    technician: { label: 'Technician', icon: <Wrench className="w-3.5 h-3.5" />, color: 'bg-teal-100 text-teal-800' },
    accountant: { label: 'Accountant', icon: <Calculator className="w-3.5 h-3.5" />, color: 'bg-emerald-100 text-emerald-800' },
    readonly: { label: 'Read-Only', icon: <Eye className="w-3.5 h-3.5" />, color: 'bg-slate-100 text-slate-800' },
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    await createOrganization(newOrgName, newOrgCounty);
    setNewOrgModal(false);
    setNewOrgName('');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Left side: Hamburger & Workspace Selector */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-toggle"
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-1 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workspace Switcher */}
        <div className="relative">
          <button
            id="workspace-switcher-btn"
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#0F172A] text-white">
              <Building2 className="w-4 h-4 text-[#14B8A6]" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-[#0F172A] truncate max-w-[180px]">
                {currentOrg?.name || 'fieldnora Workspace'}
              </div>
              <div className="text-[10px] text-[#64748B]">
                {currentOrg?.county || 'Kenya'} • KES (16% VAT)
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Org Dropdown */}
          {orgDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Workspaces (Multi-Tenant)
              </div>
              {organizations.map(org => (
                <button
                  key={org.id}
                  onClick={() => {
                    switchOrganization(org.id);
                    setOrgDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors ${
                    org.id === currentOrg?.id ? 'bg-teal-50/70 text-teal-900 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-medium text-xs">{org.name}</div>
                    <div className="text-[10px] text-slate-400">{org.county}, Kenya</div>
                  </div>
                  {org.id === currentOrg?.id && (
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-medium">
                      Active
                    </span>
                  )}
                </button>
              ))}

              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setOrgDropdownOpen(false);
                    setNewOrgModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create New Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          id="global-search-btn"
          onClick={() => setSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-slate-100/80 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search jobs, customers, technicians, invoices, parts...</span>
          </div>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded text-slate-500 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Side: Tools, Role Switcher, Mobile Mode, Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Kenya Online Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200/60">
          <Wifi className="w-3 h-3 text-emerald-600" />
          <span>EAT (UTC+3)</span>
        </div>

        {/* Technician Field Mobile Mode Toggle */}
        <button
          id="tech-mobile-toggle-btn"
          onClick={() => {
            if (activeTab === 'technician') {
              setActiveTab('dashboard');
              setTechnicianViewMode(false);
              showToast('Returned to Dashboard view', 'info');
            } else {
              setActiveTab('technician');
              setTechnicianViewMode(true);
              setUserRole('technician');
              showToast('Opened Field Technician Mobile App View', 'success');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            activeTab === 'technician'
              ? 'bg-[#14B8A6] text-white border-[#14B8A6] shadow-xs'
              : 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100'
          }`}
          title="Open Technician Mobile App"
        >
          <Smartphone className={`w-3.5 h-3.5 ${activeTab === 'technician' ? 'text-white' : 'text-teal-600'}`} />
          <span className="hidden sm:inline">
            {activeTab === 'technician' ? 'Exit Mobile App' : 'Tech Mobile App'}
          </span>
        </button>

        {/* Role Switcher */}
        <div className="relative">
          <button
            id="role-switcher-btn"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition-colors ${roleLabels[userRole].color}`}
            title="Switch User Role & Permissions"
          >
            {roleLabels[userRole].icon}
            <span>{roleLabels[userRole].label}</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Role / RBAC
              </div>
              {(Object.keys(roleLabels) as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-slate-50 transition-colors ${
                    userRole === r ? 'font-bold text-[#14B8A6]' : 'text-slate-700'
                  }`}
                >
                  {roleLabels[r].icon}
                  {roleLabels[r].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          id="notification-bell-btn"
          onClick={() => setNotificationDrawerOpen(true)}
          className="relative p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Notifications & Kenya Alerts"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full">
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {/* New Workspace Modal */}
      {newOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">Create Multi-Tenant Workspace</h3>
            <p className="text-xs text-slate-500 mb-4">
              Provision an isolated organization with its own customers, technicians, inventory, and invoices.
            </p>
            <form onSubmit={handleCreateOrg} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mombasa Coastal Air Conditioning Ltd"
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  County / Region (Kenya)
                </label>
                <select
                  value={newOrgCounty}
                  onChange={e => setNewOrgCounty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent outline-hidden"
                >
                  <option value="Nairobi">Nairobi County</option>
                  <option value="Mombasa">Mombasa County</option>
                  <option value="Kiambu">Kiambu County</option>
                  <option value="Machakos">Machakos County</option>
                  <option value="Nakuru">Nakuru County</option>
                  <option value="Kisumu">Kisumu County</option>
                  <option value="Uasin Gishu">Uasin Gishu (Eldoret)</option>
                  <option value="Kajiado">Kajiado County</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setNewOrgModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-lg shadow-xs"
                >
                  Create & Launch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
