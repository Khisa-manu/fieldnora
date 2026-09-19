import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Wrench,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Job, Technician } from '../../types';

export const DispatchView: React.FC = () => {
  const { showToast, setActiveTab } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'timeline' | 'day'>('board');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      const [jList, tList] = await Promise.all([api.getJobs(), api.getTechnicians()]);
      setJobs(jList);
      setTechnicians(tList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReassign = async (jobId: string, technicianId: string) => {
    try {
      await api.updateJob(jobId, {
        assignedTechnicianIds: technicianId ? [technicianId] : [],
        status: technicianId ? 'assigned' : 'scheduled',
      });
      showToast('Job reassigned successfully', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reassign job', 'error');
    }
  };

  const handleStatusShift = async (jobId: string, status: Job['status']) => {
    try {
      await api.updateJob(jobId, { status });
      showToast(`Status updated to ${status.replace('_', ' ').toUpperCase()}`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Kanban Columns
  const columns: Array<{
    id: string;
    title: string;
    statuses: Job['status'][];
    color: string;
  }> = [
    {
      id: 'unassigned',
      title: 'Unassigned Queue',
      statuses: ['new', 'scheduled'],
      color: 'border-slate-300 bg-slate-50/50',
    },
    {
      id: 'assigned',
      title: 'Assigned / Ready',
      statuses: ['assigned'],
      color: 'border-purple-300 bg-purple-50/30',
    },
    {
      id: 'en_route',
      title: 'En Route (GPS)',
      statuses: ['en_route'],
      color: 'border-sky-300 bg-sky-50/30',
    },
    {
      id: 'in_progress',
      title: 'On Site / Working',
      statuses: ['on_site', 'in_progress'],
      color: 'border-teal-300 bg-teal-50/30',
    },
    {
      id: 'completed',
      title: 'Completed',
      statuses: ['completed'],
      color: 'border-emerald-300 bg-emerald-50/30',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Schedule & Dispatch Grid</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Kenyan field technician allocation, travel routing, conflict prevention & live queue.
          </p>
        </div>

        {/* View Switcher & Date Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'board' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500'
              }`}
            >
              Dispatch Board
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'timeline' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500'
              }`}
            >
              Tech Swimlanes
            </button>
          </div>

          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-teal-700 rounded-xl shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5" />
            Live Map
          </button>
        </div>
      </div>

      {/* Mode 1: Dispatch Kanban Board */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {columns.map(col => {
            const colJobs = jobs.filter(j => col.statuses.includes(j.status));

            return (
              <div
                key={col.id}
                className={`rounded-2xl border p-3.5 flex flex-col min-h-[500px] ${col.color}`}
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-900">{col.title}</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {colJobs.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colJobs.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 italic">
                      Empty queue
                    </div>
                  ) : (
                    colJobs.map(job => {
                      const assignedTech = technicians.find(t =>
                        job.assignedTechnicianIds.includes(t.id)
                      );

                      return (
                        <div
                          key={job.id}
                          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-800 text-[11px]">
                              {job.jobNumber}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
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

                          <h4 className="font-semibold text-slate-900 line-clamp-1">{job.title}</h4>

                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>
                                {job.scheduledDate} ({job.startTime})
                              </span>
                            </div>
                          </div>

                          {/* Tech Selector */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <select
                              value={assignedTech ? assignedTech.id : ''}
                              onChange={e => handleReassign(job.id, e.target.value)}
                              className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-slate-50 text-slate-700 outline-hidden flex-1 truncate"
                            >
                              <option value="">Unassigned</option>
                              {technicians.map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.vehicleReg})
                                </option>
                              ))}
                            </select>

                            {/* Quick Next State */}
                            {col.id === 'unassigned' && (
                              <button
                                onClick={() => handleStatusShift(job.id, 'assigned')}
                                title="Move to Assigned"
                                className="p-1 hover:bg-slate-100 text-slate-500 rounded"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id === 'assigned' && (
                              <button
                                onClick={() => handleStatusShift(job.id, 'en_route')}
                                title="Mark En Route"
                                className="p-1 hover:bg-sky-100 text-sky-600 rounded"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id === 'en_route' && (
                              <button
                                onClick={() => handleStatusShift(job.id, 'in_progress')}
                                title="Start Work"
                                className="p-1 hover:bg-teal-100 text-teal-600 rounded"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id === 'in_progress' && (
                              <button
                                onClick={() => handleStatusShift(job.id, 'completed')}
                                title="Complete"
                                className="p-1 hover:bg-emerald-100 text-emerald-600 rounded"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 2: Technician Swimlanes */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Technician Schedule & Conflict Detection
            </h3>
            <div className="text-xs text-slate-500">
              Showing field teams for: <strong className="text-slate-800">{selectedDate}</strong>
            </div>
          </div>

          <div className="space-y-4">
            {technicians.map(tech => {
              const techJobs = jobs.filter(j => j.assignedTechnicianIds.includes(tech.id));

              return (
                <div key={tech.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
                        {tech.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{tech.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {tech.specialization} • Vehicle: {tech.vehicleReg} • Phone: {tech.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        {techJobs.length} Assigned Jobs
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          tech.activeStatus === 'on_job'
                            ? 'bg-amber-100 text-amber-800'
                            : tech.activeStatus === 'en_route'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {tech.activeStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Jobs in Swimlane */}
                  {techJobs.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 bg-white rounded-lg border border-dashed border-slate-200">
                      No jobs assigned to {tech.name} today. Technician available for dispatch.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {techJobs.map(job => (
                        <div
                          key={job.id}
                          className="p-3 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-800">{job.jobNumber}</span>
                            <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded">
                              {job.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-900 line-clamp-1">{job.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Time: {job.startTime} - {job.endTime} ({job.estimatedDurationMinutes} mins)
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
