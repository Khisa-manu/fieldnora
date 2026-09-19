import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Users,
  Wrench,
  ArrowUpRight,
  MapPin,
  Calendar,
  ChevronRight,
  TrendingUp,
  Activity,
  Play,
  Navigation
} from 'lucide-react';
import { Job, AuditLog, Technician } from '../../types';

export const DashboardView: React.FC = () => {
  const { setActiveTab, setTechnicianViewMode, showToast, refreshAppData } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setStats(data);
      const techs = await api.getTechnicians();
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

  const handleQuickJobStatus = async (jobId: string, newStatus: Job['status']) => {
    try {
      await api.updateJob(jobId, { status: newStatus });
      showToast(`Job updated to ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
      await loadData();
      await refreshAppData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update job', 'error');
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading live Kenyan operations dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A]">Operations Center</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 text-teal-800">
              Live DB
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time field dispatch, job progression, and Kenyan payment flows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dispatch')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            <Calendar className="w-4 h-4 text-slate-600" />
            Dispatch Board
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-xl shadow-xs transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            + New Work Order
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Jobs */}
        <div
          onClick={() => setActiveTab('jobs')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-teal-400/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Today&apos;s Jobs</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">{stats.todayJobsCount}</span>
            <span className="text-[11px] text-teal-600 font-medium">scheduled</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {stats.inProgressJobsCount} in progress • {stats.completedJobsCount} completed
          </div>
        </div>

        {/* Revenue Collected */}
        <div
          onClick={() => setActiveTab('payments')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-emerald-400/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Revenue (KES)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#0F172A]">
              KES {stats.totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            M-Pesa & Bank Receipts
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div
          onClick={() => setActiveTab('invoices')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-amber-400/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Outstanding Balance</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#0F172A]">
              KES {stats.outstandingPayments.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {stats.overdueInvoicesCount} overdue invoices
          </div>
        </div>

        {/* Active Technicians */}
        <div
          onClick={() => setActiveTab('map')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-sky-400/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Technicians in Field</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0F172A]">{stats.activeTechniciansCount}</span>
            <span className="text-[11px] text-slate-500">/ {stats.totalTechniciansCount} active</span>
          </div>
          <div className="mt-2 text-[11px] text-sky-600 font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Nairobi GPS Tracking Active
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Jobs Feed & Technician Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Active Work Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-teal-600" />
              <h2 className="text-sm font-bold text-[#0F172A]">Today&apos;s Active Work Orders</h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {stats.todayJobs.length} today
              </span>
            </div>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-0.5"
            >
              View All Jobs <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.todayJobs.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500">No work orders scheduled specifically for today.</p>
              <button
                onClick={() => setActiveTab('jobs')}
                className="mt-2 text-xs text-teal-600 font-semibold"
              >
                Schedule a job now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.todayJobs.map((job: Job) => {
                const statusColors: Record<string, string> = {
                  new: 'bg-slate-100 text-slate-700',
                  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
                  assigned: 'bg-purple-50 text-purple-700 border-purple-200',
                  en_route: 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse',
                  on_site: 'bg-amber-50 text-amber-800 border-amber-200',
                  in_progress: 'bg-teal-50 text-teal-800 border-teal-200',
                  completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  cancelled: 'bg-red-50 text-red-700 border-red-200',
                };

                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-teal-300 transition-all bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{job.jobNumber}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                              statusColors[job.status] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {job.status.replace('_', ' ')}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              job.priority === 'urgent'
                                ? 'bg-red-100 text-red-800'
                                : job.priority === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {job.priority}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#0F172A] mt-1">{job.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded">
                          {job.startTime} - {job.endTime}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{job.description}</p>

                    {/* Action Bar */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          Labour: <strong className="text-slate-800">{job.labour.length} items</strong>
                        </span>
                        <span>
                          Materials: <strong className="text-slate-800">{job.materials.length} items</strong>
                        </span>
                        {job.customerSignature && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Signed
                          </span>
                        )}
                      </div>

                      {/* Quick Status Shift buttons */}
                      <div className="flex items-center gap-1.5">
                        {job.status === 'scheduled' && (
                          <button
                            onClick={() => handleQuickJobStatus(job.id, 'en_route')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors"
                          >
                            <Navigation className="w-3 h-3" /> Mark En Route
                          </button>
                        )}
                        {job.status === 'en_route' && (
                          <button
                            onClick={() => handleQuickJobStatus(job.id, 'on_site')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                          >
                            <MapPin className="w-3 h-3" /> Check In (On Site)
                          </button>
                        )}
                        {(job.status === 'on_site' || job.status === 'assigned') && (
                          <button
                            onClick={() => handleQuickJobStatus(job.id, 'in_progress')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors"
                          >
                            <Play className="w-3 h-3" /> Start Job
                          </button>
                        )}
                        {job.status === 'in_progress' && (
                          <button
                            onClick={() => handleQuickJobStatus(job.id, 'completed')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Complete Job
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveTab('technician');
                            setTechnicianViewMode(true);
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                        >
                          Tech View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Live Field Technicians & Kenyan Activity Feed */}
        <div className="space-y-6">
          {/* Field Technicians Status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-[#0F172A]">Technician Deployment</h3>
              </div>
              <button
                onClick={() => setActiveTab('map')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
              >
                Map <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {technicians.map(tech => (
                <div
                  key={tech.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                        {tech.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          tech.activeStatus === 'on_job'
                            ? 'bg-amber-500'
                            : tech.activeStatus === 'en_route'
                            ? 'bg-sky-500 animate-ping'
                            : tech.activeStatus === 'available'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{tech.name}</div>
                      <div className="text-[10px] text-slate-500">{tech.vehicleReg} • {tech.specialization.split('&')[0]}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      tech.activeStatus === 'on_job'
                        ? 'bg-amber-50 text-amber-800'
                        : tech.activeStatus === 'en_route'
                        ? 'bg-sky-50 text-sky-800'
                        : tech.activeStatus === 'available'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tech.activeStatus.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-[#0F172A]">Real-Time Audit Trail</h3>
              </div>
              <button
                onClick={() => setActiveTab('audit')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                All Logs
              </button>
            </div>

            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((log: AuditLog) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-900">{log.userName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      <span className="font-mono text-[10px] text-teal-700 uppercase">{log.action}</span> on {log.entity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
