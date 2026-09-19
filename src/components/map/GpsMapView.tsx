import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  MapPin,
  Navigation,
  Wrench,
  Users,
  Compass,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Radio,
  Layers,
  Sparkles
} from 'lucide-react';
import { Technician, Customer, Job } from '../../types';

export const GpsMapView: React.FC = () => {
  const { showToast } = useApp();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [region, setRegion] = useState<'nairobi' | 'mombasa'>('nairobi');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tList, cList, jList] = await Promise.all([
          api.getTechnicians(),
          api.getCustomers(),
          api.getJobs(),
        ]);
        setTechnicians(tList);
        setCustomers(cList);
        setJobs(jList);
        if (tList.length > 0) setSelectedTech(tList[0]);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  // Map projection helpers for Nairobi coordinates
  // Nairobi bounding box ~ Lat: -1.35 to -1.22, Lng: 36.70 to 36.92
  const mapWidth = 800;
  const mapHeight = 500;

  const projectCoords = (lat: number, lng: number) => {
    const minLat = -1.35;
    const maxLat = -1.22;
    const minLng = 36.70;
    const maxLng = 36.92;

    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    const y = ((maxLat - lat) / (maxLat - minLat)) * mapHeight;

    return {
      x: Math.max(30, Math.min(mapWidth - 30, x)),
      y: Math.max(30, Math.min(mapHeight - 30, y)),
    };
  };

  // Nairobi landmark reference points
  const landmarks = [
    { name: 'Westlands / Sarit', lat: -1.263, lng: 36.802 },
    { name: 'Nairobi CBD', lat: -1.286, lng: 36.821 },
    { name: 'Kilimani / Yaya', lat: -1.292, lng: 36.786 },
    { name: 'Upper Hill', lat: -1.299, lng: 36.816 },
    { name: 'Industrial Area', lat: -1.312, lng: 36.845 },
    { name: 'Karen Hub', lat: -1.319, lng: 36.712 },
    { name: 'Gigiri / UN', lat: -1.233, lng: 36.811 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Field GPS & Live Location Radar</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 text-teal-800">
              High Precision GPS
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time technician tracking, travel routes, and geofenced client arrival logs across Kenya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={region}
            onChange={e => setRegion(e.target.value as any)}
            className="text-xs font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 outline-hidden"
          >
            <option value="nairobi">Nairobi Metropolitan</option>
            <option value="mombasa">Mombasa Coastal Region</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Map canvas + Side Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cartographic Map Canvas */}
        <div className="lg:col-span-2 bg-[#0F172A] rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col relative">
          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-white">
            <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span className="font-semibold">Nairobi Live Mesh Active</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">{technicians.length} Field Units</span>
          </div>

          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-[11px] text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> En Route
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> On Job
            </span>
          </div>

          {/* Interactive SVG Map */}
          <div className="w-full h-[520px] relative overflow-hidden flex items-center justify-center p-2 bg-[#0B132B]">
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-full select-none"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" />
                </pattern>
                <radialGradient id="pulseGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Grid Background */}
              <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

              {/* Road / Arterial Highways Simulation (e.g. Mombasa Rd, Thika Superhighway, Waiyaki Way) */}
              <path
                d="M 50 180 Q 300 220 500 260 T 780 340"
                fill="none"
                stroke="#1E293B"
                strokeWidth="4"
              />
              <path
                d="M 220 50 Q 350 200 400 300 T 520 480"
                fill="none"
                stroke="#1E293B"
                strokeWidth="4"
              />
              <path
                d="M 120 380 Q 320 310 450 240 T 720 120"
                fill="none"
                stroke="#1E293B"
                strokeWidth="2.5"
              />

              {/* Landmark Sector Zones */}
              {landmarks.map(l => {
                const pos = projectCoords(l.lat, l.lng);
                return (
                  <g key={l.name} transform={`translate(${pos.x}, ${pos.y})`}>
                    <circle r="22" fill="#1E293B" fillOpacity="0.4" />
                    <text
                      y="16"
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="9"
                      fontWeight="600"
                      className="tracking-wider uppercase"
                    >
                      {l.name}
                    </text>
                  </g>
                );
              })}

              {/* Active Route Path Between Selected Technician & Customer Job */}
              {selectedTech && (
                <g>
                  {(() => {
                    const techPos = projectCoords(
                      selectedTech.currentLatitude || -1.286,
                      selectedTech.currentLongitude || 36.817
                    );
                    const destPos = projectCoords(-1.263, 36.802); // Westlands sample destination

                    return (
                      <>
                        <line
                          x1={techPos.x}
                          y1={techPos.y}
                          x2={destPos.x}
                          y2={destPos.y}
                          stroke="#38BDF8"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          className="opacity-75"
                        />
                        <circle
                          cx={(techPos.x + destPos.x) / 2}
                          cy={(techPos.y + destPos.y) / 2}
                          r="12"
                          fill="#0F172A"
                          stroke="#38BDF8"
                          strokeWidth="1.5"
                        />
                        <text
                          x={(techPos.x + destPos.x) / 2}
                          y={(techPos.y + destPos.y) / 2 + 3}
                          textAnchor="middle"
                          fill="#38BDF8"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          ETA 18m
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}

              {/* Customer Job Pins */}
              {customers.map(c => {
                const pos = projectCoords(c.latitude, c.longitude);
                return (
                  <g
                    key={c.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer group"
                    onClick={() => showToast(`Site: ${c.name} (${c.area})`, 'info')}
                  >
                    <circle r="5" fill="#EF4444" />
                    <circle r="9" fill="none" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.6" />
                    <text
                      y="-10"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {c.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Technician Pins */}
              {technicians.map(t => {
                const pos = projectCoords(
                  t.currentLatitude || -1.286,
                  t.currentLongitude || 36.817
                );
                const isSelected = selectedTech?.id === t.id;

                const color =
                  t.activeStatus === 'on_job'
                    ? '#F59E0B'
                    : t.activeStatus === 'en_route'
                    ? '#38BDF8'
                    : '#10B981';

                return (
                  <g
                    key={t.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedTech(t)}
                    className="cursor-pointer"
                  >
                    {/* Radar Pulse animation if selected */}
                    {isSelected && (
                      <circle r="26" fill="url(#pulseGradient)" className="animate-ping" />
                    )}

                    {/* Outer marker ring */}
                    <circle r="14" fill="#0F172A" stroke={color} strokeWidth="2.5" />

                    {/* Inner vehicle glyph */}
                    <circle r="6" fill={color} />

                    {/* Label badge */}
                    <rect
                      x="-34"
                      y="-28"
                      width="68"
                      height="16"
                      rx="4"
                      fill="#0F172A"
                      stroke="#334155"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="-17"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {t.name.split(' ')[0]} ({t.vehicleReg})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Col: Selected Technician Telemetry & Check-In Log */}
        <div className="space-y-4">
          {selectedTech ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-sm text-teal-800">
                    {selectedTech.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedTech.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {selectedTech.specialization} • {selectedTech.vehicleReg}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    selectedTech.activeStatus === 'on_job'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedTech.activeStatus === 'en_route'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedTech.activeStatus.replace('_', ' ')}
                </span>
              </div>

              {/* Coordinates Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-semibold flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-teal-600" /> GPS Coordinates
                  </span>
                  <span className="font-mono text-slate-900 font-bold">
                    {selectedTech.currentLatitude?.toFixed(4) || '-1.2863'},{' '}
                    {selectedTech.currentLongitude?.toFixed(4) || '36.8172'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Last Location Ping</span>
                  <span>{new Date(selectedTech.lastLocationUpdate).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Telemetry Accuracy</span>
                  <span className="text-emerald-700 font-semibold">± 4 meters (Safaricom 5G)</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${selectedTech.phone}`}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  Call Field Phone
                </a>
                <a
                  href={`https://wa.me/${selectedTech.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold"
                >
                  WhatsApp Radio
                </a>
              </div>

              {/* Rating & Daily Metrics */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Customer Rating</div>
                  <div className="text-base font-black text-[#0F172A]">★ {selectedTech.rating}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Completed Jobs</div>
                  <div className="text-base font-black text-teal-600">
                    {selectedTech.completedJobsCount}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              Select a technician on the map to inspect live telemetry.
            </div>
          )}

          {/* All Technicians Roster */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Technician Fleet Overview
            </h4>
            <div className="space-y-1.5">
              {technicians.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTech(t)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                    selectedTech?.id === t.id
                      ? 'bg-teal-50/70 border-teal-300'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="text-[10px] text-slate-500">{t.vehicleReg}</div>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      t.activeStatus === 'on_job'
                        ? 'bg-amber-100 text-amber-800'
                        : t.activeStatus === 'en_route'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {t.activeStatus.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
