import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Navigation,
  MapPin,
  User,
  SlidersHorizontal,
  Phone,
  Plus,
  Minus,
  Crosshair,
  ChevronRight,
  Search,
  X,
  ExternalLink,
  ShieldCheck,
  BatteryCharging,
  Signal,
  MessageSquare,
  Clock,
  Compass,
  RefreshCw,
  Info,
  CheckCircle2,
  Car,
  Wrench,
  AlertTriangle
} from 'lucide-react';

export type LiveTechStatus = 'active' | 'en_route' | 'on_site' | 'offline';

export interface LiveTechnicianItem {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: LiveTechStatus;
  jobTitle: string;
  locationName: string;
  etaText?: string;
  lastSeen?: string;
  coordinates: { x: number; y: number }; // SVG map normalized coords (0..1000, 0..800)
  vehicleReg: string;
  speed: string;
  battery: number;
  trade: string;
  customerName: string;
  customerPhone: string;
  workOrderCode: string;
  routePath?: string; // SVG path d attribute for en-route lines
}

// Complete technician dataset accurately matching mrrdB.jpg
const initialTechniciansData: LiveTechnicianItem[] = [
  // Active (4)
  {
    id: 'tech-brian',
    name: 'Brian Otieno',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    phone: '0712 345 678',
    status: 'active',
    jobTitle: 'Water Heater Repair',
    locationName: 'Westlands',
    etaText: 'ETA 18 min',
    coordinates: { x: 420, y: 270 },
    vehicleReg: 'KDA 482B',
    speed: 'Stationary',
    battery: 92,
    trade: 'Plumbing & Water Heating',
    customerName: 'Westgate Residences #402',
    customerPhone: '+254 712 999 111',
    workOrderCode: 'WO-8492'
  },
  {
    id: 'tech-mercy',
    name: 'Mercy Wanjiku',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '0722 987 654',
    status: 'active',
    jobTitle: 'AC Installation',
    locationName: 'Kilimani',
    etaText: 'ETA 24 min',
    coordinates: { x: 575, y: 310 },
    vehicleReg: 'KDD 192C',
    speed: 'Stationary',
    battery: 88,
    trade: 'HVAC & Climate Systems',
    customerName: 'Dennis Pritt Heights',
    customerPhone: '+254 722 555 888',
    workOrderCode: 'WO-8493'
  },
  {
    id: 'tech-david',
    name: 'David Kiprotich',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    phone: '0733 246 810',
    status: 'active',
    jobTitle: 'Leak Detection',
    locationName: 'Lavington',
    etaText: 'ETA 31 min',
    coordinates: { x: 790, y: 395 },
    vehicleReg: 'KDG 112P',
    speed: 'Stationary',
    battery: 74,
    trade: 'Acoustic Leak Specialist',
    customerName: 'Jameson Villas, Lavington',
    customerPhone: '+254 733 888 222',
    workOrderCode: 'WO-8494'
  },
  {
    id: 'tech-aisha',
    name: 'Aisha Mohammed',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    phone: '0721 554 433',
    status: 'active',
    jobTitle: 'Electrical Inspection',
    locationName: 'Parklands',
    etaText: 'ETA 42 min',
    coordinates: { x: 795, y: 325 },
    vehicleReg: 'KDM 671J',
    speed: 'Stationary',
    battery: 95,
    trade: 'Commercial Electrical',
    customerName: 'Parklands Medical Plaza',
    customerPhone: '+254 721 333 444',
    workOrderCode: 'WO-8495'
  },

  // En Route (3)
  {
    id: 'tech-samuel',
    name: 'Samuel Njuguna',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    phone: '0701 112 233',
    status: 'en_route',
    jobTitle: 'Generator Service',
    locationName: 'Embakasi',
    etaText: 'ETA 12 min',
    coordinates: { x: 755, y: 245 },
    vehicleReg: 'KCY 884M',
    speed: '48 km/h',
    battery: 64,
    trade: 'Heavy Diesel Generators',
    customerName: 'Apex Logistics Hub Embakasi',
    customerPhone: '+254 701 888 999',
    workOrderCode: 'WO-8496',
    routePath: 'M 675 350 Q 670 295 755 245'
  },
  {
    id: 'tech-peter',
    name: 'Peter Maina',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    phone: '0723 778 899',
    status: 'en_route',
    jobTitle: 'Pump Repair',
    locationName: 'Rongai',
    etaText: 'ETA 19 min',
    coordinates: { x: 600, y: 640 },
    vehicleReg: 'KDE 304K',
    speed: '55 km/h',
    battery: 81,
    trade: 'Submersible Pumps & Boreholes',
    customerName: 'Rongai Greens Estate',
    customerPhone: '+254 723 111 222',
    workOrderCode: 'WO-8497',
    routePath: 'M 645 745 Q 640 690 600 640'
  },
  {
    id: 'tech-esther',
    name: 'Esther Nduta',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    phone: '0718 665 577',
    status: 'en_route',
    jobTitle: 'Solar Panel Check',
    locationName: 'Karen',
    etaText: 'ETA 28 min',
    coordinates: { x: 725, y: 555 },
    vehicleReg: 'KDC 990W',
    speed: '36 km/h',
    battery: 90,
    trade: 'Solar PV & Inverter Systems',
    customerName: 'Karen Hardy Manor',
    customerPhone: '+254 718 444 333',
    workOrderCode: 'WO-8498',
    routePath: 'M 675 420 Q 700 480 725 555'
  },

  // On Site (2)
  {
    id: 'tech-james',
    name: 'James Karanja',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    phone: '0724 333 444',
    status: 'on_site',
    jobTitle: 'Geyser Installation',
    locationName: 'Kileleshwa',
    etaText: 'On Site',
    coordinates: { x: 605, y: 405 },
    vehicleReg: 'KDN 521S',
    speed: '0 km/h',
    battery: 68,
    trade: 'Sanitary & Solar Water Heaters',
    customerName: 'Gatundu Gardens Apt B4',
    customerPhone: '+254 724 999 555',
    workOrderCode: 'WO-8499'
  },
  {
    id: 'tech-linet',
    name: 'Linet Achieng',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    phone: '0717 889 900',
    status: 'on_site',
    jobTitle: 'Wiring Upgrade',
    locationName: 'Kilimani',
    etaText: 'On Site',
    coordinates: { x: 790, y: 440 },
    vehicleReg: 'KDH 772T',
    speed: '0 km/h',
    battery: 83,
    trade: 'Electrical Rewiring & Breakers',
    customerName: 'Argwings Kodhek Suites',
    customerPhone: '+254 717 666 777',
    workOrderCode: 'WO-8500'
  },

  // Offline (1)
  {
    id: 'tech-kevin',
    name: 'Kevin Omondi',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    phone: '0734 567 890',
    status: 'offline',
    jobTitle: 'Standby / Rest Shift',
    locationName: 'Industrial Area',
    lastSeen: 'Yesterday 16:42',
    coordinates: { x: 720, y: 480 },
    vehicleReg: 'KDB 654H',
    speed: 'Off Radar',
    battery: 15,
    trade: 'Mechanical & Hydraulic Systems',
    customerName: 'None (Shift Ended)',
    customerPhone: '—',
    workOrderCode: 'STANDBY'
  }
];

