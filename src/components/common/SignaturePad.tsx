import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, X } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onCancel?: () => void;
  signerTitle?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onCancel,
  signerTitle = 'Customer / Client Signature',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-300 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#0F172A]">{signerTitle}</span>
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
        >
          <Eraser className="w-3 h-3" />
          Clear Pad
        </button>
      </div>

      <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 touch-none overflow-hidden">
        <canvas
          ref={canvasRef}
          width={420}
          height={160}
          className="w-full h-[160px] cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
            Sign using finger, stylus or mouse here
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-[10px] text-slate-400">
          Timestamped & legally sealed upon submission
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
          <button
            type="button"
            disabled={!hasDrawn}
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all ${
              hasDrawn
                ? 'bg-[#14B8A6] text-white hover:bg-teal-700 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Accept Signature
          </button>
        </div>
      </div>
    </div>
  );
};
