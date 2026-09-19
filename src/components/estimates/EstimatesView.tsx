import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Briefcase,
  Receipt,
  Printer,
  ChevronRight,
  X,
  Trash2,
  Building,
  User,
  Clock,
  Sparkles
} from 'lucide-react';
import { Estimate, Customer, InvoiceItem } from '../../types';

export const EstimatesView: React.FC = () => {
  const { showToast, setActiveTab, currentOrg } = useApp();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  // New Estimate form
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('Standard 14-day quotation validity. 50% deposit on acceptance.');
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Compressor Inverter Overhaul & Pressure Testing',
      quantity: 1,
      unitPrice: 28000,
      total: 28000,
      type: 'service',
    },
    {
      id: 'item-2',
      description: 'R410A Refrigerant Gas Canister (11.3 kg)',
      quantity: 2,
      unitPrice: 8500,
      total: 17000,
      type: 'material',
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eList, cList] = await Promise.all([api.getEstimates(), api.getCustomers()]);
      setEstimates(eList);
      setCustomers(cList);
      if (cList.length > 0 && !customerId) {
        setCustomerId(cList[0].id);
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

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: 'New Service / Component',
        quantity: 1,
        unitPrice: 5000,
        total: 5000,
        type: 'service',
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, val: any) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = Number(updated.quantity) * Number(updated.unitPrice);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const taxAmount = Math.round(subtotal * 0.16); // 16% Kenya VAT
  const totalAmount = subtotal + taxAmount;

  const handleCreateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0) {
      showToast('Please select customer and at least one item', 'error');
      return;
    }

    try {
      const created = await api.createEstimate({
        customerId,
        items,
        subtotal,
        taxAmount,
        totalAmount,
        notes,
        expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
      showToast(`Estimate ${created.estimateNumber} created!`, 'success');
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create estimate', 'error');
    }
  };

  const handleApproveEstimate = async (estId: string) => {
    try {
      await api.updateEstimate(estId, { status: 'approved' });
      showToast('Estimate marked as Approved by client', 'success');
      await loadData();
      if (selectedEstimate) {
        setSelectedEstimate(prev => (prev ? { ...prev, status: 'approved' } : null));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update estimate', 'error');
    }
  };

  const handleConvertToJob = async (estId: string) => {
    try {
      const job = await api.convertEstimateToJob(estId);
      showToast(`Converted to Work Order ${job.jobNumber}!`, 'success');
      setActiveTab('jobs');
    } catch (err: any) {
      showToast(err.message || 'Failed to convert estimate to job', 'error');
    }
  };

  const handleConvertToInvoice = async (estId: string) => {
    try {
      const inv = await api.convertEstimateToInvoice(estId);
      showToast(`Converted to Tax Invoice ${inv.invoiceNumber}!`, 'success');
      setActiveTab('invoices');
    } catch (err: any) {
      showToast(err.message || 'Failed to convert estimate to invoice', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Estimates & Quotations</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Client proposals, 16% VAT auto-calculations, conversion to work orders & invoices.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Estimate
        </button>
      </div>

      {/* Estimates Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading estimates...</div>
      ) : estimates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No quotations generated yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Estimate #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Subtotal (KES)</th>
                  <th className="py-3 px-4">16% VAT</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estimates.map(est => {
                  const customer = customers.find(c => c.id === est.customerId);
                  const statusColors: Record<string, string> = {
                    draft: 'bg-slate-100 text-slate-700',
                    sent: 'bg-blue-100 text-blue-800',
                    approved: 'bg-emerald-100 text-emerald-800',
                    declined: 'bg-red-100 text-red-800',
                    converted: 'bg-purple-100 text-purple-800',
                  };

                  return (
                    <tr
                      key={est.id}
                      onClick={() => {
                        setSelectedEstimate(est);
                        setViewerOpen(true);
                      }}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {est.estimateNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {customer?.name || 'Customer'}
                        </div>
                        <div className="text-[11px] text-slate-400">{customer?.area}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{est.expiryDate}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        KES {est.subtotal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        KES {est.taxAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        KES {est.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            statusColors[est.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {est.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedEstimate(est);
                            setViewerOpen(true);
                          }}
                          className="text-teal-600 hover:text-teal-700 font-semibold p-1 inline-flex items-center gap-1"
                        >
                          View Quote <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estimate Viewer / PDF Simulation Drawer */}
      {selectedEstimate && viewerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setViewerOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-sm text-slate-900">
                    Estimate {selectedEstimate.estimateNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-3 bg-teal-50/70 border-b border-teal-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-teal-900">Status: {selectedEstimate.status.toUpperCase()}</span>
                <div className="flex items-center gap-2">
                  {selectedEstimate.status !== 'approved' && selectedEstimate.status !== 'converted' && (
                    <button
                      onClick={() => handleApproveEstimate(selectedEstimate.id)}
                      className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Approved
                    </button>
                  )}
                  <button
                    onClick={() => handleConvertToJob(selectedEstimate.id)}
                    className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Convert to Work Order
                  </button>
                  <button
                    onClick={() => handleConvertToInvoice(selectedEstimate.id)}
                    className="px-2.5 py-1.5 bg-[#14B8A6] text-white rounded-lg font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <Receipt className="w-3.5 h-3.5" /> Convert to Invoice
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans">
                {/* Brand & Organization Letterhead */}
                <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                      {currentOrg?.name || 'fieldnora Services'}
                    </h2>
                    <p className="text-slate-500 mt-1">
                      Professional Engineering & Field Technical Maintenance
                    </p>
                    <p className="text-slate-500">
                      {currentOrg?.county || 'Nairobi'}, Kenya • PIN: P051982736Z
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-teal-700">
                      {selectedEstimate.estimateNumber}
                    </div>
                    <div className="text-slate-500 mt-1">
                      Date: {new Date(selectedEstimate.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-amber-600 font-medium">
                      Valid Until: {selectedEstimate.expiryDate}
                    </div>
                  </div>
                </div>

                {/* Bill To */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Prepared For Client:
                  </div>
                  {(() => {
                    const cust = customers.find(c => c.id === selectedEstimate.customerId);
                    return cust ? (
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{cust.name}</div>
                        {cust.companyName && (
                          <div className="text-slate-600 font-medium">{cust.companyName}</div>
                        )}
                        <div className="text-slate-500">{cust.address} • {cust.area}, {cust.county}</div>
                        <div className="text-slate-500 font-mono mt-0.5">{cust.phone}</div>
                      </div>
                    ) : (
                      <div>Customer Profile</div>
                    );
                  })()}
                </div>

                {/* Items Table */}
                <div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-y border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-center">Type</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Rate (KES)</th>
                        <th className="py-2 px-3 text-right">Amount (KES)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedEstimate.items.map(it => (
                        <tr key={it.id}>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{it.description}</td>
                          <td className="py-2.5 px-3 text-center capitalize text-slate-500">{it.type}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {it.unitPrice.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                            {it.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals */}
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <div className="w-64 space-y-1.5 text-right font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>KES {selectedEstimate.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>VAT (16% Kenya):</span>
                      <span>KES {selectedEstimate.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-300">
                      <span>Total Quote:</span>
                      <span className="text-teal-700">KES {selectedEstimate.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800">Quotation Terms & Warranty:</span> {selectedEstimate.notes}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Estimate Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#0F172A] mb-1">Create Quotation / Estimate</h3>
            <p className="text-xs text-slate-500 mb-4">
              Draft formal pricing with automatic 16% Kenyan VAT calculation.
            </p>

            <form onSubmit={handleCreateEstimate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Customer</label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items Manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Line Items & Services
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <input
                        type="text"
                        placeholder="Description..."
                        value={item.description}
                        onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden"
                      />
                      <select
                        value={item.type}
                        onChange={e => handleUpdateItem(item.id, 'type', e.target.value)}
                        className="w-24 px-2 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden"
                      >
                        <option value="service">Service</option>
                        <option value="material">Part/Material</option>
                        <option value="labour">Labour</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden text-center"
                      />
                      <input
                        type="number"
                        placeholder="Rate"
                        value={item.unitPrice}
                        onChange={e => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-24 px-2 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden text-right font-mono"
                      />
                      <div className="w-24 text-right font-mono font-bold text-slate-800">
                        {item.total.toLocaleString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Calculations */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1 font-mono text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>KES {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>16% VAT:</span>
                    <span>KES {taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total:</span>
                    <span className="text-teal-700">KES {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes & Terms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
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
                  Generate Estimate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
