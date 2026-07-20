// =============================================================================
// Admin Submissions Terminal Page — /admin/submissions
// =============================================================================
// Audit terminal to review, inspect, and delete student code executions.
// Features expandable syntax inspectors, telemetry metrics, and stderr consoles.
// =============================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Terminal, Trash2, Eye, EyeOff, Clock, HardDrive, Filter, RefreshCw, Pencil, X } from 'lucide-react';

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
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  problem: {
    id: string;
    title: string;
    difficulty: string;
    topic: {
      title: string;
    };
  } | null;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Advanced Filters States
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  // Override States
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [overrideForm, setOverrideForm] = useState({ status: '', stdout: '', stderr: '' });
  const [overriding, setOverriding] = useState(false);
  const [overrideError, setOverrideError] = useState('');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        difficulty: difficultyFilter,
        language: languageFilter,
        sort: sortOrder
      }).toString();
      const res = await fetch(`/api/admin/submissions?${query}`);
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search, statusFilter, difficultyFilter, languageFilter, sortOrder]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const openOverride = (sub: Submission) => {
    setSelectedSub(sub);
    setOverrideForm({
      status: sub.status,
      stdout: sub.stdout || '',
      stderr: sub.stderr || ''
    });
    setOverrideError('');
    setShowOverrideModal(true);
  };

  const handleOverrideSubmit = async () => {
    if (!selectedSub) return;
    setOverriding(true);
    setOverrideError('');
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSub.id,
          status: overrideForm.status,
          stdout: overrideForm.stdout,
          stderr: overrideForm.stderr
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setOverrideError(data.error || 'Failed to update submission status');
        setOverriding(false);
        return;
      }
      setShowOverrideModal(false);
      fetchSubmissions();
    } catch (e) {
      setOverrideError(e instanceof Error ? e.message : 'Network error');
    }
    setOverriding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this code submission record from logs?')) return;
    try {
      const res = await fetch(`/api/admin/submissions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSubmissions();
        if (expandedId === id) setExpandedId(null);
      }
    } catch { /* ignore */ }
  };

  // Status styling mapper
  function getStatusStyle(status: string): { bg: string; text: string; border: string; label: string } {
    const s = status.toLowerCase();
    if (s === 'success' || s === 'accepted') {
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        label: '✓ Passed'
      };
    }
    if (s.includes('error') || s.includes('fail') || s.includes('wrong')) {
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20',
        label: '✗ Error'
      };
    }
    return {
      bg: 'bg-zinc-800',
      text: 'text-zinc-400',
      border: 'border-zinc-700',
      label: status
    };
  }

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Submissions Terminal</h1>
          <p className="text-sm text-zinc-500 mt-1">Audit, debug, and inspect student compiler code executions</p>
        </div>
        <button onClick={fetchSubmissions} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-all">
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search student or challenge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Statuses</option>
          <option value="success">Success / Passed</option>
          <option value="error">Errors / Failed</option>
        </select>

        {/* Difficulty Dropdown */}
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Difficulties</option>
          <option value="fill_blank">Easy (Fill-in-Blank)</option>
          <option value="full_code">Medium (Full Code)</option>
          <option value="hard">Hard (Advanced)</option>
        </select>

        {/* Sorting Dropdown */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">Date: Newest First</option>
          <option value="created_asc">Date: Oldest First</option>
          <option value="time_asc">Execution: Fastest First</option>
          <option value="memory_asc">Memory: Least Used</option>
        </select>
      </div>

      {/* Terminal Output Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-500 animate-pulse flex flex-col items-center gap-3">
            <Terminal className="w-8 h-8 text-zinc-600 animate-bounce" />
            <span>Buffering execution logs...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Terminal className="w-8 h-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">No compiler executions recorded in buffer.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-850">
            {submissions.map((sub) => {
              const statusStyle = getStatusStyle(sub.status);
              const isExpanded = expandedId === sub.id;
              
              return (
                <div key={sub.id} className={`transition-colors ${isExpanded ? 'bg-zinc-950/40' : 'hover:bg-zinc-850/20'}`}>
                  {/* Top Bar Summary Row */}
                  <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {/* Status Tag */}
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shrink-0 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        {statusStyle.label}
                      </span>
                      
                      {/* Task Info */}
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-200 truncate">
                          {sub.problem?.title || 'Sandbox Execution'}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-medium">
                          Student: <span className="text-zinc-400 font-bold">{sub.user.email}</span>
                          {sub.problem && (
                            <>
                              <span className="mx-1.5">•</span> Topic: {sub.problem.topic.title}
                              <span className="mx-1.5">•</span> Difficulty: <span className="capitalize">{sub.problem.difficulty}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Stats & Controls */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 self-end sm:self-auto shrink-0">
                      {sub.executionTimeMs !== null && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {sub.executionTimeMs}ms
                        </span>
                      )}
                      {sub.memoryUsedKb !== null && (
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5" /> {Math.round(sub.memoryUsedKb / 1024)}MB
                        </span>
                      )}
                      
                      <span className="text-[10px] text-zinc-600">
                        {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
                        <button
                          onClick={() => openOverride(sub)}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-amber-400 transition"
                          title="Override execution status"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition"
                          title={isExpanded ? 'Hide source script' : 'Inspect source script'}
                        >
                          {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition"
                          title="Purge log record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Compiler Inspector Panel */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-zinc-850 animate-slide-in">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        {/* Student Code Snippet */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">User Python Code</span>
                          <pre className="p-4 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800/80 overflow-x-auto max-h-[220px] select-all leading-relaxed">
                            {sub.sourceCode}
                          </pre>
                        </div>

                        {/* Compiler Console Logs */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Compiler Outputs (Stdout/Stderr)</span>
                          <div className="p-4 rounded-xl bg-zinc-950 font-mono text-xs border border-zinc-800/80 max-h-[220px] overflow-y-auto leading-relaxed">
                            {sub.stdout && (
                              <div className="mb-2">
                                <span className="text-emerald-500 font-bold text-[10px] block mb-0.5">Stdout:</span>
                                <span className="text-zinc-300 whitespace-pre-wrap">{sub.stdout}</span>
                              </div>
                            )}
                            {sub.stderr && (
                              <div className="mb-2">
                                <span className="text-red-500 font-bold text-[10px] block mb-0.5">Stderr:</span>
                                <span className="text-red-400/90 whitespace-pre-wrap">{sub.stderr}</span>
                              </div>
                            )}
                            {sub.compileOutput && (
                              <div>
                                <span className="text-red-500 font-bold text-[10px] block mb-0.5">Compiler Warning/Error:</span>
                                <span className="text-red-400/90 whitespace-pre-wrap">{sub.compileOutput}</span>
                              </div>
                            )}
                            {!sub.stdout && !sub.stderr && !sub.compileOutput && (
                              <span className="text-zinc-600 italic">No output logged from executing script.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Override Modal */}
      {showOverrideModal && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left">
            <button onClick={() => setShowOverrideModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-amber-500" /> Override Submission
            </h2>
            <div className="mb-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <p className="text-xs text-zinc-400">Student: <span className="font-bold text-zinc-200">{selectedSub.user.email}</span></p>
              <p className="text-xs text-zinc-400 mt-1">Problem: <span className="font-bold text-zinc-200">{selectedSub.problem?.title || 'Sandbox'}</span></p>
            </div>
            {overrideError && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{overrideError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Execution Status *</label>
                <select 
                  value={overrideForm.status} 
                  onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50"
                >
                  <option value="success">Success / Passed</option>
                  <option value="wrong_answer">Wrong Answer</option>
                  <option value="runtime_error">Runtime Error</option>
                  <option value="compile_error">Compile Error</option>
                  <option value="pending">Pending / Queued</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Stdout Console Logs</label>
                <textarea
                  rows={3}
                  value={overrideForm.stdout}
                  onChange={(e) => setOverrideForm({ ...overrideForm, stdout: e.target.value })}
                  placeholder="Standard output logs..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-805 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Stderr / Error Logs</label>
                <textarea
                  rows={3}
                  value={overrideForm.stderr}
                  onChange={(e) => setOverrideForm({ ...overrideForm, stderr: e.target.value })}
                  placeholder="Stack traces or build errors..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-805 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 font-mono text-xs"
                />
              </div>
            </div>
            
            <button onClick={handleOverrideSubmit} disabled={overriding || !overrideForm.status} className="w-full mt-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
              {overriding ? 'Updating...' : 'Override Submission'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
