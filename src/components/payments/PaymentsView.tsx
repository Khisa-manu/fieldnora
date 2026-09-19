import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  CreditCard,
  Plus,
  Search,
  Smartphone,
  CheckCircle2,
  Building,
  Receipt,
  Banknote,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  X
} from 'lucide-react';
import { Payment, Invoice, Customer } from '../../types';

export const PaymentsView: React.FC = () => {
  const { showToast, currentOrg } = useApp();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordModalOpen, setRecordModalOpen] = useState(false);

  // Form state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(10000);
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('+254 722 000 111');
  const [reference, setReference] = useState('QH91K8820Z');
  const [notes, setNotes] = useState('Payment settled via Lipa Na M-Pesa');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, iList, cList] = await Promise.all([
        api.getPayments(),
        api.getInvoices(),
        api.getCustomers(),
      ]);
      setPayments(pList);
      setInvoices(iList);
      setCustomers(cList);
      if (iList.length > 0 && !selectedInvoiceId) {
        setSelectedInvoiceId(iList[0].id);
        setPaymentAmount(iList[0].balanceDue || 15000);
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

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || paymentAmount <= 0) {
      showToast('Select an invoice and valid amount', 'error');
      return;
    }

    try {
      const res = await api.recordPayment({
        invoiceId: selectedInvoiceId,
        amount: paymentAmount,
        paymentMethod,
        reference: reference || `REF-${Date.now().toString(36).toUpperCase()}`,
        phoneNumber: paymentMethod === 'mpesa' ? phoneNumber : undefined,
        notes,
      });

      showToast(`Payment of KES ${paymentAmount.toLocaleString()} recorded!`, 'success');
      setRecordModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to record payment', 'error');
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const mpesaPayments = payments.filter(p => p.paymentMethod === 'mpesa');
  const mpesaTotal = mpesaPayments.reduce((sum, p) => sum + p.amount, 0);
  const mpesaPercentage = totalCollected > 0 ? Math.round((mpesaTotal / totalCollected) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Payments & M-Pesa Daraja Gateway</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time Lipa Na M-Pesa STK push, Kenyan bank transfers, and balance reconciliation.
          </p>
        </div>

        <button
          onClick={() => setRecordModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-[#0D9488] rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Total Collections (KES)</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            KES {totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Reconciled & Audited
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Lipa Na M-Pesa Volume</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            KES {mpesaTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {mpesaPercentage}% of all incoming payments
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Paybill Integration</span>
          <div className="text-sm font-bold text-slate-900">
            Paybill: <span className="font-mono text-teal-700">522522</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Automated Daraja IPN webhook callbacks
          </div>
        </div>
      </div>

      {/* Payments History Ledger */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading payment ledger...</div>
      ) : payments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No payment transactions recorded.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Settlement Ledger ({payments.length} Transactions)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt / Ref #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount (KES)</th>
                  <th className="py-3 px-4">Phone / Account</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => {
                  const inv = invoices.find(i => i.id === p.invoiceId);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.reference}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(p.paymentDate || p.receivedAt || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-teal-800 font-medium">
                        {inv?.invoiceNumber || p.invoiceId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            p.paymentMethod === 'mpesa'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                        KES {p.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {p.phoneNumber || 'Internal / Bank'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-[#0F172A] text-sm">Record Client Payment</h3>
              <button
                onClick={() => setRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Invoice</label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find(i => i.id === e.target.value);
                    if (inv) setPaymentAmount(inv.balanceDue);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                >
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - Balance: KES {inv.balanceDue.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                >
                  <option value="mpesa">Lipa Na M-Pesa (Till/Paybill)</option>
                  <option value="bank_transfer">Bank Transfer (EFT/RTGS)</option>
                  <option value="card">Debit/Credit Card</option>
                  <option value="cash">Cash Received On-Site</option>
                  <option value="cheque">Company Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Paid (KES)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction Reference / M-Pesa Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QH91K28X91"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                />
              </div>

              {paymentMethod === 'mpesa' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sender Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="px-4 py-2 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14B8A6] text-white font-bold rounded-lg shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
