// =============================================================================
// Admin Users Page — /admin/users
// =============================================================================
// Full CRUD user management with search, create, edit, delete.
// Enhanced with Student Submission Forensics: expandable user detail view
// showing color-coded submission history, code preview, and execution stats.
// =============================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, X, UserPlus, ChevronDown, ChevronRight, Clock, Zap, MemoryStick, Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  age: number;
  role: string;
  subscriptionTier: string;
  isMinor: boolean;
  parentalConsent: boolean;
  parentalEmail: string | null;
  schoolId: string | null;
  createdAt: string;
}

interface SubmissionProblem {
  id: string;
  title: string;
  difficulty: string;
  language: string;
  topicTitle: string;
}

interface Submission {
  id: string;
  sourceCode: string;
  language: string;
  status: string;
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  executionTimeMs: number | null;
  memoryUsedKb: number | null;
  createdAt: string;
  completedAt: string | null;
  problem: SubmissionProblem | null;
}

interface SubmissionStats {
  total: number;
  success: number;
  errors: number;
  avgExecutionTimeMs: number | null;
}

const EMPTY_FORM = { email: '', name: '', age: '', role: 'student', subscriptionTier: 'free', schoolId: '', parentalConsent: false, parentalEmail: '' };

// ---------------------------------------------------------------------------
// Status color mapping for submission forensics
// ---------------------------------------------------------------------------
function getStatusStyle(status: string): { bg: string; text: string; label: string } {
  const s = status.toLowerCase();
  if (s === 'accepted' || s === 'success') return { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: '✓ Success' };
  if (s.includes('runtime') || s.includes('error')) return { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', label: '✗ Runtime Error' };
  if (s.includes('compil')) return { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', label: '✗ Compile Error' };
  if (s.includes('wrong')) return { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: '✗ Wrong Answer' };
  if (s === 'pending' || s === 'queued' || s === 'processing') return { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', label: '⏳ ' + status };
  if (s.includes('time') && s.includes('limit')) return { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: '⏰ Time Limit' };
  return { bg: 'bg-zinc-800 border-zinc-700', text: 'text-zinc-400', label: status };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Filters and Sorting States
  const [roleFilter, setRoleFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Submission forensics state
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionStats, setSubmissionStats] = useState<SubmissionStats | null>(null);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);

  // User session timeline states
  const [activeSubTab, setActiveSubTab] = useState<'submissions' | 'sessions'>('submissions');
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&limit=100`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const fetchSubmissions = useCallback(async (userId: string) => {
    setLoadingSubs(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/submissions?limit=5`);
      const data = await res.json();
      setSubmissions(data.submissions || []);
      setSubmissionStats(data.stats || null);
    } catch {
      setSubmissions([]);
      setSubmissionStats(null);
    }
    setLoadingSubs(false);
  }, []);

  const fetchSessions = useCallback(async (userId: string) => {
    setLoadingSessions(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/sessions`);
      const data = await res.json();
      setUserSessions(data.sessions || []);
    } catch {
      setUserSessions([]);
    }
    setLoadingSessions(false);
  }, []);

  const toggleExpand = (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setSubmissions([]);
      setSubmissionStats(null);
      setUserSessions([]);
    } else {
      setExpandedUserId(userId);
      setExpandedCodeId(null);
      setActiveSubTab('submissions');
      fetchSubmissions(userId);
      fetchSessions(userId);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({
      email: u.email,
      name: u.name || '',
      age: String(u.age),
      role: u.role,
      subscriptionTier: u.subscriptionTier,
      schoolId: u.schoolId || '',
      parentalConsent: u.parentalConsent,
      parentalEmail: u.parentalEmail || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return; }
      setShowModal(false);
      fetchUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch { /* ignore */ }
  };

  // Client-side filtering and sorting for the loaded users (up to 100)
  const filteredUsers = users
    .filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (tierFilter && u.subscriptionTier !== tierFilter) return false;
      if (ageFilter === 'minor' && !u.isMinor) return false;
      if (ageFilter === 'adult' && u.isMinor) return false;
      if (schoolFilter === 'has' && !u.schoolId) return false;
      if (schoolFilter === 'none' && u.schoolId) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'name_asc') {
        return (a.name || a.email).localeCompare(b.name || b.email);
      }
      if (sortOrder === 'email_asc') {
        return a.email.localeCompare(b.email);
      }
      if (sortOrder === 'age_asc') {
        return a.age - b.age;
      }
      if (sortOrder === 'age_desc') {
        return b.age - a.age;
      }
      if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Users</h1>
          <p className="text-sm text-zinc-500 mt-1">{total} registered user{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
        />
      </div>

      {/* Filters & Sorting Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mt-2">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Tiers</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>

        <select
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Ages</option>
          <option value="minor">Minors (&lt; 18)</option>
          <option value="adult">Adults (&gt;= 18)</option>
        </select>

        <select
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All School Links</option>
          <option value="has">Has School Code</option>
          <option value="none">No School Code</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50 col-span-2 md:col-span-1"
        >
          <option value="newest">Signup: Newest</option>
          <option value="oldest">Signup: Oldest</option>
          <option value="name_asc">Name: A-Z</option>
          <option value="email_asc">Email: A-Z</option>
          <option value="age_asc">Age: Low to High</option>
          <option value="age_desc">Age: High to Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-zinc-500 animate-pulse">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center">
            <UserPlus className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No users found matching current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-8"></th>
                  {['Name', 'Email', 'Age', 'Role', 'Tier', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredUsers.map((u) => (
                  <>
                    <tr key={u.id} className={`hover:bg-zinc-800/30 transition-colors ${expandedUserId === u.id ? 'bg-zinc-800/20' : ''}`}>
                      {/* Expand toggle */}
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleExpand(u.id)}
                          className="p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition-colors"
                          title="View submissions"
                        >
                          {expandedUserId === u.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400">
                            {(u.name || u.email)[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-zinc-200">{u.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-400">{u.email}</td>
                      <td className="px-5 py-3 text-sm text-zinc-400">{u.age}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${
                          u.role === 'teacher' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          u.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${
                          u.subscriptionTier === 'premium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}>{u.subscriptionTier}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(u.id, u.email)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Submission Forensics Expanded Row */}
                    {expandedUserId === u.id && (
                      <tr key={`${u.id}-subs`}>
                        <td colSpan={8} className="p-0">
                          <div className="px-6 py-5 bg-zinc-950/50 border-t border-zinc-800/50">
                            {/* Tab selector */}
                            <div className="flex items-center gap-4 border-b border-zinc-800 pb-3.5 mb-5 select-none">
                              <button
                                onClick={() => setActiveSubTab('submissions')}
                                className={`text-xs font-bold uppercase tracking-widest pb-1 transition-all border-b-2 ${
                                  activeSubTab === 'submissions'
                                    ? 'text-violet-400 border-violet-500'
                                    : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                                }`}
                              >
                                📜 Submission Forensics
                              </button>
                              <button
                                onClick={() => setActiveSubTab('sessions')}
                                className={`text-xs font-bold uppercase tracking-widest pb-1 transition-all border-b-2 ${
                                  activeSubTab === 'sessions'
                                    ? 'text-violet-400 border-violet-500'
                                    : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                                }`}
                              >
                                🧭 Session Audit Trails
                              </button>
                            </div>

                            {activeSubTab === 'submissions' ? (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    Compiler Solves History
                                  </h3>
                                  {submissionStats && (
                                    <div className="flex items-center gap-4 text-xs font-semibold">
                                      <span className="text-zinc-500">Total: <span className="text-zinc-300 font-bold">{submissionStats.total}</span></span>
                                      <span className="text-emerald-400 font-bold">{submissionStats.success} passed</span>
                                      <span className="text-red-400 font-bold">{submissionStats.errors} errors</span>
                                      {submissionStats.avgExecutionTimeMs !== null && (
                                        <span className="text-zinc-500 flex items-center gap-1">
                                          <Zap className="w-3 h-3" /> Avg: <span className="text-zinc-300 font-bold">{submissionStats.avgExecutionTimeMs}ms</span>
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {loadingSubs ? (
                                  <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                      <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
                                    ))}
                                  </div>
                                ) : submissions.length === 0 ? (
                                  <div className="text-center py-8 text-sm text-zinc-500 font-medium">
                                    No submissions found for this user.
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {submissions.map((sub) => {
                                      const statusStyle = getStatusStyle(sub.status);
                                      const isCodeOpen = expandedCodeId === sub.id;

                                      return (
                                        <div key={sub.id} className={`bg-zinc-900 rounded-xl border ${statusStyle.bg} overflow-hidden transition-all`}>
                                          <div className="px-4 py-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border whitespace-nowrap ${statusStyle.bg} ${statusStyle.text}`}>
                                                {statusStyle.label}
                                              </span>

                                              <div className="min-w-0">
                                                <p className="text-sm font-semibold text-zinc-200 truncate">
                                                  {sub.problem?.title || 'Unknown Problem'}
                                                </p>
                                                <p className="text-[10px] text-zinc-500">
                                                  {sub.problem?.topicTitle} • {sub.problem?.difficulty} • {sub.language}
                                                </p>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                              {sub.executionTimeMs !== null && (
                                                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                  <Clock className="w-3 h-3" /> {sub.executionTimeMs}ms
                                                </span>
                                              )}
                                              {sub.memoryUsedKb !== null && (
                                                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                  <MemoryStick className="w-3 h-3" /> {Math.round(sub.memoryUsedKb / 1024)}MB
                                                </span>
                                              )}

                                              <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                                                {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </span>

                                              <button
                                                onClick={() => setExpandedCodeId(isCodeOpen ? null : sub.id)}
                                                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition-colors"
                                                title={isCodeOpen ? 'Hide code' : 'View code'}
                                              >
                                                {isCodeOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                              </button>
                                            </div>
                                          </div>

                                          {isCodeOpen && (
                                            <div className="border-t border-zinc-800/60">
                                              <pre className="p-4 text-xs font-mono text-zinc-300 bg-zinc-950/50 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                                                {sub.sourceCode}
                                              </pre>
                                              {(sub.stdout || sub.stderr || sub.compileOutput) && (
                                                <div className="px-4 py-3 border-t border-zinc-800/40 bg-zinc-950/30">
                                                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Output</p>
                                                  <pre className="text-xs font-mono text-zinc-400 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                                    {sub.stdout || sub.stderr || sub.compileOutput}
                                                  </pre>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    Chronological User Session Event Streams
                                  </h3>
                                  <div className="text-xs text-zinc-500 font-semibold">
                                    Total Sessions: <span className="text-zinc-300 font-bold">{userSessions.length}</span>
                                  </div>
                                </div>

                                {loadingSessions ? (
                                  <div className="space-y-3">
                                    {[1, 2].map((i) => (
                                      <div key={i} className="h-28 bg-zinc-900 rounded-xl animate-pulse border border-zinc-800" />
                                    ))}
                                  </div>
                                ) : userSessions.length === 0 ? (
                                  <div className="text-center py-8 text-sm text-zinc-500 font-medium">
                                    No sessions recorded. Timelines are generated upon logins or exercises.
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {userSessions.map((sess: any) => {
                                      const totalTimeMins = Math.round(sess.durationSec / 60);

                                      return (
                                        <div key={sess.id} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-sm">
                                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800/80 pb-3">
                                            <div>
                                              <p className="text-sm font-extrabold text-zinc-200 flex items-center gap-1.5">
                                                🔑 Logged In Session
                                              </p>
                                              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                                                Device: {sess.device}
                                              </p>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500 self-end sm:self-auto">
                                              <span>
                                                {new Date(sess.loginAt).toLocaleDateString()} {new Date(sess.loginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </span>
                                              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-lg text-[10px]">
                                                ⏱ {totalTimeMins} mins
                                              </span>
                                            </div>
                                          </div>

                                          {/* Session Event Feed */}
                                          <div className="mt-4 pl-6 border-l-2 border-zinc-800 space-y-4 relative">
                                            {sess.events.map((evt: any, eIdx: number) => (
                                              <div key={eIdx} className="relative">
                                                {/* Mini emoji bubble anchor */}
                                                <span className="absolute -left-[35px] top-0 bg-zinc-950 border border-zinc-800 rounded-full w-6 h-6 flex items-center justify-center text-xs select-none">
                                                  {evt.icon}
                                                </span>
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-1 pl-2">
                                                  <div>
                                                    <p className="text-xs font-bold text-zinc-300">{evt.action}</p>
                                                    {evt.details && (
                                                      <p className="text-[10px] text-zinc-500 font-medium mt-0.5 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 w-fit">
                                                        {evt.details}
                                                      </p>
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-2 self-end sm:self-auto text-[10px] font-semibold text-zinc-500">
                                                    <span>
                                                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                    {evt.durationSec && (
                                                      <span className="px-1.5 py-0.5 bg-zinc-950 border border-zinc-850 rounded text-[9px] text-zinc-400">
                                                        Stayed {Math.floor(evt.durationSec / 60)}m {evt.durationSec % 60}s
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-5">{editingUser ? 'Edit User' : 'Create User'}</h2>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="space-y-3">
              <input placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" disabled={!!editingUser} />
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" />
              <input placeholder="Age *" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <select value={form.subscriptionTier} onChange={(e) => setForm({ ...form, subscriptionTier: e.target.value })} className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50">
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <input placeholder="School ID (optional)" value={form.schoolId} onChange={(e) => setForm({ ...form, schoolId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" />
              
              {form.age && parseInt(form.age) < 18 && (
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-2.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">DPDP Act Compliance (Minor)</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={form.parentalConsent}
                      onChange={(e) => setForm({ ...form, parentalConsent: e.target.checked })}
                      className="rounded border-zinc-700 bg-zinc-800 text-violet-600 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                    />
                    <span className="text-xs text-zinc-300 font-semibold">Verifiable Parental Consent Cleared</span>
                  </label>
                  <div>
                    <input
                      type="email"
                      placeholder="Parent's Email Address"
                      value={form.parentalEmail}
                      onChange={(e) => setForm({ ...form, parentalEmail: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleSave} disabled={saving || !form.email || !form.age} className="w-full mt-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20">
              {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