export const GpsMapView: React.FC = () => {
  const { showToast } = useApp();
  const [technicians, setTechnicians] = useState<LiveTechnicianItem[]>(initialTechniciansData);
  const [selectedTechId, setSelectedTechId] = useState<string>('tech-brian');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LiveTechStatus | 'all'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [callModalTech, setCallModalTech] = useState<LiveTechnicianItem | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(15);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Selected technician object
  const selectedTech = technicians.find(t => t.id === selectedTechId) || technicians[0];

  // 15-second heartbeat timer simulation matching "Live updates every 15s 🟢"
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilRefresh(prev => {
        if (prev <= 1) {
          // Trigger slight coordinate jitter to simulate live driving/tracking
          triggerTelemetryHeartbeat();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerTelemetryHeartbeat = () => {
    setIsRefreshing(true);
    setTechnicians(prev =>
      prev.map(tech => {
        if (tech.status === 'en_route') {
          // Micro-movement for en-route units
          const dx = (Math.random() - 0.48) * 3;
          const dy = (Math.random() - 0.48) * 3;
          return {
            ...tech,
            coordinates: {
              x: Math.max(100, Math.min(900, tech.coordinates.x + dx)),
              y: Math.max(100, Math.min(700, tech.coordinates.y + dy))
            }
          };
        }
        return tech;
      })
    );
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Filter technicians
  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch =
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || tech.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI counters matching mrrdB.jpg: 8 Active, 3 En Route, 2 On Site, 1 Offline
  const activeCount = 8;
  const enRouteCount = 3;
  const onSiteCount = 2;
  const offlineCount = 1;

  // Group filtered technicians by status
  const activeTechs = filteredTechnicians.filter(t => t.status === 'active');
  const enRouteTechs = filteredTechnicians.filter(t => t.status === 'en_route');
  const onSiteTechs = filteredTechnicians.filter(t => t.status === 'on_site');
  const offlineTechs = filteredTechnicians.filter(t => t.status === 'offline');

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(2.2, prev + 0.25));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.75, prev - 0.25));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    showToast('Map centered on Nairobi Metro', 'info');
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Focus on technician
  const handleSelectTechnician = (tech: LiveTechnicianItem) => {
    setSelectedTechId(tech.id);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full text-slate-100 select-none pb-6">
      {/* 4 Top KPI Stat Cards - Matching exact styling from screenshot mrrdB.jpg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Active (8) */}
        <div
          id="kpi-card-active"
          onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
          className={`cursor-pointer flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0E1620] border transition-all duration-200 ${
            statusFilter === 'active'
              ? 'border-[#14B8A6] ring-2 ring-[#14B8A6]/20'
              : 'border-[#1E293B] hover:border-slate-700'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#0D2E2B] border border-[#14B8A6]/40 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-[#14B8A6]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
              {activeCount}
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-1 leading-none">
              Active
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 leading-none">
              Working on jobs
            </span>
          </div>
        </div>

        {/* Card 2: En Route (3) */}
        <div
          id="kpi-card-en-route"
          onClick={() => setStatusFilter(statusFilter === 'en_route' ? 'all' : 'en_route')}
          className={`cursor-pointer flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0E1620] border transition-all duration-200 ${
            statusFilter === 'en_route'
              ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/20'
              : 'border-[#1E293B] hover:border-slate-700'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#0E2338] border border-[#3B82F6]/40 flex items-center justify-center shrink-0">
            <Navigation className="w-6 h-6 text-[#3B82F6] transform rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
              {enRouteCount}
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-1 leading-none">
              En Route
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 leading-none">
              Traveling to sites
            </span>
          </div>
        </div>

        {/* Card 3: On Site (2) */}
        <div
          id="kpi-card-on-site"
          onClick={() => setStatusFilter(statusFilter === 'on_site' ? 'all' : 'on_site')}
          className={`cursor-pointer flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0E1620] border transition-all duration-200 ${
            statusFilter === 'on_site'
              ? 'border-[#A855F7] ring-2 ring-[#A855F7]/20'
              : 'border-[#1E293B] hover:border-slate-700'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#251838] border border-[#A855F7]/40 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-[#A855F7]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
              {onSiteCount}
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-1 leading-none">
              On Site
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 leading-none">
              At work location
            </span>
          </div>
        </div>

        {/* Card 4: Offline (1) */}
        <div
          id="kpi-card-offline"
          onClick={() => setStatusFilter(statusFilter === 'offline' ? 'all' : 'offline')}
          className={`cursor-pointer flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0E1620] border transition-all duration-200 ${
            statusFilter === 'offline'
              ? 'border-[#94A3B8] ring-2 ring-slate-400/20'
              : 'border-[#1E293B] hover:border-slate-700'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#1A222D] border border-[#475569]/40 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-[#94A3B8]" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
              {offlineCount}
            </span>
            <span className="text-xs font-semibold text-slate-200 mt-1 leading-none">
              Offline
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 leading-none">
              Not connected
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Left Technicians Sidebar + Right Cartographic Map */}
      <div className="flex flex-col lg:flex-row gap-3.5 w-full items-stretch">
        {/* Left Column: Technicians Status List (Matching screenshot mrrdB.jpg) */}
        <div className="w-full lg:w-[350px] xl:w-[370px] bg-[#0E1620] border border-[#1E293B] rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Technicians</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {technicians.length} Total • Sorted by Status
              </p>
            </div>
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`p-2 rounded-xl border transition-colors ${
                showFilterDrawer || statusFilter !== 'all' || searchQuery
                  ? 'bg-teal-950/60 border-[#14B8A6]/60 text-[#14B8A6]'
                  : 'bg-[#111A24] border-[#1E293B] text-slate-400 hover:text-white'
              }`}
              title="Filter Technicians"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search and Filter Bar */}
          {showFilterDrawer && (
            <div className="p-3 bg-[#0B1118] border-b border-[#1E293B] space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, job, or area..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-[#111A24] border border-[#1E293B] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-[#14B8A6]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'active', 'en_route', 'on_site', 'offline'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize border transition-all ${
                      statusFilter === s
                        ? 'bg-[#14B8A6] text-black border-[#14B8A6]'
                        : 'bg-[#111A24] text-slate-400 border-[#1E293B] hover:text-slate-200'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scrollable Technicians Groups */}
          <div className="flex-1 overflow-y-auto max-h-[600px] lg:max-h-[640px] divide-y divide-[#1E293B]/40">
            {/* Group 1: Active (4) */}
            {activeTechs.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1.5 mb-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold text-[#14B8A6] bg-[#0E2625] border border-[#14B8A6]/30">
                    Active ({activeTechs.length})
                  </span>
                </div>
                {activeTechs.map(tech => (
                  <TechnicianRowItem
                    key={tech.id}
                    tech={tech}
                    isSelected={tech.id === selectedTechId}
                    onSelect={() => handleSelectTechnician(tech)}
                    onCall={() => setCallModalTech(tech)}
                  />
                ))}
              </div>
            )}

            {/* Group 2: En Route (3) */}
            {enRouteTechs.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1.5 mb-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold text-[#3B82F6] bg-[#0E2338] border border-[#3B82F6]/30">
                    En Route ({enRouteTechs.length})
                  </span>
                </div>
                {enRouteTechs.map(tech => (
                  <TechnicianRowItem
                    key={tech.id}
                    tech={tech}
                    isSelected={tech.id === selectedTechId}
                    onSelect={() => handleSelectTechnician(tech)}
                    onCall={() => setCallModalTech(tech)}
                  />
                ))}
              </div>
            )}

            {/* Group 3: On Site (2) */}
            {onSiteTechs.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1.5 mb-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold text-[#A855F7] bg-[#251838] border border-[#A855F7]/30">
                    On Site ({onSiteTechs.length})
                  </span>
                </div>
                {onSiteTechs.map(tech => (
                  <TechnicianRowItem
                    key={tech.id}
                    tech={tech}
                    isSelected={tech.id === selectedTechId}
                    onSelect={() => handleSelectTechnician(tech)}
                    onCall={() => setCallModalTech(tech)}
                  />
                ))}
              </div>
            )}

            {/* Group 4: Offline (1) */}
            {offlineTechs.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1.5 mb-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold text-[#94A3B8] bg-[#1A222D] border border-slate-700/40">
                    Offline ({offlineTechs.length})
                  </span>
                </div>
                {offlineTechs.map(tech => (
                  <TechnicianRowItem
                    key={tech.id}
                    tech={tech}
                    isSelected={tech.id === selectedTechId}
                    onSelect={() => handleSelectTechnician(tech)}
                    onCall={() => setCallModalTech(tech)}
                  />
                ))}
              </div>
            )}

            {filteredTechnicians.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No technicians match the filter criteria.
              </div>
            )}
          </div>

          {/* Bottom Action: Status Legend Trigger matching screenshot */}
          <div className="p-3.5 bg-[#0B1118] border-t border-[#1E293B]">
            <button
              onClick={() => setIsLegendOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#111A24] hover:bg-[#16202C] border border-[#1E293B] text-xs font-medium text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <span>Status Legend</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Right Column: Dark Vector Cartography Map of Nairobi */}
        <div className="flex-1 bg-[#080D13] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl relative flex flex-col min-h-[580px] lg:min-h-[640px]">
          {/* Draggable & Scalable Map Canvas */}
          <div
            ref={mapContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`w-full h-full flex-1 relative overflow-hidden ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              backgroundColor: '#0A1017'
            }}
          >
            {/* SVG Dark Nairobi Metro Cartography Map */}
            <svg
              viewBox="0 0 1000 800"
              className="w-full h-full select-none"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${
                  panOffset.y / zoomLevel
                }px)`,
                transformOrigin: '50% 50%',
                transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            >
              <defs>
                {/* Arrowhead marker for en-route blue lines */}
                <marker
                  id="blue-arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="6"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M 0 0 L 6 3 L 0 6 z" fill="#3B82F6" />
                </marker>

                {/* Pulsing beacon gradients */}
                <radialGradient id="beacon-teal" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="beacon-blue" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </radialGradient>

                {/* Topographic grid */}
                <pattern id="dark-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="none"
                    stroke="#141E2B"
                    strokeWidth="0.8"
                    strokeOpacity="0.6"
                  />
                </pattern>
              </defs>

              {/* Background Grid */}
              <rect width="1000" height="800" fill="url(#dark-grid)" />

              {/* Major Green Spaces (Karura, Arboretum, National Park Edge) */}
              <path
                d="M 720 180 Q 770 170 820 200 T 850 260 Q 800 290 750 270 Z"
                fill="#0F241E"
                opacity="0.8"
              />
              <path
                d="M 340 580 Q 380 570 420 600 T 430 680 Q 370 700 330 650 Z"
                fill="#0F241E"
                opacity="0.7"
              />
              <path
                d="M 120 680 Q 250 670 400 710 T 600 780 L 100 800 Z"
                fill="#0D1E18"
                opacity="0.6"
              />

              {/* Nairobi Metro Water Bodies / Rivers */}
              <path
                d="M 280 260 Q 420 290 560 310 T 820 370"
                fill="none"
                stroke="#0E2338"
                strokeWidth="2.5"
                strokeOpacity="0.7"
              />
              <path
                d="M 310 380 Q 450 410 590 420 T 880 470"
                fill="none"
                stroke="#0E2338"
                strokeWidth="2"
                strokeOpacity="0.7"
              />

              {/* Primary Road Network (Arterial Expressways & Ring Roads) */}
              {/* Thika Superhighway (Northeast) */}
              <path
                d="M 620 380 Q 690 280 810 140 T 960 40"
                fill="none"
                stroke="#1B2838"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 620 380 Q 690 280 810 140 T 960 40"
                fill="none"
                stroke="#243449"
                strokeWidth="2"
                strokeDasharray="8 6"
              />

              {/* Waiyaki Way / Nairobi Expressway (West) */}
              <path
                d="M 100 200 Q 300 260 550 340 T 640 400"
                fill="none"
                stroke="#1B2838"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 100 200 Q 300 260 550 340 T 640 400"
                fill="none"
                stroke="#2A3C54"
                strokeWidth="2.5"
              />

              {/* Mombasa Road (Southeast to Embakasi & Airport) */}
              <path
                d="M 640 400 Q 720 480 820 570 T 980 680"
                fill="none"
                stroke="#1B2838"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 640 400 Q 720 480 820 570 T 980 680"
                fill="none"
                stroke="#2A3C54"
                strokeWidth="2.5"
              />

              {/* Southern Bypass (Linking Karen/Lang'ata/Mombasa Rd) */}
              <path
                d="M 380 640 Q 520 600 680 570 T 840 560"
                fill="none"
                stroke="#1A2534"
                strokeWidth="4"
              />

              {/* Ngong Road & Langata Road */}
              <path
                d="M 360 440 Q 480 470 600 420"
                fill="none"
                stroke="#1B2838"
                strokeWidth="3.5"
              />
              <path
                d="M 600 420 Q 580 560 620 740"
                fill="none"
                stroke="#1B2838"
                strokeWidth="4"
              />

              {/* Outer Ring Road & Jogoo Road */}
              <path
                d="M 760 210 Q 820 340 810 460 T 780 570"
                fill="none"
                stroke="#182433"
                strokeWidth="3.5"
              />
              <path
                d="M 640 400 Q 740 420 860 430"
                fill="none"
                stroke="#1B2838"
                strokeWidth="3.5"
              />

              {/* Subtle Regional Highway Network Mesh */}
              <path
                d="M 280 120 Q 420 160 520 220 T 640 400"
                fill="none"
                stroke="#15202E"
                strokeWidth="2"
              />
              <path
                d="M 440 240 Q 540 320 640 400"
                fill="none"
                stroke="#182433"
                strokeWidth="2.5"
              />
              <path
                d="M 240 340 Q 380 370 540 380"
                fill="none"
                stroke="#15202E"
                strokeWidth="2"
              />

              {/* Large Subtle Typography Watermark "NAIROBI / NAIROBI" - Exactly as in mrrdB.jpg */}
              <g opacity="0.18" pointerEvents="none">
                <text
                  x="560"
                  y="510"
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="28"
                  fontWeight="800"
                  letterSpacing="4"
                  className="font-sans"
                >
                  NAIROBI
                </text>
                <text
                  x="560"
                  y="555"
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="28"
                  fontWeight="800"
                  letterSpacing="4"
                  className="font-sans"
                >
                  NAIROBI
                </text>
              </g>

              {/* Metropolitan Region Labels - Positioned accurately from screenshot mrrdB.jpg */}
              <g pointerEvents="none" className="select-none">
                <text x="340" y="110" fill="#64748B" fontSize="13" fontWeight="500">
                  Limuru
                </text>
                <text x="490" y="150" fill="#64748B" fontSize="13" fontWeight="500">
                  Kiambu
                </text>
                <text x="600" y="175" fill="#64748B" fontSize="13" fontWeight="500">
                  Karen
                </text>
                <text x="730" y="130" fill="#64748B" fontSize="13" fontWeight="500">
                  Ronhalasi
                </text>
                <text x="860" y="90" fill="#64748B" fontSize="13" fontWeight="500">
                  Ruiru
                </text>
                <text x="790" y="150" fill="#64748B" fontSize="13" fontWeight="500">
                  Embakasi
                </text>
                <text x="500" y="260" fill="#64748B" fontSize="13" fontWeight="500">
                  Parklands
                </text>
                <text x="310" y="320" fill="#64748B" fontSize="13" fontWeight="500">
                  Kileimani
                </text>
                <text x="400" y="370" fill="#64748B" fontSize="13" fontWeight="500">
                  Kileleshwa
                </text>
                <text x="670" y="370" fill="#64748B" fontSize="13" fontWeight="500">
                  Westlands
                </text>
                <text x="880" y="320" fill="#64748B" fontSize="13" fontWeight="500">
                  Kasarani
                </text>
                <text x="500" y="395" fill="#64748B" fontSize="13" fontWeight="500">
                  Nairobi
                </text>
                <text x="500" y="415" fill="#64748B" fontSize="13" fontWeight="500">
                  CBD
                </text>
                <text x="400" y="440" fill="#64748B" fontSize="13" fontWeight="500">
                  Kileleshwa
                </text>
                <text x="400" y="520" fill="#64748B" fontSize="13" fontWeight="500">
                  Lavington
                </text>
                <text x="860" y="490" fill="#64748B" fontSize="13" fontWeight="500">
                  Kasarani
                </text>
                <text x="470" y="670" fill="#64748B" fontSize="13" fontWeight="500">
                  Karen
                </text>
                <text x="730" y="630" fill="#64748B" fontSize="13" fontWeight="500">
                  Ngong
                </text>
                <text x="610" y="690" fill="#64748B" fontSize="13" fontWeight="500">
                  Rgnholm
                </text>
              </g>

              {/* Route Polylines for En Route Technicians (Blue glowing trails with arrowheads) */}
              {filteredTechnicians
                .filter(t => t.status === 'en_route' && t.routePath)
                .map(tech => (
                  <g key={`route-${tech.id}`}>
                    {/* Glowing outer aura */}
                    <path
                      d={tech.routePath}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="6"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />
                    {/* Inner crisp line with arrowhead */}
                    <path
                      d={tech.routePath}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      markerEnd="url(#blue-arrowhead)"
                      className="animate-pulse"
                    />
                  </g>
                ))}

              {/* Selected Technician Target Ring */}
              {selectedTech && (
                <g transform={`translate(${selectedTech.coordinates.x}, ${selectedTech.coordinates.y})`}>
                  <circle
                    r="34"
                    fill="none"
                    stroke={
                      selectedTech.status === 'active'
                        ? '#14B8A6'
                        : selectedTech.status === 'en_route'
                        ? '#3B82F6'
                        : selectedTech.status === 'on_site'
                        ? '#A855F7'
                        : '#64748B'
                    }
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                    opacity="0.8"
                  />
                  <circle
                    r="48"
                    fill="none"
                    stroke={
                      selectedTech.status === 'active'
                        ? '#14B8A6'
                        : selectedTech.status === 'en_route'
                        ? '#3B82F6'
                        : selectedTech.status === 'on_site'
                        ? '#A855F7'
                        : '#64748B'
                    }
                    strokeWidth="0.8"
                    opacity="0.3"
                  />
                </g>
              )}

              {/* Technician Markers & Pills - Exactly matching screenshot mrrdB.jpg */}
              {filteredTechnicians.map(tech => (
                <TechnicianMapMarker
                  key={tech.id}
                  tech={tech}
                  isSelected={tech.id === selectedTechId}
                  onSelect={() => handleSelectTechnician(tech)}
                />
              ))}
            </svg>
          </div>

          {/* Floating Bottom Status Legend Filter Bar (Matching screenshot mrrdB.jpg) */}
          <div className="absolute bottom-4 left-4 sm:left-6 z-20 flex items-center gap-3.5 bg-[#0B121A]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#1E293B] shadow-2xl">
            <button
              onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
              className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                statusFilter === 'active' || statusFilter === 'all'
                  ? 'text-white'
                  : 'text-slate-500'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
              <span>Active</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'en_route' ? 'all' : 'en_route')}
              className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                statusFilter === 'en_route' || statusFilter === 'all'
                  ? 'text-white'
                  : 'text-slate-500'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
              <span>En Route</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'on_site' ? 'all' : 'on_site')}
              className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                statusFilter === 'on_site' || statusFilter === 'all'
                  ? 'text-white'
                  : 'text-slate-500'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
              <span>On Site</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'offline' ? 'all' : 'offline')}
              className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                statusFilter === 'offline' || statusFilter === 'all'
                  ? 'text-white'
                  : 'text-slate-500'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
              <span>Offline</span>
            </button>
          </div>

          {/* Bottom Right Map Controls & Attribution (Matching screenshot mrrdB.jpg) */}
          <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
            {/* Map Controls: [+], [-], [⌖] */}
            <div className="flex flex-col rounded-xl bg-[#0E1620]/95 backdrop-blur-md border border-[#1E293B] shadow-2xl overflow-hidden divide-y divide-[#1E293B]">
              <button
                id="map-zoom-in-btn"
                onClick={handleZoomIn}
                className="p-2.5 text-slate-300 hover:text-white hover:bg-[#16202C] transition-colors"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                id="map-zoom-out-btn"
                onClick={handleZoomOut}
                className="p-2.5 text-slate-300 hover:text-white hover:bg-[#16202C] transition-colors"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                id="map-recenter-btn"
                onClick={handleResetView}
                className="p-2.5 text-slate-300 hover:text-white hover:bg-[#16202C] transition-colors"
                title="Center Nairobi Metro"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>

            {/* Attribution & Live Refresh Telemetry Pulse */}
            <div className="flex flex-col items-end text-[10px] text-slate-400 select-none">
              <span>Map data OpenStreetMap contributors</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span>Live updates every 15s</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRefreshing ? 'bg-[#14B8A6] ring-4 ring-[#14B8A6]/40' : 'bg-[#14B8A6] animate-pulse'
                  }`}
                  title={`Next sync in ${secondsUntilRefresh}s`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Technician Inspection Dossier Drawer (Floats at bottom or in modal for fast dispatcher actions) */}
      {selectedTech && (
        <div className="bg-[#0E1620] border border-[#1E293B] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <img
              src={selectedTech.avatar}
              alt={selectedTech.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#14B8A6]/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {selectedTech.name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedTech.status === 'active'
                      ? 'bg-teal-950/70 text-[#14B8A6] border border-[#14B8A6]/30'
                      : selectedTech.status === 'en_route'
                      ? 'bg-blue-950/70 text-[#3B82F6] border border-[#3B82F6]/30'
                      : selectedTech.status === 'on_site'
                      ? 'bg-purple-950/70 text-[#A855F7] border border-[#A855F7]/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {selectedTech.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">• {selectedTech.trade}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                <span className="text-[#14B8A6] font-semibold">{selectedTech.workOrderCode}:</span>{' '}
                {selectedTech.jobTitle} at{' '}
                <span className="font-medium text-white">{selectedTech.customerName}</span> (
                {selectedTech.locationName})
              </p>
            </div>
          </div>

          {/* Telemetry Metrics & Dispatch Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 text-xs bg-[#111A24] px-3.5 py-2 rounded-xl border border-[#1E293B]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-200">{selectedTech.vehicleReg}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>{selectedTech.speed}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedTech.battery}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCallModalTech(selectedTech)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111A24] hover:bg-[#16202C] border border-[#1E293B] text-xs font-semibold text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span>Call {selectedTech.phone}</span>
              </button>

              <a
                href={`https://maps.google.com/?q=${selectedTech.locationName}+Nairobi`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D9488] hover:bg-[#14B8A6] text-xs font-semibold text-white transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Maps Route</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Call Dialog Simulation */}
      {callModalTech && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0E1620] border border-[#1E293B] rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#111A24] border-2 border-[#14B8A6] mx-auto overflow-hidden p-0.5">
              <img
                src={callModalTech.avatar}
                alt={callModalTech.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{callModalTech.name}</h3>
              <p className="text-xs text-slate-400">{callModalTech.trade}</p>
              <p className="text-sm font-mono font-bold text-[#14B8A6] mt-2">
                {callModalTech.phone}
              </p>
            </div>

            <div className="p-3 bg-[#111A24] rounded-xl border border-[#1E293B] text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Vehicle:</span>
                <span className="text-white font-mono">{callModalTech.vehicleReg}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Current Job:</span>
                <span className="text-white">{callModalTech.jobTitle}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Location:</span>
                <span className="text-white">{callModalTech.locationName}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${callModalTech.phone}`}
                onClick={() => {
                  showToast(`Dialing ${callModalTech.name} (${callModalTech.phone})...`, 'success');
                  setCallModalTech(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#14B8A6] text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Dial Now</span>
              </a>
              <button
                onClick={() => setCallModalTech(null)}
                className="px-4 py-2.5 rounded-xl bg-[#16202C] hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Legend Modal */}
      {isLegendOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E1620] border border-[#1E293B] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#14B8A6]" />
                <h3 className="text-base font-bold text-white">Status Legend & Dispatch Rules</h3>
              </div>
              <button
                onClick={() => setIsLegendOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#16202C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#0B1118] rounded-xl border border-[#1E293B] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#14B8A6]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
                  <span>Active</span>
                </div>
                <p className="text-slate-400">
                  Technician is clocked in, actively diagnostics or executing an assigned work order on schedule.
                </p>
              </div>

              <div className="p-3 bg-[#0B1118] rounded-xl border border-[#1E293B] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#3B82F6]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                  <span>En Route</span>
                </div>
                <p className="text-slate-400">
                  Vehicle is traveling towards customer location. GPS polyline updates live with real-time ETA calculations.
                </p>
              </div>

              <div className="p-3 bg-[#0B1118] rounded-xl border border-[#1E293B] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#A855F7]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
                  <span>On Site</span>
                </div>
                <p className="text-slate-400">
                  Geofence arrival confirmed at customer premises. Time clock actively counting for invoice labour items.
                </p>
              </div>

              <div className="p-3 bg-[#0B1118] rounded-xl border border-[#1E293B] space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#94A3B8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
                  <span>Offline</span>
                </div>
                <p className="text-slate-400">
                  Device disconnected or shift completed. Not currently dispatchable for emergency work orders.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsLegendOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#14B8A6] text-white font-semibold text-xs transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Technician Row Item in Left Sidebar
const TechnicianRowItem: React.FC<{
  tech: LiveTechnicianItem;
  isSelected: boolean;
  onSelect: () => void;
  onCall: () => void;
}> = ({ tech, isSelected, onSelect, onCall }) => {
  return (
    <div
      onClick={onSelect}
      className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all ${
        isSelected
          ? 'bg-[#142030] border-l-2 border-[#14B8A6]'
          : 'hover:bg-[#111A24] border-l-2 border-transparent'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={tech.avatar}
          alt={tech.name}
          className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-[#1E293B]"
        />
        <div className="min-w-0">
          <h4
            className={`text-xs font-semibold truncate ${
              isSelected ? 'text-white font-bold' : 'text-slate-200'
            }`}
          >
            {tech.name}
          </h4>
          <p className="text-[11px] text-slate-400 truncate">
            {tech.jobTitle} – {tech.locationName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <div className="flex flex-col items-end">
          {tech.status === 'offline' ? (
            <>
              <span className="text-[11px] font-medium text-slate-400">Offline</span>
              <span className="text-[10px] text-slate-500">{tech.phone}</span>
            </>
          ) : tech.status === 'on_site' ? (
            <>
              <span className="text-[11px] font-semibold text-[#A855F7]">On Site</span>
              <span className="text-[10px] text-slate-400">{tech.phone}</span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-semibold text-slate-300">
                {tech.etaText || 'Active'}
              </span>
              <span className="text-[10px] text-slate-400">{tech.phone}</span>
            </>
          )}
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            onCall();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          title={`Call ${tech.name}`}
        >
          <Phone className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Subcomponent: Map Marker with Attached Pill Badge (Exact reproduction of mrrdB.jpg)
const TechnicianMapMarker: React.FC<{
  tech: LiveTechnicianItem;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ tech, isSelected, onSelect }) => {
  const { x, y } = tech.coordinates;

  // Colors based on status
  const colorMap = {
    active: { bg: '#14B8A6', dot: '#14B8A6', text: 'Active' },
    en_route: { bg: '#3B82F6', dot: '#3B82F6', text: 'En Route' },
    on_site: { bg: '#A855F7', dot: '#A855F7', text: 'On Site' },
    offline: { bg: '#64748B', dot: '#64748B', text: 'Offline' }
  };

  const currentStatus = colorMap[tech.status];

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onSelect}
      className="cursor-pointer group"
    >
      {/* Outer circular icon badge */}
      <circle
        cx="0"
        cy="0"
        r="14"
        fill={currentStatus.bg}
        filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
        className="transition-transform group-hover:scale-110"
      />

      {/* Icon inside badge */}
      {tech.status === 'en_route' ? (
        <path
          d="M -4 4 L 0 -4 L 4 4 L 0 2 z"
          fill="#FFFFFF"
          transform="rotate(45)"
        />
      ) : tech.status === 'on_site' ? (
        <circle cx="0" cy="0" r="4" fill="#FFFFFF" />
      ) : tech.status === 'offline' ? (
        <circle cx="0" cy="0" r="3" fill="#FFFFFF" opacity="0.8" />
      ) : (
        /* Helmet / Tech symbol */
        <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" />
      )}

      {/* Attached Label Pill (Black container with Name + Status) matching mrrdB.jpg */}
      <g transform="translate(18, -16)">
        {/* Pill Background */}
        <rect
          x="0"
          y="0"
          width="110"
          height="34"
          rx="6"
          fill="#0B131D"
          fillOpacity="0.95"
          stroke={isSelected ? currentStatus.bg : '#1E293B'}
          strokeWidth={isSelected ? 1.5 : 1}
          filter="drop-shadow(0 4px 8px rgba(0,0,0,0.6))"
        />

        {/* Technician Name */}
        <text
          x="10"
          y="15"
          fill="#FFFFFF"
          fontSize="10"
          fontWeight="700"
          className="font-sans select-none"
        >
          {tech.name}
        </text>

        {/* Status indicator dot + text */}
        <circle cx="12" cy="25" r="2.5" fill={currentStatus.dot} />
        <text
          x="19"
          y="28"
          fill={tech.status === 'offline' ? '#94A3B8' : currentStatus.dot}
          fontSize="9"
          fontWeight="600"
          className="font-sans select-none"
        >
          {currentStatus.text}
        </text>
      </g>
    </g>
  );
};
