import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Radio,
  Wrench,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  Phone,
  Building2,
  KeyRound,
  Check,
  AlertCircle
} from 'lucide-react';
import { FieldnoraLogo } from '../common/FieldnoraLogo';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

interface RoleOption {
  id: 'admin' | 'dispatcher' | 'technician';
  label: string;
  name: string;
  email: string;
  phone: string;
  badge: string;
  tagline: string;
  icon: React.ReactNode;
}

const PRESET_ROLES: RoleOption[] = [
  {
    id: 'admin',
    label: 'Admin',
    name: 'Faith Wanjiku',
    email: 'admin@fieldnora.co.ke',
    phone: '+254 722 100 200',
    badge: 'Operations Admin',
    tagline: 'Full operational control, KRA eTIMS invoices, cash flow & settings',
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: 'dispatcher',
    label: 'Dispatcher',
    name: 'Kevin Omondi',
    email: 'dispatch@fieldnora.co.ke',
    phone: '+254 733 210 320',
    badge: 'Dispatch Lead',
    tagline: 'Live job scheduling, technician tracking & Nairobi GPS routing',
    icon: <Radio className="w-4 h-4" />,
  },
  {
    id: 'technician',
    label: 'Technician',
    name: 'Brian Kiprop',
    email: 'brian@fieldnora.co.ke',
    phone: '+254 711 450 780',
    badge: 'Field Engineer',
    tagline: 'Mobile job view, on-site checklists, parts catalog & signatures',
    icon: <Wrench className="w-4 h-4" />,
  },
];

