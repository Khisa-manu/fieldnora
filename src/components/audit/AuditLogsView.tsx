import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Cloud,
  Check
} from 'lucide-react';
import { AuditLog } from '../../types';

interface DatabaseStatus {
  engine: string;
  orm: string;
  provider: string;
  connected: boolean;
  host?: string;
  error?: string;
  initializedAt?: string;
  supportedHosts: string[];
}

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [dbTesting, setDbTesting] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [lList, status] = await Promise.all([
          api.getAuditLogs(),
          api.getDatabaseStatus().catch(() => null),
        ]);
        setLogs(lList);
        if (status) setDbStatus(status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleTestDatabase = async () => {
    setDbTesting(true);
    setDbTestResult(null);
    try {
      const res = await api.testDatabaseConnection();
      if (res.status) setDbStatus(res.status);
      if (res.success) {
        setDbTestResult(`Connected successfully to ${res.status?.provider || 'PostgreSQL'} via Drizzle ORM!`);
      } else {
        setDbTestResult(`Connection standby: ${res.status?.error || 'Awaiting DATABASE_URL in settings.'}`);
      }
    } catch (err: any) {
      setDbTestResult(`Test error: ${err.message || 'Could not verify database'}`);
    } finally {
      setDbTesting(false);
    }
  };

  const filteredLogs = logs.filter(
    l => filterAction === 'all' || l.action.toLowerCase().includes(filterAction)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Database Production Architecture Status Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">PostgreSQL + Drizzle ORM Database</h2>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    dbStatus?.connected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {dbStatus?.connected ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Live: {dbStatus.provider.toUpperCase()}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      PostgreSQL Ready
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted for <strong>Neon Serverless Postgres</strong> or <strong>Railway PostgreSQL</strong> via Drizzle ORM with connection pooling & automated schema bootstrapping.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleTestDatabase}
              disabled={dbTesting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dbTesting ? 'animate-spin' : ''}`} />
              {dbTesting ? 'Verifying...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Database specs grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              Engine & ORM
            </div>
            <div className="font-bold text-slate-900 font-mono">PostgreSQL 16 · Drizzle ORM</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
              <Cloud className="w-3.5 h-3.5 text-slate-400" />
              Supported Hosting
            </div>
            <div className="font-bold text-slate-900 font-mono">Neon (AWS) / Railway</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-1">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Current Host / Endpoint
            </div>
            <div className="font-bold text-slate-900 font-mono truncate">
              {dbStatus?.host || 'DATABASE_URL (Environment variable)'}
            </div>
          </div>
        </div>

        {/* Feedback banner */}
        {dbTestResult && (
          <div className={`p-3 rounded-xl text-xs font-medium border ${
            dbTestResult.includes('success')
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {dbTestResult}
          </div>
        )}
      </div>

      {/* Audit Logs Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Security Audit & Compliance Logs</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Immutable log of all user activities, status changes, GPS check-ins, payments, and eTIMS signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 font-semibold outline-hidden"
          >
            <option value="all">All Audit Actions</option>
            <option value="create">Creations</option>
            <option value="update">Updates & Status Shifts</option>
            <option value="check_in">GPS Check-Ins</option>
            <option value="payment">Payment Audits</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading audit history...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No logs found matching filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp (EAT)</th>
                  <th className="py-3 px-4">Actor / User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Details / Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.userName}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{log.entity}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">{log.entityId}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {log.newValue || log.previousValue || 'Action logged'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
