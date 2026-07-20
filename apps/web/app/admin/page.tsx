// =============================================================================
// Admin Dashboard — /admin
// =============================================================================
// Real-time stats from DB, recent users, quick actions, dynamic seed presets,
// and enhanced system telemetry with auto-refresh and sparklines.
// =============================================================================
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Users, BookOpen, FileText, Code2, HelpCircle, Layers, Database, ArrowRight, AlertTriangle, ChevronDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  userCount: number;
  courseCount: number;
  topicCount: number;
  submissionCount: number;
  mcqCount: number;
  problemCount: number;
}

interface RecentUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Seed Preset Configuration
// ---------------------------------------------------------------------------
const SEED_PRESETS = [
  {
    id: 'python-fundamentals',
    label: 'Python Fundamentals',
    icon: '🐍',
    description: 'Variables, Loops, Functions — 3 topics, 9 MCQs, 9 problems, 5 users',
    destructive: false,
  },
  {
    id: 'javascript-algorithms',
    label: 'JavaScript Algorithms',
    icon: '⚡',
    description: 'Scopes, Arrays, Recursion — 3 topics, 9 MCQs, 9 problems, 2 users',
    destructive: false,
  },
];

// ---------------------------------------------------------------------------
// Mini Sparkline Component
// ---------------------------------------------------------------------------
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="mt-1.5 opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [showSeedDropdown, setShowSeedDropdown] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);

  // Observability Diagnostics Telemetry
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [compilerLatency, setCompilerLatency] = useState<number | null>(null);
  const [browserPing, setBrowserPing] = useState<number | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Latency history for sparklines (last 10 pings)
  const [dbHistory, setDbHistory] = useState<number[]>([]);
  const [compilerHistory, setCompilerHistory] = useState<number[]>([]);
  const [browserHistory, setBrowserHistory] = useState<number[]>([]);

  const seedDropdownRef = useRef<HTMLDivElement>(null);

  // Close seed dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (seedDropdownRef.current && !seedDropdownRef.current.contains(e.target as Node)) {
        setShowSeedDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runDiagnostics = useCallback(async () => {
    setDiagnosing(true);
    // 1. Prisma DB Ping Test
    const t0 = performance.now();
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const val = Math.round(performance.now() - t0);
        setDbLatency(val);
        setDbHistory((prev) => [...prev.slice(-9), val]);
      } else {
        setDbLatency(null);
      }
    } catch {
      setDbLatency(null);
    }

    // 2. Compiler Ping Test
    const t1 = performance.now();
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'print("ping")', language_id: 71 }),
      });
      if (res.ok) {
        const val = Math.round(performance.now() - t1);
        setCompilerLatency(val);
        setCompilerHistory((prev) => [...prev.slice(-9), val]);
      } else {
        setCompilerLatency(null);
      }
    } catch {
      setCompilerLatency(null);
    }

    // 3. Static Content Ping Speed
    const t2 = performance.now();
    try {
      await fetch('/favicon.ico');
      const val = Math.round(performance.now() - t2);
      setBrowserPing(val);
      setBrowserHistory((prev) => [...prev.slice(-9), val]);
    } catch {
      setBrowserPing(null);
    }
    setDiagnosing(false);
  }, []);

  // Auto-refresh diagnostics every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(() => {
        runDiagnostics();
      }, 30000);
    } else {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [autoRefresh, runDiagnostics]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
    runDiagnostics();
  }, [fetchStats, runDiagnostics]);

  const handleSeed = async (presetId: string) => {
    // Confirmation guard for destructive preset
    if (presetId === 'clean-wipe' && !confirmWipe) {
      setConfirmWipe(true);
      return;
    }

    setSeeding(true);
    setSeedMsg('');
    setShowSeedDropdown(false);
    setConfirmWipe(false);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: presetId }),
      });
      const data = await res.json();
      if (data.success) {
        if (presetId === 'clean-wipe') {
          setSeedMsg('✅ ' + (data.message || 'Database wiped successfully.'));
        } else {
          setSeedMsg(`✅ Seeded: ${data.seeded.courses} course, ${data.seeded.topics} topics, ${data.seeded.mcqs} MCQs, ${data.seeded.problems} problems, ${data.seeded.users} users`);
        }
        fetchStats();
      } else {
        setSeedMsg(`❌ ${data.error}`);
      }
    } catch (e) {
      setSeedMsg(`❌ ${e instanceof Error ? e.message : 'Network error'}`);
    }
    setSeeding(false);
  };

  // Health status helper
  function getHealthStatus(db: number | null, compiler: number | null, browser: number | null): { label: string; color: string; bgColor: string } {
    const offline = [db, compiler, browser].filter((v) => v === null).length;
    if (offline >= 2) return { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500' };
    if (offline === 1) return { label: 'Degraded', color: 'text-amber-400', bgColor: 'bg-amber-500' };
    const slow = [db && db > 800, compiler && compiler > 2000, browser && browser > 300].filter(Boolean).length;
    if (slow >= 2) return { label: 'Slow', color: 'text-amber-400', bgColor: 'bg-amber-500' };
    return { label: 'Healthy', color: 'text-emerald-400', bgColor: 'bg-emerald-500' };
  }

  const STAT_CARDS = [
    { label: 'Users', value: stats?.userCount, icon: Users, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20', href: '/admin/users' },
    { label: 'Courses', value: stats?.courseCount, icon: BookOpen, color: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20', href: '/admin/courses?tab=courses' },
    { label: 'Topics', value: stats?.topicCount, icon: Layers, color: 'from-emerald-500 to-green-500', shadow: 'shadow-emerald-500/20', href: '/admin/courses?tab=topics' },
    { label: 'MCQs', value: stats?.mcqCount, icon: HelpCircle, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20', href: '/admin/courses?tab=mcqs' },
    { label: 'Problems', value: stats?.problemCount, icon: Code2, color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20', href: '/admin/courses?tab=problems' },
    { label: 'Submissions', value: stats?.submissionCount, icon: FileText, color: 'from-indigo-500 to-blue-500', shadow: 'shadow-indigo-500/20', href: '/admin/users' },
  ];

  const health = getHealthStatus(dbLatency, compilerLatency, browserPing);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Dynamic Seed Preset Dropdown */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Overview of your platform&apos;s data</p>
        </div>

        {/* Seed Preset Dropdown */}
        <div className="relative" ref={seedDropdownRef}>
          <button
            onClick={() => { setShowSeedDropdown(!showSeedDropdown); setConfirmWipe(false); }}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 text-sm font-semibold transition-all disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            {seeding ? 'Seeding...' : 'Seed Database'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSeedDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showSeedDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Seed Preset</p>
              </div>
              <div className="p-2">
                {SEED_PRESETS.map((preset) => (
                  <div key={preset.id}>
                    <button
                      onClick={() => handleSeed(preset.id)}
                      className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-start gap-3 ${
                        preset.destructive
                          ? 'hover:bg-red-500/10 text-red-400'
                          : 'hover:bg-violet-500/10 text-zinc-200'
                      }`}
                    >
                      <span className="text-xl mt-0.5">{preset.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{preset.label}</p>
                        <p className={`text-xs mt-0.5 ${preset.destructive ? 'text-red-500/70' : 'text-zinc-500'}`}>
                          {preset.description}
                        </p>
                      </div>
                      {preset.destructive && <AlertTriangle className="w-4 h-4 text-red-500/60 mt-1 shrink-0" />}
                    </button>

                    {/* Destructive confirmation */}
                    {preset.destructive && confirmWipe && (
                      <div className="mx-3 mb-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-in fade-in">
                        <p className="text-xs text-red-400 font-medium mb-2">
                          ⚠️ This will permanently delete all content. Are you sure?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSeed('clean-wipe')}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
                          >
                            Yes, Wipe Everything
                          </button>
                          <button
                            onClick={() => setConfirmWipe(false)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {seedMsg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${seedMsg.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {seedMsg}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, shadow, href }) => (
          <Link
            key={label}
            href={href}
            className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${color} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg ${shadow}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-black tracking-tight text-zinc-100">{value ?? '—'}</p>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Recent Users</h2>
          <Link href="/admin/users" className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentUsers.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-500">No users yet. Click &quot;Seed Database&quot; to add sample data.</div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {recentUsers.map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
                    {(u.name || u.email)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{u.name || 'Unnamed'}</p>
                    <p className="text-xs text-zinc-500">{u.email}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${u.role === 'teacher' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Telemetry Observability Diagnostics */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${health.bgColor} animate-pulse`} />
              System Telemetry
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-xs text-zinc-500">Real-time service health monitoring</p>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                health.label === 'Healthy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                health.label === 'Degraded' || health.label === 'Slow' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {health.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                autoRefresh
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} style={autoRefresh ? { animationDuration: '3s' } : {}} />
              {autoRefresh ? 'Auto (30s)' : 'Auto'}
            </button>
            <button
              onClick={runDiagnostics}
              disabled={diagnosing}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-xs font-semibold text-zinc-300 transition-all disabled:opacity-50"
            >
              {diagnosing ? 'Pinging...' : '⚡ Ping Now'}
            </button>
          </div>
        </div>

        {/* Health Status Bar */}
        <div className="h-1.5 rounded-full bg-zinc-800 mb-5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              health.label === 'Healthy' ? 'bg-gradient-to-r from-emerald-500 to-green-400 w-full' :
              health.label === 'Slow' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 w-3/4' :
              health.label === 'Degraded' ? 'bg-gradient-to-r from-amber-500 to-orange-400 w-1/2' :
              'bg-gradient-to-r from-red-500 to-red-400 w-1/4'
            }`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* DB Latency */}
          <div className="bg-zinc-950/40 border border-zinc-800/85 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Supabase DB Latency</span>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${dbLatency === null ? 'text-red-500' : dbLatency > 800 ? 'text-amber-500' : 'text-emerald-400'}`}>
                  {dbLatency !== null ? `${dbLatency}ms` : 'Offline'}
                </span>
                <span className="text-[10px] text-zinc-600 ml-1.5">Prisma API</span>
              </div>
              <Sparkline data={dbHistory} color={dbLatency === null ? '#ef4444' : dbLatency > 800 ? '#f59e0b' : '#34d399'} />
            </div>
          </div>

          {/* Compiler Latency */}
          <div className="bg-zinc-950/40 border border-zinc-800/85 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Judge0 Compiler Latency</span>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${compilerLatency === null ? 'text-red-500' : compilerLatency > 2000 ? 'text-amber-500' : 'text-emerald-400'}`}>
                  {compilerLatency !== null ? `${compilerLatency}ms` : 'Unreachable'}
                </span>
                <span className="text-[10px] text-zinc-600 ml-1.5">Judge0 API</span>
              </div>
              <Sparkline data={compilerHistory} color={compilerLatency === null ? '#ef4444' : compilerLatency > 2000 ? '#f59e0b' : '#34d399'} />
            </div>
          </div>

          {/* Static Content Latency */}
          <div className="bg-zinc-950/40 border border-zinc-800/85 rounded-xl p-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Static Content Latency</span>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <span className={`text-2xl font-black ${browserPing === null ? 'text-red-500' : browserPing > 300 ? 'text-amber-500' : 'text-emerald-400'}`}>
                  {browserPing !== null ? `${browserPing}ms` : 'Offline'}
                </span>
                <span className="text-[10px] text-zinc-600 ml-1.5">Static CDN</span>
              </div>
              <Sparkline data={browserHistory} color={browserPing === null ? '#ef4444' : browserPing > 300 ? '#f59e0b' : '#34d399'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
