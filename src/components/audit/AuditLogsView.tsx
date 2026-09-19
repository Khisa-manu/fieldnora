import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AuditLog } from '../../types';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const lList = await api.getAuditLogs();
        setLogs(lList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(
    l => filterAction === 'all' || l.action.toLowerCase().includes(filterAction)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
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
                    <td className="py-3.5 px-4 text-slate-600 capitalize">{log.entityType}</td>
                    <td className="py-3.5 px-4 font-mono text-teal-800 font-medium">
                      {log.entityId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] max-w-xs truncate">
                      {JSON.stringify(log.details)}
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
