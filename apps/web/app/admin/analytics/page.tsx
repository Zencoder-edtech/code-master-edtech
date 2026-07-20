// =============================================================================
// Admin Analytics & Compliance Page — /admin/analytics
// =============================================================================
// Regulatory compliance panel auditing demographics, minors ratio, B2C funnels
// and verifiable parental consent clearance required under the DPDP Act 2023.
// =============================================================================
'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Users, Percent, Terminal, RefreshCw, BarChart, Pencil, X, Search } from 'lucide-react';

interface AnalyticsData {
  demographics: {
    totalUsers: number;
    minorCount: number;
    adultCount: number;
    consentGiven: number;
    consentPending: number;
  };
  roles: {
    students: number;
    teachers: number;
    admins: number;
  };
  submissions: {
    totalSubs: number;
    successSubs: number;
    failSubs: number;
  };
  progress: {
    completedProgress: number;
    activeProgress: number;
  };
  minorAudits: Array<{
    id: string;
    name: string | null;
    email: string;
    age: number;
    parentalConsent: boolean;
    parentalEmail: string | null;
    createdAt: string;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [consentFilter, setConsentFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMinor, setSelectedMinor] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ age: '0', parentalConsent: false, parentalEmail: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        consent: consentFilter,
        age: ageFilter
      }).toString();
      const res = await fetch(`/api/admin/analytics?${query}`);
      const json = await res.json();
      setData(json);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [search, consentFilter, ageFilter]);

  const openEdit = (minor: any) => {
    setSelectedMinor(minor);
    setEditForm({
      age: String(minor.age),
      parentalConsent: minor.parentalConsent,
      parentalEmail: minor.parentalEmail || ''
    });
    setError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedMinor) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${selectedMinor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(editForm.age),
          parentalConsent: editForm.parentalConsent,
          parentalEmail: editForm.parentalEmail
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update compliance details');
        setSaving(false);
        return;
      }
      setShowEditModal(false);
      fetchAnalytics();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    }
    setSaving(false);
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 text-zinc-500 animate-pulse">
        <div className="h-10 w-64 bg-zinc-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-2xl" />
          <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { demographics, roles, submissions, progress, minorAudits } = data;

  // Calculators
  const minorPercent = demographics.totalUsers > 0 ? Math.round((demographics.minorCount / demographics.totalUsers) * 100) : 0;
  const consentPercent = demographics.minorCount > 0 ? Math.round((demographics.consentGiven / demographics.minorCount) * 100) : 100;
  const compilerSuccessPercent = submissions.totalSubs > 0 ? Math.round((submissions.successSubs / submissions.totalSubs) * 100) : 100;

  // SVG parameters for minor radial gauge
  const radius = 30;
  const circ = 2 * Math.PI * radius;
  const strokeOffset = circ - (minorPercent / 100) * circ;

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-emerald-400" /> Analytics & Compliance
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Audit demographics, minors ratios, and parental consent logs</p>
        </div>
        <button onClick={fetchAnalytics} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-all">
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-zinc-100">{demographics.totalUsers}</p>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mt-1">Total Users</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
            <Percent className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400">{demographics.minorCount} ({minorPercent}%)</p>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mt-1">Underage Users (&lt;18)</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{demographics.consentGiven} ({consentPercent}%)</p>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mt-1">Consent Cleared (DPDP)</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
            <Terminal className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-2xl font-black text-violet-400">{submissions.totalSubs}</p>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mt-1">Total Submissions</span>
        </div>
      </div>

      {/* Gauges & Visual Progress grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DPDP Compliance Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 mb-4">
              🛡️ DPDP Act Audit
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Minors registration requires parent verifiable consent. The gauge below represents verified parental consent emails vs minors currently pending consent.
            </p>
          </div>

          <div className="my-6 flex items-center gap-6 justify-center">
            {/* Radial Gauge */}
            <div className="relative">
              <svg width="80" height="80" viewBox="0 0 80 80" className="transform -rotate-90">
                <circle cx="40" cy="40" r="30" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black">
                {consentPercent}%
              </div>
            </div>

            <div className="text-xs space-y-1.5 font-bold">
              <p className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Approved: {demographics.consentGiven}
              </p>
              <p className="text-amber-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Pending: {demographics.consentPending}
              </p>
            </div>
          </div>
          
          <div className="border-t border-zinc-800/80 pt-4 text-center">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
              Regulatory Verification status: <span className={consentPercent > 80 ? 'text-emerald-400' : 'text-amber-400'}>{consentPercent > 80 ? 'Satisfactory' : 'Needs Review'}</span>
            </span>
          </div>
        </div>

        {/* Compiler Health Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 mb-4">
              💻 Compiler Diagnostics
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Pass rate of user code executions submitted to Judge0. High levels of compile or runtime failures may indicate curriculum difficulty.
            </p>
          </div>

          <div className="my-6">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-black text-violet-400">{compilerSuccessPercent}%</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Pass Rate</span>
            </div>
            
            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${compilerSuccessPercent}%` }}
              />
            </div>
            
            <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase mt-3">
              <span className="text-emerald-400">Passed: {submissions.successSubs}</span>
              <span className="text-red-400">Failed: {submissions.failSubs}</span>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-4 text-center">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
              CURRICULUM WELLNESS INDEX: <span className="text-emerald-400">HEALTHY</span>
            </span>
          </div>
        </div>

        {/* Classroom Roles Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 mb-4">
              🏫 Classroom Segments
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Proportion of user types registered on the EdTech platform. Students build profiles, while teachers monitor metrics.
            </p>
          </div>

          <div className="my-5 space-y-3 font-semibold text-xs text-zinc-400">
            <div>
              <div className="flex justify-between mb-1">
                <span>Students</span>
                <span className="text-zinc-200">{roles.students}</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: `${demographics.totalUsers > 0 ? (roles.students / demographics.totalUsers) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Teachers / Instructors</span>
                <span className="text-zinc-200">{roles.teachers}</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${demographics.totalUsers > 0 ? (roles.teachers / demographics.totalUsers) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Super Admins</span>
                <span className="text-zinc-200">{roles.admins}</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-red-400 h-full rounded-full" style={{ width: `${demographics.totalUsers > 0 ? (roles.admins / demographics.totalUsers) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-4 text-center">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
              TOPIC MODULE COMPLETES: <span className="text-emerald-400">{progress.completedProgress}</span>
            </span>
          </div>
        </div>
      </div>

      {/* DPDP Consent Audit Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <span>🛡️</span> Regulated Minor Audit Log (DPDP Act 2023 compliance)
          </h2>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search student or parent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 placeholder:text-zinc-650 focus:outline-none focus:border-violet-500/50 w-48"
              />
            </div>
            
            <select
              value={consentFilter}
              onChange={(e) => setConsentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
            >
              <option value="">All Consent</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Only</option>
            </select>

            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
            >
              <option value="">All Ages</option>
              <option value="under13">Under 13</option>
              <option value="13to17">13 to 17</option>
            </select>
          </div>
        </div>

        {minorAudits.length === 0 ? (
          <div className="p-10 text-center text-sm text-zinc-500">No underage minors found in the system log.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Student Name', 'Student Email', 'Age', 'Parent Email', 'Parental Approval Timestamp', 'Approval Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {minorAudits.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-zinc-200">{m.name || '—'}</td>
                    <td className="px-5 py-3 text-sm text-zinc-400">{m.email}</td>
                    <td className="px-5 py-3 text-sm text-zinc-400">{m.age} years</td>
                    <td className="px-5 py-3 text-sm text-zinc-400 font-semibold">{m.parentalEmail || <span className="text-zinc-600 italic">Not Registered</span>}</td>
                    <td className="px-5 py-3 text-xs text-zinc-500">
                      {m.parentalConsent ? new Date(m.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                        m.parentalConsent
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                      }`}>
                        {m.parentalConsent ? 'Consent Verified' : 'Approval Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openEdit(m)}
                        className="p-1.5 rounded-lg hover:bg-zinc-850 text-zinc-500 hover:text-violet-400 transition-colors"
                        title="Edit minor consent details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Compliance Details Modal */}
      {showEditModal && selectedMinor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Edit Compliance Logs
            </h2>
            <div className="mb-4 p-3.5 bg-zinc-950 rounded-xl border border-zinc-850">
              <p className="text-xs text-zinc-400">Student: <span className="font-bold text-zinc-200">{selectedMinor.email}</span></p>
              <p className="text-xs text-zinc-400 mt-1">Name: <span className="font-bold text-zinc-200">{selectedMinor.name || 'Unnamed'}</span></p>
            </div>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Age Verify *</label>
                <input 
                  type="number" 
                  min={0}
                  value={editForm.age} 
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Parent Email Address</label>
                <input 
                  type="email" 
                  value={editForm.parentalEmail} 
                  onChange={(e) => setEditForm({ ...editForm, parentalEmail: e.target.value })} 
                  placeholder="parent@email.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50" 
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer mt-4 select-none">
                <input 
                  type="checkbox"
                  checked={editForm.parentalConsent}
                  onChange={(e) => setEditForm({ ...editForm, parentalConsent: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-violet-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-sm text-zinc-300 font-semibold">Verifiable Parental Consent Cleared</span>
              </label>
            </div>
            
            <button onClick={handleEditSubmit} disabled={saving || !editForm.age} className="w-full mt-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
              {saving ? 'Updating...' : 'Update Compliance Log'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
