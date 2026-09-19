import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  FileCheck2,
  Plus,
  Search,
  CheckCircle2,
  FileText,
  Calendar,
  User,
  ShieldCheck,
  ChevronRight,
  Eye,
  X,
  Sparkles
} from 'lucide-react';
import { FormTemplate, FormSubmission, Job, FormField } from '../../types';

export const FormsView: React.FC = () => {
  const { showToast } = useApp();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [activeTab, setActiveSubTab] = useState<'templates' | 'submissions'>('templates');
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);

  // Fill form state
  const [jobId, setJobId] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});

  const loadData = async () => {
    try {
      const [tList, sList, jList] = await Promise.all([
        api.getFormTemplates(),
        api.getFormSubmissions(),
        api.getJobs(),
      ]);
      setTemplates(tList);
      setSubmissions(sList);
      setJobs(jList);
      if (jList.length > 0 && !jobId) setJobId(jList[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartSubmission = (template: FormTemplate) => {
    setSelectedTemplate(template);
    const initialData: Record<string, any> = {};
    template.fields.forEach((f: FormField) => {
      initialData[f.id] = f.type === 'checkbox' ? false : '';
    });
    setFormData(initialData);
    setSubmissionModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !jobId) return;

    try {
      await api.submitForm({
        formId: selectedTemplate.id,
        templateId: selectedTemplate.id,
        jobId,
        submittedBy: 'Eng. Brian Kiprop',
        data: formData,
        answers: formData,
        signatureUrl:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 60 10 110 35 T 190 20" fill="none" stroke="%230F172A" stroke-width="2"/></svg>',
      });
      showToast('Form submission and digital certificate saved!', 'success');
      setSubmissionModalOpen(false);
      await loadData();
      setActiveSubTab('submissions');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit form', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-[#0F172A]">Custom Forms & Digital Certificates</h1>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Safety compliance, EPRA electrical certificates, HVAC logs, and client sign-off records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveSubTab('templates')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'templates' ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Form Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveSubTab('submissions')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'submissions' ? 'bg-[#0F172A] text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Completed Audits ({submissions.length})
          </button>
        </div>
      </div>

      {/* View 1: Templates List */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(t => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 hover:border-teal-500 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                    <span className="text-[10px] text-slate-400">v{t.version}.0</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{t.title}</h3>
                  <p className="text-xs text-slate-500">{t.description}</p>
                </div>
              </div>

              {/* Fields preview pill badges */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-700">Form Audit Fields:</div>
                <div className="flex flex-wrap gap-1.5">
                  {t.fields.map((f: FormField) => (
                    <span
                      key={f.id}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200"
                    >
                      {f.label} ({f.type})
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {t.fields.length} interactive checklist items
                </span>
                <button
                  onClick={() => handleStartSubmission(t)}
                  className="px-3 py-1.5 bg-[#14B8A6] hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Fill On-Site
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 2: Submissions Archive */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Form Title</th>
                  <th className="py-3 px-4">Work Order</th>
                  <th className="py-3 px-4">Technician Lead</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map(sub => {
                  const tmplId = sub.templateId || sub.formId;
                  const tmpl = templates.find(t => t.id === tmplId);
                  const job = jobs.find(j => j.id === sub.jobId);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {tmpl?.title || tmplId}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-teal-800">
                        {job?.jobNumber || sub.jobId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{sub.submittedBy}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Signed & Sealed
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="text-teal-600 hover:text-teal-700 font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Certificate
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

      {/* Fill Form Modal */}
      {submissionModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedTemplate.title}</h3>
                <p className="text-xs text-slate-500">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => setSubmissionModalOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Associate with Work Order
                </label>
                <select
                  value={jobId}
                  onChange={e => setJobId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.jobNumber} - {j.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Fields */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                {selectedTemplate.fields.map((field: FormField) => (
                  <div key={field.id} className="space-y-1">
                    <label className="block font-semibold text-slate-800">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.type === 'text' && (
                      <input
                        type="text"
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={e =>
                          setFormData({ ...formData, [field.id]: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-mono"
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        value={formData[field.id] || ''}
                        onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                      >
                        <option value="">Select option...</option>
                        {field.options?.map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'checkbox' && (
                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <input
                          type="checkbox"
                          checked={!!formData[field.id]}
                          onChange={e =>
                            setFormData({ ...formData, [field.id]: e.target.checked })
                          }
                          className="w-4 h-4 text-teal-600 rounded"
                        />
                        <span className="text-slate-700">Verified and compliant</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmissionModalOpen(false)}
                  className="px-4 py-2 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#14B8A6] text-white font-bold rounded-lg shadow-xs"
                >
                  Submit Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Certificate Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Digital Compliance Certificate</h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div>
                  Certified By: <strong className="text-slate-900">{selectedSubmission.submittedBy}</strong>
                </div>
                <div>
                  Date: <span className="text-slate-600">{new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
                </div>
                <div>
                  Job Link: <span className="font-mono font-bold text-teal-800">{selectedSubmission.jobId}</span>
                </div>
              </div>

              {/* Data fields */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Audit Findings:
                </div>
                {Object.entries(selectedSubmission.data || selectedSubmission.answers || {}).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium capitalize">{k}:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {typeof v === 'boolean' ? (v ? 'YES / PASS' : 'NO') : String(v)}
                    </span>
                  </div>
                ))}
              </div>

              {(selectedSubmission.signatureUrl || (selectedSubmission as any).signature) && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Digital Technician Sign-Off Stamp
                  </div>
                  <img
                    src={selectedSubmission.signatureUrl || (selectedSubmission as any).signature}
                    alt="Digital Signature"
                    className="h-10 bg-slate-50 border rounded p-1"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
