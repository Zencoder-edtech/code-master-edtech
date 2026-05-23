// =============================================================================
// Admin Dashboard — /admin
// =============================================================================
// Real-time stats from DB, recent users, quick actions, and seed button.
// =============================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, BookOpen, FileText, Code2, HelpCircle, Layers, Database, ArrowRight } from 'lucide-react';
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  // Observability Diagnostics Telemetry
  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [compilerLatency, setCompilerLatency] = useState<number | null>(null);
  const [browserPing, setBrowserPing] = useState<number | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setDiagnosing(true);
    // 1. Prisma DB Ping Test
    const t0 = performance.now();
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setDbLatency(Math.round(performance.now() - t0));
      else setDbLatency(null);
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
      if (res.ok) setCompilerLatency(Math.round(performance.now() - t1));
      else setCompilerLatency(null);
    } catch {
      setCompilerLatency(null);
    }

    // 3. Static Content Ping Speed
    const t2 = performance.now();
    try {
      await fetch('/favicon.ico');
      setBrowserPing(Math.round(performance.now() - t2));
    } catch {
      setBrowserPing(null);
    }
    setDiagnosing(false);
  }, []);

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

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg('');
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSeedMsg(`✅ Seeded: ${data.seeded.courses} course, ${data.seeded.topics} topics, ${data.seeded.mcqs} MCQs, ${data.seeded.problems} problems, ${data.seeded.users} users`);
        fetchStats();
      } else {
        setSeedMsg(`❌ ${data.error}`);
      }
    } catch (e) {
      setSeedMsg(`❌ ${e instanceof Error ? e.message : 'Network error'}`);
    }
    setSeeding(false);
  };

  const STAT_CARDS = [
    { label: 'Users', value: stats?.userCount, icon: Users, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20', href: '/admin/users' },
    { label: 'Courses', value: stats?.courseCount, icon: BookOpen, color: 'from-violet-500 to-purple-500', shadow: 'shadow-violet-500/20', href: '/admin/courses' },
    { label: 'Topics', value: stats?.topicCount, icon: Layers, color: 'from-emerald-500 to-green-500', shadow: 'shadow-emerald-500/20', href: '/admin/courses' },
    { label: 'MCQs', value: stats?.mcqCount, icon: HelpCircle, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20', href: '/admin/courses' },
    { label: 'Problems', value: stats?.problemCount, icon: Code2, color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20', href: '/admin/courses' },
    { label: 'Submissions', value: stats?.submissionCount, icon: FileText, color: 'from-indigo-500 to-blue-500', shadow: 'shadow-indigo-500/20', href: '/admin/users' },
  ];

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Overview of your platform&apos;s data</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 text-sm font-semibold transition-all disabled:opacity-50"
        >
          <Database className="w-4 h-4" />
          {seeding ? 'Seeding...' : 'Seed Database'}
        </button>
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

      {/* Telemetry Observability diagnostics */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Observability & Telemetry Diagnostics
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Real-time latency ping diagnostics for services</p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={diagnosing}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-xs font-semibold text-zinc-300 transition-all disabled:opacity-50"
          >
            {diagnosing ? 'Pinging...' : '⚡ Refetch Diagnostics'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* DB Latency */}
          <div className="bg-zinc-950/40 border border-zinc-800/85 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Supabase DB Latency</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${dbLatency === null ? 'text-red-500' : dbLatency > 800 ? 'text-amber-500' : 'text-emerald-400'}`}>
                {dbLatency !== null ? `${dbLatency}ms` : 'Offline'}
              </span>
              <span className="text-[10px] text-zinc-600">Prisma API</span>
            </div>
          </div>

          {/* Compiler Latency */}
          <div className="bg-zinc-950/40 border border-zinc-800/85 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Judge0 Compiler Latency</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${compilerLatency === null ? 'text-red-500' : compilerLatency > 2000 ? 'text-amber-500' : 'text-emerald-400'}`}>
                {compilerLatency !== null ? `${compilerLatency}ms` : 'Unreachable'}
              </span>
              <span className="text-[10px] text-zinc-600">Judge0 API</span>
            </div>
          </div>

          {/* Static Content Latency */}
          <div className="bg-zinc-950/40 border border-zinc-800/85 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Static Content Latency</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${browserPing === null ? 'text-red-500' : browserPing > 300 ? 'text-amber-500' : 'text-emerald-400'}`}>
                {browserPing !== null ? `${browserPing}ms` : 'Offline'}
              </span>
              <span className="text-[10px] text-zinc-600">Static CDN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
