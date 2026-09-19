import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  User,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Camera,
  FileCheck,
  Receipt,
  CheckSquare,
  Navigation,
  Play,
  Pause,
  Upload,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Job, Customer, Technician, ProductInventory } from '../../types';
import { ALL_SERVICES, SECTORS } from '../../data/serviceVerticals';
import { SignaturePad } from '../common/SignaturePad';

export const JobsView: React.FC = () => {
  const { showToast, setActiveTab, setTechnicianViewMode } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Job for Dossier / Modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);

  // New Job Form State
  const [newJobData, setNewJobData] = useState<{
    customerId: string;
    title: string;
    description: string;
    priority: Job['priority'];
    scheduledDate: string;
    startTime: string;
    endTime: string;
    estimatedDurationMinutes: number;
    technicianId: string;
    checklistItems: string;
  }>({
    customerId: '',
    title: '',
    description: '',
    priority: 'medium',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    estimatedDurationMinutes: 120,
    technicianId: '',
    checklistItems: 'Site inspection completed\nTurned off mains switch\nInstalled replacement parts\nSystem test performed',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [jList, cList, tList, pList] = await Promise.all([
        api.getJobs(),
        api.getCustomers(),
        api.getTechnicians(),
        api.getProducts(),
      ]);
      setJobs(jList);
      setCustomers(cList);
      setTechnicians(tList);
      setProducts(pList);
      if (cList.length > 0 && !newJobData.customerId) {
        setNewJobData(prev => ({ ...prev, customerId: cList[0].id }));
      }
      if (tList.length > 0 && !newJobData.technicianId) {
        setNewJobData(prev => ({ ...prev, technicianId: tList[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (jobId: string, status: Job['status']) => {
    try {
      const updated = await api.updateJob(jobId, { status });
      setJobs(prev => prev.map(j => (j.id === jobId ? updated : j)));
      if (selectedJob?.id === jobId) {
        setSelectedJob(updated);
      }
      showToast(`Job status updated to ${status.replace('_', ' ').toUpperCase()}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update job status', 'error');
    }
  };

  const handleToggleChecklist = async (job: Job, itemId: string) => {
    const updatedChecklist = job.checklist.map(item =>
      item.id === itemId
        ? {
            ...item,
            completed: !item.completed,
            completedAt: !item.completed ? new Date().toISOString() : undefined,
          }
        : item
    );

    try {
      const updated = await api.updateJob(job.id, { checklist: updatedChecklist });
      setSelectedJob(updated);
      setJobs(prev => prev.map(j => (j.id === job.id ? updated : j)));
    } catch (err: any) {
      showToast(err.message || 'Failed to update checklist item', 'error');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobData.customerId || !newJobData.title) {
      showToast('Please select a customer and provide a job title', 'error');
      return;
    }

    const checklist = newJobData.checklistItems
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean)
      .map((label, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        label,
        completed: false,
      }));

    try {
      const created = await api.createJob({
        customerId: newJobData.customerId,
        title: newJobData.title,
        description: newJobData.description,
        priority: newJobData.priority,
        scheduledDate: newJobData.scheduledDate,
        startTime: newJobData.startTime,
        endTime: newJobData.endTime,
        estimatedDurationMinutes: Number(newJobData.estimatedDurationMinutes),
        assignedTechnicianIds: newJobData.technicianId ? [newJobData.technicianId] : [],
        checklist,
        status: newJobData.technicianId ? 'assigned' : 'scheduled',
      });
      showToast(`Work order ${created.jobNumber} created!`, 'success');
      setCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create job', 'error');
    }
  };

  const handleSaveSignature = async (dataUrl: string) => {
    if (!selectedJob) return;
    try {
      const updated = await api.saveSignature(selectedJob.id, {
        signerName: 'Customer Representative',
        dataUrl,
        customerAcceptedNotes: 'Customer reviewed completed work and confirmed satisfaction on-site.',
      });
      setSelectedJob(updated);
      setJobs(prev => prev.map(j => (j.id === selectedJob.id ? updated : j)));
      setSignatureModalOpen(false);
      showToast('Customer digital signature saved to work order', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save signature', 'error');
    }
  };

  const handleSimulatePhotoUpload = async (phase: 'before' | 'during' | 'after') => {
    if (!selectedJob) return;
    const samplePhotos = {
      before: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      during: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
      after: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    };

    try {
      const updated = await api.addJobPhoto(selectedJob.id, {
        url: samplePhotos[phase],
        caption: `Site inspection snapshot (${phase.toUpperCase()})`,
        phase,
        latitude: -1.286389,
        longitude: 36.817223,
      });
      setSelectedJob(updated);
      setJobs(prev => prev.map(j => (j.id === selectedJob.id ? updated : j)));
      showToast(`Added ${phase.toUpperCase()} field photo with GPS timestamp`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to attach photo', 'error');
    }
  };

  const handleConvertToInvoice = async (job: Job) => {
    try {
      const totalLabour = job.labour.reduce(
        (sum, l) => sum + (l.total ?? l.totalPrice ?? l.hours * l.hourlyRate),
        0
      );
      const totalMaterials = job.materials.reduce(
        (sum, m) => sum + (m.total ?? m.totalPrice ?? m.quantity * m.unitPrice),
        0
      );
      const subtotal = totalLabour + totalMaterials || 15000;
      const taxAmount = Math.round(subtotal * 0.16);
      const totalAmount = subtotal + taxAmount;

      await api.createInvoice({
        customerId: job.customerId,
        jobId: job.id,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        items: [
          ...job.labour.map(l => ({
            id: l.id,
            description: l.description,
            quantity: l.hours,
            unitPrice: l.hourlyRate,
            total: l.total ?? l.totalPrice ?? l.hours * l.hourlyRate,
            discount: 0,
            type: 'labour' as const,
          })),
          ...job.materials.map(m => ({
            id: m.id,
            description: m.name,
            quantity: m.quantity,
            unitPrice: m.unitPrice,
            total: m.total ?? m.totalPrice ?? m.quantity * m.unitPrice,
            discount: 0,
            type: 'material' as const,
          })),
        ],
        subtotal,
        taxAmount,
        totalAmount,
        balanceDue: totalAmount,
        notes: `Auto-generated from work order ${job.jobNumber}. Validated against eTIMS VAT regulations.`,
      });
      showToast(`Invoice generated from Job ${job.jobNumber}!`, 'success');
      setActiveTab('invoices');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate invoice', 'error');
    }
  };

  // Status progression stages
  const statusStages: Job['status'][] = [
    'new',
    'scheduled',
    'assigned',
    'en_route',
    'on_site',
    'in_progress',
    'completed',
  ];

  const filteredJobs = jobs.filter(j => {
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || j.priority === priorityFilter;
    const matchesQuery =
      j.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Jobs & Work Orders</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Full lifecycle dispatch, checklists, field photos, labour & parts consumption.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Work Order
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Status Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'en_route', label: 'En Route' },
            { id: 'on_site', label: 'On Site' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#0F172A] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Priority Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by job #, title, description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-[#14B8A6]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid / List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading work orders...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No work orders found with current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map(job => {
            const customer = customers.find(c => c.id === job.customerId);
            const assignedTechs = technicians.filter(t => job.assignedTechnicianIds.includes(t.id));

            return (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedJob(job);
                  setJobModalOpen(true);
                }}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400/80 p-4.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                        {job.jobNumber}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          job.priority === 'urgent'
                            ? 'bg-red-100 text-red-800'
                            : job.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {job.priority}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        job.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : job.status === 'in_progress'
                          ? 'bg-teal-100 text-teal-800'
                          : job.status === 'en_route'
                          ? 'bg-sky-100 text-sky-800 animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A] mt-2 line-clamp-1">{job.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{customer ? customer.name : 'Unknown Customer'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {job.scheduledDate} ({job.startTime} - {job.endTime})
                      </span>
                    </div>

                    {assignedTechs.length > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Wrench className="w-3.5 h-3.5 text-teal-600" />
                        <span>
                          {assignedTechs.map(t => `${t.name} (${t.vehicleReg})`).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span>{job.checklist.filter(c => c.completed).length}/{job.checklist.length} checklist</span>
                    <span>•</span>
                    <span>{job.photos.length} photos</span>
                  </div>

                  <span className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-0.5">
                    Open Dossier <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Work Order Dossier Drawer / Modal */}
      {selectedJob && jobModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setJobModalOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-3xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      {selectedJob.jobNumber}
                    </span>
                    <h3 className="text-base font-bold text-[#0F172A]">{selectedJob.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scheduled: {selectedJob.scheduledDate} • Priority: {selectedJob.priority.toUpperCase()}
                  </p>
                </div>

                <button
                  onClick={() => setJobModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                {/* Status Progression Pipeline */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Job Progression Pipeline
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                    {statusStages.map((st, i) => {
                      const isCurrent = selectedJob.status === st;
                      const isPast = statusStages.indexOf(selectedJob.status) > i;

                      return (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(selectedJob.id, st)}
                          className={`px-2 py-2 rounded-lg text-center font-bold text-[10px] uppercase tracking-wider transition-all border ${
                            isCurrent
                              ? 'bg-[#14B8A6] text-white border-[#14B8A6] shadow-2xs scale-105'
                              : isPast
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Technician Mobile Mode Link & Convert to Invoice */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-teal-900">Field Operations Actions</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setJobModalOpen(false);
                        setTechnicianViewMode(true);
                        setActiveTab('technician');
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Open in Mobile Tech App
                    </button>
                    <button
                      onClick={() => handleConvertToInvoice(selectedJob)}
                      className="px-3 py-1.5 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-teal-700 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Convert to Invoice
                    </button>
                  </div>
                </div>

                {/* Job Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                      Standard Operating Checklist ({selectedJob.checklist.length})
                    </h4>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedJob.checklist.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleChecklist(selectedJob, item.id)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 cursor-pointer hover:border-teal-400 transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            item.completed
                              ? 'bg-teal-600 border-teal-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span
                          className={`font-medium ${
                            item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Field Photos & Evidence */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-sky-600" />
                      Field Photos Gallery ({selectedJob.photos.length})
                    </h4>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSimulatePhotoUpload('before')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-[11px] text-slate-700"
                      >
                        + Before Photo
                      </button>
                      <button
                        onClick={() => handleSimulatePhotoUpload('after')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 rounded font-semibold text-[11px] text-emerald-800"
                      >
                        + After Photo
                      </button>
                    </div>
                  </div>

                  {selectedJob.photos.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400">
                      No photos uploaded yet for this site.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedJob.photos.map(p => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50"
                        >
                          <img
                            src={p.url}
                            alt={p.caption}
                            referrerPolicy="no-referrer"
                            className="w-full h-28 object-cover"
                          />
                          <div className="p-2">
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              {p.phase}
                            </span>
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                              {p.caption}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Customer Signature Proof */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Client Sign-Off & Acceptance
                    </h4>
                    {!selectedJob.customerSignature && (
                      <button
                        onClick={() => setSignatureModalOpen(true)}
                        className="px-2.5 py-1 bg-[#14B8A6] text-white rounded font-semibold text-xs"
                      >
                        Capture Digital Signature
                      </button>
                    )}
                  </div>

                  {selectedJob.customerSignature ? (
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
                        <span>Signed by: {selectedJob.customerSignature.signerName}</span>
                        <span>
                          {new Date(selectedJob.customerSignature.signedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-200 max-w-xs">
                        <img
                          src={selectedJob.customerSignature.signatureDataUrl}
                          alt="Signature Proof"
                          className="h-16 w-auto"
                        />
                      </div>
                      {selectedJob.customerSignature.customerAcceptedNotes && (
                        <p className="text-[11px] text-emerald-800">
                          &ldquo;{selectedJob.customerSignature.customerAcceptedNotes}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl text-slate-400">
                      Work order awaits customer verification and sign-off.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Canvas Modal */}
      {signatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg">
            <SignaturePad
              onSave={handleSaveSignature}
              onCancel={() => setSignatureModalOpen(false)}
              signerTitle="Customer Work Order Acceptance Sign-Off"
            />
          </div>
        </div>
      )}

      {/* Create Work Order Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">Create Work Order</h3>
            <p className="text-xs text-slate-500 mb-4">
              Schedule service call, allocate technician, and set checklists.
            </p>

            <form onSubmit={handleCreateJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Client</label>
                <select
                  value={newJobData.customerId}
                  onChange={e => setNewJobData({ ...newJobData, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Load Standard Kenyan Trade Vertical (Optional Quick-Fill)
                </label>
                <select
                  defaultValue=""
                  onChange={e => {
                    const svc = ALL_SERVICES.find(s => s.id === e.target.value);
                    if (!svc) return;
                    setNewJobData(prev => ({
                      ...prev,
                      title: `${svc.name} - Service & Inspection`,
                      description: svc.description,
                      checklistItems: svc.defaultChecklist.join('\n'),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-teal-300 bg-teal-50/50 rounded-lg outline-hidden text-xs text-teal-900 font-medium"
                >
                  <option value="">-- Select from 81 Kenyan Trades (e.g. Mama Fua, Solar, Borehole...) --</option>
                  {SECTORS.map(sec => (
                    <optgroup key={sec} label={sec}>
                      {ALL_SERVICES.filter(s => s.sector === sec).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} (KES {s.standardCalloutKes.toLocaleString()} callout)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Order Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial VRF Air Conditioning Servicing"
                  value={newJobData.title}
                  onChange={e => setNewJobData({ ...newJobData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scope of Work & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Describe fault symptoms, client instructions, materials needed..."
                  value={newJobData.description}
                  onChange={e => setNewJobData({ ...newJobData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newJobData.priority}
                    onChange={e => setNewJobData({ ...newJobData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={newJobData.scheduledDate}
                    onChange={e => setNewJobData({ ...newJobData, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newJobData.startTime}
                    onChange={e => setNewJobData({ ...newJobData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newJobData.endTime}
                    onChange={e => setNewJobData({ ...newJobData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Lead Technician</label>
                <select
                  value={newJobData.technicianId}
                  onChange={e => setNewJobData({ ...newJobData, technicianId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                >
                  <option value="">Unassigned (Send to Queue)</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialization}) - {t.vehicleReg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  On-Site Checklist Items (one per line)
                </label>
                <textarea
                  rows={3}
                  value={newJobData.checklistItems}
                  onChange={e => setNewJobData({ ...newJobData, checklistItems: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-lg shadow-xs"
                >
                  Create & Schedule Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
