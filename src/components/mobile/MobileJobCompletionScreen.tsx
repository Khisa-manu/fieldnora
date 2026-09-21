import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  MoreVertical,
  Check,
  CheckCircle2,
  Pen,
  User,
  Star,
  ClipboardList,
  RefreshCw,
  CloudUpload,
  Sparkles,
  Share2,
  Download,
  FileCheck,
  CheckCircle
} from 'lucide-react';

export interface MobileJobCompletionProps {
  onBack?: () => void;
  onJobSynced?: () => void;
  jobNumber?: string;
  customerName?: string;
  labourTotalKes?: number;
  materialsTotalKes?: number;
  totalKes?: number;
}

export const MobileJobCompletionScreen: React.FC<MobileJobCompletionProps> = ({
  onBack,
  onJobSynced,
  jobNumber = '#FN-2400-0897',
  customerName = 'John Mwangi',
  totalKes = 4300,
}) => {
  const { showToast } = useApp();

  // Screen interactive state
  const [signerName, setSignerName] = useState(customerName);
  const [starRating, setStarRating] = useState(4); // 4 stars matching ZMesm.jpg
  const [notes, setNotes] = useState('');
  const [mpesaConfirmed, setMpesaConfirmed] = useState(true); // Green toggle ON in ZMesm.jpg
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [hasDrawnCustom, setHasDrawnCustom] = useState(false);

  // Canvas ref for real touch & mouse finger signing
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Draw initial stylish cursive signature "John Mwangi" to match screenshot ZMesm.jpg
  const drawInitialPresetSignature = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Style and typography for realistic cursive signature
    ctx.save();
    ctx.strokeStyle = '#0F172A';
    ctx.fillStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Cursive stroke simulation for "John Mwangi"
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 8;

    ctx.font = 'italic 38px "Brush Script MT", "Caveat", "Segoe Script", "Dancing Script", cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(signerName || 'John Mwangi', cx, cy - 2);

    // Add a delicate stylistic flourish underline
    ctx.beginPath();
    ctx.moveTo(cx - 90, cy + 18);
    ctx.bezierCurveTo(cx - 20, cy + 22, cx + 40, cy + 14, cx + 95, cy + 18);
    ctx.stroke();

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set display resolution vs internal resolution for retina crispness
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
      }
      if (!hasDrawnCustom) {
        drawInitialPresetSignature(canvas);
      }
    }
  }, [signerName]);

  // Touch & Mouse Drawing Handlers
  const startDrawing = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (!hasDrawnCustom) {
      // Clear preset signature on first user touch
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawnCustom(true);
    }

    isDrawingRef.current = true;
    lastPointRef.current = { x, y };
  };

  const drawMove = (clientX: number, clientY: number) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.save();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    ctx.restore();

    lastPointRef.current = { x: currentX, y: currentY };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnCustom(true);
    showToast('Signature cleared. Sign above with your finger.', 'info');
  };

  const handleResetToPreset = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setHasDrawnCustom(false);
      drawInitialPresetSignature(canvas);
      showToast('Loaded customer verified signature.', 'success');
    }
  };

  const handleCompleteAndSync = () => {
    if (!mpesaConfirmed) {
      showToast('Please confirm customer M-Pesa receipt before completing job.', 'warning');
      return;
    }

    setIsSyncing(true);
    showToast('Encrypting job summary and synchronizing with Fieldnora cloud...', 'info');

    setTimeout(() => {
      setIsSyncing(false);
      setIsCompleted(true);
      showToast('Job #FN-2400-0897 successfully completed and synced!', 'success');
      if (onJobSynced) {
        onJobSynced();
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto bg-[#F8FAFC] text-slate-800 flex flex-col rounded-[48px] border-[10px] border-[#131B26] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden h-[860px] select-none relative font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. NATIVE ANDROID SYSTEM STATUS BAR (10:42 | 78%)             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white text-slate-800 px-6 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-tight shrink-0 select-none border-b border-slate-100">
        <span className="font-bold text-xs text-slate-900">10:42</span>

        {/* System Status Indicators (Alarm, DND Circle, VoLTE, WiFi, Cell, Battery 78%) */}
        <div className="flex items-center gap-1.5 text-slate-700">
          {/* Alarm Clock */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2 2" />
            <path d="M5 3L2 6" />
            <path d="M19 3l3 3" />
          </svg>

          {/* DND Circle */}
          <div className="w-2.5 h-2.5 rounded-full border border-slate-600 flex items-center justify-center">
            <div className="w-1.5 h-0.5 bg-slate-600" />
          </div>

          {/* VoLTE Badge */}
          <span className="text-[8.5px] font-black uppercase tracking-tighter border border-slate-400 px-0.5 rounded-[2px] leading-tight">
            VoLTE
          </span>

          {/* WiFi Symbol */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M12 3c-4.97 0-9.5 2.02-12.79 5.29l1.42 1.42c2.92-2.92 6.96-4.71 11.37-4.71s8.45 1.79 11.37 4.71l1.42-1.42c-3.29-3.27-7.82-5.29-12.79-5.29zm0 6c-3.31 0-6.34 1.34-8.54 3.54l1.42 1.42c1.82-1.82 4.33-2.96 7.12-2.96s5.3 1.14 7.12 2.96l1.42-1.42c-2.2-2.2-5.23-3.54-8.54-3.54zm0 6c-1.66 0-3.18.67-4.29 1.78l4.29 4.29 4.29-4.29c-1.11-1.11-2.63-1.78-4.29-1.78z" />
          </svg>

          {/* Cellular Signal 4 bars */}
          <div className="flex items-end gap-[1px] h-2.5">
            <div className="w-[2px] h-1 bg-slate-700 rounded-[0.5px]" />
            <div className="w-[2px] h-1.5 bg-slate-700 rounded-[0.5px]" />
            <div className="w-[2px] h-2 bg-slate-700 rounded-[0.5px]" />
            <div className="w-[2px] h-2.5 bg-slate-700 rounded-[0.5px]" />
          </div>

          {/* Battery 78% */}
          <div className="flex items-center gap-1 pl-0.5">
            <div className="w-4 h-2.5 rounded-[2px] border border-slate-700 p-[1px] flex items-center">
              <div className="h-full bg-slate-800 rounded-[1px] w-[78%]" />
            </div>
            <span className="text-[10px] font-bold text-slate-800">78%</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. TOP APP BAR: Job Completion / #FN-2400-0897               */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-slate-200/80 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 text-slate-700 hover:text-slate-900 active:scale-95 transition-transform cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-[17px] font-black text-slate-900 leading-tight tracking-tight">
              Job Completion
            </h1>
            <p className="text-[12px] font-semibold text-slate-500 leading-none mt-0.5">
              {jobNumber}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowOverflowMenu(!showOverflowMenu)}
            className="p-1.5 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showOverflowMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 text-xs text-slate-700 space-y-0.5">
              <button
                onClick={() => {
                  handleResetToPreset();
                  setShowOverflowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reload John's Signature</span>
              </button>
              <button
                onClick={() => {
                  showToast('PDF Job Card #FN-2400-0897 exported to downloads.', 'info');
                  setShowOverflowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Job Card PDF</span>
              </button>
              <button
                onClick={() => {
                  showToast('eTIMS KRA Tax invoice copied to clipboard.', 'success');
                  setShowOverflowMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Share with Customer</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SCROLLABLE CONTENT BODY (MATCHING EXACT SCREENSHOT ZMesm)  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* CARD 1: SUCCESS BANNER */}
        <div className="bg-[#EBF8F2] border border-[#C6F0D8] rounded-xl p-3 flex items-start gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 leading-tight">
              Great work! Job completed.
            </h3>
            <p className="text-[12px] text-slate-600 leading-snug mt-0.5">
              Please collect customer signature and complete the job.
            </p>
          </div>
        </div>

        {/* CARD 2: CUSTOMER SIGNATURE */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Pen className="w-4 h-4 text-[#16A34A]" />
            <h3 className="text-[14px] font-bold text-slate-900">
              Customer Signature
            </h3>
          </div>

          {/* Signature Canvas Box */}
          <div className="relative w-full h-[128px] bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
            {/* Very subtle horizontal line for signature baseline */}
            <div className="absolute inset-x-4 bottom-5 border-b border-slate-100 pointer-events-none" />

            <canvas
              ref={canvasRef}
              onMouseDown={e => startDrawing(e.clientX, e.clientY)}
              onMouseMove={e => drawMove(e.clientX, e.clientY)}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={e => {
                if (e.touches.length === 1) {
                  startDrawing(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchMove={e => {
                if (e.touches.length === 1) {
                  drawMove(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none"
            />
          </div>

          {/* Signature Footer Row */}
          <div className="flex items-center justify-between text-[11.5px] pt-0.5">
            <span className="text-slate-500 font-normal">
              Sign above with your finger
            </span>

            <button
              type="button"
              onClick={handleClearSignature}
              className="flex items-center gap-1 font-bold text-[#16A34A] hover:text-green-700 active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* CARD 3: CUSTOMER FEEDBACK */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#16A34A]" />
            <h3 className="text-[14px] font-bold text-slate-900">
              Customer Feedback
            </h3>
          </div>

          {/* Customer Name Input */}
          <div className="space-y-1">
            <label className="block text-[11.5px] font-medium text-slate-700">
              Customer Name
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={signerName}
                onChange={e => setSignerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-900 font-medium focus:outline-none focus:border-[#16A34A] transition-colors pr-9"
              />
              <User className="w-4 h-4 text-slate-700 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Star Rating: How was our service? */}
          <div className="space-y-1">
            <label className="block text-[11.5px] font-medium text-slate-700">
              How was our service?
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(starNum => {
                const isFilled = starNum <= starRating;
                return (
                  <button
                    key={starNum}
                    type="button"
                    onClick={() => setStarRating(starNum)}
                    className="p-0.5 text-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-4.5 h-4.5 ${
                        isFilled
                          ? 'text-[#16A34A] fill-[#16A34A]'
                          : 'text-slate-300 fill-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes (Optional) */}
          <div className="space-y-1">
            <label className="block text-[11.5px] font-medium text-slate-700">
              Additional Notes (Optional)
            </label>
            <div className="relative">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any notes or feedback..."
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#16A34A] transition-colors resize-none pr-8"
              />
              {/* Pencil edit icon in bottom right matching ZMesm.jpg */}
              <div className="absolute right-2.5 bottom-2.5 text-slate-600 pointer-events-none">
                <Pen className="w-3.5 h-3.5 transform rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: JOB SUMMARY */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-3.5 space-y-2.5">
            {/* Header */}
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#16A34A]" />
              <h3 className="text-[14px] font-bold text-slate-900">
                Job Summary
              </h3>
            </div>

            {/* Labour Section */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[12.5px] font-bold text-slate-900">
                <span>Labour</span>
                <span>2.5 hrs</span>
              </div>
              <div className="flex items-center justify-between text-[12px] text-slate-700 pl-2">
                <span>- Diagnostic &amp; Inspection</span>
                <span className="font-medium text-slate-900">KSh 1,500.00</span>
              </div>
              <div className="flex items-center justify-between text-[12px] text-slate-700 pl-4">
                <span>Repair &amp; Testing</span>
                <span className="font-medium text-slate-900">KSh 2,000.00</span>
              </div>
            </div>

            {/* Materials Used Section */}
            <div className="space-y-1 pt-1">
              <div className="text-[12.5px] font-bold text-slate-900">
                Materials Used
              </div>
              <div className="flex items-center justify-between text-[12px] text-slate-700 pl-2">
                <span>Replacement Capacitor (10µF)</span>
                <span className="font-medium text-slate-900">KSh 450.00</span>
              </div>
              <div className="flex items-center justify-between text-[12px] text-slate-700 pl-2">
                <span>Electrical Tape</span>
                <span className="font-medium text-slate-900">KSh 150.00</span>
              </div>
              <div className="flex items-center justify-between text-[12px] text-slate-700 pl-2">
                <span>Cable Clip Set</span>
                <span className="font-medium text-slate-900">KSh 200.00</span>
              </div>
            </div>
          </div>

          {/* Highlighted Mint Green Total Bar */}
          <div className="bg-[#EEF9F1] px-3.5 py-2 flex items-center justify-between border-t border-[#D7F3E2]">
            <span className="text-[13.5px] font-bold text-[#16A34A]">
              Total
            </span>
            <span className="text-[14px] font-black text-[#16A34A]">
              KSh {totalKes.toLocaleString('en-KE')}.00
            </span>
          </div>
        </div>

        {/* CARD 5: M-PESA PAYMENT RECEIVED */}
        <div className="space-y-1.5">
          <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              {/* Green Rounded Square Icon with Android Robot Icon */}
              <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center text-white shrink-0 shadow-xs">
                {/* Android / Phone Icon */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 2.23 12.95 2 12 2c-.96 0-1.86.23-2.66.63L7.85 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.73 4.29 5.5 6.01 5.5 8h13c0-1.99-1.23-3.71-2.97-4.84zM10 5.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm4 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75z" />
                </svg>
              </div>

              <div>
                <h4 className="text-[13.5px] font-bold text-slate-900 leading-tight">
                  M-Pesa Payment Received
                </h4>
                <p className="text-[11.5px] text-slate-600 leading-snug mt-0.5">
                  Confirm payment with customer.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => setMpesaConfirmed(!mpesaConfirmed)}
              className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
                mpesaConfirmed ? 'bg-[#16A34A] justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-5.5 h-5.5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Payment confirmed subtext with green checkmark */}
          {mpesaConfirmed && (
            <div className="flex items-center gap-1.5 px-1 text-[11.5px] text-slate-600 font-medium">
              <span>Payment confirmed via M-Pesa</span>
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] fill-[#16A34A] text-white" />
            </div>
          )}
        </div>

        {/* CARD 6: COMPLETE & SYNC JOB ACTION BUTTON */}
        <div className="pt-1 pb-1 space-y-2">
          <button
            type="button"
            disabled={isSyncing}
            onClick={handleCompleteAndSync}
            className="w-full bg-[#138844] hover:bg-[#0F753B] active:bg-[#0C6331] text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-bold text-[15px] shadow-sm transition-colors cursor-pointer disabled:opacity-75"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                <span>Syncing Job to Cloud...</span>
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle className="w-4.5 h-4.5" />
                <span>Job Completed &amp; Synced!</span>
              </>
            ) : (
              <>
                <span>Complete &amp; Sync Job</span>
                <CloudUpload className="w-4.5 h-4.5" />
              </>
            )}
          </button>

          {/* Job will sync when online note */}
          <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-slate-600 font-medium">
            <RefreshCw className={`w-3.5 h-3.5 text-[#16A34A] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Job will sync when online</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. NATIVE ANDROID SYSTEM NAVIGATION BAR (◁  ○  □)             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#E2E8F0] py-2 px-12 flex items-center justify-between text-slate-600 border-t border-slate-300 shrink-0">
        {/* Back Triangle */}
        <button
          onClick={onBack}
          className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
          title="Back"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <polygon points="19,4 5,12 19,20" />
          </svg>
        </button>

        {/* Home Circle */}
        <button
          onClick={onBack}
          className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
          title="Home"
        >
          <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />
        </button>

        {/* Recents Square */}
        <button
          className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
          title="Recent Apps"
        >
          <div className="w-3.5 h-3.5 rounded-2xs border-2 border-current" />
        </button>
      </div>

      {/* Completion Success Toast Modal */}
      {isCompleted && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 text-center space-y-4 max-w-[320px] shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <FileCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Job Completed!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Order <span className="font-mono font-bold text-slate-800">{jobNumber}</span> has been digitally signed by <span className="font-semibold text-slate-800">{signerName}</span> and receipt transmitted.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 text-left space-y-1">
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-bold text-emerald-700">M-Pesa KSh {totalKes.toLocaleString()}.00 ✓</span>
              </div>
              <div className="flex justify-between">
                <span>Rating:</span>
                <span className="font-bold text-slate-800">{starRating} / 5 Stars ★</span>
              </div>
              <div className="flex justify-between">
                <span>Sync Status:</span>
                <span className="font-bold text-emerald-700">Cloud Synced ☁</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCompleted(false);
                  if (onBack) onBack();
                }}
                className="w-full bg-[#138844] hover:bg-[#0F753B] text-white py-2.5 rounded-xl font-bold text-xs shadow-md cursor-pointer transition-colors"
              >
                Back to Today's Jobs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
