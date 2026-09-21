import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Customer, Technician, JobPriority, JobStatus } from '../../types';
import { X, Plus, Wrench, MapPin, Calendar, Clock, User, ShieldCheck } from 'lucide-react';

interface NewWorkOrderModalProps {
  onJobCreated?: () => void;
}

export const NewWorkOrderModal: React.FC<NewWorkOrderModalProps> = ({ onJobCreated }) => {
  const { newJobModalOpen, setNewJobModalOpen, showToast, refreshAppData } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [title, setTitle] = useState('');
  const [trade, setTrade] = useState('HVAC & Air Conditioning');
  const [locationName, setLocationName] = useState('Westlands Commercial');
  const [priority, setPriority] = useState<JobPriority>('medium');
  const [status, setStatus] = useState<JobStatus>('en_route');
  const [assignedTechId, setAssignedTechId] = useState('tech-07');
  const [scheduledTime, setScheduledTime] = useState('15:30');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (newJobModalOpen) {
      loadFormData();
    }
  }, [newJobModalOpen]);

  const loadFormData = async () => {
    try {
      const [cList, tList] = await Promise.all([
        api.getCustomers(),
        api.getTechnicians(),
      ]);
      setCustomers(cList);
      setTechnicians(tList);
      if (tList.length > 0 && !assignedTechId) {
        setAssignedTechId(tList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!newJobModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !customerName.trim()) {
      showToast('Please provide both Customer name and Work Order title', 'error');
      return;
    }

    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const randomJobNum = `WO-${Math.floor(24570 + Math.random() * 500)}`;

      await api.createJob({
        jobNumber: randomJobNum,
        title: title.trim(),
        description: `${trade}: ${title.trim()}. Site: ${locationName}. Notes: ${notes || 'Standard callout'}`,
        priority,
        status,
        assignedTechnicianIds: assignedTechId ? [assignedTechId] : [],
        scheduledDate: todayStr,
        startTime: scheduledTime,
        endTime: '17:30',
        estimatedDurationMin: 120,
        labour: [
          {
            id: 'labour-01',
            technicianId: assignedTechId || 'tech-07',
            description: `${trade} - Diagnostic & Repair`,
            hours: 2,
            hourlyRate: 2500,
            total: 5000,
          },
        ],
        materials: [
          {
            id: 'mat-01',
            name: 'Consumable hardware & gasket kit',
            quantity: 1,
            unitPrice: 3500,
            total: 3500,
          },
        ],
      });

      showToast(`Work Order ${randomJobNum} dispatched successfully!`, 'success');
      setNewJobModalOpen(false);
      setTitle('');
      setCustomerName('');
      setNotes('');
      await refreshAppData();
      if (onJobCreated) onJobCreated();
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch work order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#111A24] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0E1620]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#0D2E2B] text-[#14B8A6] border border-teal-800/40">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Dispatch New Work Order
              </h2>
              <p className="text-xs text-slate-400">
                Create and allocate emergency or scheduled field work
              </p>
            </div>
          </div>
          <button
            onClick={() => setNewJobModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Customer & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Client / Facility Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. Britam Towers – Westlands"
                className="w-full px-3 py-2 rounded-lg bg-[#0B1118] border border-[#1E293B] text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#14B8A6]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Site Location / Area
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  placeholder="e.g. Westlands, Waiyaki Way"
                  className="w-full px-3 py-2 pl-8 rounded-lg bg-[#0B1118] border border-[#1E293B] text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#14B8A6]"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Title & Service Trade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Job Title / Scope *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Office AC Repair"
                className="w-full px-3 py-2 rounded-lg bg-[#0B1118] border border-[#1E293B] text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#14B8A6]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Service Trade
              </label>
              <select
                value={trade}
                onChange={e => setTrade(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B1118] border border-[#1E293B] text-slate-100 focus:outline-hidden focus:border-[#14B8A6]"
              >
                <option value="HVAC & Air Conditioning">HVAC & Air Conditioning</option>
                <option value="Electrical Systems & Generator">Electrical Systems & Generator</option>
                <option value="Plumbing & Drainage">Plumbing & Drainage</option>
                <option value="Solar & Renewable Energy">Solar & Renewable Energy</option>
                <option value="Fire Alarm & Safety">Fire Alarm & Safety</option>
                <option value="General Diagnostics">General Diagnostics</option>
              </select>
            </div>
          </div>

          {/* Technician & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Assign Technician
              </label>
              <select
                value={assignedTechId}
                onChange={e => setAssignedTechId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B1118] border border-[#1E293B] text-slate-100 focus:outline-hidden focus:border-[#14B8A6]"
              >
                <option value="tech-07">John Mwangi (Tech 07) – Westlands</option>
                <option value="tech-03">David Kiprotich (Tech 03) – Nairobi West</option>
                <option value="tech-11">Esther Wanjiku (Tech 11) – Kasarani</option>
                <option value="tech-02">Michael Otieno (Tech 02) – Kilimani</option>
                <option value="tech-08">Peter Ndung'u (Tech 08) – Kitisuru</option>
                <option value="tech-05">Alex Kamau (Tech 05) – Parklands</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} – {t.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Dispatch Priority
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high', 'urgent'] as JobPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-semibold uppercase text-[10px] tracking-wide border transition-all ${
                      priority === p
                        ? p === 'urgent' || p === 'high'
                          ? 'bg-rose-950/70 border-rose-600 text-rose-300'
                          : 'bg-teal-950/70 border-teal-600 text-teal-300'
                        : 'bg-[#0B1118] border-[#1E293B] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Initial Status & Scheduled Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B1118] border border-[#1E293B] text-slate-100 focus:outline-hidden focus:border-[#14B8A6]"
              >
                <option value="en_route">En Route</option>
                <option value="on_site">On Site</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Dispatch Target Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0B1118] border border-[#1E293B] text-slate-100 focus:outline-hidden focus:border-[#14B8A6]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Field Technician Instructions / Fault Symptoms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Inspect condenser coils, test 3-phase compressor current draw, bring R410A canister."
              className="w-full px-3 py-2 rounded-lg bg-[#0B1118] border border-[#1E293B] text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#14B8A6] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => setNewJobModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#16202C] hover:bg-[#1E293B] text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#0D9488] hover:bg-[#14B8A6] active:bg-[#0F766E] text-white font-semibold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Dispatching...' : 'Confirm & Dispatch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
