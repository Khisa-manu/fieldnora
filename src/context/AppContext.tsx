import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization, User, UserRole, AppNotification } from '../types';
import { api, setApiContext } from '../services/api';

export type ActiveTab =
  | 'dashboard'
  | 'customers'
  | 'jobs'
  | 'dispatch'
  | 'technician'
  | 'mobile'
  | 'services'
  | 'map'
  | 'estimates'
  | 'invoices'
  | 'payments'
  | 'inventory'
  | 'forms'
  | 'portal'
  | 'reports'
  | 'audit';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  currentOrg: Organization | null;
  organizations: Organization[];
  currentUser: User | null;
  userRole: UserRole;
  activeTab: ActiveTab;
  technicianViewMode: boolean;
  searchModalOpen: boolean;
  notificationDrawerOpen: boolean;
  authModalOpen: boolean;
  notifications: AppNotification[];
  unreadNotifCount: number;
  toasts: Toast[];
  isOnline: boolean;
  newJobModalOpen: boolean;
  selectedRegion: string;
  setActiveTab: (tab: ActiveTab) => void;
  setTechnicianViewMode: (mode: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setNewJobModalOpen: (open: boolean) => void;
  setSelectedRegion: (region: string) => void;
  setUserRole: (role: UserRole) => void;
  switchOrganization: (orgId: string) => Promise<void>;
  createOrganization: (name: string, county: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  showToast: (message: string, type?: Toast['type']) => void;
  refreshAppData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [technicianViewMode, setTechnicianViewMode] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isOnline] = useState<boolean>(true);
  const [newJobModalOpen, setNewJobModalOpen] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('Nairobi Westlands');

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const refreshAppData = async () => {
    try {
      const orgs = await api.getOrganizations();
      setOrganizations(orgs);
      const activeOrg = orgs.find(o => o.id === currentOrg?.id) || orgs[0];
      if (activeOrg) {
        setCurrentOrg(activeOrg);
        const users = await api.getUsers();
        const me = users.find(u => u.role === userRole) || users[0];
        if (me) {
          setCurrentUser(me);
          setApiContext(activeOrg.id, `${me.name} (${me.role})`);
        }
      }
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load initial app context:', err);
    }
  };

  useEffect(() => {
    refreshAppData();
  }, []);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (currentUser) {
      setCurrentUser(prev => (prev ? { ...prev, role } : null));
      if (currentOrg) {
        setApiContext(currentOrg.id, `${currentUser.name} (${role})`);
      }
    }
    showToast(`Switched active view role to ${role.toUpperCase()}`, 'info');
    if (role === 'technician') {
      setActiveTab('technician');
    }
  };

  const switchOrganization = async (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      setApiContext(org.id, currentUser ? `${currentUser.name} (${userRole})` : 'User');
      showToast(`Switched workspace to ${org.name}`, 'info');
      await refreshAppData();
    }
  };

  const createOrganization = async (name: string, county: string) => {
    try {
      const newOrg = await api.createOrganization({ name, county, currency: 'KES', taxRate: 16 });
      setOrganizations(prev => [...prev, newOrg]);
      await switchOrganization(newOrg.id);
      showToast(`Workspace "${name}" created successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create workspace', 'error');
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentOrg,
        organizations,
        currentUser,
        userRole,
        activeTab,
        technicianViewMode,
        searchModalOpen,
        notificationDrawerOpen,
        authModalOpen,
        notifications,
        unreadNotifCount,
        toasts,
        isOnline,
        newJobModalOpen,
        selectedRegion,
        setActiveTab,
        setTechnicianViewMode,
        setSearchModalOpen,
        setNotificationDrawerOpen,
        setAuthModalOpen,
        setNewJobModalOpen,
        setSelectedRegion,
        setUserRole,
        switchOrganization,
        createOrganization,
        markNotificationAsRead,
        showToast,
        refreshAppData,
      }}
    >
      {children}
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-red-900/90 text-white border-red-700'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 text-white border-amber-700'
                : 'bg-slate-900/90 text-white border-slate-700'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
