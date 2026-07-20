// =============================================================================
// Admin Streak Adjuster Page — /admin/streaks
// =============================================================================
// Full CRUD management of student progress streaks and completion counters.
// Enables direct manipulation of active flames, personal bests, and dates.
// =============================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, X, Flame, Award, Calendar, RefreshCw } from 'lucide-react';

interface UserSelect {
  id: string;
  name: string | null;
  email: string;
}

interface TopicSelect {
  id: string;
  title: string;
}

interface StreakEntry {
  id: string;
  streak: number;
  longestStreak: number;
  lastActivityAt: string;
  isTopicComplete: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  topic: {
    id: string;
    title: string;
  };
}

export default function AdminStreaksPage() {
  const [streaks, setStreaks] = useState<StreakEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Selection lookups for the Add Modal
  const [users, setUsers] = useState<UserSelect[]>([]);
  const [topics, setTopics] = useState<TopicSelect[]>([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStreak, setSelectedStreak] = useState<StreakEntry | null>(null);
  
  // Form states
  const [addForm, setAddForm] = useState({ userId: '', topicId: '', streak: '1', longestStreak: '1', isTopicComplete: false });
  const [editForm, setEditForm] = useState({ streak: '0', longestStreak: '0', lastActivityAt: '', isTopicComplete: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Filters & Sorting states
  const [completedFilter, setCompletedFilter] = useState('');
  const [streakRangeFilter, setStreakRangeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const fetchStreaks = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        completed: completedFilter,
        streakRange: streakRangeFilter,
        sort: sortOrder
      }).toString();
      const res = await fetch(`/api/admin/streaks?${query}`);
      const data = await res.json();
      setStreaks(data.progress || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search, completedFilter, streakRangeFilter, sortOrder]);

  const fetchLookups = async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        fetch('/api/admin/users?limit=200'),
        fetch('/api/admin/topics')
      ]);
      const uData = await uRes.json();
      const tData = await tRes.json();
      
      setUsers(uData.users || []);
      setTopics(tData.topics || []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchStreaks();
  }, [fetchStreaks]);

  useEffect(() => {
    fetchLookups();
  }, []);

  const openAdd = () => {
    setError('');
    setAddForm({
      userId: users[0]?.id || '',
      topicId: topics[0]?.id || '',
      streak: '1',
      longestStreak: '1',
      isTopicComplete: false
    });
    setShowAddModal(true);
  };

  const handleAddSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/streaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create record');
        setSaving(false);
        return;
      }
      setShowAddModal(false);
      fetchStreaks();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    }
    setSaving(false);
  };

  const openEdit = (s: StreakEntry) => {
    setError('');
    setSelectedStreak(s);
    setEditForm({
      streak: String(s.streak),
      longestStreak: String(s.longestStreak),
      lastActivityAt: s.lastActivityAt.split('T')[0] || '',
      isTopicComplete: s.isTopicComplete
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedStreak) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/streaks/${selectedStreak.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update streak');
        setSaving(false);
        return;
      }
      setShowEditModal(false);
      fetchStreaks();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, email: string, title: string) => {
    if (!confirm(`Delete streak/progress record of user ${email} on ${title}?`)) return;
    try {
      await fetch(`/api/admin/streaks/${id}`, { method: 'DELETE' });
      fetchStreaks();
    } catch { /* ignore */ }
  };

  // Top level statistics metrics
  const totalStreaks = streaks.length;
  const avgStreak = totalStreaks > 0 ? Math.round(streaks.reduce((acc, s) => acc + s.streak, 0) / totalStreaks) : 0;
  const maxStreak = totalStreaks > 0 ? Math.max(...streaks.map((s) => s.streak)) : 0;

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Streak Adjuster</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and edit students active daily coding flames</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
          <Plus className="w-4 h-4" /> Add Streak Record
        </button>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Active Records</span>
            <p className="text-2xl font-black text-zinc-100 mt-1">{totalStreaks}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-violet-400" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Average Streak</span>
            <p className="text-2xl font-black text-orange-400 mt-1">{avgStreak} Days 🔥</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Max Peak Streak</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{maxStreak} Days 🏆</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Search Filter & Options */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by student name, email, or topic title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-violet-500/50 transition-all"
          />
        </div>

        <select
          value={completedFilter}
          onChange={(e) => setCompletedFilter(e.target.value)}
          className="px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Statuses</option>
          <option value="true">Completed Only</option>
          <option value="false">Active Only</option>
        </select>

        <select
          value={streakRangeFilter}
          onChange={(e) => setStreakRangeFilter(e.target.value)}
          className="px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Streaks</option>
          <option value="active">Active Streaks (&gt; 0)</option>
          <option value="long">Long Streaks (&gt;= 5)</option>
          <option value="champion">Champion (&gt;= 10)</option>
        </select>
      </div>

      <div className="flex items-center justify-between mt-1 bg-zinc-900/30 px-2 py-1.5 rounded-lg border border-zinc-800/40">
        <p className="text-xs text-zinc-500 font-medium">Found {totalStreaks} streak record{totalStreaks !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 font-semibold">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-transparent border-none text-violet-400 font-bold focus:ring-0 cursor-pointer pr-8"
          >
            <option value="">Last Activity (Newest)</option>
            <option value="activity_asc">Last Activity (Oldest)</option>
            <option value="streak_desc">Current Streak (Highest)</option>
            <option value="longest_streak_desc">Longest Streak (Highest)</option>
            <option value="name_asc">Student Email (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-zinc-500 animate-pulse">Retrieving streak metrics...</div>
        ) : streaks.length === 0 ? (
          <div className="p-10 text-center">
            <Flame className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No streak records found. Add one or search for another student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Student', 'Topic', 'Current Streak', 'Longest Streak', 'Last Activity', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {streaks.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-semibold text-zinc-200">{s.user.name || 'Unnamed'}</p>
                        <p className="text-xs text-zinc-500">{s.user.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-400 font-medium">{s.topic.title}</td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-bold text-orange-400 flex items-center gap-1">
                        🔥 {s.streak} day{s.streak !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                        🏆 {s.longestStreak}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500">
                      {new Date(s.lastActivityAt).toLocaleDateString()} {new Date(s.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                        s.isTopicComplete
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                      }`}>
                        {s.isTopicComplete ? 'Completed' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(s.id, s.user.email, s.topic.title)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-500" /> Create Progress/Streak Log
            </h2>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Select Student *</label>
                <select 
                  value={addForm.userId} 
                  onChange={(e) => setAddForm({ ...addForm, userId: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.email} ({u.name || 'Unnamed'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Select Topic *</label>
                <select 
                  value={addForm.topicId} 
                  onChange={(e) => setAddForm({ ...addForm, topicId: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50"
                >
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Current Streak 🔥</label>
                  <input 
                    type="number" 
                    min={0}
                    value={addForm.streak} 
                    onChange={(e) => setAddForm({ ...addForm, streak: e.target.value })} 
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Longest Streak 🏆</label>
                  <input 
                    type="number" 
                    min={0}
                    value={addForm.longestStreak} 
                    onChange={(e) => setAddForm({ ...addForm, longestStreak: e.target.value })} 
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50" 
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-2.5 cursor-pointer mt-4 select-none">
                <input 
                  type="checkbox"
                  checked={addForm.isTopicComplete}
                  onChange={(e) => setAddForm({ ...addForm, isTopicComplete: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-violet-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-sm text-zinc-300 font-semibold">Mark Topic Completed</span>
              </label>
            </div>
            
            <button onClick={handleAddSubmit} disabled={saving || !addForm.userId || !addForm.topicId} className="w-full mt-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20">
              {saving ? 'Creating...' : 'Initialize Streak'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Streak Modal */}
      {showEditModal && selectedStreak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-violet-500" /> Edit Student Streak
            </h2>
            <div className="mb-4 p-3.5 bg-zinc-850 rounded-xl border border-zinc-800">
              <p className="text-xs text-zinc-400">Student: <span className="font-bold text-zinc-200">{selectedStreak.user.email}</span></p>
              <p className="text-xs text-zinc-400 mt-1">Topic: <span className="font-bold text-zinc-200">{selectedStreak.topic.title}</span></p>
            </div>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Current Streak 🔥</label>
                  <input 
                    type="number" 
                    min={0}
                    value={editForm.streak} 
                    onChange={(e) => setEditForm({ ...editForm, streak: e.target.value })} 
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Longest Streak 🏆</label>
                  <input 
                    type="number" 
                    min={0}
                    value={editForm.longestStreak} 
                    onChange={(e) => setEditForm({ ...editForm, longestStreak: e.target.value })} 
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50" 
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">Last Activity Date 📅</label>
                <input 
                  type="date" 
                  value={editForm.lastActivityAt} 
                  onChange={(e) => setEditForm({ ...editForm, lastActivityAt: e.target.value })} 
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50" 
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer mt-4 select-none">
                <input 
                  type="checkbox"
                  checked={editForm.isTopicComplete}
                  onChange={(e) => setEditForm({ ...editForm, isTopicComplete: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-violet-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-sm text-zinc-300 font-semibold">Mark Topic Completed</span>
              </label>
            </div>
            
            <button onClick={handleEditSubmit} disabled={saving || !editForm.streak || !editForm.longestStreak} className="w-full mt-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20">
              {saving ? 'Updating...' : 'Update Streak'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
