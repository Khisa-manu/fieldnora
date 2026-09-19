import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Building,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Job, Invoice, Payment, Technician } from '../../types';

export const ReportsView: React.FC = () => {
  const { showToast } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [jList, iList, pList, tList] = await Promise.all([
          api.getJobs(),
          api.getInvoices(),
          api.getPayments(),
          api.getTechnicians(),
        ]);
        setJobs(jList);
        setInvoices(iList);
        setPayments(pList);
        setTechnicians(tList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalRevenue = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstandingReceivables = invoices.reduce((sum, i) => sum + i.balanceDue, 0);
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const completionRate = jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0;

  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Issue Date', 'Total Amount (KES)', 'Balance Due (KES)', 'Status'];
    const rows = invoices.map(i => [i.invoiceNumber, i.createdAt.split('T')[0], i.totalAmount, i.balanceDue, i.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fieldnora_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Financial CSV report exported successfully', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Business Reports & Fleet Analytics</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Revenue tracking, technician productivity, first-time fix rates, and cash collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 font-semibold outline-hidden"
          >
            <option value="month">This Month (September 2026)</option>
            <option value="quarter">Q3 2026</option>
            <option value="year">Full Year 2026</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Top 4 Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Gross Billed (KES)</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            KES {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> +18.4% vs last month
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Cash Collections</span>
          <div className="text-2xl font-black text-teal-600 font-mono">
            KES {totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">M-Pesa & EFT auto-reconciled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Outstanding Receivables</span>
          <div className="text-2xl font-black text-amber-700 font-mono">
            KES {outstandingReceivables.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">Aged &gt; 30 days: KES 0</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500">Job Completion Rate</span>
          <div className="text-2xl font-black text-[#0F172A]">{completionRate}%</div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            First-time fix: 94.2%
          </div>
        </div>
      </div>

      {/* Technician Productivity Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Technician Fleet Utilization & Customer Ratings
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Technician</th>
                <th className="py-2.5 px-3">Specialization</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3 text-center">Jobs Completed</th>
                <th className="py-2.5 px-3 text-center">Avg Rating</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {technicians.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-bold text-slate-900">{t.name}</td>
                  <td className="py-3 px-3 text-slate-600">{t.specialization}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono">{t.vehicleReg}</td>
                  <td className="py-3 px-3 text-center font-bold text-teal-700">
                    {t.completedJobsCount}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    ★ {t.rating}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        t.activeStatus === 'on_job'
                          ? 'bg-amber-100 text-amber-800'
                          : t.activeStatus === 'en_route'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {t.activeStatus.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue by Service Vertical (Simulated Bar Graph) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Monthly Revenue Breakdown by Trade Category
        </h3>

        <div className="space-y-3 text-xs">
          {[
            { trade: 'HVAC & Refrigeration', amount: 480000, pct: 85 },
            { trade: 'Commercial Electrical Services', amount: 310000, pct: 60 },
            { trade: 'Plumbing & Drainage', amount: 185000, pct: 35 },
            { trade: 'Security & Access Control', amount: 120000, pct: 25 },
          ].map(row => (
            <div key={row.trade} className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>{row.trade}</span>
                <span className="font-mono text-slate-900 font-bold">
                  KES {row.amount.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-sky-500 rounded-full"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
