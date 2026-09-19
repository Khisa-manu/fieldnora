import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_SERVICES, SECTORS, ServiceVertical } from '../../data/serviceVerticals';
import {
  Search,
  Filter,
  CheckCircle2,
  Wrench,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowRight,
  DollarSign,
  Clock,
  ListChecks,
  Check,
  Building2,
  ShieldCheck,
  Tag,
  ExternalLink,
  Plus
} from 'lucide-react';

export const ServicesCatalogView: React.FC = () => {
  const { setActiveTab, showToast, currentOrg } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<ServiceVertical | null>(null);

  // Active services enabled for this workspace (defaults to 12 top Kenyan services)
  const [enabledServiceIds, setEnabledServiceIds] = useState<Set<string>>(
    new Set([
      'plumbers',
      'electricians',
      'hvac-technicians',
      'solar-technicians',
      'cctv-technicians',
      'generator-technicians',
      'pest-control-technicians',
      'mama-fua',
      'cleaning-staff',
      'borehole-technicians',
      'gate-access-control-technicians',
      'water-pump-technicians',
    ])
  );

  const toggleServiceOffering = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEnabledServiceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast(`Removed "${name}" from company offered services`, 'info');
      } else {
        next.add(id);
        showToast(`Added "${name}" to company offered services`, 'success');
      }
      return next;
    });
  };

  const filteredServices = useMemo(() => {
    return ALL_SERVICES.filter(service => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSector = selectedSector === 'All' || service.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [searchTerm, selectedSector]);

  const handleLaunchJob = (service: ServiceVertical) => {
    showToast(`Initializing work order for ${service.name}...`, 'info');
    setActiveTab('jobs');
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                <Wrench className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Kenyan Field Services & Trade Directory
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                81 Trade Verticals
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
              Comprehensive catalog of specialized field-service trades across Kenya and East Africa.
              Configure standard callout fees in KES, pre-loaded quality checklists, and company-offered trades.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setEnabledServiceIds(new Set(ALL_SERVICES.map(s => s.id)));
                showToast('Enabled all 81 trade verticals for this workspace', 'success');
              }}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Enable All 81
            </button>
            <button
              onClick={() => setActiveTab('portal')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Customer Booking View
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium block">Total Trades</span>
            <span className="text-lg font-bold text-slate-900 font-mono">81 Services</span>
          </div>
          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100">
            <span className="text-teal-700 font-medium block">Workspace Active</span>
            <span className="text-lg font-bold text-teal-900 font-mono">
              {enabledServiceIds.size} Offered
            </span>
          </div>
          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100">
            <span className="text-sky-700 font-medium block">Economic Sectors</span>
            <span className="text-lg font-bold text-sky-900 font-mono">13 Sectors</span>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="text-emerald-700 font-medium block">eTIMS Compliance</span>
            <span className="text-lg font-bold text-emerald-900 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Standardized
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by trade title, keyword (e.g. Mama Fua, Solar, Borehole, Welder, CCTV, Generator)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sector Select Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-hidden focus:border-teal-500"
            >
              <option value="All">All 13 Sectors ({ALL_SERVICES.length})</option>
              {SECTORS.map(sec => {
                const count = ALL_SERVICES.filter(s => s.sector === sec).length;
                return (
                  <option key={sec} value={sec}>
                    {sec} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Sector Quick Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedSector('All')}
            className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              selectedSector === 'All'
                ? 'bg-[#0F172A] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Trades ({ALL_SERVICES.length})
          </button>
          {SECTORS.map(sec => {
            const isSelected = selectedSector === sec;
            const count = ALL_SERVICES.filter(s => s.sector === sec).length;
            return (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map(service => {
          const isOffered = enabledServiceIds.has(service.id);

          return (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className={`group bg-white rounded-2xl border p-4.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative ${
                isOffered ? 'border-teal-300/80 ring-1 ring-teal-500/20' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Row: Sector tag & Offered toggle button */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 truncate max-w-[200px]">
                    {service.sector}
                  </span>
                  <button
                    onClick={e => toggleServiceOffering(service.id, service.name, e)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                      isOffered
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
                    }`}
                    title={isOffered ? 'Currently offered by company' : 'Click to enable for company'}
                  >
                    {isOffered ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        Offered
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Offer Trade
                      </>
                    )}
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                  {service.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {service.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom: Pricing Benchmarks & Action */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Standard Callout</div>
                  <div className="font-bold text-slate-900 font-mono">
                    KES {service.standardCalloutKes.toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-medium">Base Hourly</div>
                  <div className="font-bold text-teal-800 font-mono">
                    KES {service.standardHourlyRateKes.toLocaleString()}/hr
                  </div>
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleLaunchJob(service);
                  }}
                  className="p-1.5 bg-slate-50 group-hover:bg-teal-600 group-hover:text-white text-slate-600 rounded-lg transition-colors"
                  title="Create Work Order for this Trade"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">No matching services found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for another trade keyword or change the economic sector filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSector('All');
            }}
            className="px-4 py-2 text-xs font-bold bg-[#0F172A] text-white rounded-xl hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Modal: Service Detail & Checklist Inspector */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {selectedService.sector}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedService.name}</h2>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-700 mb-1">Service Scope & Definition</h4>
                <p className="text-slate-600 leading-relaxed">{selectedService.description}</p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-medium block">Standard Kenyan Callout</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    KES {selectedService.standardCalloutKes.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Covers initial travel & on-site diagnosis
                  </span>
                </div>
                <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200">
                  <span className="text-teal-700 font-medium block">Standard Labor Hourly</span>
                  <span className="text-base font-bold text-teal-900 font-mono">
                    KES {selectedService.standardHourlyRateKes.toLocaleString()}/hr
                  </span>
                  <span className="text-[10px] text-teal-600 block mt-0.5">
                    Pre-configured for work order invoices
                  </span>
                </div>
              </div>

              {/* Standard Technical Checklist */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-teal-600" />
                  Pre-Configured Field Checklist ({selectedService.defaultChecklist.length} steps)
                </h4>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedService.defaultChecklist.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Categorization Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedService.tags.map(t => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium text-[11px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  toggleServiceOffering(selectedService.id, selectedService.name, { stopPropagation: () => {} } as any);
                }}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                  enabledServiceIds.has(selectedService.id)
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {enabledServiceIds.has(selectedService.id) ? 'Disable from Company' : 'Offer This Service'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedService(null);
                    handleLaunchJob(selectedService);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-[#14B8A6] hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Dispatch Work Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
