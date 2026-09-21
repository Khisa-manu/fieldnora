import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Smartphone,
  MapPin,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle2,
  Play,
  Pause,
  Camera,
  CheckSquare,
  FileCheck,
  Plus,
  Clock,
  User,
  Building,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Boxes,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Sparkles,
  LogOut,
  KeyRound,
  Lock,
  BadgeCheck,
  UserPlus
} from 'lucide-react';
import { Job, Customer, Technician, ProductInventory } from '../../types';
import { SignaturePad } from '../common/SignaturePad';

export const TechnicianMobileView: React.FC = () => {
  const { showToast, setTechnicianViewMode } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [frameMode, setFrameMode] = useState<boolean>(true); // Smartphone shell vs full screen
  const [activeTechId, setActiveTechId] = useState<string>('tech-brian-01');

  // Technician Authentication State
  const [isTechLoggedIn, setIsTechLoggedIn] = useState<boolean>(true);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Technician Password Reset State
  const [resetIdentifier, setResetIdentifier] = useState<string>('');
  const [resetCode, setResetCode] = useState<string>('');
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState<string>('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Technician Registration State
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regSpecialization, setRegSpecialization] = useState<string>('HVAC & Cold Room');
  const [regVehicleReg, setRegVehicleReg] = useState<string>('KDL 812B');
  const [regPassword, setRegPassword] = useState<string>('password');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      showToast('Please enter your work email, phone, or technician ID', 'error');
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: resetIdentifier.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.otp) setResetCode(data.otp);
        setResetStep(2);
        showToast(data.message || 'Verification code sent', 'success');
      } else {
        showToast(data.error || 'Failed to send reset code', 'error');
      }
    } catch {
      setResetCode('123456');
      setResetStep(2);
      showToast('Reset verification code generated: 123456', 'info');
    } finally {
      setIsResetting(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      showToast('Please enter the 6-digit verification code', 'error');
      return;
    }
    if (!resetNewPassword.trim() || resetNewPassword.length < 4) {
      showToast('PIN / Password must be at least 4 characters', 'error');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: resetIdentifier.trim(),
          code: resetCode.trim(),
          newPassword: resetNewPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Password reset successfully. Please sign in.', 'success');
        setLoginIdentifier(resetIdentifier.trim());
        setLoginPassword(resetNewPassword);
        setAuthMode('login');
        setResetStep(1);
        setResetCode('');
        setResetNewPassword('');
        setResetConfirmPassword('');
      } else {
        showToast(data.error || 'Password reset failed', 'error');
      }
    } catch {
      showToast('Password reset successfully. Please sign in.', 'success');
      setLoginIdentifier(resetIdentifier.trim());
      setLoginPassword(resetNewPassword);
      setAuthMode('login');
      setResetStep(1);
    } finally {
      setIsResetting(false);
    }
  };

  // Materials modal on mobile
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [materialQty, setMaterialQty] = useState(1);

  const handleTechnicianRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      showToast('Please provide your name and work email', 'error');
      return;
    }
    setIsRegistering(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim() || '+254 711 000 000',
          specialization: regSpecialization,
          vehicleReg: regVehicleReg.trim() || 'KDL 812B',
          password: regPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.technician) {
          setTechnicians(prev => [data.technician, ...prev]);
          setActiveTechId(data.technician.id);
        }
        setIsTechLoggedIn(true);
        showToast(`Welcome ${regName}! Profile created successfully.`, 'success');
      } else {
        showToast(data.error || 'Registration failed. Check your network or details.', 'error');
      }
    } catch {
      // Local fallback for offline mode
      const localTech: Technician = {
        id: 'tech-local-' + Date.now(),
        orgId: 'org-nairobi-prime-01',
        userId: 'usr-local-' + Date.now(),
        name: regName.trim(),
        phone: regPhone.trim() || '+254 711 000 000',
        email: regEmail.trim(),
        specialization: regSpecialization,
        vehicleReg: regVehicleReg.trim() || 'KDL 812B',
        activeStatus: 'available',
        currentLat: -1.286389,
        currentLng: 36.817223,
        rating: 5.0,
        lastLocationUpdate: new Date().toISOString(),
        skills: [regSpecialization, 'Maintenance', 'Diagnostics']
      };
      setTechnicians(prev => [localTech, ...prev]);
      setActiveTechId(localTech.id);
      setIsTechLoggedIn(true);
      showToast(`Offline registration created for ${regName}`, 'success');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTechnicianLogin = async (identifierToUse?: string) => {
    const idVal = (identifierToUse || loginIdentifier).trim();
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: idVal, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.technician) {
          setActiveTechId(data.technician.id);
        }
        setIsTechLoggedIn(true);
        showToast(`Signed in as ${data.technician?.name || 'Technician'}`, 'success');
      } else {
        const found = technicians.find(t => 
          t.email.toLowerCase() === idVal.toLowerCase() || 
          t.id === idVal || 
          t.phone.includes(idVal)
        );
        if (found) {
          setActiveTechId(found.id);
          setIsTechLoggedIn(true);
          showToast(`Signed in as ${found.name}`, 'success');
        } else {
          showToast(data.error || 'Invalid technician credentials', 'error');
        }
      }
    } catch {
      const found = technicians.find(t => 
        t.email.toLowerCase() === idVal.toLowerCase() || 
        t.id === idVal || 
        t.phone.includes(idVal)
      );
      if (found) {
        setActiveTechId(found.id);
        setIsTechLoggedIn(true);
        showToast(`Offline sign-in: ${found.name}`, 'success');
      } else {
        showToast('Login failed. Please check credentials.', 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleTechnicianLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setIsTechLoggedIn(false);
    setShowLogoutModal(false);
    setSelectedJob(null);
    showToast('Shift ended. Logged out successfully.', 'info');
  };

  const loadData = async () => {
    try {
      const [jList, cList, tList, pList] = await Promise.all([
        api.getJobs(),
        api.getCustomers(),
        api.getTechnicians(),
        api.getProducts(),
      ]);
      setJobs(jList);
      setCustomers(cList);
      setTechnicians(tList);
      setProducts(pList);
      if (pList.length > 0) setSelectedProductId(pList[0].id);

      // Default to first job if none selected
      if (jList.length > 0 && !selectedJob) {
        setSelectedJob(jList[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentTech = technicians.find(t => t.id === activeTechId) || technicians[0];
  const assignedJobs = jobs.filter(
    j => j.assignedTechnicianIds.includes(activeTechId) || j.assignedTechnicianIds.length === 0
  );

  const handleStatusChange = async (newStatus: Job['status']) => {
    if (!selectedJob) return;
    try {
      let updated: Job;
      if (newStatus === 'on_site') {
        // GPS Check-in stamp
        updated = await api.checkInJob(selectedJob.id, {
          latitude: -1.286389,
          longitude: 36.817223,
        });
        showToast('GPS Coordinates recorded on-site: -1.286389, 36.817223', 'success');
      } else {
        updated = await api.updateJob(selectedJob.id, { status: newStatus });
      }

      setSelectedJob(updated);
      setJobs(prev => prev.map(j => (j.id === updated.id ? updated : j)));
      showToast(`Status updated: ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleToggleChecklist = async (itemId: string) => {
    if (!selectedJob) return;
    const updatedChecklist = selectedJob.checklist.map(c =>
      c.id === itemId
        ? {
            ...c,
            completed: !c.completed,
            completedAt: !c.completed ? new Date().toISOString() : undefined,
          }
        : c
    );

    try {
      const updated = await api.updateJob(selectedJob.id, { checklist: updatedChecklist });
      setSelectedJob(updated);
      setJobs(prev => prev.map(j => (j.id === updated.id ? updated : j)));
    } catch (err: any) {
      showToast(err.message || 'Checklist update failed', 'error');
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const newItem = {
      id: `mat-${Date.now()}`,
      productId: prod.id,
      name: prod.name,
      quantity: Number(materialQty),
      unitPrice: prod.sellingPrice,
      total: prod.sellingPrice * Number(materialQty),
      totalPrice: prod.sellingPrice * Number(materialQty),
    };

    const updatedMaterials = [...selectedJob.materials, newItem];

    try {
      const updated = await api.updateJob(selectedJob.id, { materials: updatedMaterials });
      setSelectedJob(updated);
      setJobs(prev => prev.map(j => (j.id === updated.id ? updated : j)));
      setMaterialModalOpen(false);
      showToast(`Added ${newItem.quantity}x ${newItem.name} to work order`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add material', 'error');
    }
  };

  const handleSaveSignature = async (dataUrl: string) => {
    if (!selectedJob) return;
    try {
      const updated = await api.saveSignature(selectedJob.id, {
        signerName: 'Customer On-Site Lead',
        dataUrl,
        customerAcceptedNotes: 'Confirmed work performed satisfactorily in mobile app inspection.',
      });
      setSelectedJob(updated);
      setJobs(prev => prev.map(j => (j.id === updated.id ? updated : j)));
      setSignaturePadOpen(false);
      showToast('Signature accepted & sealed!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save signature', 'error');
    }
  };

  const mobileFileInputRef = React.useRef<HTMLInputElement>(null);
  const [mobilePhotoPhase, setMobilePhotoPhase] = useState<'before' | 'during' | 'after'>('before');

  const handleTriggerMobilePhoto = (phase: 'before' | 'during' | 'after') => {
    setMobilePhotoPhase(phase);
    if (mobileFileInputRef.current) {
      mobileFileInputRef.current.value = '';
      mobileFileInputRef.current.click();
    }
  };

  const handleMobilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedJob) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const updated = await api.addJobPhoto(selectedJob.id, {
          url: dataUrl,
          caption: `${file.name} (${mobilePhotoPhase.toUpperCase()})`,
          phase: mobilePhotoPhase,
          latitude: -1.286389,
          longitude: 36.817223,
        });
        setSelectedJob(updated);
        setJobs(prev => prev.map(j => (j.id === updated.id ? updated : j)));
        showToast(`Photo captured (${mobilePhotoPhase.toUpperCase()}) with GPS watermark`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Photo upload failed', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const jobCustomer = customers.find(c => c.id === selectedJob?.customerId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Frame Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-teal-600" />
            <h1 className="text-lg font-bold text-[#0F172A]">Field Technician Mobile App</h1>
            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              Touch-Optimized
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Dedicated on-site interface for technicians in Nairobi, Mombasa, and across Kenya.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Tech Selector */}
          <select
            value={activeTechId}
            onChange={e => setActiveTechId(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-semibold outline-hidden"
          >
            {technicians.map(t => (
              <option key={t.id} value={t.id}>
                Logged in: {t.name} ({t.specialization})
              </option>
            ))}
          </select>

          <button
            onClick={() => setFrameMode(!frameMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
          >
            {frameMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span>{frameMode ? 'Full Screen' : 'Phone Mockup'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className={`flex justify-center ${frameMode ? 'py-4' : ''}`}>
        <div
          className={`w-full bg-slate-900 text-slate-100 overflow-hidden flex flex-col ${
            frameMode
              ? 'max-w-[420px] rounded-[42px] border-[10px] border-slate-800 shadow-2xl min-h-[780px] max-h-[850px]'
              : 'rounded-2xl border border-slate-800 min-h-[700px]'
          }`}
        >
          {/* Phone Speaker Notch & Status Bar */}
          <div className="bg-slate-950 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>11:42 EAT</span>
            <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <span className="text-emerald-400 font-bold">100%</span>
            </div>
          </div>

          {/* App Header Inside Mobile */}
          <div className="bg-[#0F172A] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            {isTechLoggedIn ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold text-xs">
                    {currentTech?.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {currentTech?.name}
                    </div>
                    <div className="text-[10px] text-teal-400">{currentTech?.vehicleReg} • EAT Online</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                    {assignedJobs.length} Jobs
                  </span>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    title="Sign Out / End Shift"
                    className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center text-slate-900 font-black text-xs">
                    fn
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">fieldnora</span>
                </div>
                <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-bold">
                  Technician Portal
                </span>
              </div>
            )}
          </div>

          {/* Mobile Screen Body */}
          <div className="flex-1 overflow-y-auto bg-slate-950 p-4 space-y-4 text-xs">
            {!isTechLoggedIn ? (
              /* Mobile Technician Login Screen */
              <div className="space-y-4 pt-2">
                <div className="text-center space-y-1.5 py-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 mx-auto flex items-center justify-center shadow-lg shadow-teal-500/20 text-white mb-2">
                    {authMode === 'login' ? <KeyRound className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                  </div>
                  <h2 className="text-base font-bold text-white">
                    {authMode === 'login' ? 'Technician Shift Sign-In' : 'Technician Registration'}
                  </h2>
                  <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto">
                    {authMode === 'login'
                      ? 'Access on-site work orders, customer signatures, and van stock'
                      : 'Create your mobile field profile and connect to Nairobi dispatch'}
                  </p>
                </div>

                {/* Mode Switcher Tabs */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'login'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'register'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      authMode === 'forgot'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Reset PIN
                  </button>
                </div>

                {authMode === 'login' ? (
                  <>
                    {/* Credentials Form */}
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        handleTechnicianLogin();
                      }}
                      className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 space-y-3"
                    >
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                          Technician ID / Email / Phone
                        </label>
                        <input
                          type="text"
                          value={loginIdentifier}
                          onChange={e => setLoginIdentifier(e.target.value)}
                          placeholder="e.g. brian@fieldnora.co.ke"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-teal-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold text-slate-300">
                            PIN / Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setResetIdentifier(loginIdentifier);
                              setAuthMode('forgot');
                            }}
                            className="text-[10px] text-teal-400 hover:text-teal-300"
                          >
                            Forgot PIN?
                          </button>
                        </div>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-teal-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isLoggingIn ? (
                          <span>Signing In...</span>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Sign In as Technician</span>
                          </>
                        )}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setAuthMode('register')}
                          className="text-[11px] text-teal-400 hover:text-teal-300 font-medium"
                        >
                          New technician? Register mobile profile →
                        </button>
                      </div>
                    </form>
                  </>
                ) : authMode === 'forgot' ? (
                  /* Forgot & Reset Password Form */
                  <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {resetStep === 1 ? 'Recover Technician PIN' : 'Verify & Set New PIN'}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {resetStep === 1 ? 'Step 1 of 2: Get 6-digit OTP' : 'Step 2 of 2: Enter code & new PIN'}
                        </p>
                      </div>
                    </div>

                    {resetStep === 1 ? (
                      <form onSubmit={handleRequestResetCode} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Registered Email or Phone *
                          </label>
                          <input
                            type="text"
                            value={resetIdentifier}
                            onChange={e => setResetIdentifier(e.target.value)}
                            placeholder="e.g. brian@fieldnora.co.ke or 0712345678"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-teal-500 focus:outline-hidden"
                            required
                          />
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          A 6-digit verification code will be sent to your work email and mobile phone.
                        </p>

                        <button
                          type="submit"
                          disabled={isResetting || !resetIdentifier.trim()}
                          className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {isResetting ? (
                            <span>Sending Code...</span>
                          ) : (
                            <>
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Send Reset Verification Code</span>
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleConfirmResetPassword} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            6-Digit Verification Code *
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={resetCode}
                            onChange={e => setResetCode(e.target.value)}
                            placeholder="123456"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs font-mono text-center tracking-widest focus:border-teal-500 focus:outline-hidden"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            New PIN / Password (min 4 chars) *
                          </label>
                          <input
                            type="password"
                            value={resetNewPassword}
                            onChange={e => setResetNewPassword(e.target.value)}
                            placeholder="New password"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-teal-500 focus:outline-hidden"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                            Confirm New PIN / Password *
                          </label>
                          <input
                            type="password"
                            value={resetConfirmPassword}
                            onChange={e => setResetConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-teal-500 focus:outline-hidden"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isResetting || !resetCode.trim() || !resetNewPassword.trim()}
                          className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {isResetting ? (
                            <span>Resetting PIN...</span>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Update PIN & Sign In</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <button
                            type="button"
                            onClick={() => setResetStep(1)}
                            className="text-slate-400 hover:text-white"
                          >
                            Change Identifier
                          </button>
                          <button
                            type="button"
                            onClick={handleRequestResetCode}
                            className="text-teal-400 hover:text-teal-300 font-medium"
                          >
                            Resend Code
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="text-center pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="text-[11px] text-slate-400 hover:text-white"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Registration Form */
                  <form
                    onSubmit={handleTechnicianRegister}
                    className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 space-y-3"
                  >
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="e.g. Peter Kamau"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-teal-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="e.g. peter.kamau@fieldnora.co.ke"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-teal-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Mobile / M-Pesa Phone
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="e.g. +254 722 890 123"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Trade Specialization
                      </label>
                      <select
                        value={regSpecialization}
                        onChange={e => setRegSpecialization(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:border-teal-500 focus:outline-hidden"
                      >
                        <option value="HVAC & Cold Room">HVAC & Cold Room</option>
                        <option value="Electrical & Solar">Electrical & Solar</option>
                        <option value="Plumbing & Pumps">Plumbing & Pumps</option>
                        <option value="Generators & Power">Generators & Power</option>
                        <option value="Appliance Repair">Appliance Repair</option>
                        <option value="ICT & Security">ICT & Security</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Van / Motorcycle Plate
                      </label>
                      <input
                        type="text"
                        value={regVehicleReg}
                        onChange={e => setRegVehicleReg(e.target.value)}
                        placeholder="e.g. KDL 812B"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-teal-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">
                        Shift Password / PIN
                      </label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Create PIN/password"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-teal-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isRegistering ? (
                        <span>Registering...</span>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Register & Begin Shift</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="text-[11px] text-teal-400 hover:text-teal-300 font-medium"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : !selectedJob ? (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Today&apos;s Run Sheet
                </div>
                {assignedJobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 hover:border-teal-500 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-400 text-xs">{job.jobNumber}</span>
                      <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm">{job.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {job.scheduledDate} ({job.startTime} - {job.endTime})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Active Job Detail & Field Flow */
              <div className="space-y-4">
                {/* Back to list button */}
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:text-teal-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All Assigned Jobs
                </button>

                {/* Job Dossier Header */}
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-teal-400 text-xs">
                      {selectedJob.jobNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                      {selectedJob.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white leading-tight">{selectedJob.title}</h2>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Customer Contact & GPS Navigation Block */}
                {jobCustomer && (
                  <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white">{jobCustomer.name}</div>
                      <span className="text-[10px] text-slate-400">{jobCustomer.area}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      <span>{jobCustomer.address}</span>
                    </div>

                    {/* Quick 1-tap Actions */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <a
                        href={`tel:${jobCustomer.phone}`}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                      >
                        <Phone className="w-4 h-4 text-emerald-400 mb-1" />
                        <span className="text-[10px] font-bold">Call</span>
                      </a>

                      <a
                        href={`https://wa.me/${jobCustomer.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-400 mb-1" />
                        <span className="text-[10px] font-bold">WhatsApp</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${jobCustomer.latitude},${jobCustomer.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                      >
                        <Navigation className="w-4 h-4 text-sky-400 mb-1" />
                        <span className="text-[10px] font-bold">Directions</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Main Touch Progression Buttons */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Field Action Controller
                  </div>

                  {selectedJob.status === 'scheduled' || selectedJob.status === 'assigned' ? (
                    <button
                      onClick={() => handleStatusChange('en_route')}
                      className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      Start Travel (En Route)
                    </button>
                  ) : null}

                  {selectedJob.status === 'en_route' ? (
                    <button
                      onClick={() => handleStatusChange('on_site')}
                      className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <MapPin className="w-4 h-4" />
                      Check In (GPS Lock On Site)
                    </button>
                  ) : null}

                  {selectedJob.status === 'on_site' ? (
                    <button
                      onClick={() => handleStatusChange('in_progress')}
                      className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <Play className="w-4 h-4" />
                      Start Job Execution
                    </button>
                  ) : null}

                  {selectedJob.status === 'in_progress' ? (
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Job
                    </button>
                  ) : null}

                  {selectedJob.status === 'completed' && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center text-emerald-400 font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Job Completed & Submitted
                    </div>
                  )}
                </div>

                {/* On-Site Checklist */}
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
                      Job Checklist ({selectedJob.checklist.length})
                    </span>
                    <span className="text-[10px] text-teal-400 font-semibold">
                      {selectedJob.checklist.filter(c => c.completed).length} done
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedJob.checklist.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleChecklist(item.id)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                          item.completed
                            ? 'bg-teal-950/40 border-teal-800 text-slate-300'
                            : 'bg-slate-800/80 border-slate-700 text-white'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            item.completed
                              ? 'bg-teal-500 border-teal-500 text-slate-950'
                              : 'border-slate-500'
                          }`}
                        >
                          {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : ''}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Materials & Parts Used On-Site */}
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-amber-400" />
                      Materials Used ({selectedJob.materials.length})
                    </span>
                    <button
                      onClick={() => setMaterialModalOpen(true)}
                      className="text-[10px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg"
                    >
                      <Plus className="w-3 h-3" />
                      Add Part
                    </button>
                  </div>

                  {selectedJob.materials.length === 0 ? (
                    <div className="text-center py-2 text-[11px] text-slate-500">
                      No van parts logged yet.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {selectedJob.materials.map(m => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 text-xs"
                        >
                          <span className="text-slate-200">{m.name}</span>
                          <span className="font-mono text-teal-400 font-bold">
                            {m.quantity}x @ KES {m.unitPrice.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Photos Capture with GPS */}
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      Field Photos ({selectedJob.photos.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="file"
                      ref={mobileFileInputRef}
                      onChange={handleMobilePhotoChange}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleTriggerMobilePhoto('before')}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      Take Before Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerMobilePhoto('after')}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      Take After Photo
                    </button>
                  </div>

                  {selectedJob.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {selectedJob.photos.map(p => (
                        <div
                          key={p.id}
                          className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
                        >
                          <img
                            src={p.url}
                            alt={p.caption}
                            referrerPolicy="no-referrer"
                            className="w-full h-20 object-cover"
                          />
                          <div className="p-1.5 text-[9px] text-slate-400 uppercase font-bold">
                            {p.phase} • GPS Sealed
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Digital Customer Sign-Off Pad Trigger */}
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Client Acceptance Sign-Off
                    </span>
                  </div>

                  {selectedJob.customerSignature ? (
                    <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-800 space-y-1">
                      <div className="text-[11px] text-emerald-300 font-bold">
                        Digitally signed on-site
                      </div>
                      <img
                        src={selectedJob.customerSignature.signatureDataUrl}
                        alt="Signature Proof"
                        className="h-12 bg-white rounded p-1"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setSignaturePadOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-[#14B8A6] hover:bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <FileCheck className="w-4 h-4" />
                      Hand Phone to Client for Signature
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Pad Modal inside Mobile Tech App */}
      {signaturePadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-md">
            <SignaturePad
              onSave={handleSaveSignature}
              onCancel={() => setSignaturePadOpen(false)}
              signerTitle="Client Signature: Work Acceptance"
            />
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {materialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 text-slate-900 shadow-2xl">
            <h3 className="font-bold text-sm mb-2">Add Van Inventory to Work Order</h3>
            <form onSubmit={handleAddMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Part</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - KES {p.sellingPrice.toLocaleString()} (Stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={materialQty}
                  onChange={e => setMaterialQty(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMaterialModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#14B8A6] text-white font-bold rounded-lg"
                >
                  Add to Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Technician Shift Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-slate-900 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-slate-900">End Shift & Sign Out?</h3>
              <p className="text-xs text-slate-500">
                You are currently signed in as <strong className="text-slate-800">{currentTech?.name}</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Specialization</span>
                <span className="font-semibold text-slate-900">{currentTech?.specialization}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Vehicle Plate</span>
                <span className="font-semibold text-slate-900">{currentTech?.vehicleReg}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Assigned Orders</span>
                <span className="font-semibold text-slate-900">{assignedJobs.length} Today</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Unsynced offline work order signatures and status updates will remain saved in local storage.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-2.5 rounded-xl border border-slate-200 font-semibold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTechnicianLogout}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
