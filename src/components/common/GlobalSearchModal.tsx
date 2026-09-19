import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Search,
  X,
  Briefcase,
  Users,
  FileText,
  Receipt,
  Boxes,
  Wrench,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Customer, Job, Estimate, Invoice, Technician, ProductInventory } from '../../types';

export const GlobalSearchModal: React.FC = () => {
  const { searchModalOpen, setSearchModalOpen, setActiveTab } = useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    customers: Customer[];
    jobs: Job[];
    estimates: Estimate[];
    invoices: Invoice[];
    technicians: Technician[];
    products: ProductInventory[];
  }>({
    customers: [],
    jobs: [],
    estimates: [],
    invoices: [],
    technicians: [],
    products: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ customers: [], jobs: [], estimates: [], invoices: [], technicians: [], products: [] });
    }
  }, [searchModalOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ customers: [], jobs: [], estimates: [], invoices: [], technicians: [], products: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!searchModalOpen) return null;

  const totalResults =
    results.customers.length +
    results.jobs.length +
    results.estimates.length +
    results.invoices.length +
    results.technicians.length +
    results.products.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search jobs, customers, technicians, invoices, estimates, parts..."
            className="flex-1 text-sm bg-transparent outline-hidden text-[#0F172A] placeholder:text-slate-400"
          />
          {loading && <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />}
          <button
            onClick={() => setSearchModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-8 text-xs text-slate-400">
              Type anything to search across the entire fieldnora database...
            </div>
          )}

          {query && totalResults === 0 && !loading && (
            <div className="text-center py-8 text-xs text-slate-500">
              No results found for &ldquo;<span className="font-semibold">{query}</span>&rdquo;
            </div>
          )}

          {/* Jobs */}
          {results.jobs.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                Jobs & Work Orders ({results.jobs.length})
              </div>
              <div className="space-y-1">
                {results.jobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => {
                      setActiveTab('jobs');
                      setSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{job.jobNumber} • {job.title}</div>
                      <div className="text-[11px] text-slate-500">{job.scheduledDate} • Priority: {job.priority.toUpperCase()}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 capitalize">
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {results.customers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                Customers ({results.customers.length})
              </div>
              <div className="space-y-1">
                {results.customers.map(cust => (
                  <div
                    key={cust.id}
                    onClick={() => {
                      setActiveTab('customers');
                      setSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{cust.name} {cust.companyName && `(${cust.companyName})`}</div>
                      <div className="text-[11px] text-slate-500">{cust.phone} • {cust.area}, {cust.county}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {results.invoices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                Invoices ({results.invoices.length})
              </div>
              <div className="space-y-1">
                {results.invoices.map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setActiveTab('invoices');
                      setSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-500">Balance Due: KES {inv.balanceDue.toLocaleString()}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 capitalize">
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technicians */}
          {results.technicians.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                Technicians ({results.technicians.length})
              </div>
              <div className="space-y-1">
                {results.technicians.map(tech => (
                  <div
                    key={tech.id}
                    onClick={() => {
                      setActiveTab('dispatch');
                      setSearchModalOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{tech.name} ({tech.vehicleReg})</div>
                      <div className="text-[11px] text-slate-500">{tech.specialization} • {tech.phone}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-50 text-teal-700 capitalize">
                      {tech.activeStatus.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Global Kenyan Search</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