export const LoginView: React.FC = () => {
  const { loginWithCredentials, loginAsRole, showToast } = useApp();

  const [selectedRole, setSelectedRole] = useState<'admin' | 'dispatcher' | 'technician'>('admin');
  const [email, setEmail] = useState('admin@fieldnora.co.ke');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRequestAccess, setShowRequestAccess] = useState(false);

  // Forgot Password Form State
  const [fpIdentifier, setFpIdentifier] = useState('');
  const [fpStep, setFpStep] = useState<'input' | 'otp' | 'success'>('input');
  const [fpOtp, setFpOtp] = useState('');
  const [fpGeneratedOtp, setFpGeneratedOtp] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  // Request Access Form State
  const [raName, setRaName] = useState('');
  const [raEmail, setRaEmail] = useState('');
  const [raPhone, setRaPhone] = useState('');
  const [raCompany, setRaCompany] = useState('');
  const [raCounty, setRaCounty] = useState('Nairobi');
  const [raTeamSize, setRaTeamSize] = useState('5-20 technicians');
  const [raLoading, setRaLoading] = useState(false);
  const [raSuccess, setRaSuccess] = useState(false);

  // Handle switching preset role
  const handleSelectRole = (role: 'admin' | 'dispatcher' | 'technician') => {
    setSelectedRole(role);
    setErrorMessage(null);
    const target = PRESET_ROLES.find(r => r.id === role);
    if (target) {
      setEmail(target.email);
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email or phone number');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithCredentials(email, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials. Please verify your email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click login
  const handleQuickLogin = async (role: 'admin' | 'dispatcher' | 'technician') => {
    setLoading(true);
    try {
      await loginAsRole(role);
    } catch (err: any) {
      showToast(err.message || 'Quick login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password flow
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpIdentifier) return;
    setFpLoading(true);
    try {
      const res = await api.forgotPassword(fpIdentifier);
      setFpStep('otp');
      if (res.otp) {
        setFpGeneratedOtp(res.otp);
      }
      showToast(res.message || 'Verification code sent', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send verification code', 'error');
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpOtp || !fpNewPassword) return;
    setFpLoading(true);
    try {
      const res = await api.resetPassword({
        identifier: fpIdentifier,
        code: fpOtp,
        newPassword: fpNewPassword,
      });
      setFpStep('success');
      showToast(res.message || 'Password reset successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setFpLoading(false);
    }
  };

  // Request Access Flow
  const handleRequestAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raName || !raEmail) return;
    setRaLoading(true);
    try {
      const res = await api.requestAccess({
        name: raName,
        email: raEmail,
        phone: raPhone,
        companyName: raCompany,
        county: raCounty,
        estimatedTeamSize: raTeamSize,
      });
      setRaSuccess(true);
      showToast(res.message, 'success');
    } catch (err: any) {
      showToast(err.message || 'Request failed. Please try again.', 'error');
    } finally {
      setRaLoading(false);
    }
  };

  const currentRoleObj = PRESET_ROLES.find(r => r.id === selectedRole) || PRESET_ROLES[0];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#021319] selection:bg-[#00827F] selection:text-white">
      {/* ================================================================ */}
      {/* LEFT COLUMN: HERO BRANDING (matching attachment r8HJ9.jpg)         */}
      {/* ================================================================ */}
      <div
        className="w-full lg:w-[48%] xl:w-[50%] min-h-[380px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden bg-gradient-to-br from-[#021319] via-[#041E26] to-[#010D12]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 35% 85%, rgba(13, 148, 136, 0.32) 0%, transparent 60%),
            radial-gradient(rgba(20, 184, 166, 0.15) 1.2px, transparent 1.2px)
          `,
          backgroundSize: '100% 100%, 28px 28px',
        }}
      >
        {/* Subtle decorative grid corner accents */}
        <div className="absolute top-6 left-8 text-xs font-mono tracking-widest text-teal-400/40 uppercase">
          KENYA FIELD OPS • v2.6.4
        </div>

        {/* Center Main Typography */}
        <div className="my-auto pt-8 lg:pt-0 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/70 border border-teal-800/50 text-teal-300 text-xs font-medium mb-6 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></span>
            Enterprise Multi-Role Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-sans lowercase">
            fieldnora
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl font-normal mt-3.5 tracking-wide max-w-md">
            Field Operations for Kenya &amp; Africa
          </p>

          {/* Underline pill accent matching r8HJ9.jpg */}
          <div className="w-16 h-1.5 bg-[#00827F] rounded-full mt-5 shadow-xs shadow-teal-500/50"></div>

          {/* Feature Highlights on Left Panel */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-xl text-left">
            <div className="p-3.5 rounded-xl bg-[#031d24]/80 border border-teal-900/60 backdrop-blur-xs">
              <div className="text-[#14B8A6] text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Admin Portal
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                eTIMS invoicing, cash flow, custom inventory &amp; executive audits.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#031d24]/80 border border-teal-900/60 backdrop-blur-xs">
              <div className="text-[#14B8A6] text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                Dispatcher
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Live drag-drop board, Nairobi GPS traffic routes &amp; team allocation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#031d24]/80 border border-teal-900/60 backdrop-blur-xs">
              <div className="text-[#14B8A6] text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Technician
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Mobile APK flow, offline sync, safety checklists &amp; client sign-off.
              </p>
            </div>
          </div>
        </div>

        {/* Left Footer Badges */}
        <div className="pt-6 border-t border-teal-900/40 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>KRA eTIMS &amp; M-Pesa Integrated</span>
          </div>
          <span>Nairobi Central HQ • Westlands</span>
        </div>
      </div>

      {/* ================================================================ */}
      {/* RIGHT COLUMN: LOGIN FORM (exact UI/UX from attachment r8HJ9.jpg)  */}
      {/* ================================================================ */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-[#F3F5F8]">
        <div className="w-full max-w-[460px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-300/60 border border-slate-100 p-7 sm:p-9 transition-all">
          {/* Header Brand Logo matching attachment */}
          <div className="flex justify-center mb-1">
            <FieldnoraLogo size={38} textSize="text-2xl" textColor="text-[#0F172A]" />
          </div>

          {/* Heading and subtitle */}
          <div className="text-center mt-3 mb-6">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Sign in to your dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-normal">
              Welcome back! Please sign in to continue.
            </p>
          </div>

          {/* Role Selection Segmented Control */}
          <div className="mb-5 bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
            {PRESET_ROLES.map(role => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white text-[#00827F] shadow-sm font-bold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <span className={isSelected ? 'text-[#00827F]' : 'text-slate-400'}>
                    {role.icon}
                  </span>
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Role Info Note */}
          <div className="mb-5 p-2.5 rounded-lg bg-teal-50/70 border border-teal-200/70 text-xs flex items-start gap-2.5">
            <div className="p-1 rounded-md bg-[#00827F] text-white shrink-0 mt-0.5">
              {currentRoleObj.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-teal-950 truncate">
                  {currentRoleObj.name}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00827F] bg-white px-1.5 py-0.5 rounded border border-teal-200">
                  {currentRoleObj.badge}
                </span>
              </div>
              <p className="text-[11px] text-teal-800/90 mt-0.5 leading-snug">
                {currentRoleObj.tagline}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form (exact layout from attachment) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="text"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00827F]/20 focus:border-[#00827F] transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00827F]/20 focus:border-[#00827F] transition-all shadow-2xs"
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row matching attachment */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember-me-checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00827F] focus:ring-[#00827F] border-slate-300 accent-[#00827F] cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Remember me</span>
              </label>

              <button
                type="button"
                id="forgot-password-link"
                onClick={() => {
                  setFpIdentifier(email);
                  setShowForgotPassword(true);
                }}
                className="text-xs font-semibold text-[#00827F] hover:text-[#006A68] hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in Button matching attachment (Vibrant teal button) */}
            <button
              type="submit"
              id="sign-in-submit-btn"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#00827F] hover:bg-[#006e6b] active:bg-[#005a58] text-white font-semibold rounded-lg shadow-sm transition-all duration-150 text-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Quick Demo 1-Click Role Direct Sign-in options */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-medium text-slate-400 text-center mb-2">
              Instant 1-Click Evaluation Sign In:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-[11px] font-semibold text-slate-700 transition-colors flex flex-col items-center gap-1 group text-center"
              >
                <Shield className="w-3.5 h-3.5 text-[#00827F] group-hover:scale-110 transition-transform" />
                <span className="truncate">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('dispatcher')}
                className="p-2 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-[11px] font-semibold text-slate-700 transition-colors flex flex-col items-center gap-1 group text-center"
              >
                <Radio className="w-3.5 h-3.5 text-[#00827F] group-hover:scale-110 transition-transform" />
                <span className="truncate">Dispatcher</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('technician')}
                className="p-2 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-[11px] font-semibold text-slate-700 transition-colors flex flex-col items-center gap-1 group text-center"
              >
                <Wrench className="w-3.5 h-3.5 text-[#00827F] group-hover:scale-110 transition-transform" />
                <span className="truncate">Technician</span>
              </button>
            </div>
          </div>

          {/* Footer Text matching attachment: "Don't have an account? Request access" */}
          <div className="text-center mt-5 text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              id="request-access-link"
              onClick={() => setShowRequestAccess(true)}
              className="text-[#00827F] font-semibold hover:underline hover:text-[#006A68] transition-colors"
            >
              Request access
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* FORGOT PASSWORD MODAL                                             */}
      {/* ================================================================ */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 relative text-slate-900">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-teal-50 text-[#00827F] border border-teal-200">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Reset Password</h3>
                <p className="text-xs text-slate-500">Fast Kenyan OTP Verification</p>
              </div>
            </div>

            {fpStep === 'input' && (
              <form onSubmit={handleSendOtp} className="mt-4 space-y-3.5">
                <p className="text-xs text-slate-600">
                  Enter your registered work email, phone number (+254...), or technician ID to receive a 6-digit verification code.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email, Phone, or Tech ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. brian@fieldnora.co.ke or 0711450780"
                    value={fpIdentifier}
                    onChange={e => setFpIdentifier(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#00827F]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={fpLoading}
                  className="w-full py-2.5 bg-[#00827F] hover:bg-[#006e6b] text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {fpLoading ? 'Dispatching SMS & Email OTP...' : 'Send Verification Code'}
                </button>
              </form>
            )}

            {fpStep === 'otp' && (
              <form onSubmit={handleResetPassword} className="mt-4 space-y-3.5">
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900">
                  <span>Verification code dispatched to </span>
                  <strong className="font-semibold">{fpIdentifier}</strong>.
                  {fpGeneratedOtp && (
                    <div className="mt-1 font-mono font-bold text-teal-950">
                      Demo OTP Code: <span className="underline">{fpGeneratedOtp}</span> (or enter 123456)
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={fpOtp}
                    onChange={e => setFpOtp(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono tracking-widest text-center outline-none focus:border-[#00827F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new secure password"
                    value={fpNewPassword}
                    onChange={e => setFpNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#00827F]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setFpStep('input')}
                    className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={fpLoading}
                    className="flex-1 py-2.5 bg-[#00827F] hover:bg-[#006e6b] text-white font-semibold rounded-lg text-xs transition-colors"
                  >
                    {fpLoading ? 'Resetting...' : 'Confirm Reset'}
                  </button>
                </div>
              </form>
            )}

            {fpStep === 'success' && (
              <div className="mt-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Password Reset Completed</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    You can now sign in immediately using your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full py-2.5 bg-[#00827F] hover:bg-[#006e6b] text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* REQUEST ACCESS MODAL                                              */}
      {/* ================================================================ */}
      {showRequestAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 relative text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowRequestAccess(false);
                setRaSuccess(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-teal-50 text-[#00827F] border border-teal-200">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Request Corporate Access</h3>
                <p className="text-xs text-slate-500">Field Operations Workspace Provisioning</p>
              </div>
            </div>

            {raSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Request Dispatched!</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    Thank you. Our Nairobi enterprise onboarding specialists will contact you with deployment credentials for your team.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestAccess(false);
                    setRaSuccess(false);
                  }}
                  className="px-6 py-2.5 bg-[#00827F] text-white font-semibold rounded-lg text-xs"
                >
                  Close &amp; Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestAccessSubmit} className="mt-4 space-y-3">
                <p className="text-xs text-slate-600">
                  Join leading Kenyan HVAC, electrical, plumbing, solar, and telecom service organizations using fieldnora.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Martin Maina"
                      value={raName}
                      onChange={e => setRaName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#00827F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Electrical Solutions Ltd"
                      value={raCompany}
                      onChange={e => setRaCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#00827F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="martin@apexelectrical.co.ke"
                      value={raEmail}
                      onChange={e => setRaEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#00827F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (M-Pesa / Call)</label>
                    <input
                      type="tel"
                      placeholder="+254 712 345 678"
                      value={raPhone}
                      onChange={e => setRaPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#00827F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary County</label>
                    <select
                      value={raCounty}
                      onChange={e => setRaCounty(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-[#00827F]"
                    >
                      <option value="Nairobi">Nairobi (HQ)</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kiambu">Kiambu</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Machakos">Machakos</option>
                      <option value="Uasin Gishu">Uasin Gishu (Eldoret)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Field Team Size</label>
                    <select
                      value={raTeamSize}
                      onChange={e => setRaTeamSize(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-[#00827F]"
                    >
                      <option value="1-5 technicians">1 - 5 Technicians</option>
                      <option value="5-20 technicians">5 - 20 Technicians</option>
                      <option value="20-50 technicians">20 - 50 Technicians</option>
                      <option value="50+ enterprise">50+ Enterprise Fleet</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00827F]" />
                    What&apos;s included in your trial:
                  </div>
                  <p>
                    Full 30-day access for Admin, Dispatcher &amp; Technicians, complete with KRA eTIMS invoice generation and live Nairobi GPS route tracking.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestAccess(false)}
                    className="flex-1 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={raLoading}
                    className="flex-1 py-2.5 bg-[#00827F] hover:bg-[#006e6b] text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {raLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
