import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Crosshair,
  Briefcase,
  Clock,
  Navigation,
  ClipboardList,
  Smartphone,
  ShieldCheck,
  Phone,
  MessageSquare,
  Volume2,
  VolumeX,
  Compass,
  Zap,
  CheckCircle2,
  Users,
  MapPin,
  ExternalLink,
  Layers,
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// WhatsApp Brand Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

export interface MobileLiveTrackingViewProps {
  onBack?: () => void;
  onViewJobDetails?: () => void;
  jobNumber?: string;
  customerName?: string;
  jobTitle?: string;
  destinationAddress?: string;
  destinationArea?: string;
}

export const MobileLiveTrackingView: React.FC<MobileLiveTrackingViewProps> = ({
  onBack,
  onViewJobDetails,
  jobNumber = 'JOB-2025-0587',
  customerName = 'Peter Mwangi',
  jobTitle = 'Water Heater Repair',
  destinationAddress = 'Apartment5B, Riverside Drive, Nairobi',
  destinationArea = 'Nairobi CBD',
}) => {
  const { showToast } = useApp();

  // Navigation simulation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [navMuted, setNavMuted] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(38); // km/h
  const [nextManeuver, setNextManeuver] = useState({
    distanceMeters: 350,
    street: 'Riverside Drive',
    instruction: 'Turn right in 350m',
    icon: 'turn-right'
  });

  // Animated vehicle progress along route (0 to 1)
  const [routeProgress, setRouteProgress] = useState(0.18);
  const [recenteredPulse, setRecenteredPulse] = useState(false);

  // Modals & Drawers
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [showTechContactModal, setShowTechContactModal] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [mapLayer, setMapLayer] = useState<'vector' | 'satellite' | 'traffic'>('vector');
  const [trafficEnabled, setTrafficEnabled] = useState(true);

  // Simulated GPS timer and speed updates when navigating
  useEffect(() => {
    let interval: any;
    if (isNavigating) {
      interval = setInterval(() => {
        setRouteProgress(prev => {
          if (prev >= 0.95) return 0.15;
          return prev + 0.015;
        });
        setCurrentSpeed(Math.floor(32 + Math.random() * 14));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isNavigating]);

  // Recenter handler
  const handleRecenter = () => {
    setRecenteredPulse(true);
    setTimeout(() => setRecenteredPulse(false), 1500);
    showToast('GPS Recentered on current location (Kilimani)', 'info');
  };

  // Launch Google Maps Turn-by-Turn Intent
  const handleStartGoogleMapsNavigation = () => {
    setIsNavigating(true);
    showToast('Starting GPS Navigation to Riverside Drive...', 'success');
    // Open Google Maps intent in new tab if allowed
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=-1.2921,36.7865&destination=-1.2635,36.8020&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  // Coordinates mapping on the custom SVG map (Kilimani to Nairobi CBD)
  // "You" at Kilimani: x = 145, y = 148
  // "Job Destination" at Nairobi CBD / Riverside: x = 270, y = 165
  // Current dynamic vehicle position along curve:
  const startX = 145;
  const startY = 148;
  const targetX = 270;
  const targetY = 165;
  const currentVehicleX = startX + (targetX - startX) * routeProgress;
  const currentVehicleY = startY + (targetY - startY) * routeProgress;

  return (
    <div className="w-full max-w-[420px] bg-[#070C13] text-slate-100 flex flex-col rounded-[48px] border-[10px] border-[#131B26] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden h-[860px] select-none relative font-sans">
      
      {/* ========================================================= */}
      {/* 1. NATIVE ANDROID SYSTEM STATUS BAR (10:42 | 4G | 72%)    */}
      {/* Exact match to screenshot vwnwt.jpg                       */}
      {/* ========================================================= */}
      <div className="bg-[#070C13] px-6 pt-3 pb-1.5 flex items-center justify-between text-xs font-semibold text-white tracking-wide shrink-0 z-30">
        <span className="text-[13px] font-bold">10:42</span>
        <div className="flex items-center gap-1.5 text-white">
          {/* Signal bars */}
          <div className="flex items-end gap-[1.5px] h-3">
            <span className="w-[3px] h-1.5 bg-white rounded-[0.5px]" />
            <span className="w-[3px] h-2 bg-white rounded-[0.5px]" />
            <span className="w-[3px] h-2.5 bg-white rounded-[0.5px]" />
            <span className="w-[3px] h-3 bg-white rounded-[0.5px]" />
          </div>
          {/* 4G badge */}
          <span className="text-[11px] font-bold px-0.5">4G</span>
          {/* Wi-Fi */}
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 3c-4.97 0-9.45 2.05-12 5.34l12 13.66 12-13.66c-2.55-3.29-7.03-5.34-12-5.34z" />
          </svg>
          {/* Battery */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold">72%</span>
            <div className="w-5 h-2.5 border border-white rounded-[3px] p-[1px] flex items-center">
              <div className="h-full bg-white rounded-[1.5px] w-[72%]" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TOP APP BAR: [←] Live Tracking [⋮]                     */}
      {/* Exact match to screenshot vwnwt.jpg                       */}
      {/* ========================================================= */}
      <div className="bg-[#070C13] px-4 py-2.5 flex items-center justify-between shrink-0 border-b border-[#141C28] z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBack) onBack();
            }}
            className="p-1.5 rounded-full hover:bg-[#152130] text-white active:scale-95 transition-all"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[18px] font-bold text-white tracking-tight">
            Live Tracking
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowOverflowMenu(!showOverflowMenu)}
            className="p-1.5 rounded-full hover:bg-[#152130] text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Overflow Menu Dropdown */}
          {showOverflowMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#0F1722] border border-[#1F2C3E] rounded-2xl p-1.5 shadow-2xl z-50 text-xs">
              <button
                onClick={() => {
                  setTrafficEnabled(!trafficEnabled);
                  setShowOverflowMenu(false);
                  showToast(`Nairobi Traffic overlay: ${trafficEnabled ? 'OFF' : 'ON'}`, 'info');
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-[#172333] text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>Traffic Overlay</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trafficEnabled ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'}`}>
                  {trafficEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowNearbyModal(true);
                  setShowOverflowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-xl hover:bg-[#172333] text-slate-200"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Nearby Technicians (3)</span>
              </button>

              <button
                onClick={() => {
                  if (onViewJobDetails) onViewJobDetails();
                  setShowOverflowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-xl hover:bg-[#172333] text-slate-200"
              >
                <ClipboardList className="w-4 h-4 text-amber-400" />
                <span>View Full Job Dossier</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE NAIROBI MAP CANVAS WITH REAL LABELS         */}
      {/* Westlands, Parklands, Eastleigh, Nairobi CBD, Kilimani,   */}
      {/* Lavington, Ngong Road, Industrial Area, buruburu, Langata */}
      {/* ========================================================= */}
      <div className="relative flex-1 bg-[#090F17] overflow-hidden">
        
        {/* Top-Left Geographic Title (NAIROBI / Nairobi County) */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none select-none">
          <h2 className="text-[20px] font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            NAIROBI
          </h2>
          <p className="text-[12px] font-semibold text-slate-400 -mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            Nairobi County
          </p>
        </div>

        {/* Turn-by-Turn Navigation HUD Overlay (Active when navigating) */}
        {isNavigating && (
          <div className="absolute top-3 right-3 left-3 z-30 bg-[#0C1522]/95 backdrop-blur-md border border-[#1E2D42] rounded-2xl p-3 shadow-2xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Navigation className="w-6 h-6 transform rotate-45" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white flex items-center gap-1.5">
                  <span>{nextManeuver.instruction}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  onto {nextManeuver.street} • Speed: <span className="text-teal-400 font-bold">{currentSpeed} km/h</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setNavMuted(!navMuted)}
                className="p-2 rounded-xl bg-[#15202E] hover:bg-[#1E2B3E] text-slate-300 hover:text-white"
                title={navMuted ? 'Unmute voice navigation' : 'Mute voice navigation'}
              >
                {navMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
              </button>
              <button
                onClick={() => setIsNavigating(false)}
                className="p-2 rounded-xl bg-[#15202E] hover:bg-red-500/20 text-slate-300 hover:text-red-400"
                title="Exit Navigation HUD"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Real Detailed Nairobi Cartographic Vector SVG */}
        <svg
          viewBox="0 0 400 380"
          className="w-full h-full object-cover select-none"
        >
          <defs>
            {/* Ambient radar glow for 'You' */}
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#2563EB" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </radialGradient>
            
            {/* Ambient orange glow for 'Job Destination' */}
            <radialGradient id="destGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#EA580C" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </radialGradient>

            {/* Neon Route Gradient */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Landmass Background Blocks */}
          <rect x="0" y="0" width="400" height="380" fill="#0A0F17" />
          
          {/* Subtle Sector Outlines (Forest, Uhuru Park, Karura Reserve) */}
          <path d="M0,0 L200,0 L180,90 L0,110 Z" fill="#0C131D" />
          <path d="M220,0 L400,0 L400,120 L240,110 Z" fill="#0C131D" />
          <path d="M0,120 L160,115 L140,240 L0,260 Z" fill="#0C131D" />
          <path d="M180,120 L400,130 L400,280 L200,270 Z" fill="#0C131D" />
          <path d="M0,270 L400,290 L400,380 L0,380 Z" fill="#0A0F17" />

          {/* Uhuru Park & Arboretum Green Accents */}
          <path d="M190,140 Q215,155 230,135 Q220,120 190,140 Z" fill="#0E231F" opacity="0.7" />
          <path d="M260,70 Q285,85 305,65 Q290,50 260,70 Z" fill="#0E231F" opacity="0.6" />
          <path d="M120,40 Q150,55 170,35 Q150,20 120,40 Z" fill="#0E231F" opacity="0.6" />

          {/* ========================================================= */}
          {/* ROAD NETWORK (Arterials, Ring Roads, Highways)            */}
          {/* ========================================================= */}
          {/* Minor Grid Streets */}
          <g stroke="#141E2B" strokeWidth="1.8" fill="none">
            <path d="M40,20 L160,60 L180,140" />
            <path d="M70,80 L20,160 L90,200" />
            <path d="M180,30 L270,80 L350,60" />
            <path d="M240,90 L380,130" />
            <path d="M30,190 L130,220 L110,310" />
            <path d="M160,180 L220,240 L280,210" />
            <path d="M220,230 L360,260" />
            <path d="M140,260 L240,340" />
            <path d="M290,280 L380,340" />
            <path d="M80,320 L200,370" />
          </g>

          {/* Secondary Arterials */}
          <g stroke="#1C293A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* Waiyaki Way (Top Diagonal) */}
            <path d="M0,65 L160,75 L240,115 L320,95 L400,105" />
            {/* Uhuru Highway / Mombasa Road */}
            <path d="M240,30 L235,140 L260,220 L330,310 L400,350" />
            {/* Ngong Road (Crossing from West to CBD) */}
            <path d="M30,220 L145,150 L230,145" />
            {/* Ring Road Kilimani */}
            <path d="M130,90 L145,150 L160,230 L220,260" />
            {/* Langata Road (Southern bypass) */}
            <path d="M20,330 L160,300 L260,330 L400,370" />
            {/* Jogoo Road / Outering towards Eastlands */}
            <path d="M260,170 L340,190 L400,180" />
          </g>

          {/* Major Nairobi Highways with Traffic Indicator Layer */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Uhuru Highway */}
            <path
              d="M240,40 L235,135 L255,210 L320,290 L400,340"
              stroke="#2B3E57"
              strokeWidth="5.5"
            />
            {trafficEnabled && (
              <path
                d="M240,40 L235,135 L255,210 L320,290 L400,340"
                stroke="#10B981"
                strokeWidth="2.2"
                strokeOpacity="0.75"
              />
            )}

            {/* Ngong Road */}
            <path
              d="M40,210 L145,148 L235,140"
              stroke="#2B3E57"
              strokeWidth="5.5"
            />
            {trafficEnabled && (
              <path
                d="M40,210 L145,148 L235,140"
                stroke="#F59E0B"
                strokeWidth="2.2"
                strokeOpacity="0.8"
              />
            )}

            {/* Waiyaki Way into Westlands */}
            <path
              d="M0,65 L150,75 L235,115"
              stroke="#2B3E57"
              strokeWidth="5"
            />
            {trafficEnabled && (
              <path
                d="M0,65 L150,75 L235,115"
                stroke="#10B981"
                strokeWidth="2"
                strokeOpacity="0.75"
              />
            )}
          </g>

          {/* ========================================================= */}
          {/* NAIROBI NEIGHBORHOOD LABELS (Exact Match to vwnwt.jpg)    */}
          {/* ========================================================= */}
          <g fill="#94A3B8" fontSize="11" fontWeight="600" fontFamily="sans-serif">
            {/* Westlands (Top Center) */}
            <text x="250" y="52" fill="#E2E8F0" fontSize="12" fontWeight="700">Westlands</text>
            
            {/* Parklands (Top Right) */}
            <text x="295" y="85" fill="#CBD5E1">Parklands</text>
            
            {/* Eastleigh (Far Right Top) */}
            <text x="340" y="108" fill="#CBD5E1">Eastleigh</text>
            
            {/* Nairobi CBD (Center Right) */}
            <text x="220" y="115" fill="#FFFFFF" fontSize="12" fontWeight="800">Nairobi</text>
            <text x="220" y="127" fill="#FFFFFF" fontSize="12" fontWeight="800">CBD</text>
            
            {/* Kilimani (Center Left) */}
            <text x="72" y="125" fill="#CBD5E1" fontSize="12">Kilimani</text>
            
            {/* Lavington (Far Left Mid) */}
            <text x="68" y="172" fill="#94A3B8">Lavington</text>
            
            {/* Ngong Road (Angled Street Label) */}
            <text
              x="160"
              y="152"
              fill="#94A3B8"
              fontSize="9.5"
              fontWeight="500"
              transform="rotate(32 160 152)"
            >
              Ngong Road
            </text>
            
            {/* Kilimani sub-label under route */}
            <text x="255" y="155" fill="#94A3B8">Kilimani</text>

            {/* Industrial Area (Bottom Right) */}
            <text x="290" y="178" fill="#CBD5E1">Industrial</text>
            <text x="290" y="190" fill="#CBD5E1">Area</text>
            
            {/* buruburu (Right Mid) */}
            <text x="292" y="205" fill="#94A3B8">buruburu</text>
            
            {/* Langata (Bottom Center) */}
            <text x="225" y="222" fill="#CBD5E1">Langata</text>
          </g>

          {/* ========================================================= */}
          {/* ACTIVE NAVIGATION ROUTE LINE (Kilimani to Nairobi CBD)     */}
          {/* ========================================================= */}
          <path
            d="M145,148 Q185,130 215,140 T270,165"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={isNavigating ? '6 4' : 'none'}
            className={isNavigating ? 'animate-pulse' : ''}
          />

          {/* Glowing Trail */}
          <path
            d="M145,148 Q185,130 215,140 T270,165"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="8"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />

          {/* ========================================================= */}
          {/* MARKER 1: "YOU" (Current Location - Kilimani)             */}
          {/* Concentric radar rings + solid blue disc with white center*/}
          {/* ========================================================= */}
          <g>
            {/* Radar Pulse Halo 1 */}
            <circle
              cx="145"
              cy="148"
              r="28"
              fill="url(#radarGlow)"
              className="animate-ping origin-center"
              style={{ animationDuration: '3s' }}
            />
            {/* Radar Pulse Halo 2 */}
            <circle
              cx="145"
              cy="148"
              r="20"
              fill="#2563EB"
              fillOpacity="0.25"
            />
            {/* Blue Outer Disc */}
            <circle
              cx="145"
              cy="148"
              r="12"
              fill="#2563EB"
              stroke="#FFFFFF"
              strokeWidth="3.5"
            />
            {/* Inner White Target Dot */}
            <circle
              cx="145"
              cy="148"
              r="4.5"
              fill="#FFFFFF"
            />
          </g>

          {/* ========================================================= */}
          {/* MARKER 2: "JOB DESTINATION" (Nairobi CBD / Riverside)     */}
          {/* Glowing Orange ambient backdrop + Orange Briefcase Pin    */}
          {/* ========================================================= */}
          <g>
            {/* Ambient Orange Glow */}
            <circle
              cx="266"
              cy="145"
              r="24"
              fill="url(#destGlow)"
            />

            {/* Pin Anchor Line */}
            <path
              d="M266,135 L266,155"
              stroke="#EA580C"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Orange Pin Body */}
            <circle
              cx="266"
              cy="133"
              r="14"
              fill="#EA580C"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))"
            />

            {/* White Briefcase icon inside Pin */}
            <g transform="translate(259, 126) scale(0.6)" fill="#FFFFFF">
              <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM10 5h4v2h-4V5zm10 14H4V9h16v10z" />
            </g>
          </g>

          {/* Dynamic Moving Vehicle icon when Navigation is active */}
          {isNavigating && (
            <g transform={`translate(${currentVehicleX - 10}, ${currentVehicleY - 10})`}>
              <circle cx="10" cy="10" r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
              <polygon points="10,5 14,14 10,12 6,14" fill="#FFFFFF" />
            </g>
          )}
        </svg>

        {/* ========================================================= */}
        {/* FLOATING TOOLTIP 1: "YOU / Current Location"              */}
        {/* Exact match to screenshot vwnwt.jpg                       */}
        {/* ========================================================= */}
        <div
          onClick={handleRecenter}
          className="absolute top-[125px] left-[155px] z-20 cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="bg-[#0D1520]/95 backdrop-blur-md border border-[#1E2B3E] px-3 py-1.5 rounded-xl shadow-xl flex flex-col min-w-[105px]">
            <span className="text-[13px] font-bold text-white leading-tight flex items-center gap-1">
              <span>You</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse" />
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium leading-tight mt-0.5">
              Current Location
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FLOATING TOOLTIP 2: "Job Destination / Nairobi CBD"       */}
        {/* Exact match to screenshot vwnwt.jpg                       */}
        {/* ========================================================= */}
        <div
          onClick={() => {
            if (onViewJobDetails) onViewJobDetails();
          }}
          className="absolute top-[135px] left-[282px] z-20 cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="bg-[#0D1520]/95 backdrop-blur-md border border-[#1E2B3E] px-3 py-1.5 rounded-xl shadow-xl flex flex-col min-w-[115px]">
            <span className="text-[13px] font-bold text-white leading-tight flex items-center justify-between">
              <span>Job Destination</span>
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium leading-tight mt-0.5">
              {destinationArea}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FLOATING WIDGET: "Nearby Technicians" (Bottom Left)       */}
        {/* Exact match to screenshot vwnwt.jpg                       */}
        {/* ========================================================= */}
        <div
          onClick={() => setShowNearbyModal(true)}
          className="absolute bottom-3 left-3.5 z-20 bg-[#0A1018]/95 backdrop-blur-md border border-[#1E2B3D] p-2 rounded-2xl shadow-2xl cursor-pointer hover:border-teal-500/50 active:scale-98 transition-all group"
        >
          <div className="flex items-center justify-between gap-3 px-1">
            <span className="text-[11.5px] font-bold text-white group-hover:text-teal-300 transition-colors">
              Nearby Technicians
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 px-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block shadow-sm" />
            <span className="text-[10.5px] text-slate-400 font-medium">3 online</span>
          </div>

          {/* Overlapping Avatar Row + "+2" badge */}
          <div className="flex items-center -space-x-1.5 mt-2 px-0.5">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
              alt="Technician Brenda W."
              className="w-7 h-7 rounded-full object-cover border-2 border-[#0A1018] shadow-xs"
            />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="Technician Alex M."
              className="w-7 h-7 rounded-full object-cover border-2 border-[#0A1018] shadow-xs"
            />
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
              alt="Technician Brian K."
              className="w-7 h-7 rounded-full object-cover border-2 border-[#0A1018] shadow-xs"
            />
            <div className="w-7 h-7 rounded-full bg-[#182333] border-2 border-[#0A1018] flex items-center justify-center text-[10px] font-bold text-slate-200">
              +2
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FLOATING BUTTON: "GPS Recenter / Crosshair" (Bottom Right)*/}
        {/* Exact match to screenshot vwnwt.jpg                       */}
        {/* ========================================================= */}
        <button
          onClick={handleRecenter}
          className={`absolute bottom-4 right-4 z-20 w-11 h-11 rounded-full bg-[#111A26] border border-[#223145] hover:border-blue-400 flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all ${
            recenteredPulse ? 'ring-4 ring-blue-500/50 bg-blue-600' : ''
          }`}
          title="Recenter GPS"
        >
          <Crosshair className={`w-5 h-5 text-white ${recenteredPulse ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ========================================================= */}
      {/* 4. SLIDING NAVIGATION BOTTOM SHEET                        */}
      {/* NEXT JOB | Water Heater Repair | ETA 18 min | 6.8 km |    */}
      {/* Job Priority Medium | Technician: Alex M. | Start Nav     */}
      {/* Exact match to screenshot vwnwt.jpg                       */}
      {/* ========================================================= */}
      <div className="bg-[#0A1019] border-t border-[#192435] rounded-t-3xl p-4 pt-2.5 pb-2.5 shrink-0 z-30 shadow-[0_-15px_30px_rgba(0,0,0,0.8)] space-y-3.5">
        
        {/* Centered Grab Handle Pill */}
        <div className="w-12 h-1 bg-slate-600/70 rounded-full mx-auto" />

        {/* Row 1: Briefcase Icon + NEXT JOB + Title + Address */}
        <div className="flex items-start gap-3.5">
          {/* Orange Circular Icon with Briefcase */}
          <div className="w-12 h-12 rounded-full bg-[#EA580C] flex items-center justify-center text-white shrink-0 shadow-md mt-0.5">
            <Briefcase className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-black text-[#F97316] tracking-wider uppercase block">
              NEXT JOB
            </span>
            <h2 className="text-[18px] font-bold text-white tracking-tight leading-tight truncate">
              {jobTitle}
            </h2>
            <div className="flex items-center gap-1.5 text-[12px] text-slate-300 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{destinationAddress}</span>
            </div>
          </div>
        </div>

        {/* Row 2: 3 Metrics Cards (ETA 18 min | Distance 6.8 km | Priority Medium) */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          
          {/* Card 1: ETA */}
          <div className="flex items-center gap-2 bg-[#0E1622] border border-[#1A2638] rounded-xl p-2 min-w-0">
            <Clock className="w-5 h-5 text-[#38BDF8] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                ETA
              </span>
              <span className="text-[16px] font-black text-[#38BDF8] leading-tight block truncate">
                18 min
              </span>
              <span className="text-[10.5px] text-slate-400 leading-tight block">
                11:00 AM
              </span>
            </div>
          </div>

          {/* Card 2: Distance */}
          <div className="flex items-center gap-2 bg-[#0E1622] border border-[#1A2638] rounded-xl p-2 min-w-0">
            {/* Winding Route / Road Icon */}
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M4 19c2-3 4-3 6 0s4 3 6 0 4-3 4-3" />
                <path d="M4 5c2-3 4-3 6 0s4 3 6 0 4-3 4-3" />
                <path d="M12 5v14" strokeDasharray="2 2" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                Distance
              </span>
              <span className="text-[16px] font-black text-white leading-tight block truncate">
                6.8 km
              </span>
            </div>
          </div>

          {/* Card 3: Job Priority */}
          <div className="flex items-center gap-2 bg-[#0E1622] border border-[#1A2638] rounded-xl p-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-[#0F2F23] border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
                Job Priority
              </span>
              <span className="text-[14px] font-black text-[#F97316] leading-tight block truncate">
                Medium
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Technician Profile + Live Contact Button */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
              alt="Alex M."
              className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow-sm"
            />
            <div>
              <h4 className="text-[13px] font-bold text-white leading-tight">
                Technician: Alex M.
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 leading-tight mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block shadow-sm" />
                <span>Online</span>
              </div>
            </div>
          </div>

          {/* Phone / Device Quick Button */}
          <button
            onClick={() => setShowTechContactModal(true)}
            className="w-9 h-9 rounded-xl bg-[#131C28] hover:bg-[#1C283A] border border-[#212E41] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all shadow-sm"
            title="Contact Technician / Customer"
          >
            <Smartphone className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Sub-note: All data is live and encrypted 🔒 */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 px-0.5">
          <span>All data is live and encrypted</span>
          <span>🔒</span>
        </div>

        {/* Row 4: Primary & Secondary Buttons */}
        <div className="space-y-2 pt-0.5">
          
          {/* Primary Action Button: START NAVIGATION (Opens in Google Maps) */}
          <button
            onClick={handleStartGoogleMapsNavigation}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/40 cursor-pointer"
          >
            {/* White diamond navigation icon */}
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
              <Navigation className="w-3.5 h-3.5 text-white transform rotate-45" />
            </div>
            <div className="text-center">
              <span className="text-[14.5px] font-black tracking-wide block leading-tight">
                {isNavigating ? 'Resume Navigation HUD' : 'Start Navigation'}
              </span>
              <span className="text-[10.5px] text-blue-100 font-medium block leading-tight">
                Opens in Google Maps
              </span>
            </div>
          </button>

          {/* Secondary Action Button: View Job Details */}
          <button
            onClick={() => {
              if (onViewJobDetails) {
                onViewJobDetails();
              } else {
                showToast('Switching to Work Order Dossier...', 'info');
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#090F17] hover:bg-[#121B27] border border-[#1E2C3F] active:scale-[0.99] text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <ClipboardList className="w-4 h-4 text-slate-300" />
            <span>View Job Details</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. NATIVE ANDROID SYSTEM NAVIGATION BAR (◁  ○  □)         */}
      {/* Exact match to screenshot vwnwt.jpg                       */}
      {/* ========================================================= */}
      <div className="bg-[#000000] py-2 px-12 flex items-center justify-between text-slate-400 shrink-0 border-t border-[#0F1622] z-30">
        <button
          onClick={() => {
            if (onBack) onBack();
          }}
          className="p-1 hover:text-white transition-colors"
          title="Android Back"
        >
          {/* Triangle left */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 19L5 12l14-7v14z" />
          </svg>
        </button>
        <button
          onClick={() => {
            if (onBack) onBack();
          }}
          className="p-1 hover:text-white transition-colors"
          title="Android Home"
        >
          {/* Circle */}
          <div className="w-4 h-4 rounded-full border-2 border-current" />
        </button>
        <button
          onClick={() => {
            showToast('Switching background tasks', 'info');
          }}
          className="p-1 hover:text-white transition-colors"
          title="Android Recents"
        >
          {/* Square */}
          <div className="w-3.5 h-3.5 rounded-[3px] border-2 border-current" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: NEARBY TECHNICIANS RADAR DRAWER                  */}
      {/* ========================================================= */}
      {showNearbyModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end animate-fadeIn">
          <div className="bg-[#0C1420] border-t border-[#1F2E42] rounded-t-3xl p-5 max-h-[80%] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-400" />
                  <span>Nearby Technicians in Nairobi</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Available for co-dispatch or spare part handover
                </p>
              </div>
              <button
                onClick={() => setShowNearbyModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'tech-1',
                  name: 'Alex Mutua (Assigned)',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
                  vehicle: 'Yamaha DT 175 (KME 842X)',
                  location: 'Kilimani / Ngong Rd',
                  distance: '0.0 km (You)',
                  battery: '88%',
                  status: 'En Route to Riverside',
                  badge: 'Lead HVAC Tech'
                },
                {
                  id: 'tech-2',
                  name: 'Brenda Wanjiru',
                  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
                  vehicle: 'Toyota Probox (KDD 210M)',
                  location: 'Westlands (Waiyaki Way)',
                  distance: '2.4 km away',
                  battery: '94%',
                  status: 'On Site (AC Service)',
                  badge: 'Electrical & Plumbing'
                },
                {
                  id: 'tech-3',
                  name: 'Brian Kiprono',
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
                  vehicle: 'Boxer 150 (KMF 123T)',
                  location: 'Upper Hill / Hospital Rd',
                  distance: '3.1 km away',
                  battery: '64%',
                  status: 'Available',
                  badge: 'Spare Parts Courier'
                }
              ].map(tech => (
                <div
                  key={tech.id}
                  className="bg-[#101A27] border border-[#1E2B3E] rounded-2xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-teal-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{tech.name}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{tech.location} • <span className="text-teal-400">{tech.distance}</span></p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tech.vehicle} • {tech.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href="tel:0712345678"
                      className="p-2 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30"
                      title="Direct Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowNearbyModal(false)}
              className="w-full py-3 rounded-xl bg-[#14B8A6] text-[#0A1017] font-bold text-xs"
            >
              Close Technicians Radar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: TECHNICIAN / CUSTOMER CONTACT QUICK ACTIONS      */}
      {/* ========================================================= */}
      {showTechContactModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col justify-end animate-fadeIn">
          <div className="bg-[#0C1420] border-t border-[#1F2E42] rounded-t-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Direct Communication</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Job {jobNumber} • {customerName}
                </p>
              </div>
              <button
                onClick={() => setShowTechContactModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:0712345678"
                className="p-3.5 rounded-2xl bg-[#101A27] border border-[#1E2B3E] hover:border-teal-500/50 flex flex-col items-center justify-center gap-2 text-white"
              >
                <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">Call Customer</span>
                <span className="text-[10px] text-slate-400">0712 345 678</span>
              </a>

              <a
                href="https://wa.me/254712345678?text=Hello%20Peter,%20this%20is%20Alex%20from%20FieldNora%20en%20route%20to%20Riverside%20Drive."
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-[#101A27] border border-[#1E2B3E] hover:border-emerald-500/50 flex flex-col items-center justify-center gap-2 text-white"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">WhatsApp ETA</span>
                <span className="text-[10px] text-emerald-400 font-semibold">18 min arrival</span>
              </a>
            </div>

            <button
              onClick={() => setShowTechContactModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
