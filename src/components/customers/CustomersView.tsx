import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Briefcase,
  Receipt,
  FileText,
  CreditCard,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  Filter,
  Check
} from 'lucide-react';
import { Customer, Job, Estimate, Invoice, Payment, ServiceLocation } from '../../types';

export const CustomersView: React.FC = () => {
  const { showToast, setActiveTab } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  // Customer Detail Drawer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<{
    jobs: Job[];
    estimates: Estimate[];
    invoices: Invoice[];
    payments: Payment[];
  } | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<{
    type: 'individual' | 'company';
    name: string;
    companyName: string;
    phone: string;
    email: string;
    address: string;
    county: string;
    area: string;
    latitude: number;
    longitude: number;
    notes: string;
    tagsInput: string;
  }>({
    type: 'company',
    name: '',
    companyName: '',
    phone: '+254 ',
    email: '',
    address: '',
    county: 'Nairobi',
    area: '',
    latitude: -1.286389,
    longitude: 36.817223,
    notes: '',
    tagsInput: '',
  });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openCustomerDetail = async (cust: Customer) => {
    setSelectedCustomer(cust);
    setHistoryLoading(true);
    try {
      const details = await api.getCustomerById(cust.id);
      setCustomerHistory({
        jobs: details.jobs,
        estimates: details.estimates,
        invoices: details.invoices,
        payments: details.payments,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenCreateModal = (cust?: Customer) => {
    if (cust) {
      setEditingCustomer(cust);
      setFormData({
        type: cust.type,
        name: cust.name,
        companyName: cust.companyName || '',
        phone: cust.phone,
        email: cust.email,
        address: cust.address,
        county: cust.county,
        area: cust.area,
        latitude: cust.latitude,
        longitude: cust.longitude,
        notes: cust.notes,
        tagsInput: cust.tags.join(', '),
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        type: 'company',
        name: '',
        companyName: '',
        phone: '+254 ',
        email: '',
        address: '',
        county: 'Nairobi',
        area: '',
        latitude: -1.286389,
        longitude: 36.817223,
        notes: '',
        tagsInput: '',
      });
    }
    setModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      type: formData.type,
      name: formData.name,
      companyName: formData.type === 'company' ? formData.companyName : undefined,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      county: formData.county,
      area: formData.area || 'Central',
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      notes: formData.notes,
      tags,
    };

    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, payload);
        showToast('Customer updated successfully', 'success');
      } else {
        await api.createCustomer(payload);
        showToast('Customer created successfully', 'success');
      }
      setModalOpen(false);
      await loadCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to save customer', 'error');
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.deleteCustomer(id);
      showToast('Customer deleted', 'info');
      setSelectedCustomer(null);
      await loadCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete customer', 'error');
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phone.includes(searchQuery) ||
      c.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCounty = selectedCounty === 'all' || c.county === selectedCounty;
    const matchesTag = selectedTag === 'all' || c.tags.includes(selectedTag);
    return matchesQuery && matchesCounty && matchesTag;
  });

  const allTags = Array.from(new Set(customers.flatMap(c => c.tags)));
  const allCounties = Array.from(new Set(customers.map(c => c.county)));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Customer Management / CRM</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Profiles, service locations, communication history, jobs & invoices.
          </p>
        </div>

        <button
          onClick={() => handleOpenCreateModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name, company, phone, area..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCounty}
            onChange={e => setSelectedCounty(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-hidden"
          >
            <option value="all">All Counties ({allCounties.length})</option>
            {allCounties.map(co => (
              <option key={co} value={co}>
                {co}
              </option>
            ))}
          </select>

          <select
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-hidden"
          >
            <option value="all">All Tags ({allTags.length})</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table / Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No customers match your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer Name / Company</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Location (Kenya)</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(cust => (
                  <tr
                    key={cust.id}
                    onClick={() => openCustomerDetail(cust)}
                    className="hover:bg-teal-50/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            cust.type === 'company'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {cust.type === 'company' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{cust.name}</div>
                          {cust.companyName && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              {cust.companyName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{cust.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span>{cust.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1 font-medium text-slate-900">
                        <MapPin className="w-3 h-3 text-sky-500" />
                        <span>{cust.area}, {cust.county}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                        {cust.address}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {cust.tags.map(t => (
                          <span
                            key={t}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          openCustomerDetail(cust);
                        }}
                        className="text-teal-600 hover:text-teal-700 p-1 font-semibold text-xs inline-flex items-center gap-1"
                      >
                        View Dossier <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Dossier Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSelectedCustomer(null)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-xl text-teal-800">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A]">{selectedCustomer.name}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedCustomer.area}, {selectedCustomer.county} • Customer ID: {selectedCustomer.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCreateModal(selectedCustomer)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200"
                    title="Edit Customer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(selectedCustomer.id, selectedCustomer.name)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Body with Tabs / History */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Contact & Communication Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 text-xs font-semibold text-slate-800 hover:bg-teal-50/40 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    Call Customer
                  </a>
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 text-xs font-semibold text-slate-800 hover:bg-emerald-50/40 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Chat
                  </a>
                  <a
                    href={`mailto:${selectedCustomer.email}`}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-sky-500 text-xs font-semibold text-slate-800 hover:bg-sky-50/40 transition-colors col-span-2 sm:col-span-1"
                  >
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    Email Dispatch
                  </a>
                </div>

                {/* Service Locations */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    Service Locations ({selectedCustomer.serviceLocations.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedCustomer.serviceLocations.map(loc => (
                      <div key={loc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900">{loc.name}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{loc.address}</div>
                        {loc.contactPerson && (
                          <div className="text-slate-500 text-[10px] mt-1">
                            Contact: {loc.contactPerson} ({loc.contactPhone})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer History Accordion / Lists */}
                {historyLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading customer history...</div>
                ) : customerHistory ? (
                  <div className="space-y-5">
                    {/* Jobs History */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                        Work Orders ({customerHistory.jobs.length})
                      </h4>
                      {customerHistory.jobs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No previous jobs recorded.</p>
                      ) : (
                        <div className="space-y-2">
                          {customerHistory.jobs.map(j => (
                            <div key={j.id} className="p-3 rounded-xl border border-slate-200 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{j.jobNumber} • {j.title}</span>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                  {j.status}
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] mt-1">
                                Scheduled: {j.scheduledDate} ({j.startTime} - {j.endTime})
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Invoices History */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        Invoices & eTIMS ({customerHistory.invoices.length})
                      </h4>
                      {customerHistory.invoices.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No invoices issued.</p>
                      ) : (
                        <div className="space-y-2">
                          {customerHistory.invoices.map(inv => (
                            <div key={inv.id} className="p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                              <div>
                                <div className="font-bold text-slate-900">{inv.invoiceNumber}</div>
                                <div className="text-[11px] text-slate-500">
                                  Total: KES {inv.totalAmount.toLocaleString()} • Balance: KES {inv.balanceDue.toLocaleString()}
                                </div>
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  inv.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter Kenyan client information for field dispatch, invoices, and GPS navigation.
            </p>

            <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
              {/* Type toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'company' })}
                  className={`flex-1 py-1.5 rounded-lg border font-semibold text-center ${
                    formData.type === 'company'
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Company / Organization
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'individual' })}
                  className={`flex-1 py-1.5 rounded-lg border font-semibold text-center ${
                    formData.type === 'individual'
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Individual Client
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Evans Kipchumba"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              {formData.type === 'company' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Registered Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Safaricom Telecommunications PLC"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kenyan Phone (M-Pesa ready)</label>
                  <input
                    type="text"
                    required
                    placeholder="+254 7XX XXX XXX"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="client@domain.co.ke"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">County</label>
                  <select
                    value={formData.county}
                    onChange={e => setFormData({ ...formData, county: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  >
                    <option value="Nairobi">Nairobi</option>
                    <option value="Kiambu">Kiambu</option>
                    <option value="Machakos">Machakos</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Uasin Gishu">Uasin Gishu (Eldoret)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Area / Estate</label>
                  <input
                    type="text"
                    placeholder="e.g. Westlands, Kilimani, Karen"
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#14B8A6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Address & Directions</label>
                <input
                  type="text"
                  placeholder="e.g. Dennis Pritt Road, House 14B"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="VIP, Service Contract, Commercial"
                  value={formData.tagsInput}
                  onChange={e => setFormData({ ...formData, tagsInput: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#14B8A6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Gate code, safety procedures, billing preferences..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-lg shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
