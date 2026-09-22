import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  SwitchCamera,
  MapPin,
  Clock,
  ShieldCheck,
  Upload,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export interface CapturedPhotoData {
  dataUrl: string;
  caption: string;
  phase: 'before' | 'during' | 'after';
  timestamp: string;
  latitude: number;
  longitude: number;
}

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photo: CapturedPhotoData) => void;
  title?: string;
  defaultPhase?: 'before' | 'during' | 'after';
  jobNumber?: string;
  locationName?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Job Site Inspection Camera',
  defaultPhase = 'before',
  jobNumber = 'WO-24568',
  locationName = 'Nairobi, Kenya',
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [phase, setPhase] = useState<'before' | 'during' | 'after'>(defaultPhase);
  const [caption, setCaption] = useState<string>('');
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: -1.286389,
    lng: 36.817223,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync default phase when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase(defaultPhase);
      setCapturedImage(null);
      setCaption('');
      setCameraError(null);

      // Attempt to get real device GPS coordinates if available
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            setCurrentCoords({
              lat: Number(pos.coords.latitude.toFixed(6)),
              lng: Number(pos.coords.longitude.toFixed(6)),
            });
          },
          err => {
            console.warn('Geolocation fallback to Nairobi center:', err.message);
          },
          { timeout: 6000 }
        );
      }

      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setIsLoadingCamera(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API not supported in this browser or environment.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Live camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. You can grant permission in your browser or choose a photo from your device.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can upload a photo from your file manager or gallery.');
      } else {
        setCameraError(err.message || 'Unable to access live camera. Please use the device photo selector below.');
      }
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Watermark drawing utility on canvas
  const applyWatermarkAndProcess = (sourceImg: CanvasImageSource, width: number, height: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Draw base image
    ctx.drawImage(sourceImg, 0, 0, width, height);

    // Bottom dark gradient overlay for crystal clear legible watermark
    const gradHeight = Math.max(120, height * 0.18);
    const gradient = ctx.createLinearGradient(0, height - gradHeight, 0, height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.35, 'rgba(5, 12, 20, 0.75)');
    gradient.addColorStop(1, 'rgba(5, 12, 20, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - gradHeight, width, gradHeight);

    // Top subtle phase badge
    const badgeText = `${phase.toUpperCase()} INSPECTION • ${jobNumber}`;
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgePaddingX = 16;
    const badgeHeight = 34;

    ctx.fillStyle = phase === 'before' ? '#0284C7' : phase === 'after' ? '#16A34A' : '#D97706';
    ctx.beginPath();
    if ('roundRect' in ctx && typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(24, 24, textWidth + badgePaddingX * 2, badgeHeight, 8);
    } else {
      ctx.rect(24, 24, textWidth + badgePaddingX * 2, badgeHeight);
    }
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(badgeText, 24 + badgePaddingX, 24 + 24);

    // Bottom left telemetry text
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const line1 = `FIELDNORA TELEMETRY · GEO-VERIFIED`;
    const line2 = `LAT: ${currentCoords.lat.toFixed(6)}  LON: ${currentCoords.lng.toFixed(6)} (${locationName})`;
    const line3 = `${dateStr} ${timeStr} EAT · GPS ACCURACY ±3m`;

    ctx.fillStyle = '#14B8A6';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText(line1, 28, height - 64);

    ctx.fillStyle = '#F1F5F9';
    ctx.font = '500 14px "JetBrains Mono", monospace';
    ctx.fillText(line2, 28, height - 42);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '400 13px "JetBrains Mono", monospace';
    ctx.fillText(line3, 28, height - 20);

    // Brand security watermark icon/text in bottom-right
    ctx.textAlign = 'right';
    ctx.fillStyle = '#14B8A6';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('FIELDNORA™ INSPECT', width - 28, height - 34);

    ctx.fillStyle = '#64748B';
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Tamper-Sealed Digital Evidence', width - 28, height - 18);

    ctx.textAlign = 'left';

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleShutterClick = () => {
    if (!videoRef.current) return;
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const stampedDataUrl = applyWatermarkAndProcess(video, width, height);
    if (stampedDataUrl) {
      setCapturedImage(stampedDataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const width = img.width || 1280;
        const height = img.height || 720;
        const stamped = applyWatermarkAndProcess(img, width, height);
        setCapturedImage(stamped);
        stopCamera();
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPhoto = () => {
    if (!capturedImage) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onCapture({
      dataUrl: capturedImage,
      caption: caption.trim() || `${phase.toUpperCase()} site photo (${jobNumber})`,
      phase,
      timestamp: timeFormatted,
      latitude: currentCoords.lat,
      longitude: currentCoords.lng,
    });

    onClose();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#0B121C] border border-[#1E2B3E] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#182435] bg-[#090F17]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-950/80 border border-teal-700/50 flex items-center justify-center text-[#14B8A6]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-none">{title}</h3>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {jobNumber} • GPS Watermarked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#162232] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Selector Tabs */}
        <div className="px-5 pt-3 pb-2 bg-[#0B121C] flex items-center gap-2 border-b border-[#141F2E]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Phase:
          </span>
          {(['before', 'during', 'after'] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPhase(p)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                phase === p
                  ? p === 'before'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : p === 'after'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-amber-600 text-white shadow-xs'
                  : 'bg-[#121D2B] text-slate-400 hover:text-white hover:bg-[#172537]'
              }`}
            >
              {p} Work
            </button>
          ))}
        </div>

        {/* Camera Viewfinder / Preview Body */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-black overflow-hidden flex items-center justify-center">
          {/* Visual Shutter Flash Effect */}
          {isFlashing && (
            <div className="absolute inset-0 z-30 bg-white pointer-events-none animate-out fade-out duration-200" />
          )}

          {/* Mode 1: Captured Image Confirmation Preview */}
          {capturedImage ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured job site evidence"
                className="max-h-[360px] w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-teal-500/30 flex items-center gap-1.5 text-[11px] font-mono text-teal-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Watermark Applied</span>
              </div>
            </div>
          ) : (
            /* Mode 2: Live Viewfinder or Fallback */
            <div className="relative w-full h-full flex items-center justify-center">
              {isLoadingCamera && (
                <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center gap-2 text-slate-300 text-xs">
                  <RefreshCw className="w-6 h-6 text-[#14B8A6] animate-spin" />
                  <span>Connecting to camera hardware...</span>
                </div>
              )}

              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraError ? 'hidden' : 'block'}`}
              />

              {/* Grid / Crosshair Guide Overlay */}
              {!cameraError && !isLoadingCamera && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                  {/* Framing Corners */}
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-[#14B8A6]/70 rounded-tl" />
                    <div className="w-6 h-6 border-t-2 border-r-2 border-[#14B8A6]/70 rounded-tr" />
                  </div>

                  {/* Center Crosshair */}
                  <div className="self-center flex items-center justify-center">
                    <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#14B8A6] rounded-full" />
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-[#14B8A6]/70 rounded-bl" />
                    <div className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#14B8A6]" />
                      <span>{currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}</span>
                    </div>
                    <div className="w-6 h-6 border-b-2 border-r-2 border-[#14B8A6]/70 rounded-br" />
                  </div>
                </div>
              )}

              {/* Camera Error or Fallback Message */}
              {cameraError && (
                <div className="p-6 text-center space-y-3 max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-600/40 text-amber-400 mx-auto flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-teal-400 text-[#07131B] font-bold text-xs flex items-center justify-center gap-2 mx-auto shadow-md transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Browse / Upload Photo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Caption & Controls Footer */}
        <div className="p-4 bg-[#090F17] border-t border-[#182435] space-y-3">
          {capturedImage ? (
            /* Photo Confirmation Controls */
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Photo Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Broken valve replaced with new Brass 25mm connector"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F1824] border border-[#1E2B3E] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#14B8A6]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#141E2C] hover:bg-[#1B293C] text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="flex-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-[#14B8A6] hover:brightness-110 text-[#050C14] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Attach to Work Order</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Shutter & Tools */
            <div className="flex items-center justify-between">
              {/* File Upload Hidden Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Gallery / File Picker Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121D2B] hover:bg-[#18273A] border border-[#1E2E42] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                title="Choose existing photo or file"
              >
                <Upload className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">Gallery</span>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleShutterClick}
                disabled={Boolean(cameraError) || isLoadingCamera}
                className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                  cameraError || isLoadingCamera
                    ? 'border-slate-700 bg-slate-800 opacity-50 cursor-not-allowed'
                    : 'border-white/80 bg-white hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/20 cursor-pointer'
                }`}
                title="Snap Photo"
              >
                <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-teal-500 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-slate-950 stroke-[2.2]" />
                </div>
              </button>

              {/* Switch Camera Button */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                disabled={Boolean(cameraError) || isLoadingCamera}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121D2B] hover:bg-[#18273A] border border-[#1E2E42] text-xs font-semibold text-slate-300 transition-colors cursor-pointer disabled:opacity-40"
                title="Flip between front and rear camera"
              >
                <SwitchCamera className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">{facingMode === 'environment' ? 'Rear' : 'Front'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
