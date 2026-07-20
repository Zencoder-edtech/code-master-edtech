// =============================================================================
// Admin Schools B2B Page — /admin/schools
// =============================================================================
// Dashboard to manage institutional B2B accounts and class voucher code sets.
// Enables grouping students by school codes and auditing parent consents.
// =============================================================================
'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, School, X, Link as LinkIcon, Unlink, GraduationCap, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';

interface SchoolGroup {
  schoolId: string;
  totalStudents: number;
  minorCount: number;
  consentRate: number;
  avgAge: number;
  emails: string[];
}

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<SchoolGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Expanded school detail row for listing individual students
  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);

  // Advanced Filters & Sorting States
  const [consentFilter, setConsentFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('id_asc');

  // Migrate School Code States
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [migrateForm, setMigrateForm] = useState({ oldSchoolId: '', newSchoolId: '' });
  const [migrating, setMigrating] = useState(false);
  const [migrateError, setMigrateError] = useState('');

  // Modal forms
  const [showBindModal, setShowBindModal] = useState(false);
  const [form, setForm] = useState({ email: '', schoolId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/schools');
      const data = await res.json();
      setSchools(data.schools || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const openBind = (sId: string = '') => {
    setError('');
    setForm({ email: '', schoolId: sId });
    setShowBindModal(true);
  };

  const handleBindSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to bind student');
        setSaving(false);
        return;
      }
      setShowBindModal(false);
      fetchSchools();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    }
    setSaving(false);
  };

  const handleUnbind = async (email: string) => {
    if (!confirm(`Remove student ${email} from their registered school?`)) return;
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, schoolId: '' })
      });
      if (res.ok) {
        fetchSchools();
      }
    } catch { /* ignore */ }
  };

  const openMigrate = (schoolId: string = '') => {
    setMigrateForm({ oldSchoolId: schoolId, newSchoolId: '' });
    setMigrateError('');
    setShowMigrateModal(true);
  };

  const handleMigrateSubmit = async () => {
    setMigrating(true);
    setMigrateError('');
    try {
      const res = await fetch('/api/admin/schools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(migrateForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setMigrateError(data.error || 'Failed to migrate school code');
        setMigrating(false);
        return;
      }
      setShowMigrateModal(false);
      fetchSchools();
    } catch (e) {
      setMigrateError(e instanceof Error ? e.message : 'Network error');
    }
    setMigrating(false);
  };

  // Filter and sort school groups
  const filteredSchools = schools
    .filter((s) => {
      const matchesSearch = 
        s.schoolId.toLowerCase().includes(search.toLowerCase()) ||
        s.emails.some(email => email.toLowerCase().includes(search.toLowerCase()));
      if (!matchesSearch) return false;

      if (consentFilter === 'complete' && s.consentRate !== 100) return false;
      if (consentFilter === 'incomplete' && s.consentRate === 100) return false;

      if (sizeFilter === 'small' && s.totalStudents > 5) return false;
      if (sizeFilter === 'large' && s.totalStudents <= 5) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'id_asc') {
        return a.schoolId.localeCompare(b.schoolId);
      }
      if (sortOrder === 'students_desc') {
        return b.totalStudents - a.totalStudents;
      }
      if (sortOrder === 'students_asc') {
        return a.totalStudents - b.totalStudents;
      }
      if (sortOrder === 'consent_desc') {
        return b.consentRate - a.consentRate;
      }
      if (sortOrder === 'consent_asc') {
        return a.consentRate - b.consentRate;
      }
      return 0;
    });

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Schools Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage B2B school groupings, voucher bindings, and students</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => openMigrate()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 text-zinc-200 text-sm font-semibold transition-all">
            <RefreshCw className="w-4 h-4 text-violet-400" /> Migrate School Code
          </button>
          <button onClick={() => openBind()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
            <LinkIcon className="w-4 h-4" /> Link Student to School
          </button>
        </div>
      </div>

      {/* Search & Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search school code or student email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>

        <select
          value={consentFilter}
          onChange={(e) => setConsentFilter(e.target.value)}
          className="px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Consent Rates</option>
          <option value="complete">100% Consent Approved</option>
          <option value="incomplete">Pending Consent (&lt;100%)</option>
        </select>

        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Group Sizes</option>
          <option value="small">Small/Medium Group (&lt;= 5)</option>
          <option value="large">Large Group (&gt; 5)</option>
        </select>
      </div>

      <div className="flex items-center justify-between mt-1 bg-zinc-900/30 px-2 py-1.5 rounded-lg border border-zinc-800/40">
        <p className="text-xs text-zinc-500 font-medium">Found {filteredSchools.length} school registry group{filteredSchools.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-semibold">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-transparent border-none text-violet-400 font-bold focus:ring-0 cursor-pointer pr-8"
          >
            <option value="id_asc">School ID (A-Z)</option>
            <option value="students_desc">Student Count (Highest)</option>
            <option value="students_asc">Student Count (Lowest)</option>
            <option value="consent_desc">Consent Rate (Highest)</option>
            <option value="consent_asc">Consent Rate (Lowest)</option>
          </select>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-zinc-500 animate-pulse">Calculating institutional registries...</div>
        ) : filteredSchools.length === 0 ? (
          <div className="p-10 text-center">
            <School className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No school codes registered. Link a student with a School ID to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-8"></th>
                  {['School ID / Code', 'Linked Students', 'Minor Ratio', 'Parent Consent Rate', 'Average Student Age', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredSchools.map((s) => {
                  const isExpanded = expandedSchoolId === s.schoolId;
                  const minorRatio = s.totalStudents > 0 ? Math.round((s.minorCount / s.totalStudents) * 100) : 0;
                  
                  return (
                    <>
                      <tr key={s.schoolId} className={`hover:bg-zinc-800/30 transition-colors ${isExpanded ? 'bg-zinc-800/10' : ''}`}>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => setExpandedSchoolId(isExpanded ? null : s.schoolId)}
                            className="p-1 rounded-md hover:bg-zinc-850 text-zinc-500 hover:text-violet-400 transition"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-sm font-extrabold text-zinc-200">{s.schoolId}</td>
                        <td className="px-5 py-3 text-sm text-zinc-400">{s.totalStudents} student{s.totalStudents !== 1 ? 's' : ''}</td>
                        <td className="px-5 py-3 text-sm text-zinc-400">{minorRatio}% Minors</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                            s.consentRate > 80
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {s.consentRate}% Approved
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-zinc-400">{s.avgAge} Years Old</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3.5">
                            <button
                              onClick={() => openBind(s.schoolId)}
                              className="flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300 transition"
                            >
                              + Link Student
                            </button>
                            <button
                              onClick={() => openMigrate(s.schoolId)}
                              className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                            >
                              ⚙ Migrate Code
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable list of students within the school */}
                      {isExpanded && (
                        <tr key={`${s.schoolId}-details`}>
                          <td colSpan={7} className="p-0">
                            <div className="px-6 py-4 bg-zinc-950/40 border-t border-zinc-800/80">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-violet-400" /> Students Registered at {s.schoolId}
                              </h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {s.emails.map((email) => (
                                  <div key={email} className="px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                                    <span className="font-semibold text-zinc-300 truncate">{email}</span>
                                    <button
                                      onClick={() => handleUnbind(email)}
                                      className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition"
                                      title="Unbind student from school ID"
                                    >
                                      <Unlink className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bind Student Modal */}
      {showBindModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowBindModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-violet-500" /> Link Student to School
            </h2>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Student Account Email *</label>
                <input 
                  type="email" 
                  placeholder="student@email.com"
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">School ID / Code *</label>
                <input 
                  type="text" 
                  placeholder="e.g. DPS-DELHI-01"
                  value={form.schoolId} 
                  onChange={(e) => setForm({ ...form, schoolId: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" 
                />
              </div>
            </div>
            
            <button onClick={handleBindSubmit} disabled={saving || !form.email || !form.schoolId} className="w-full mt-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20">
              {saving ? 'Linking...' : 'Link Student'}
            </button>
          </div>
        </div>
      )}

      {/* Migrate Modal */}
      {showMigrateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left text-zinc-100">
            <button onClick={() => setShowMigrateModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-violet-500" /> Migrate School Code
            </h2>
            {migrateError && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{migrateError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Original School ID / Code *</label>
                <input 
                  type="text" 
                  placeholder="e.g. DPS-DELHI-01"
                  value={migrateForm.oldSchoolId} 
                  onChange={(e) => setMigrateForm({ ...migrateForm, oldSchoolId: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-550 focus:outline-none focus:border-violet-500/50" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">New School ID / Code *</label>
                <input 
                  type="text" 
                  placeholder="e.g. DPS-DELHI-02"
                  value={migrateForm.newSchoolId} 
                  onChange={(e) => setMigrateForm({ ...migrateForm, newSchoolId: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-550 focus:outline-none focus:border-violet-500/50" 
                />
              </div>
            </div>
            
            <button onClick={handleMigrateSubmit} disabled={migrating || !migrateForm.oldSchoolId || !migrateForm.newSchoolId} className="w-full mt-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
              {migrating ? 'Migrating...' : 'Migrate School Code'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
