import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  X,
  Building,
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    currentOrg,
    organizations,
    switchOrganization,
    createOrganization,
    userRole,
    setUserRole,
    showToast,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'new_org'>('login');
  const [email, setEmail] = useState('admin@fieldnora.co.ke');
  const [password, setPassword] = useState('••••••••');
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCounty, setNewOrgCounty] = useState('Nairobi');

  if (!authModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.login({ email, password });
      showToast('Signed in successfully to fieldnora', 'success');
      setAuthModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;
    try {
      await createOrganization(newOrgName, newOrgCounty);
      setAuthModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to create workspace', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#0F172A] p-6 text-white text-center relative">
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex justify-center mb-2">
            <BrandLogo variant="light" size="md" />
          </div>
          <h2 className="text-base font-bold">Kenyan Field Operations Portal</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-based multi-tenant authentication & access control
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-[#14B8A6] text-[#0F172A] bg-white'
                : 'border-transparent text-slate-500'
            }`}
          >
            Sign In / Quick Roles
          </button>
          <button
            onClick={() => setMode('new_org')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              mode === 'new_org'
                ? 'border-[#14B8A6] text-[#0F172A] bg-white'
                : 'border-transparent text-slate-500'
            }`}
          >
            New Company Setup
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@fieldnora.co.ke"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:border-teal-500 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-hidden focus:border-teal-500 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors text-sm"
              >
                Sign In
              </button>
            </form>
          )}

          {mode === 'new_org' && (
            <form onSubmit={handleCreateOrg} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Kilimani Engineering Ltd"
                  value={newOrgName}
                  onChange={e => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kenyan County</label>
                <select
                  value={newOrgCounty}
                  onChange={e => setNewOrgCounty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-semibold"
                >
                  <option value="Nairobi">Nairobi County (HQ)</option>
                  <option value="Mombasa">Mombasa County</option>
                  <option value="Kiambu">Kiambu County</option>
                  <option value="Nakuru">Nakuru County</option>
                  <option value="Kisumu">Kisumu County</option>
                  <option value="Machakos">Machakos County</option>
                  <option value="Uasin Gishu">Uasin Gishu (Eldoret)</option>
                </select>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[11px] text-teal-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                  Instant Provisioning
                </div>
                <p>
                  Your workspace will immediately be configured with 16% Kenya VAT, eTIMS compliance ledger, and KES currency presets.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#14B8A6] hover:bg-teal-600 text-white font-bold rounded-xl shadow-xs transition-colors"
              >
                Create Kenyan Workspace
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
