import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  MoreVertical,
  MapPin,
  Phone,
  Navigation,
  Camera,
  Play,
  Pause,
  CheckCircle2,
  FileSignature,
  Smartphone,
  ClipboardList,
  Package,
  Wrench,
  ChevronRight,
  X,
  ExternalLink,
  Clock,
  Check,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  Send,
  Eye,
  Info
} from 'lucide-react';
import { SignaturePad } from '../common/SignaturePad';
import { MobileJobCompletionScreen } from './MobileJobCompletionScreen';

// WhatsApp Brand Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export interface MobileJobDetailProps {
  onBack?: () => void;
  onOpenLiveTracking?: () => void;
  onOpenCompletion?: () => void;
  initialJobNumber?: string;
}

export const MobileJobDetailScreen: React.FC<MobileJobDetailProps> = ({
  onBack,
  onOpenLiveTracking,
  onOpenCompletion,
  initialJobNumber = 'JOB-2025-0587',
}) => {
  const { showToast } = useApp();

  // Full-screen job completion view toggle
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  // Core Job State matching exact screenshot thWmW.jpg
  const [jobState, setJobState] = useState({
    jobNumber: initialJobNumber,
    status: 'on_site' as 'scheduled' | 'en_route' | 'on_site' | 'in_progress' | 'completed',
    statusLabel: 'On Site',
    customerName: 'Peter Mwangi',
    phone: '0712 345 678',
    addressLine1: 'Westlands Square, Block B, 3rd Floor',
    addressLine2: 'Westlands, Nairobi',
    jobDescription:
      'AC not cooling, indoor fan running but no cold air. Check refrigerant levels and inspect thermostat.',
    requiredMaterials: 'R410A Refrigerant (1kg), Copper Pipe Insulation.',
    labourItems: 'AC Inspection & Repair, Gas Top-up, System Test & Commissioning.',
    amountKes: 8500,
    startTime: null as string | null,
    isTimerRunning: false,
    elapsedSeconds: 1420, // ~23 mins active
    signature: null as string | null,
    paymentStatus: 'pending' as 'pending' | 'paid',
    paymentReceipt: null as string | null,
    photos: [
      {
        id: 'p-01',
        title: 'Air handler evaporator coil inspection',
        phase: 'before',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
        timestamp: '10:15 AM',
      },
    ],
    checklist: [
      { id: 'chk-1', text: 'Measure refrigerant suction & discharge pressures', done: true },
      { id: 'chk-2', text: 'Inspect thermostat wiring & temperature delta', done: true },
      { id: 'chk-3', text: 'Apply nitrogen pressure leak test to joints', done: false },
      { id: 'chk-4', text: 'Top up 1kg R410A refrigerant & verify subcooling', done: false },
      { id: 'chk-5', text: 'Test run AC unit for 15 mins (Target 19°C airflow)', done: false },
    ],
  });

  // Modal Dialog States
  const [activeModal, setActiveModal] = useState<
    'none' | 'overflow_menu' | 'status_picker' | 'signature' | 'mpesa_payment' | 'camera' | 'call' | 'whatsapp' | 'description_details' | 'materials_details' | 'labour_details' | 'gps_navigation'
  >('none');

  // M-Pesa STK Push Simulation State
  const [mpesaPhone, setMpesaPhone] = useState('0712345678');
  const [mpesaAmount, setMpesaAmount] = useState('8500');
  const [mpesaStep, setMpesaStep] = useState<'prompt' | 'sending' | 'waiting_pin' | 'confirmed'>('prompt');
  const [mpesaCountdown, setMpesaCountdown] = useState(15);

  // Active Job Timer Hook
  useEffect(() => {
    let interval: any;
    if (jobState.isTimerRunning) {
      interval = setInterval(() => {
        setJobState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [jobState.isTimerRunning]);

  // STK Push Countdown Timer
  useEffect(() => {
    let timer: any;
    if (mpesaStep === 'waiting_pin' && mpesaCountdown > 0) {
      timer = setTimeout(() => {
        setMpesaCountdown(c => c - 1);
      }, 1000);
    } else if (mpesaStep === 'waiting_pin' && mpesaCountdown === 0) {
      // Auto-confirm M-Pesa transaction
      const receipt = `SJL${Math.floor(100000 + Math.random() * 900000)}KES`;
      setMpesaStep('confirmed');
      setJobState(prev => ({
        ...prev,
        paymentStatus: 'paid',
        paymentReceipt: receipt,
      }));
      showToast('M-Pesa payment received! Safaricom Receipt: ' + receipt, 'success');
    }
    return () => clearTimeout(timer);
  }, [mpesaStep, mpesaCountdown, showToast]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Status transitions
  const handleSetStatus = (newStatus: 'scheduled' | 'en_route' | 'on_site' | 'in_progress' | 'completed') => {
    const labelMap: Record<string, string> = {
      scheduled: 'Scheduled',
      en_route: 'En Route',
      on_site: 'On Site',
      in_progress: 'In Progress',
      completed: 'Completed',
    };
    setJobState(prev => ({
      ...prev,
      status: newStatus,
      statusLabel: labelMap[newStatus],
      isTimerRunning: newStatus === 'in_progress',
    }));
    setActiveModal('none');
    showToast(`Job status updated to ${labelMap[newStatus]}`, 'success');
  };

  const handleToggleStartJob = () => {
    if (jobState.status !== 'in_progress') {
      handleSetStatus('in_progress');
      showToast('Job started! Elapsed time tracking active.', 'info');
    } else {
      setJobState(prev => ({ ...prev, isTimerRunning: !prev.isTimerRunning }));
      showToast(jobState.isTimerRunning ? 'Job timer paused' : 'Job timer resumed', 'info');
    }
  };

  const handleCompleteJob = () => {
    if (onOpenCompletion) {
      onOpenCompletion();
      return;
    }
    setShowCompletionScreen(true);
  };

  const handleSaveSignature = (dataUrl: string) => {
    setJobState(prev => ({ ...prev, signature: dataUrl }));
    setActiveModal('none');
    showToast('Customer signature saved for JOB-2025-0587', 'success');
  };

  const handleInitiateMpesa = () => {
    setMpesaStep('sending');
    setTimeout(() => {
      setMpesaStep('waiting_pin');
      setMpesaCountdown(6);
    }, 1200);
  };

  if (showCompletionScreen) {
    return (
      <div className="flex justify-center w-full min-h-screen py-2 sm:py-6 px-1 sm:px-4 bg-[#05080E] select-none">
        <MobileJobCompletionScreen
          jobNumber={jobState.jobNumber}
          customerName={jobState.customerName}
          totalKes={jobState.amountKes}
          onBack={() => setShowCompletionScreen(false)}
          onJobSynced={() => {
            setJobState(prev => ({
              ...prev,
              status: 'completed',
              statusLabel: 'Completed',
              paymentStatus: 'paid'
            }));
            setShowCompletionScreen(false);
            showToast('Job successfully completed and synced!', 'success');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full min-h-screen py-2 sm:py-6 px-1 sm:px-4 bg-[#05080E] select-none">
      {/* ========================================================================= */}
      {/* SMARTPHONE CASING & BEZEL - EXACT PIXEL PERFECT ANDROID VIEW (thWmW.jpg)  */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[420px] bg-[#000000] text-white rounded-[40px] sm:rounded-[44px] shadow-2xl border-4 sm:border-[6px] border-[#182333] flex flex-col overflow-hidden relative min-h-[850px] max-h-[920px]">
        
        {/* ========================================================= */}
        {/* 1. NATIVE ANDROID SYSTEM STATUS BAR (10:42 / 78% Battery) */}
        {/* ========================================================= */}
        <div className="bg-[#000000] px-6 pt-3 pb-1.5 flex items-center justify-between text-xs text-white font-medium shrink-0 z-20">
          {/* Time: 10:42 */}
          <span className="font-semibold text-[13px] tracking-tight text-white">10:42</span>

          {/* Notch indicator */}
          <div className="w-3.5 h-3.5 rounded-full bg-[#0B0F15] border border-[#1A2533] mx-auto shadow-inner" />

          {/* System Indicators: DND Circle, Signal, Wifi, 78% Battery */}
          <div className="flex items-center gap-1.5 text-slate-300">
            {/* DND Circle */}
            <div className="w-3 h-3 rounded-full border border-slate-300 flex items-center justify-center">
              <span className="w-1.5 h-0.5 bg-slate-300" />
            </div>

            {/* 4G Cell Signal (4 filled bars) */}
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-1 bg-slate-300 rounded-2xs" />
              <span className="w-0.5 h-1.5 bg-slate-300 rounded-2xs" />
              <span className="w-0.5 h-2.5 bg-slate-300 rounded-2xs" />
              <span className="w-0.5 h-3 bg-slate-300 rounded-2xs" />
            </div>

            {/* Wi-Fi Icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-slate-300">
              <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 2.5c3.96 0 7.56 1.54 10.27 4.07L12 18.84 1.73 10.57C4.44 8.04 8.04 6.5 12 6.5z" />
            </svg>

            {/* Battery 78% Gauge */}
            <div className="flex items-center gap-1 font-semibold text-[11px] text-white">
              <div className="w-5 h-2.5 rounded-xs border border-slate-300 p-0.5 flex items-center">
                <div className="w-[78%] h-full bg-slate-200 rounded-2xs" />
              </div>
              <span className="text-[11px]">78%</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. TOP ACTION APP BAR: [←] Job Details [⋮]                */}
        {/* ========================================================= */}
        <div className="bg-[#000000] px-4 py-2.5 flex items-center justify-between border-b border-[#141B26] shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1 -ml-1 text-white hover:text-teal-400 active:scale-95 transition-all"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-[17px] font-bold text-white tracking-tight">Job Details</h1>
          </div>

          {/* Three-dot Overflow Menu Button */}
          <div className="relative">
            <button
              onClick={() => setActiveModal(activeModal === 'overflow_menu' ? 'none' : 'overflow_menu')}
              className="p-1 text-slate-300 hover:text-white active:scale-95 transition-all"
              title="More actions"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>

            {/* Overflow Dropdown Menu */}
            {activeModal === 'overflow_menu' && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0E1624] border border-[#1E2C3F] rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setActiveModal('status_picker');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#152033] flex items-center gap-2.5 text-slate-200"
                >
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <span>Change Status ({jobState.statusLabel})</span>
                </button>
                <button
                  onClick={() => {
                    setActiveModal('none');
                    showToast('Work order report PDF generated and queued for download', 'success');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#152033] flex items-center gap-2.5 text-slate-200"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Download Work Order PDF</span>
                </button>
                <button
                  onClick={() => {
                    setActiveModal('none');
                    showToast('Reported 15 min traffic delay to dispatcher desk', 'info');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#152033] flex items-center gap-2.5 text-slate-200"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Report Traffic / Site Delay</span>
                </button>
                <div className="h-px bg-[#1E2C3F] my-1" />
                <button
                  onClick={() => {
                    setActiveModal('none');
                    showToast('Safety hazard checklist confirmed: All clear.', 'success');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-[#152033] flex items-center gap-2.5 text-emerald-400"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Safety Risk Check (JSA)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. MAIN SCROLLABLE CONTENT CANVAS (Exact layout thWmW.jpg) */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto bg-[#000000] px-3.5 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-800 text-xs">
          
          {/* ------------------------------------------------------------- */}
          {/* CARD 1: JOB NUMBER, CUSTOMER & ADDRESS DETAILS                */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#0B111A] rounded-2xl border border-[#16212E] p-3.5 space-y-3.5 shadow-sm">
            {/* Top Row: JOB-2025-0587 & On Site Pill */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-[18px] text-white tracking-tight">
                {jobState.jobNumber}
              </span>

              {/* Status Pill Badge: "On Site" */}
              <button
                onClick={() => setActiveModal('status_picker')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0C3032] border border-[#14B8A6]/40 text-[#14B8A6] hover:bg-[#0E3C3E] active:scale-95 transition-all shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5 text-[#14B8A6] fill-[#14B8A6]" />
                <span>{jobState.statusLabel}</span>
              </button>
            </div>

            {/* Customer Sub-section */}
            <div className="flex items-start gap-3">
              {/* Teal Avatar with User Icon */}
              <div className="w-11 h-11 rounded-full bg-[#107074] flex items-center justify-center shrink-0 shadow-inner">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>

              {/* Customer Information & Contact Row */}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-slate-400 font-medium block">Customer</span>
                <h2 className="text-[15px] font-bold text-white leading-tight truncate">
                  {jobState.customerName}
                </h2>

                {/* Phone & WhatsApp Action Pills Row */}
                <div className="flex items-center gap-3 mt-1.5">
                  {/* Phone Clickable */}
                  <button
                    onClick={() => setActiveModal('call')}
                    className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-medium text-[13px] group"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#14B8A6] fill-[#14B8A6]" />
                    <span className="font-mono">{jobState.phone}</span>
                  </button>

                  {/* WhatsApp Pill Button */}
                  <button
                    onClick={() => setActiveModal('whatsapp')}
                    className="bg-[#09111A] hover:bg-[#121B27] border border-[#1E293B] rounded-lg px-2.5 py-0.5 flex items-center gap-1.5 text-white active:scale-95 transition-all shadow-xs"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                    <span className="text-[12px] font-semibold text-white">WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Address Sub-section */}
            <div className="flex items-start gap-3 pt-1">
              <div className="w-11 flex justify-center shrink-0 pt-0.5">
                <MapPin className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-slate-400 font-medium block">Address</span>
                <p className="text-[13px] font-medium text-white leading-tight">
                  {jobState.addressLine1}
                </p>
                <p className="text-[13px] text-slate-300 mt-0.5">
                  {jobState.addressLine2}
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 2: INTERACTIVE NAIROBI VECTOR MAP (Exact match thWmW)    */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#0A1018] rounded-2xl border border-[#16212E] overflow-hidden relative shadow-sm">
            {/* Vector Cartography SVG of Westlands, Nairobi */}
            <div className="relative w-full h-[190px] bg-[#0C121C] overflow-hidden">
              <svg
                viewBox="0 0 400 200"
                className="w-full h-full object-cover select-none pointer-events-none"
              >
                {/* Land Blocks */}
                <rect x="0" y="0" width="400" height="200" fill="#0C121C" />
                <path d="M0,0 L180,0 L160,80 L0,90 Z" fill="#0E1622" />
                <path d="M190,0 L400,0 L400,60 L240,70 Z" fill="#0E1622" />
                <path d="M0,100 L150,90 L130,170 L0,180 Z" fill="#0E1622" />
                <path d="M170,90 L390,75 L380,140 L160,150 Z" fill="#0E1622" />
                <path d="M0,185 L400,165 L400,200 L0,200 Z" fill="#0A0F17" />

                {/* Subtle Park Greenery */}
                <path d="M180,95 Q200,110 215,95 Q205,80 180,95 Z" fill="#0E2320" />
                <path d="M70,25 Q90,35 105,25 Q95,15 70,25 Z" fill="#0E2320" />
                <path d="M280,115 Q310,125 325,115 Q305,100 280,115 Z" fill="#0E2320" />

                {/* Road Networks */}
                {/* Parklands Rd (Top Horizontal) */}
                <path
                  d="M0,35 L400,35"
                  stroke="#1E2A3A"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Riverside Dr (Top Right Angle) */}
                <path
                  d="M260,0 L400,60"
                  stroke="#1E2A3A"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Ring Rd / Trefenae Rd (Vertical Center) */}
                <path
                  d="M175,0 L165,200"
                  stroke="#1E2A3A"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Westlands Ave (Diagonal Lower Left) */}
                <path
                  d="M0,130 L165,110 L280,145 L400,120"
                  stroke="#1E2A3A"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                {/* The Oval Limuru Rd (Bottom Highway) */}
                <path
                  d="M0,175 Q200,155 400,145"
                  stroke="#1E2A3A"
                  strokeWidth="11"
                  strokeLinecap="round"
                />
                <path
                  d="M0,175 Q200,155 400,145"
                  stroke="#151E2B"
                  strokeWidth="9"
                />

                {/* Street Names Labels in Exact Position from Screenshot */}
                <text x="55" y="65" fill="#CBD5E1" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  Westlands
                </text>
                <text x="60" y="77" fill="#CBD5E1" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  Square
                </text>
                
                <text x="190" y="32" fill="#94A3B8" fontSize="8" fontWeight="500" fontFamily="sans-serif">
                  Parklands Rd
                </text>

                <text x="310" y="30" fill="#94A3B8" fontSize="8" fontWeight="500" fontFamily="sans-serif">
                  Riverside Dr
                </text>

                {/* Vertical label for Trefenae Rd */}
                <text
                  x="170"
                  y="105"
                  fill="#64748B"
                  fontSize="7"
                  fontWeight="bold"
                  transform="rotate(-90 170,105)"
                  fontFamily="sans-serif"
                >
                  Trefenae Rd
                </text>

                <text x="50" y="165" fill="#94A3B8" fontSize="8" fontWeight="500" fontFamily="sans-serif">
                  Westlands Ave
                </text>

                <text x="275" y="180" fill="#94A3B8" fontSize="8" fontWeight="500" fontFamily="sans-serif">
                  The Oval Limuru Rd
                </text>

                {/* Driving path connecting You Are Here to Job Location */}
                <path
                  d="M135,90 Q170,95 240,85"
                  stroke="#14B8A6"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  fill="none"
                />
              </svg>

              {/* Marker 1: "You are here" (Blue concentric pulse with tooltip) */}
              <div className="absolute top-[75px] left-[125px] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto">
                {/* Concentric blue rings */}
                <div className="relative flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500/25 animate-ping absolute" />
                  <div className="w-6 h-6 rounded-full bg-blue-600/40 border border-blue-400/50 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md" />
                  </div>
                </div>
                {/* Tooltip Tag: "You are here" */}
                <div className="mt-1 px-2 py-0.5 rounded-md bg-[#0C1420] border border-[#1A283B] text-[10px] font-semibold text-white shadow-lg whitespace-nowrap">
                  You are here
                </div>
              </div>

              {/* Marker 2: "Job Location" (Teal Pin with concentric rings and tooltip) */}
              <div className="absolute top-[70px] left-[250px] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto">
                <div className="relative flex items-center justify-center">
                  {/* Concentric radar rings */}
                  <div className="w-9 h-9 rounded-full border border-teal-500/30 absolute animate-pulse" />
                  <div className="w-6 h-6 rounded-full bg-[#14B8A6]/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#14B8A6] fill-[#14B8A6]" />
                  </div>
                </div>
                {/* Tooltip Tag: "Job Location" */}
                <div className="mt-1 px-2 py-0.5 rounded-md bg-[#0C1420] border border-[#1A283B] text-[10px] font-semibold text-white shadow-lg whitespace-nowrap">
                  Job Location
                </div>
              </div>

              {/* Interactive Floating Quick GPS Navigator overlay */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                {onOpenLiveTracking && (
                  <button
                    onClick={onOpenLiveTracking}
                    className="bg-[#2563EB]/90 hover:bg-[#1D4ED8] text-white px-2 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all"
                    title="Live Tracking Map"
                  >
                    <Navigation className="w-3.5 h-3.5 transform rotate-45 text-white" />
                    <span className="text-[10px]">Live Map (vwnwt)</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveModal('gps_navigation')}
                  className="bg-[#09111A]/90 hover:bg-[#121E2C] border border-[#1E2E40] text-teal-400 p-1.5 rounded-lg text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
                  title="Open GPS Navigation"
                >
                  <Navigation className="w-3.5 h-3.5 transform -rotate-45" />
                  <span className="text-[10px] font-bold text-white">4 mins (1.2 km)</span>
                </button>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 3: JOB DESCRIPTION                                       */}
          {/* ------------------------------------------------------------- */}
          <div
            onClick={() => setActiveModal('description_details')}
            className="bg-[#0B111A] rounded-2xl border border-[#16212E] hover:border-[#14B8A6]/40 p-3.5 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all shadow-sm group"
          >
            <div className="flex items-start gap-3 min-w-0 pr-2">
              {/* Teal circular badge with Clipboard icon */}
              <div className="w-10 h-10 rounded-full bg-[#107074] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-white group-hover:text-teal-300 transition-colors">
                  Job Description
                </h3>
                <p className="text-[12px] text-slate-300 leading-snug line-clamp-2 mt-0.5">
                  {jobState.jobDescription}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white shrink-0 transition-colors" />
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 4: REQUIRED MATERIALS                                    */}
          {/* ------------------------------------------------------------- */}
          <div
            onClick={() => setActiveModal('materials_details')}
            className="bg-[#0B111A] rounded-2xl border border-[#16212E] hover:border-[#14B8A6]/40 p-3.5 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all shadow-sm group"
          >
            <div className="flex items-start gap-3 min-w-0 pr-2">
              {/* Teal circular badge with Package/Cube icon */}
              <div className="w-10 h-10 rounded-full bg-[#107074] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-white group-hover:text-teal-300 transition-colors">
                  Required Materials
                </h3>
                <p className="text-[12px] text-slate-300 leading-snug mt-0.5">
                  {jobState.requiredMaterials}
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 5: LABOUR ITEMS                                          */}
          {/* ------------------------------------------------------------- */}
          <div
            onClick={() => setActiveModal('labour_details')}
            className="bg-[#0B111A] rounded-2xl border border-[#16212E] hover:border-[#14B8A6]/40 p-3.5 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all shadow-sm group"
          >
            <div className="flex items-start gap-3 min-w-0 pr-2">
              {/* Teal circular badge with Wrench icon */}
              <div className="w-10 h-10 rounded-full bg-[#107074] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-white group-hover:text-teal-300 transition-colors">
                  Labour Items
                </h3>
                <p className="text-[12px] text-slate-300 leading-snug mt-0.5">
                  {jobState.labourItems}
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 2x2 ACTION BUTTONS GRID (Exact match thWmW.jpg)                */}
          {/* ------------------------------------------------------------- */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Button 1: Start Job (Deep teal filled) */}
            <button
              onClick={handleToggleStartJob}
              className={`py-3 px-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm ${
                jobState.status === 'in_progress'
                  ? 'bg-[#0E4447] text-teal-300 border border-teal-500/50'
                  : 'bg-[#0E5456] hover:bg-[#126567] text-white'
              }`}
            >
              {jobState.status === 'in_progress' ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{jobState.isTimerRunning ? formatTimer(jobState.elapsedSeconds) : 'Resume'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Job</span>
                </>
              )}
            </button>

            {/* Button 2: Complete Job (Deep teal filled) */}
            <button
              onClick={handleCompleteJob}
              className={`py-3 px-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm ${
                jobState.status === 'completed'
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50'
                  : 'bg-[#0E5456] hover:bg-[#126567] text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{jobState.status === 'completed' ? 'Completed ✓' : 'Complete Job'}</span>
            </button>

            {/* Button 3: Add Signature (ZMesm.jpg Digital Sign-off) */}
            <button
              onClick={() => {
                if (onOpenCompletion) {
                  onOpenCompletion();
                } else {
                  setShowCompletionScreen(true);
                }
              }}
              className={`py-3 px-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 bg-[#09111A] hover:bg-[#121B27] border active:scale-95 transition-all shadow-sm cursor-pointer ${
                jobState.signature ? 'border-teal-500/60 text-teal-300' : 'border-[#1E293B] text-white'
              }`}
            >
              <FileSignature className="w-4 h-4 text-[#14B8A6]" />
              <span>{jobState.signature ? 'Signed ✓' : 'Digital Sign-Off'}</span>
            </button>

            {/* Button 4: Collect Payment (M-Pesa) */}
            <button
              onClick={() => {
                setMpesaStep('prompt');
                setActiveModal('mpesa_payment');
              }}
              className={`py-3 px-2 rounded-xl font-semibold text-[12px] flex items-center justify-center gap-1.5 bg-[#09111A] hover:bg-[#121B27] border active:scale-95 transition-all shadow-sm ${
                jobState.paymentStatus === 'paid' ? 'border-emerald-500/60 text-emerald-300' : 'border-[#1E293B] text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 text-[#14B8A6] shrink-0" />
              <span className="truncate">
                {jobState.paymentStatus === 'paid' ? 'Paid (M-Pesa) ✓' : 'Collect Payment (M-Pesa)'}
              </span>
            </button>
          </div>

          <div className="h-4" />
        </div>

        {/* ========================================================= */}
        {/* 4. BOTTOM QUICK ACTIONS BAR (Exact match thWmW.jpg)       */}
        {/* Call | WhatsApp | Navigate | Camera                       */}
        {/* ========================================================= */}
        <div className="bg-[#000000] border-t border-[#141B26] grid grid-cols-4 divide-x divide-[#141B26] shrink-0 py-2">
          {/* Action 1: Call */}
          <button
            onClick={() => setActiveModal('call')}
            className="flex flex-col items-center justify-center py-1 text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <Phone className="w-4.5 h-4.5 text-[#14B8A6]" />
            <span className="text-[11px] font-medium mt-1">Call</span>
          </button>

          {/* Action 2: WhatsApp */}
          <button
            onClick={() => setActiveModal('whatsapp')}
            className="flex flex-col items-center justify-center py-1 text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <WhatsAppIcon className="w-4.5 h-4.5 text-[#25D366]" />
            <span className="text-[11px] font-medium mt-1">WhatsApp</span>
          </button>

          {/* Action 3: Navigate */}
          <button
            onClick={() => {
              if (onOpenLiveTracking) {
                onOpenLiveTracking();
              } else {
                setActiveModal('gps_navigation');
              }
            }}
            className="flex flex-col items-center justify-center py-1 text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <Navigation className="w-4.5 h-4.5 text-[#14B8A6] transform -rotate-45" />
            <span className="text-[11px] font-medium mt-1">Navigate</span>
          </button>

          {/* Action 4: Camera */}
          <button
            onClick={() => setActiveModal('camera')}
            className="flex flex-col items-center justify-center py-1 text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <Camera className="w-4.5 h-4.5 text-[#14B8A6]" />
            <span className="text-[11px] font-medium mt-1">Camera</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 5. NATIVE ANDROID SYSTEM NAVIGATION BAR (◁  ○  □)         */}
        {/* ========================================================= */}
        <div className="bg-[#000000] py-2.5 px-12 flex items-center justify-between text-slate-400 border-t border-[#0A0E14] shrink-0">
          {/* Back Triangle */}
          <button onClick={onBack} className="p-1 hover:text-white transition-colors" title="Back">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <polygon points="19,4 5,12 19,20" />
            </svg>
          </button>

          {/* Home Circle */}
          <button onClick={onBack} className="p-1 hover:text-white transition-colors" title="Home">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
          </button>

          {/* Recents Square */}
          <button className="p-1 hover:text-white transition-colors" title="Recent Apps">
            <div className="w-3.5 h-3.5 rounded-2xs border-2 border-current" />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODALS & INTENT EMULATORS                                    */}
      {/* ========================================================================= */}

      {/* MODAL 1: STATUS PICKER */}
      {activeModal === 'status_picker' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0E1624] border border-[#1E2C3F] rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Update Dispatch Status</h3>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { key: 'scheduled', label: 'Scheduled', desc: 'Dispatched to technician schedule' },
                { key: 'en_route', label: 'En Route', desc: 'Driving to customer location' },
                { key: 'on_site', label: 'On Site', desc: 'Arrived at Westlands Square' },
                { key: 'in_progress', label: 'In Progress', desc: 'Actively performing HVAC inspection & gas top-up' },
                { key: 'completed', label: 'Completed', desc: 'Service completed, client acceptance sign-off' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => handleSetStatus(opt.key as any)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    jobState.status === opt.key
                      ? 'bg-[#14B8A6]/20 border-[#14B8A6] text-white'
                      : 'bg-[#09111A] border-[#16212E] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <span className="font-bold text-xs block">{opt.label}</span>
                    <span className="text-[11px] text-slate-400">{opt.desc}</span>
                  </div>
                  {jobState.status === opt.key && <Check className="w-4 h-4 text-teal-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOMER SIGNATURE MODAL */}
      {activeModal === 'signature' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-md">
            <SignaturePad
              onCancel={() => setActiveModal('none')}
              onSave={handleSaveSignature}
              signerTitle={`Customer Acceptance Signature (${jobState.customerName})`}
            />
          </div>
        </div>
      )}

      {/* MODAL 3: KENYAN M-PESA STK PUSH EMULATOR */}
      {activeModal === 'mpesa_payment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0B121C] border border-[#1E2B3D] rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header with Safaricom Green Accent */}
            <div className="flex items-center justify-between pb-2 border-b border-[#172232]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#008542] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  M
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Lipa na M-Pesa STK</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Paybill: 247247 (Fieldnora)</span>
                </div>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {mpesaStep === 'prompt' && (
              <div className="space-y-4 text-xs">
                <div className="bg-[#060A10] p-3 rounded-xl border border-[#141C28] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer:</span>
                    <span className="font-bold text-white">{jobState.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Work Order:</span>
                    <span className="font-mono text-teal-400">{jobState.jobNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service Fee:</span>
                    <span className="font-bold text-emerald-400 text-sm">KES {Number(mpesaAmount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Customer Safaricom Number</label>
                  <input
                    type="text"
                    value={mpesaPhone}
                    onChange={e => setMpesaPhone(e.target.value)}
                    className="w-full bg-[#0E1724] border border-[#1E2E42] rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-hidden"
                    placeholder="e.g. 0712345678"
                  />
                  <span className="text-[10px] text-slate-500">Will trigger instant PIN dialog on customer's phone</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300">Amount (KES)</label>
                  <input
                    type="number"
                    value={mpesaAmount}
                    onChange={e => setMpesaAmount(e.target.value)}
                    className="w-full bg-[#0E1724] border border-[#1E2E42] rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <button
                  onClick={handleInitiateMpesa}
                  className="w-full py-2.5 rounded-xl font-bold bg-[#008542] hover:bg-[#007037] text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Send STK Push Prompt</span>
                </button>
              </div>
            )}

            {mpesaStep === 'sending' && (
              <div className="py-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#008542] animate-spin mx-auto" />
                <h4 className="font-bold text-white text-sm">Contacting Safaricom Daraja API...</h4>
                <p className="text-xs text-slate-400">Initiating prompt to {mpesaPhone}</p>
              </div>
            )}

            {mpesaStep === 'waiting_pin' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 mx-auto flex items-center justify-center">
                  <span className="font-mono text-xl font-bold text-emerald-400">{mpesaCountdown}s</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Waiting for Customer PIN...</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Customer prompted on <span className="font-mono text-white">{mpesaPhone}</span> for KES {Number(mpesaAmount).toLocaleString()}.
                  </p>
                </div>
                <div className="bg-[#0E1724] p-2.5 rounded-xl border border-[#19273A] text-[11px] text-amber-300">
                  Simulating customer entering secret 4-digit M-Pesa PIN...
                </div>
              </div>
            )}

            {mpesaStep === 'confirmed' && (
              <div className="py-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 mx-auto flex items-center justify-center text-emerald-400">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Payment Confirmed!</h4>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5">
                    Receipt: {jobState.paymentReceipt}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    KES {Number(mpesaAmount).toLocaleString()} received from Peter Mwangi.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal('none')}
                  className="w-full py-2.5 rounded-xl font-bold bg-[#14B8A6] text-[#050B12]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: PHONE CALL INTENT SIMULATOR */}
      {activeModal === 'call' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#09111C] border border-[#19283B] rounded-3xl p-6 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 border-2 border-teal-500 mx-auto flex items-center justify-center text-teal-400">
              <Phone className="w-8 h-8 animate-bounce" />
            </div>

            <div>
              <span className="text-xs text-slate-400">Calling Customer...</span>
              <h3 className="text-lg font-bold text-white mt-1">{jobState.customerName}</h3>
              <p className="text-sm font-mono text-teal-400 mt-0.5">{jobState.phone}</p>
            </div>

            <div className="flex justify-center gap-3">
              <a
                href={`tel:${jobState.phone.replace(/\s+/g, '')}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Open Native Phone App</span>
              </a>
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: WHATSAPP CHAT INTENT SIMULATOR */}
      {activeModal === 'whatsapp' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0C1522] border border-[#1E2F46] rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#182638]">
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                <h3 className="text-sm font-bold text-white">WhatsApp Client Message</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#070D14] p-3 rounded-xl border border-[#162232] space-y-1">
                <span className="text-[11px] text-slate-400">Recipient:</span>
                <p className="font-bold text-white">{jobState.customerName} ({jobState.phone})</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Template Dispatch Update:</span>
                <div className="bg-[#052E16]/40 border border-[#166534] p-3 rounded-xl text-slate-200 text-xs leading-relaxed">
                  "Hello {jobState.customerName}, this is John Mwangi from Fieldnora Services. I am on-site at Westlands Square, Block B for your AC diagnostic job {jobState.jobNumber}. Please let me know when you're available for access."
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/254${jobState.phone.replace(/^0/, '').replace(/\s+/g, '')}?text=${encodeURIComponent(
                    `Hello ${jobState.customerName}, this is Fieldnora technician regarding work order ${jobState.jobNumber}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 flex items-center justify-center gap-1.5 text-xs shadow-md"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Launch WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    setActiveModal('none');
                    showToast('WhatsApp notification sent', 'success');
                  }}
                  className="px-4 py-2.5 rounded-xl font-medium bg-[#142030] text-slate-300 text-xs"
                >
                  Simulate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CAMERA / SITE EVIDENCE ATTACHMENT */}
      {activeModal === 'camera' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0B131F] border border-[#1E2D42] rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#182638]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Job Site Inspection Photos</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {jobState.photos.map(p => (
                  <div key={p.id} className="relative rounded-xl overflow-hidden border border-[#1D2B3F] group">
                    <img src={p.url} alt={p.title} className="w-full h-24 object-cover" />
                    <span className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-teal-300 font-mono">
                      {p.timestamp}
                    </span>
                  </div>
                ))}
                <label className="border-2 border-dashed border-[#1E2F46] hover:border-teal-400 rounded-xl flex flex-col items-center justify-center h-24 cursor-pointer text-slate-400 hover:text-teal-400 transition-colors">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[11px] font-semibold">Snap Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = ev => {
                          const url = ev.target?.result as string;
                          setJobState(prev => ({
                            ...prev,
                            photos: [
                              ...prev.photos,
                              {
                                id: `p-${Date.now()}`,
                                title: file.name,
                                phase: 'during',
                                url,
                                timestamp: '10:45 AM',
                              },
                            ],
                          }));
                          showToast('Inspection photo attached to work order', 'success');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <p className="text-[11px] text-slate-400">
                Photos are automatically geo-tagged with GPS coordinates and appended to the final customer invoice.
              </p>

              <button
                onClick={() => setActiveModal('none')}
                className="w-full py-2 rounded-xl bg-[#14B8A6] text-[#050C14] font-bold text-xs"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: JOB DESCRIPTION & TECHNICAL DIAGNOSTICS */}
      {activeModal === 'description_details' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0B131F] border border-[#1E2D42] rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#182638]">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Diagnostic & Fault Checklist</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#08101A] p-3 rounded-xl border border-[#172436] space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reported Issue</span>
                <p className="text-slate-200 leading-relaxed">{jobState.jobDescription}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Diagnostic Steps</span>
                {jobState.checklist.map(chk => (
                  <div
                    key={chk.id}
                    onClick={() => {
                      setJobState(prev => ({
                        ...prev,
                        checklist: prev.checklist.map(c => (c.id === chk.id ? { ...c, done: !c.done } : c)),
                      }));
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      chk.done ? 'bg-[#0E2C2E] border-teal-500/50 text-teal-200' : 'bg-[#0A111C] border-[#182638] text-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${chk.done ? 'bg-teal-500 border-teal-500 text-slate-950' : 'border-slate-500'}`}>
                      {chk.done && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs leading-snug flex-1">{chk.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveModal('none')}
                className="w-full py-2.5 rounded-xl font-bold bg-[#14B8A6] text-[#050C14] text-xs"
              >
                Save Diagnostic Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: MATERIALS LEDGER */}
      {activeModal === 'materials_details' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0B131F] border border-[#1E2D42] rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#182638]">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Materials & Van Inventory</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#09111C] border border-[#162334] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">R410A Refrigerant (1kg)</span>
                    <span className="text-[11px] text-slate-400">Gas cylinder refilling kit</span>
                  </div>
                  <span className="font-mono font-bold text-teal-400">KES 3,500</span>
                </div>

                <div className="p-3 rounded-xl bg-[#09111C] border border-[#162334] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Copper Pipe Insulation</span>
                    <span className="text-[11px] text-slate-400">Thermal armacell sleeve (2m)</span>
                  </div>
                  <span className="font-mono font-bold text-teal-400">KES 1,200</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0F2228] border border-teal-500/30 text-teal-300 text-[11px]">
                Items are deducted from van stock allocation: <span className="font-bold text-white">Van #KBZ 421Y</span>.
              </div>

              <button
                onClick={() => setActiveModal('none')}
                className="w-full py-2.5 rounded-xl font-bold bg-[#14B8A6] text-[#050C14] text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: LABOUR DETAILS */}
      {activeModal === 'labour_details' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0B131F] border border-[#1E2D42] rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#182638]">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Labour Breakdown</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#09111C] border border-[#162334] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">AC Inspection & Diagnostic</span>
                    <span className="text-[11px] text-slate-400">1.0 hr @ KES 1,800/hr</span>
                  </div>
                  <span className="font-mono font-bold text-white">KES 1,800</span>
                </div>

                <div className="p-3 rounded-xl bg-[#09111C] border border-[#162334] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Gas Top-up & System Commissioning</span>
                    <span className="text-[11px] text-slate-400">1.5 hrs @ KES 1,800/hr</span>
                  </div>
                  <span className="font-mono font-bold text-white">KES 2,000</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#182638] text-xs">
                <span className="font-bold text-slate-300">Total Labour Fee:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">KES 3,800</span>
              </div>

              <button
                onClick={() => setActiveModal('none')}
                className="w-full py-2.5 rounded-xl font-bold bg-[#14B8A6] text-[#050C14] text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: GPS NAVIGATION INTENT */}
      {activeModal === 'gps_navigation' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0B131F] border border-[#1E2D42] rounded-3xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#182638]">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-teal-400 transform -rotate-45" />
                <h3 className="text-sm font-bold text-white">Turn-by-Turn GPS Navigation</h3>
              </div>
              <button onClick={() => setActiveModal('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#09111C] p-3 rounded-xl border border-[#162334] space-y-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Current GPS: Westlands Ave, Nairobi</span>
                </div>
                <div className="flex items-center gap-2 text-white font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <span>Destination: Westlands Square, Block B</span>
                </div>
                <div className="pt-1 text-[11px] text-teal-400 font-mono">
                  Distance: 1.2 km • ETA: 4 mins (Normal traffic)
                </div>
              </div>

              {onOpenLiveTracking && (
                <button
                  onClick={() => {
                    setActiveModal('none');
                    onOpenLiveTracking();
                  }}
                  className="w-full py-2.5 rounded-xl font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center gap-2 text-xs shadow-md"
                >
                  <Navigation className="w-4 h-4 transform rotate-45" />
                  <span>Open Live Tracking Map (vwnwt.jpg)</span>
                </button>
              )}

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  'Westlands Square, Westlands, Nairobi'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl font-bold bg-[#14B8A6] text-[#050C14] flex items-center justify-center gap-2 text-xs shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Google Maps App</span>
              </a>

              <button
                onClick={() => setActiveModal('none')}
                className="w-full py-2 rounded-xl bg-[#142030] text-slate-300 font-medium text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
