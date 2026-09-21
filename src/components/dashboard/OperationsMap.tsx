import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Plus,
  Minus,
  Crosshair,
  MapPin,
  Phone,
  BatteryCharging,
  Wifi,
  Radio,
  ExternalLink,
  X,
  Navigation
} from 'lucide-react';
import { Technician } from '../../types';

interface OperationsMapProps {
  technicians?: Technician[];
  selectedTechId?: string | null;
  onSelectTech?: (techId: string | null) => void;
  className?: string;
  focusedCoordinates?: { lat: number; lng: number } | null;
}

export const OperationsMap: React.FC<OperationsMapProps> = ({
  selectedTechId = null,
  onSelectTech,
  className = '',
  focusedCoordinates = null,
}) => {
  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeInspector, setActiveInspector] = useState<string | null>(null);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [layerMode, setLayerMode] = useState<'standard' | 'traffic' | 'satellite'>('standard');

  const containerRef = useRef<HTMLDivElement>(null);

  // Key technicians matching PoL0f.jpg
  const mapTechnicians = [
    {
      id: 'tech-07',
      code: 'Tech 07',
      name: 'John Mwangi',
      status: 'active',
      statusLabel: 'Active',
      color: '#14B8A6',
      badgeBg: '#092723',
      x: 395,
      y: 195,
      area: 'Parklands',
      currentJob: 'WO-24568 (Britam Towers)',
      vehicle: 'KDL 452X (Toyota Probox)',
      battery: '94%',
      signal: '5G Safaricom',
      phone: '+254 722 456 789',
    },
    {
      id: 'tech-03',
      code: 'Tech 03',
      name: 'David Kiprotich',
      status: 'on_site',
      statusLabel: 'On Site',
      color: '#F59E0B',
      badgeBg: '#2E2006',
      x: 425,
      y: 335,
      area: 'Nairobi West',
      currentJob: 'WO-24567 (Safaricom Care Centre)',
      vehicle: 'KDG 112P (Nissan Caravan)',
      battery: '78%',
      signal: '4G+ Safaricom',
      phone: '+254 711 345 678',
    },
    {
      id: 'tech-11',
      code: 'Tech 11',
      name: 'Esther Wanjiku',
      status: 'en_route',
      statusLabel: 'En Route',
      color: '#3B82F6',
      badgeBg: '#0C1B33',
      x: 585,
      y: 140,
      area: 'Kasarani',
      currentJob: 'WO-24566 (Garden City Mall)',
      vehicle: 'KDA 789M (Isuzu D-Max)',
      battery: '88%',
      signal: '5G Airtel',
      phone: '+254 733 987 654',
    },
  ];

  // Pan to focused coordinates if passed
  useEffect(() => {
    if (focusedCoordinates) {
      // Nairobi center roughly lat -1.286, lng 36.817 -> SVG center (450, 240)
      const centerX = 450;
      const centerY = 240;
      const targetX = ((focusedCoordinates.lng - 36.75) / 0.15) * 800;
      const targetY = ((-focusedCoordinates.lat - 1.22) / 0.12) * 450;
      setPan({
        x: centerX - targetX,
        y: centerY - targetY,
      });
      setZoom(1.25);
    }
  }, [focusedCoordinates]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleRecenter = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActiveInspector(null);
  };

  const selectedTech = mapTechnicians.find(t => t.id === (activeInspector || selectedTechId));

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[360px] sm:h-[400px] lg:h-[420px] rounded-2xl bg-[#0D1520] border border-[#1E293B] overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-inner ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* SVG Canvas Map */}
      <svg
        viewBox="0 0 900 480"
        className="w-full h-full transform transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          {/* Territory hatching / gradient */}
          <radialGradient id="nairobiGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0D1520" stopOpacity="0.9" />
          </radialGradient>

          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#162231" strokeWidth="0.6" strokeDasharray="2 4" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width="900" height="480" fill="#0D1520" />
        <rect width="900" height="480" fill="url(#gridPattern)" />
        <rect width="900" height="480" fill="url(#nairobiGlow)" />

        {/* Nairobi West Territory Dashed Boundary (From PoL0f.jpg) */}
        <polygon
          points="350,300 480,285 520,380 430,410 340,360"
          fill="#14B8A6"
          fillOpacity="0.04"
          stroke="#14B8A6"
          strokeWidth="1.6"
          strokeDasharray="5 4"
          className="opacity-75"
        />

        {/* Secondary Region: Parklands / Westlands Boundary */}
        <polygon
          points="330,160 480,140 470,225 320,230"
          fill="#3B82F6"
          fillOpacity="0.03"
          stroke="#3B82F6"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="opacity-60"
        />

        {/* Secondary Region: Kasarani Boundary */}
        <polygon
          points="520,80 680,95 670,190 510,180"
          fill="#8B5CF6"
          fillOpacity="0.03"
          stroke="#8B5CF6"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="opacity-50"
        />

        {/* Nairobi Main Road Arteries (Waiyaki Way, Thika Road, Mombasa Road, Uhuru Hwy, Ring Rd) */}
        <g stroke="#1F2E42" strokeLinecap="round" strokeLinejoin="round">
          {/* Thika Superhighway (NE to SW) */}
          <path d="M 750 40 L 590 140 L 450 240" strokeWidth="3.5" stroke="#243852" />
          <path d="M 750 40 L 590 140 L 450 240" strokeWidth="1" stroke="#38BDF8" strokeOpacity="0.4" strokeDasharray="8 6" />

          {/* Waiyaki Way (NW to Central) */}
          <path d="M 160 120 L 320 180 L 450 240" strokeWidth="3.2" stroke="#243852" />

          {/* Mombasa Road (SE toward Airport / Embakasi) */}
          <path d="M 450 240 L 580 340 L 780 440" strokeWidth="3.5" stroke="#243852" />

          {/* Uhuru Highway / CBD spine */}
          <path d="M 440 160 L 450 240 L 445 320 L 430 400" strokeWidth="4" stroke="#29405D" />

          {/* Ring Road Westlands - Kilimani - Ngong Rd */}
          <path d="M 330 150 L 360 250 L 350 350 L 320 420" strokeWidth="2.5" />

          {/* Outer Ring Road / Jogoo Rd */}
          <path d="M 580 140 L 650 230 L 620 330 L 580 340" strokeWidth="2.2" />

          {/* Langata Road (South C - Karen) */}
          <path d="M 430 360 L 350 390 L 220 430" strokeWidth="2.5" />

          {/* Minor interconnecting roads */}
          <path d="M 280 200 L 420 190" strokeWidth="1.4" stroke="#182637" />
          <path d="M 360 260 L 450 270 L 550 260" strokeWidth="1.4" stroke="#182637" />
          <path d="M 470 300 L 540 310" strokeWidth="1.4" stroke="#182637" />
          <path d="M 520 170 L 610 190" strokeWidth="1.4" stroke="#182637" />
        </g>

        {/* Real Nairobi Geographic Area Labels (Matching Screenshot PoL0f.jpg) */}
        <g fill="#64748B" fontSize="11" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="600" letterSpacing="0.05em">
          {/* Central & Westlands */}
          <text x="445" y="245" fill="#94A3B8" fontSize="13" fontWeight="700">Nairobi</text>
          <text x="310" y="240">Kileleshwa</text>
          <text x="240" y="275">Lavington</text>
          <text x="180" y="210">Kangemi</text>
          <text x="365" y="170">Parklands</text>

          {/* South & West Territory */}
          <text x="390" y="360" fill="#2DD4BF" fontWeight="700">Nairobi West</text>
          <text x="490" y="355">South C</text>
          <text x="540" y="315">Industrial Area</text>

          {/* North & East */}
          <text x="590" y="115">Kasarani</text>
          <text x="520" y="165">Ruaraka</text>
          <text x="690" y="90">Roysambu</text>
          <text x="740" y="60">Kahawa</text>
          <text x="680" y="380">Embakasi</text>
        </g>

        {/* ------------------------------------------------------------- */}
        {/* TECHNICIAN LIVE MARKERS MATCHING POL0f.jpg                    */}
        {/* ------------------------------------------------------------- */}

        {/* Tech 07: Active (Teal) at Parklands */}
        <g
          className="cursor-pointer group"
          onClick={e => {
            e.stopPropagation();
            setActiveInspector('tech-07');
            if (onSelectTech) onSelectTech('tech-07');
          }}
        >
          {/* Pulsing Beacon Ring */}
          <circle cx="395" cy="195" r="18" fill="#14B8A6" fillOpacity="0.18">
            <animate attributeName="r" values="12;26;12" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="fillOpacity" values="0.3;0;0.3" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* Central Pin */}
          <circle cx="395" cy="195" r="9" fill="#14B8A6" stroke="#0D1520" strokeWidth="2.5" />
          <circle cx="395" cy="195" r="3.5" fill="#FFFFFF" />

          {/* Pill Label Tag: "Tech 07  Active" */}
          <g transform="translate(412, 183)">
            <rect
              width="108"
              height="24"
              rx="6"
              fill="#0B131D"
              stroke="#1E293B"
              strokeWidth="1.2"
              className="drop-shadow-md"
            />
            <text x="10" y="16" fill="#F1F5F9" fontSize="10.5" fontWeight="700">
              Tech 07
            </text>
            <circle cx="62" cy="12" r="3" fill="#14B8A6" />
            <text x="70" y="16" fill="#14B8A6" fontSize="9.5" fontWeight="600">
              Active
            </text>
          </g>
        </g>

        {/* Tech 03: On Site (Amber) at Nairobi West */}
        <g
          className="cursor-pointer group"
          onClick={e => {
            e.stopPropagation();
            setActiveInspector('tech-03');
            if (onSelectTech) onSelectTech('tech-03');
          }}
        >
          {/* Pulsing Beacon Ring */}
          <circle cx="425" cy="335" r="18" fill="#F59E0B" fillOpacity="0.18">
            <animate attributeName="r" values="12;26;12" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="fillOpacity" values="0.3;0;0.3" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* Central Pin */}
          <circle cx="425" cy="335" r="9" fill="#F59E0B" stroke="#0D1520" strokeWidth="2.5" />
          <circle cx="425" cy="335" r="3.5" fill="#FFFFFF" />

          {/* Pill Label Tag: "Tech 03  On Site" */}
          <g transform="translate(442, 323)">
            <rect
              width="114"
              height="24"
              rx="6"
              fill="#0B131D"
              stroke="#1E293B"
              strokeWidth="1.2"
              className="drop-shadow-md"
            />
            <text x="10" y="16" fill="#F1F5F9" fontSize="10.5" fontWeight="700">
              Tech 03
            </text>
            <circle cx="62" cy="12" r="3" fill="#F59E0B" />
            <text x="70" y="16" fill="#F59E0B" fontSize="9.5" fontWeight="600">
              On Site
            </text>
          </g>
        </g>

        {/* Tech 11: En Route (Blue) at Kasarani / Ruaraka */}
        <g
          className="cursor-pointer group"
          onClick={e => {
            e.stopPropagation();
            setActiveInspector('tech-11');
            if (onSelectTech) onSelectTech('tech-11');
          }}
        >
          {/* Pulsing Beacon Ring */}
          <circle cx="585" cy="140" r="18" fill="#3B82F6" fillOpacity="0.18">
            <animate attributeName="r" values="12;26;12" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="fillOpacity" values="0.3;0;0.3" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* Central Pin */}
          <circle cx="585" cy="140" r="9" fill="#3B82F6" stroke="#0D1520" strokeWidth="2.5" />
          <circle cx="585" cy="140" r="3.5" fill="#FFFFFF" />

          {/* Pill Label Tag: "Tech 11  En Route" */}
          <g transform="translate(602, 128)">
            <rect
              width="118"
              height="24"
              rx="6"
              fill="#0B131D"
              stroke="#1E293B"
              strokeWidth="1.2"
              className="drop-shadow-md"
            />
            <text x="10" y="16" fill="#F1F5F9" fontSize="10.5" fontWeight="700">
              Tech 11
            </text>
            <circle cx="62" cy="12" r="3" fill="#3B82F6" />
            <text x="70" y="16" fill="#60A5FA" fontSize="9.5" fontWeight="600">
              En Route
            </text>
          </g>
        </g>
      </svg>

      {/* Floating Map Controls on Top-Left (Matching Screenshot) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 bg-[#0B1118]/90 border border-[#1E293B] rounded-xl p-1 shadow-lg backdrop-blur-xs">
        <button
          onClick={e => {
            e.stopPropagation();
            setShowLayersMenu(!showLayersMenu);
          }}
          className="p-2 text-slate-300 hover:text-white hover:bg-[#16202C] rounded-lg transition-colors"
          title="Map Layers"
        >
          <Layers className="w-4 h-4 text-[#14B8A6]" />
        </button>

        <button
          onClick={e => {
            e.stopPropagation();
            handleZoomIn();
          }}
          className="p-2 text-slate-300 hover:text-white hover:bg-[#16202C] rounded-lg transition-colors"
          title="Zoom In (+)"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={e => {
            e.stopPropagation();
            handleZoomOut();
          }}
          className="p-2 text-slate-300 hover:text-white hover:bg-[#16202C] rounded-lg transition-colors"
          title="Zoom Out (-)"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          onClick={e => {
            e.stopPropagation();
            handleRecenter();
          }}
          className="p-2 text-slate-300 hover:text-white hover:bg-[#16202C] rounded-lg transition-colors"
          title="Recenter Map"
        >
          <Crosshair className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Layers Menu Popover */}
      {showLayersMenu && (
        <div className="absolute top-4 left-16 z-20 w-44 bg-[#111A24] border border-[#1E293B] rounded-xl shadow-xl p-2 text-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Map Mode
          </div>
          <button
            onClick={() => {
              setLayerMode('standard');
              setShowLayersMenu(false);
            }}
            className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
              layerMode === 'standard' ? 'bg-[#16202C] text-[#14B8A6] font-semibold' : 'text-slate-300 hover:bg-[#16202C]'
            }`}
          >
            Dark Vector Navigation
          </button>
          <button
            onClick={() => {
              setLayerMode('traffic');
              setShowLayersMenu(false);
            }}
            className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
              layerMode === 'traffic' ? 'bg-[#16202C] text-[#14B8A6] font-semibold' : 'text-slate-300 hover:bg-[#16202C]'
            }`}
          >
            Nairobi Live Congestion
          </button>
        </div>
      )}

      {/* Floating Technician Status Legend on Bottom-Left (Matching Screenshot) */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#0B1118]/90 border border-[#1E293B] rounded-xl px-3.5 py-2.5 shadow-lg backdrop-blur-xs text-xs space-y-1.5">
        <div className="text-[11px] font-bold text-slate-300 tracking-wide">
          Technician Status
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
            <span className="text-slate-200">Active</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="text-slate-200">On Site</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-slate-200">En Route</span>
          </span>
        </div>
      </div>

      {/* Selected Technician Card Popover (if user clicks on marker) */}
      {selectedTech && (
        <div className="absolute bottom-4 right-4 z-20 w-72 bg-[#111A24] border border-[#1E293B] rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedTech.color }}
              />
              <span className="font-bold text-white text-sm">{selectedTech.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({selectedTech.code})</span>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                setActiveInspector(null);
                if (onSelectTech) onSelectTech(null);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#0B1118] p-2 rounded-lg border border-[#1E293B]/70 space-y-1 text-[11px]">
            <div className="text-slate-400">Current Assignment:</div>
            <div className="text-slate-200 font-medium truncate">{selectedTech.currentJob}</div>
            <div className="text-[10px] text-teal-400">Territory: {selectedTech.area}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
            <div>Van: <span className="text-slate-200">{selectedTech.vehicle.split(' ')[0]}</span></div>
            <div>Battery: <span className="text-emerald-400">{selectedTech.battery}</span></div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[#1E293B]">
            <a
              href={`tel:${selectedTech.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#16202C] hover:bg-[#1E293B] text-slate-200 font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Direct Call</span>
            </a>
            <button
              onClick={() => {
                setPan({ x: 450 - selectedTech.x, y: 240 - selectedTech.y });
                setZoom(1.4);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#0D2E2B] text-[#14B8A6] border border-teal-800/40 hover:bg-[#14B8A6] hover:text-white transition-colors"
              title="Focus Marker"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
