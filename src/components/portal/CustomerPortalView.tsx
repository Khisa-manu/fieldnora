import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Smartphone,
  CheckCircle2,
  Plus,
  Receipt,
  Wrench,
  ShieldCheck,
  CreditCard,
  User,
  ArrowRight,
  Sparkles,
  Navigation
} from 'lucide-react';
import { Customer, Job, Invoice, Technician } from '../../types';
import { ALL_SERVICES, SECTORS } from '../../data/serviceVerticals';

export const CustomerPortalView: React.FC = () => {
  const { showToast, currentOrg } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking request form
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState('plumbers');
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [bookingNotes, setBookingNotes] = useState('');

  // M-Pesa STK push for portal
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, jList, iList, tList] = await Promise.all([
        api.getCustomers(),
        api.getJobs(),
        api.getInvoices(),
        api.getTechnicians(),
      ]);
      setCustomers(cList);
      setJobs(jList);
      setInvoices(iList);
      setTechnicians(tList);
      if (cList.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(cList[0].id);
        setMpesaPhone(cList[0].phone);
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

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const customerJobs = jobs.filter(j => j.customerId === activeCustomer?.id);
  const customerInvoices = invoices.filter(i => i.customerId === activeCustomer?.id);

  const totalOutstanding = customerInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;

    try {
      await api.createJob({
        customerId: activeCustomer.id,
        title: `${serviceType} - Client Portal Request`,
        description: bookingNotes || 'Requested via customer self-service hub.',
        priority: 'medium',
        scheduledDate: preferredDate,
        startTime: '09:00',
        endTime: '11:00',
        assignedTechnicianIds: [],
        checklist: [{ id: 'chk-1', label: 'Initial Site Inspection & Diagnostics', completed: false }],
        materials: [],
        photos: [],
      });

      showToast('Service visit booked! Our dispatch team will confirm shortly.', 'success');
      setBookingModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Booking failed', 'error');
    }
  };

  const handlePortalMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    try {
      await api.triggerMpesaStkPush({
        invoiceId: payingInvoice.id,
        phoneNumber: mpesaPhone,
        amount: payingInvoice.balanceDue,
      });

      showToast(`M-Pesa STK Prompt dispatched to ${mpesaPhone}`, 'success');
      setPayingInvoice(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'M-Pesa error', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Customer Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] text-white p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold">Client Self-Service Experience</h1>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-semibold">
              External Facing View
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Branded customer portal for self-booking, invoice settlements, and live technician radar.
          </p>
        </div>

        {/* Customer Persona Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Viewing As Client:</label>
          <select
            value={selectedCustomerId}
            onChange={e => {
              setSelectedCustomerId(e.target.value);
              const cust = customers.find(c => c.id === e.target.value);
              if (cust) setMpesaPhone(cust.phone);
            }}
            className="text-xs bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 outline-hidden font-semibold"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeCustomer && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                Welcome to your client account
              </span>
              <h2 className="text-xl font-bold text-slate-900">{activeCustomer.name}</h2>
              <p className="text-xs text-slate-500">
                Service location: {activeCustomer.address} • {activeCustomer.area}, {activeCustomer.county}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Total Unpaid Invoices:</div>
                <div className="text-lg font-mono font-black text-amber-700">
                  KES {totalOutstanding.toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => setBookingModalOpen(true)}
                className="px-4 py-2 bg-[#14B8A6] hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Book Service Visit
              </button>
            </div>
          </div>

          {/* Active Job Alert Banner */}
          {customerJobs.some(j => j.status === 'en_route' || j.status === 'in_progress') && (
            <div className="p-4 bg-sky-950/20 border border-sky-300 rounded-2xl flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center animate-pulse">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sky-950 text-sm">
                    Technician En Route to Your Premises
                  </div>
                  <p className="text-sky-800">
                    Eng. Brian Kiprop is travelling with Toyota Hilux KDF 492P. Estimated arrival in 15 minutes.
                  </p>
                </div>
              </div>

              <span className="font-mono font-bold text-sky-900 bg-sky-100 px-3 py-1 rounded-full">
                LIVE ETA: 11:45 AM
              </span>
            </div>
          )}

          {/* Grid: Upcoming Work Orders & Invoices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Col: Service Visits */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-teal-600" />
                  Service Visits & Work Orders
                </h3>
                <span className="text-xs text-slate-500">{customerJobs.length} records</span>
              </div>

              <div className="space-y-3">
                {customerJobs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No scheduled service appointments.
                  </div>
                ) : (
                  customerJobs.map(job => (
                    <div
                      key={job.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{job.jobNumber}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="font-semibold text-slate-900">{job.title}</div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {job.scheduledDate} ({job.startTime} - {job.endTime})
                        </span>
                      </div>

                      {job.customerSignature && (
                        <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 pt-1 border-t border-slate-200">
                          <CheckCircle2 className="w-3 h-3" /> Digitally signed by customer on site
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Col: Invoices & M-Pesa Settlement */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-teal-600" />
                  Tax Invoices & M-Pesa Paybill
                </h3>
                <span className="text-xs text-slate-500">{customerInvoices.length} invoices</span>
              </div>

              <div className="space-y-3">
                {customerInvoices.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No billing statements issued yet.
                  </div>
                ) : (
                  customerInvoices.map(inv => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-600">
                        <span>Total Invoice: KES {inv.totalAmount.toLocaleString()}</span>
                        <span className="font-mono font-bold text-slate-900">
                          Balance: KES {inv.balanceDue.toLocaleString()}
                        </span>
                      </div>

                      {inv.balanceDue > 0 ? (
                        <button
                          onClick={() => {
                            setPayingInvoice(inv);
                            setMpesaPhone(activeCustomer.phone);
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          Pay KES {inv.balanceDue.toLocaleString()} via Lipa Na M-Pesa
                        </button>
                      ) : (
                        <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1 bg-emerald-50 py-1.5 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Fully Settled
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Visit Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900">Request Service Appointment</h3>
            <p className="text-slate-500">
              Our dispatch office will schedule a certified technician to your site.
            </p>

            <form onSubmit={handleCreateBooking} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Service / Trade Vertical
                </label>
                <select
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden text-xs bg-white font-medium"
                >
                  {SECTORS.map(sec => (
                    <optgroup key={sec} label={sec}>
                      {ALL_SERVICES.filter(s => s.sector === sec).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} (Est. Callout: KES {s.standardCalloutKes.toLocaleString()})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {(() => {
                  const sObj = ALL_SERVICES.find(s => s.id === serviceType);
                  if (!sObj) return null;
                  return (
                    <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600 flex items-center justify-between">
                      <span>{sObj.description}</span>
                      <span className="font-bold text-teal-800 shrink-0 ml-2">
                        KES {sObj.standardHourlyRateKes.toLocaleString()}/hr
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                >
                </input>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Problem Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue at your premises..."
                  value={bookingNotes}
                  onChange={e => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="px-4 py-2 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14B8A6] text-white font-bold rounded-lg shadow-xs"
                >
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Portal M-Pesa STK Prompt Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              Lipa Na M-Pesa: {payingInvoice.invoiceNumber}
            </h3>
            <p className="text-slate-500">
              Amount to pay:{' '}
              <strong className="text-slate-900 font-mono">
                KES {payingInvoice.balanceDue.toLocaleString()}
              </strong>
            </p>

            <form onSubmit={handlePortalMpesa} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  M-Pesa Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={mpesaPhone}
                  onChange={e => setMpesaPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-3 py-1.5 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-xs"
                >
                  Send STK Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
