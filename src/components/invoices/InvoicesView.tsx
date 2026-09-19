import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Printer,
  Smartphone,
  QrCode,
  ShieldCheck,
  ChevronRight,
  X,
  Building,
  User,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Invoice, Customer, Payment } from '../../types';

export const InvoicesView: React.FC = () => {
  const { showToast, setActiveTab, currentOrg } = useApp();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [mpesaModalOpen, setMpesaModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // M-Pesa STK state
  const [mpesaPhone, setMpesaPhone] = useState('+254 722 000 111');
  const [mpesaAmount, setMpesaAmount] = useState<number>(0);
  const [mpesaSending, setMpesaSending] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [iList, cList] = await Promise.all([api.getInvoices(), api.getCustomers()]);
      setInvoices(iList);
      setCustomers(cList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openInvoiceViewer = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setMpesaAmount(inv.balanceDue);
    const cust = customers.find(c => c.id === inv.customerId);
    if (cust) setMpesaPhone(cust.phone);
    setViewerOpen(true);
  };

  const handleTriggerMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setMpesaSending(true);
    try {
      const res = await api.triggerMpesaStkPush({
        invoiceId: selectedInvoice.id,
        phoneNumber: mpesaPhone,
        amount: mpesaAmount,
      });

      showToast(`M-Pesa STK push initiated! Receipt: ${res.mpesaReceiptNumber}`, 'success');
      setMpesaModalOpen(false);
      await loadData();
      setSelectedInvoice(res.invoice);
    } catch (err: any) {
      showToast(err.message || 'M-Pesa push failed', 'error');
    } finally {
      setMpesaSending(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    return statusFilter === 'all' || inv.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Tax Invoicing & eTIMS Compliance</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
              KRA eTIMS Validated
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Kenyan electronic tax invoices with control codes, CU numbers, and Lipa Na M-Pesa STK push.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('jobs')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate from Work Order
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Invoices' },
          { id: 'sent', label: 'Unpaid / Sent' },
          { id: 'paid', label: 'Fully Paid' },
          { id: 'partial', label: 'Partially Paid' },
          { id: 'overdue', label: 'Overdue' },
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

      {/* Invoices Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading tax invoices...</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No invoices found matching criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">eTIMS Status</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => {
                  const customer = customers.find(c => c.id === inv.customerId);

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => openInvoiceViewer(inv)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {customer?.name || 'Customer'}
                        </div>
                        <div className="text-[11px] text-slate-400">{customer?.area}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{inv.dueDate}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        KES {inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-700">
                        KES {inv.balanceDue.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                          {inv.etimsControlCode ? 'KRA SIGNED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'partial'
                              ? 'bg-blue-100 text-blue-800'
                              : inv.status === 'overdue'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openInvoiceViewer(inv);
                          }}
                          className="text-teal-600 hover:text-teal-700 font-semibold p-1 inline-flex items-center gap-1"
                        >
                          View & Pay <ChevronRight className="w-3.5 h-3.5" />
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

      {/* Tax Invoice Document Drawer */}
      {selectedInvoice && viewerOpen && (
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
                  <Receipt className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-sm text-slate-900">
                    Tax Invoice {selectedInvoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                    title="Print Invoice"
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

              {/* Action Banner */}
              <div className="p-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Balance Due:</span>
                  <span className="font-mono font-bold text-teal-400 text-sm">
                    KES {selectedInvoice.balanceDue.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedInvoice.balanceDue > 0 && (
                    <button
                      onClick={() => setMpesaModalOpen(true)}
                      className="px-3 py-1.5 bg-[#14B8A6] hover:bg-teal-600 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Lipa Na M-Pesa STK Push
                    </button>
                  )}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Tax Invoice ${selectedInvoice.invoiceNumber} from ${currentOrg?.name}. Balance due: KES ${selectedInvoice.balanceDue.toLocaleString()}. Pay via M-Pesa Paybill 522522.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Share WhatsApp
                  </a>
                </div>
              </div>

              {/* Printable Invoice Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-sans">
                {/* Header */}
                <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                      {currentOrg?.name || 'fieldnora Technical Services Ltd'}
                    </h2>
                    <p className="text-slate-500 mt-1">
                      KRA PIN: <strong className="text-slate-800">P051982736Z</strong>
                    </p>
                    <p className="text-slate-500">
                      VAT Reg: <strong className="text-slate-800">VR-091823-KE</strong> • County: {currentOrg?.county || 'Nairobi'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      TAX INVOICE
                    </span>
                    <div className="text-lg font-mono font-bold text-slate-900 mt-2">
                      {selectedInvoice.invoiceNumber}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Issue: {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-amber-700 font-semibold">
                      Due: {selectedInvoice.dueDate}
                    </div>
                  </div>
                </div>

                {/* Client Box */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Bill To:
                    </div>
                    {(() => {
                      const cust = customers.find(c => c.id === selectedInvoice.customerId);
                      return cust ? (
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{cust.name}</div>
                          {cust.companyName && (
                            <div className="text-slate-700 font-medium">{cust.companyName}</div>
                          )}
                          <div className="text-slate-500">{cust.address} • {cust.area}, {cust.county}</div>
                          <div className="text-slate-500 font-mono mt-0.5">{cust.phone}</div>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Payment instructions */}
                  <div className="text-right text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-800">M-Pesa Payment Details:</div>
                    <div>Paybill: <strong className="font-mono text-teal-800">522522</strong></div>
                    <div>Account: <strong className="font-mono text-teal-800">{selectedInvoice.invoiceNumber}</strong></div>
                  </div>
                </div>

                {/* Line Items Table */}
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
                      {selectedInvoice.items.map(it => (
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

                {/* Totals & Calculations */}
                <div className="flex justify-end pt-3 border-t border-slate-200">
                  <div className="w-64 space-y-1.5 text-right font-mono">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal (Net):</span>
                      <span>KES {selectedInvoice.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>16% VAT Tax:</span>
                      <span>KES {selectedInvoice.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-300">
                      <span>Total Invoice:</span>
                      <span>KES {selectedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Amount Paid:</span>
                      <span>KES {(selectedInvoice.paidAmount ?? selectedInvoice.amountPaid ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-teal-800 pt-1 border-t border-slate-300">
                      <span>Balance Due:</span>
                      <span>KES {selectedInvoice.balanceDue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* KRA eTIMS Security Compliance Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Kenya Revenue Authority eTIMS Verification
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      CU Serial: {selectedInvoice.etimsCuSerialNumber || 'KRAMW0123984'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div>
                        Control Code:{' '}
                        <strong className="font-mono text-slate-900">
                          {selectedInvoice.etimsControlCode || 'KRA-ETIMS-2026-B87A9F21'}
                        </strong>
                      </div>
                      <div>
                        Date & Time Validated:{' '}
                        <strong className="font-mono text-slate-900">
                          {new Date(selectedInvoice.createdAt).toISOString()}
                        </strong>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Scan the QR code to verify validity on the official KRA tax portal.
                      </div>
                    </div>

                    {/* QR Code Graphic simulation */}
                    <div className="p-2 bg-white rounded-lg border border-slate-300 flex-shrink-0">
                      <QrCode className="w-16 h-16 text-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* M-Pesa STK Push Modal */}
      {mpesaModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                  MP
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">Lipa Na M-Pesa Online (Daraja)</h3>
                  <p className="text-[11px] text-slate-500">Instant STK Push Prompt</p>
                </div>
              </div>
              <button
                onClick={() => setMpesaModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTriggerMpesa} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer M-Pesa Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+254 7XX XXX XXX"
                  value={mpesaPhone}
                  onChange={e => setMpesaPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount to Settle (KES)
                </label>
                <input
                  type="number"
                  required
                  value={mpesaAmount}
                  onChange={e => setMpesaAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Instant Daraja Push
                </div>
                <p>
                  A PIN prompt will appear on the customer&apos;s phone. Upon entering PIN, the invoice balance will automatically settle in real-time.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMpesaModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mpesaSending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-2"
                >
                  {mpesaSending ? 'Dispatching STK Push...' : 'Send STK Push Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
