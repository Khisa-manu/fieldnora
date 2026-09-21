import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { OperationsMap } from './OperationsMap';
import {
  ClipboardList,
  Banknote,
  CreditCard,
  Users,
  MapPin,
  MoreVertical,
  ChevronDown,
  CheckCircle2,
  Clock,
  Navigation,
  Phone,
  Eye,
  ArrowRight,
  TrendingUp,
  X,
  ExternalLink
} from 'lucide-react';
import { Job, Technician, JobPriority, JobStatus } from '../../types';

interface WorkOrderItem {
  jobNumber: string;
  customerName: string;
  trade: string;
  status: 'en_route' | 'on_site' | 'in_progress' | 'scheduled' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timeAgo: string;
  scheduledTime: string;
  technicianName: string;
  technicianCode: string;
  techId: string;
  lat: number;
  lng: number;
  locationName: string;
}

export const DashboardView: React.FC = () => {
  const { setActiveTab, showToast, refreshAppData, setNewJobModalOpen } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeMenuJob, setActiveMenuJob] = useState<string | null>(null);
  const [detailModalJob, setDetailModalJob] = useState<WorkOrderItem | null>(null);
  const [focusedCoords, setFocusedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // The 14 Active Work Orders matching the screenshot PoL0f.jpg
  const [workOrders, setWorkOrders] = useState<WorkOrderItem[]>([
    {
      jobNumber: 'WO-24568',
      customerName: 'Britam Towers – Westlands',
      trade: 'Office AC Repair',
      status: 'en_route',
      priority: 'medium',
      timeAgo: '15:38 (22 min ago)',
      scheduledTime: '15:38',
      technicianName: 'John Mwangi',
      technicianCode: 'Tech 07',
      techId: 'tech-07',
      lat: -1.2650,
      lng: 36.8050,
      locationName: 'Parklands & Westlands',
    },
    {
      jobNumber: 'WO-24567',
      customerName: 'Safaricom Care Centre',
      trade: 'Generator Inspection',
      status: 'on_site',
      priority: 'high',
      timeAgo: '15:21 (39 min ago)',
      scheduledTime: '14:32',
      technicianName: 'David Kiprotich',
      technicianCode: 'Tech 03',
      techId: 'tech-03',
      lat: -1.3120,
      lng: 36.8200,
      locationName: 'Nairobi West',
    },
    {
      jobNumber: 'WO-24566',
      customerName: 'Garden City Mall',
      trade: 'Electrical Fault',
      status: 'in_progress',
      priority: 'medium',
      timeAgo: '14:57 (1 hr 3 min ago)',
      scheduledTime: '14:57',
      technicianName: 'Esther Wanjiku',
      technicianCode: 'Tech 11',
      techId: 'tech-11',
      lat: -1.2250,
      lng: 36.8850,
      locationName: 'Kasarani / Thika Rd',
    },
    {
      jobNumber: 'WO-24565',
      customerName: 'Delta Towers – Westlands',
      trade: 'Plumbing Leak',
      status: 'en_route',
      priority: 'low',
      timeAgo: '14:32 (1 hr 28 min ago)',
      scheduledTime: '14:32',
      technicianName: 'Michael Otieno',
      technicianCode: 'Tech 02',
      techId: 'tech-02',
      lat: -1.2640,
      lng: 36.8010,
      locationName: 'Westlands Commercial',
    },
    {
      jobNumber: 'WO-24564',
      customerName: 'Kitisuru Neighbourhood',
      trade: 'Water Heater Repair',
      status: 'in_progress',
      priority: 'high',
      timeAgo: '14:10 (1 hr 50 min ago)',
      scheduledTime: '14:30',
      technicianName: 'Peter Ndung\'u',
      technicianCode: 'Tech 08',
      techId: 'tech-08',
      lat: -1.2400,
      lng: 36.7650,
      locationName: 'Kitisuru Estate',
    },
    {
      jobNumber: 'WO-24563',
      customerName: 'Westgate Shopping Centre',
      trade: 'Fire Alarm Check',
      status: 'en_route',
      priority: 'low',
      timeAgo: '13:45 (2 hr 15 min ago)',
      scheduledTime: '14:35',
      technicianName: 'Alex Kamau',
      technicianCode: 'Tech 05',
      techId: 'tech-05',
      lat: -1.2620,
      lng: 36.8020,
      locationName: 'Westlands / Mwanzi Rd',
    },
    {
      jobNumber: 'WO-24562',
      customerName: 'Two Rivers Mall',
      trade: 'Chiller Plant Overhaul',
      status: 'in_progress',
      priority: 'high',
      timeAgo: '13:15 (2 hr 45 min ago)',
      scheduledTime: '13:30',
      technicianName: 'Brian Kiprop',
      technicianCode: 'Tech 01',
      techId: 'tech-01',
      lat: -1.2150,
      lng: 36.8020,
      locationName: 'Limuru Rd / Ruaka',
    },
    {
      jobNumber: 'WO-24561',
      customerName: 'Kilimani Crest Apartments',
      trade: 'Borehole Booster Pump',
      status: 'on_site',
      priority: 'urgent',
      timeAgo: '12:40 (3 hr 20 min ago)',
      scheduledTime: '12:45',
      technicianName: 'Samuel Chege',
      technicianCode: 'Tech 04',
      techId: 'tech-04',
      lat: -1.2915,
      lng: 36.7892,
      locationName: 'Kilimani',
    },
    {
      jobNumber: 'WO-24560',
      customerName: 'Nairobi Java Upper Hill',
      trade: 'Commercial Kitchen Hood',
      status: 'en_route',
      priority: 'medium',
      timeAgo: '12:10 (3 hr 50 min ago)',
      scheduledTime: '12:15',
      technicianName: 'Dennis Mutua',
      technicianCode: 'Tech 06',
      techId: 'tech-06',
      lat: -1.2950,
      lng: 36.8150,
      locationName: 'Upper Hill',
    },
    {
      jobNumber: 'WO-24559',
      customerName: 'Village Market',
      trade: 'Cold Room Compressor',
      status: 'in_progress',
      priority: 'high',
      timeAgo: '11:30 (4 hr 30 min ago)',
      scheduledTime: '11:30',
      technicianName: 'Faith Ndwiga',
      technicianCode: 'Tech 09',
      techId: 'tech-09',
      lat: -1.2280,
      lng: 36.8050,
      locationName: 'Gigiri',
    },
    {
      jobNumber: 'WO-24558',
      customerName: 'Yaya Centre',
      trade: 'Main Distribution Board Scan',
      status: 'on_site',
      priority: 'low',
      timeAgo: '11:00 (5 hr ago)',
      scheduledTime: '11:00',
      technicianName: 'Kevin Ochieng',
      technicianCode: 'Tech 10',
      techId: 'tech-10',
      lat: -1.2920,
      lng: 36.7880,
      locationName: 'Kilimani / Argwings Kodhek',
    },
    {
      jobNumber: 'WO-24557',
      customerName: 'Karen Country Club',
      trade: 'Solar Water Heater Circuit',
      status: 'en_route',
      priority: 'medium',
      timeAgo: '10:15 (5 hr 45 min ago)',
      scheduledTime: '10:30',
      technicianName: 'John Mwangi',
      technicianCode: 'Tech 07',
      techId: 'tech-07',
      lat: -1.3195,
      lng: 36.7062,
      locationName: 'Karen',
    },
    {
      jobNumber: 'WO-24556',
      customerName: 'Sarit Centre Westlands',
      trade: 'Hydraulic Freight Lift Check',
      status: 'scheduled',
      priority: 'medium',
      timeAgo: '09:30 (6 hr 30 min ago)',
      scheduledTime: '09:30',
      technicianName: 'David Kiprotich',
      technicianCode: 'Tech 03',
      techId: 'tech-03',
      lat: -1.2610,
      lng: 36.8040,
      locationName: 'Westlands',
    },
    {
      jobNumber: 'WO-24555',
      customerName: 'The Hub Karen',
      trade: 'Emergency Backup Inverter',
      status: 'scheduled',
      priority: 'high',
      timeAgo: '08:45 (7 hr 15 min ago)',
      scheduledTime: '08:45',
      technicianName: 'Michael Otieno',
      technicianCode: 'Tech 02',
      techId: 'tech-02',
      lat: -1.3180,
      lng: 36.7120,
      locationName: 'Karen',
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, techs] = await Promise.all([
        api.getDashboard(),
        api.getTechnicians(),
      ]);
      setStats(dash);
      setTechnicians(techs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (jobNum: string, newStatus: WorkOrderItem['status']) => {
    setWorkOrders(prev =>
      prev.map(j => (j.jobNumber === jobNum ? { ...j, status: newStatus } : j))
    );
    showToast(`Work Order ${jobNum} updated to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
    setActiveMenuJob(null);
  };

  const handlePinOnMap = (job: WorkOrderItem) => {
    setSelectedTechId(job.techId);
    setFocusedCoords({ lat: job.lat, lng: job.lng });
    showToast(`Focusing map on ${job.technicianCode} (${job.customerName})`, 'info');
    // Scroll smoothly to the map if table is far down
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered & Paginated Work Orders
  const filteredOrders = workOrders.filter(order => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'en_route') return order.status === 'en_route';
    if (statusFilter === 'on_site') return order.status === 'on_site';
    if (statusFilter === 'in_progress') return order.status === 'in_progress';
    if (statusFilter === 'high') return order.priority === 'high' || order.priority === 'urgent';
    if (statusFilter === 'medium') return order.priority === 'medium';
    if (statusFilter === 'low') return order.priority === 'low';
    return true;
  });

  const pageSize = 6;
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status: WorkOrderItem['status']) => {
    switch (status) {
      case 'en_route':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#0E1E36] text-[#60A5FA] border border-blue-900/50">
            en route
          </span>
        );
      case 'on_site':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#2B1D06] text-[#FBBF24] border border-amber-900/50">
            on site
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#082823] text-[#2DD4BF] border border-teal-900/50">
            in progress
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#16202C] text-slate-300 border border-slate-700/50">
            scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#0E281F] text-emerald-400 border border-emerald-900/50">
            completed
          </span>
        );
    }
  };

  const getPriorityDot = (priority: WorkOrderItem['priority']) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return (
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="capitalize">{priority}</span>
          </span>
        );
      case 'medium':
        return (
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Medium</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Low</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-100">
      {/* ------------------------------------------------------------- */}
      {/* TOP ROW: MAP (~68% width) + 4 METRIC CARDS (~32% width)        */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Interactive Operations Map (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col">
          <OperationsMap
            selectedTechId={selectedTechId}
            onSelectTech={id => setSelectedTechId(id)}
            focusedCoordinates={focusedCoords}
            className="flex-1 min-h-[360px] sm:min-h-[400px] lg:min-h-[420px]"
          />
        </div>

        {/* Right Column: 4 KPI Metric Cards vertically stacked (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3 sm:gap-3.5">
          {/* Card 1: Today's Jobs */}
          <div
            onClick={() => setActiveTab('jobs')}
            className="bg-[#0E1620] p-4 sm:p-4.5 rounded-2xl border border-[#1E293B] hover:border-teal-700/60 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-medium text-slate-400">Today&apos;s Jobs</span>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-1">14</div>
              <div className="text-xs text-slate-400 mt-0.5">6 Completed</div>
            </div>
            <div className="p-3 rounded-xl bg-[#092723] text-[#14B8A6] border border-teal-800/40 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          {/* Card 2: Revenue */}
          <div
            onClick={() => setActiveTab('payments')}
            className="bg-[#0E1620] p-4 sm:p-4.5 rounded-2xl border border-[#1E293B] hover:border-amber-700/60 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-medium text-slate-400">Revenue</span>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-1">KES 287,400</div>
              <div className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.4% vs yesterday</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#2A2007] text-[#F59E0B] border border-amber-800/40 group-hover:scale-105 transition-transform">
              <Banknote className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          {/* Card 3: Outstanding */}
          <div
            onClick={() => setActiveTab('invoices')}
            className="bg-[#0E1620] p-4 sm:p-4.5 rounded-2xl border border-[#1E293B] hover:border-indigo-700/60 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-medium text-slate-400">Outstanding</span>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-1">KES 94,200</div>
              <div className="text-xs text-slate-400 mt-0.5">12 Invoices</div>
            </div>
            <div className="p-3 rounded-xl bg-[#151B2E] text-[#818CF8] border border-indigo-800/40 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          {/* Card 4: Techs Active */}
          <div
            onClick={() => setActiveTab('technician')}
            className="bg-[#0E1620] p-4 sm:p-4.5 rounded-2xl border border-[#1E293B] hover:border-cyan-700/60 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-medium text-slate-400">Techs Active</span>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-1">8/11</div>
              <div className="text-xs text-slate-400 mt-0.5">73% utilization</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0B252E] text-[#06B6D4] border border-cyan-800/40 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM ROW: TODAY'S ACTIVE WORK ORDERS TABLE                   */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0E1620] border border-[#1E293B] rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Today&apos;s Active Work Orders
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#092723] text-[#14B8A6] border border-teal-800/50">
              14
            </span>
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setStatusFilterOpen(!statusFilterOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B1118] hover:bg-[#16202C] border border-[#1E293B] text-xs font-medium text-slate-300 transition-colors"
            >
              <span className="capitalize">
                {statusFilter === 'all'
                  ? 'All Status'
                  : statusFilter.replace('_', ' ')}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {statusFilterOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-[#111A24] border border-[#1E293B] rounded-xl shadow-2xl py-1 z-30 text-xs">
                {[
                  { id: 'all', label: 'All Status' },
                  { id: 'en_route', label: 'En Route' },
                  { id: 'on_site', label: 'On Site' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'high', label: 'High Priority' },
                  { id: 'medium', label: 'Medium Priority' },
                  { id: 'low', label: 'Low Priority' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setStatusFilter(opt.id);
                      setStatusFilterOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#16202C] transition-colors ${
                      statusFilter === opt.id
                        ? 'text-[#14B8A6] font-semibold bg-[#16202C]/60'
                        : 'text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Work Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0B1118]/60 text-slate-400 text-[11px] font-semibold tracking-wider uppercase">
                <th className="py-3 px-5">Job #</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Scheduled</th>
                <th className="py-3 px-5">Technician</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/60 text-slate-300 font-normal">
              {paginatedOrders.map(order => (
                <tr
                  key={order.jobNumber}
                  className="hover:bg-[#111A24] transition-colors group"
                >
                  {/* Job # */}
                  <td className="py-3.5 px-5 font-mono font-semibold text-slate-200">
                    <button
                      onClick={() => setDetailModalJob(order)}
                      className="hover:text-[#14B8A6] transition-colors text-left"
                    >
                      {order.jobNumber}
                    </button>
                  </td>

                  {/* Customer & Trade */}
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-white truncate max-w-[200px]">
                      {order.customerName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {order.trade}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* Priority Dot */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getPriorityDot(order.priority)}
                  </td>

                  {/* Time + Ago */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                    {order.timeAgo}
                  </td>

                  {/* Scheduled Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                    {order.scheduledTime}
                  </td>

                  {/* Technician */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <div className="font-semibold text-slate-200">{order.technicianName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{order.technicianCode}</div>
                  </td>

                  {/* Action Icons */}
                  <td className="py-3.5 px-5 whitespace-nowrap text-right relative">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Blue Map Location Pin button matching screenshot */}
                      <button
                        onClick={() => handlePinOnMap(order)}
                        className="p-1.5 rounded-lg bg-[#0E1E36] hover:bg-[#152E54] text-[#60A5FA] border border-blue-900/60 transition-colors"
                        title="Locate & Focus on Map"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>

                      {/* More Options Dropdown button */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuJob(
                              activeMenuJob === order.jobNumber ? null : order.jobNumber
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#16202C] transition-colors"
                          title="Actions"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuJob === order.jobNumber && (
                          <div className="absolute right-0 mt-1 w-44 bg-[#111A24] border border-[#1E293B] rounded-xl shadow-2xl py-1 z-30 text-left text-xs">
                            <button
                              onClick={() => {
                                setDetailModalJob(order);
                                setActiveMenuJob(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-[#16202C] hover:text-white"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#14B8A6]" />
                              <span>View Work Order</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.jobNumber, 'on_site')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-[#16202C] hover:text-amber-400"
                            >
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              <span>Mark On Site</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.jobNumber, 'in_progress')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-[#16202C] hover:text-teal-400"
                            >
                              <span className="w-2 h-2 rounded-full bg-teal-500" />
                              <span>Mark In Progress</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.jobNumber, 'completed')}
                              className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-[#16202C] hover:text-emerald-400"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Complete Order</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with exact pagination matching PoL0f.jpg */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-[#1E293B] bg-[#0B1118]/50 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{paginatedOrders.length}</span> of{' '}
            <span className="font-semibold text-slate-200">{filteredOrders.length}</span> active work orders
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto font-medium">
            {[1, 2, 3].map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                  currentPage === page
                    ? 'bg-[#14B8A6] text-white shadow-xs'
                    : 'bg-[#111A24] text-slate-400 hover:text-white hover:bg-[#16202C] border border-[#1E293B]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* WORK ORDER INSPECTOR MODAL                                    */}
      {/* ------------------------------------------------------------- */}
      {detailModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#111A24] border border-[#1E293B] rounded-2xl p-5 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <span className="font-mono text-[11px] text-[#14B8A6] font-bold">
                  {detailModalJob.jobNumber}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {detailModalJob.trade}
                </h3>
              </div>
              <button
                onClick={() => setDetailModalJob(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="bg-[#0B1118] p-3 rounded-xl border border-[#1E293B] space-y-1">
                <div className="text-[11px] text-slate-400">Client / Building</div>
                <div className="text-sm font-bold text-white">{detailModalJob.customerName}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#14B8A6]" />
                  <span>{detailModalJob.locationName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0B1118] p-2.5 rounded-xl border border-[#1E293B]">
                  <div className="text-[10px] text-slate-400">Current Status</div>
                  <div className="mt-1">{getStatusBadge(detailModalJob.status)}</div>
                </div>
                <div className="bg-[#0B1118] p-2.5 rounded-xl border border-[#1E293B]">
                  <div className="text-[10px] text-slate-400">Priority</div>
                  <div className="mt-1">{getPriorityDot(detailModalJob.priority)}</div>
                </div>
              </div>

              <div className="bg-[#0B1118] p-3 rounded-xl border border-[#1E293B] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Assigned Technician</div>
                  <div className="font-semibold text-white">{detailModalJob.technicianName}</div>
                  <div className="text-[10px] text-teal-400 font-mono">{detailModalJob.technicianCode}</div>
                </div>
                <button
                  onClick={() => {
                    handlePinOnMap(detailModalJob);
                    setDetailModalJob(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0D2E2B] text-[#14B8A6] border border-teal-800/40 hover:bg-[#14B8A6] hover:text-white transition-colors flex items-center gap-1.5 font-semibold"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Map Pin</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#1E293B]">
              <button
                onClick={() => {
                  handleUpdateStatus(detailModalJob.jobNumber, 'completed');
                  setDetailModalJob(null);
                }}
                className="flex-1 py-2 rounded-lg bg-[#0D9488] hover:bg-[#14B8A6] text-white font-semibold text-center transition-colors"
              >
                Mark Job Complete
              </button>
              <button
                onClick={() => setDetailModalJob(null)}
                className="px-4 py-2 rounded-lg bg-[#16202C] text-slate-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
