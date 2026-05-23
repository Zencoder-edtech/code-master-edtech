// =============================================================================
// Admin Courses Page — /admin/courses
// =============================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, BookOpen, ChevronRight, Trash2, Pencil, X, Globe, GlobeLock } from 'lucide-react';
import Link from 'next/link';

interface Topic { id: string; title: string; isPublished: boolean; order: number; }
interface Course {
  id: string; name: string; slug: string; language: string; description: string | null;
  isPublished: boolean; order: number; topics: Topic[]; createdAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ name: '', language: 'python', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const openCreate = () => {
    setEditingCourse(null);
    setForm({ name: '', language: 'python', description: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (c: Course) => {
    setEditingCourse(c);
    setForm({ name: c.name, language: c.language, description: c.description || '' });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return; }
      setShowModal(false);
      fetchCourses();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete course "${name}" and ALL its topics, MCQs, problems? This cannot be undone.`)) return;
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
    fetchCourses();
  };

  const togglePublish = async (c: Course) => {
    await fetch(`/api/admin/courses/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !c.isPublished }),
    });
    fetchCourses();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-48 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Courses</h1>
          <p className="text-sm text-zinc-500 mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
          <Plus className="w-4 h-4" /> New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center">
          <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm mb-4">No courses yet. Create your first course or seed the database from the Dashboard.</p>
          <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all">Create Course</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-300">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center text-lg">
                      {c.language === 'python' ? '🐍' : c.language === 'javascript' ? '🟨' : '💻'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100">{c.name}</h3>
                      <p className="text-xs text-zinc-500">{c.language} · {c.topics.length} topic{c.topics.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => togglePublish(c)} className={`p-1.5 rounded-lg transition-colors ${c.isPublished ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`} title={c.isPublished ? 'Published' : 'Draft'}>
                      {c.isPublished ? <Globe className="w-4 h-4" /> : <GlobeLock className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-zinc-800 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {c.description && <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{c.description}</p>}
                {c.topics.length > 0 && (
                  <div className="space-y-1 mb-4">
                    {c.topics.slice(0, 3).map((t) => (
                      <div key={t.id} className="flex items-center gap-2 text-xs text-zinc-500">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.isPublished ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                        {t.title}
                      </div>
                    ))}
                    {c.topics.length > 3 && <p className="text-xs text-zinc-600">+{c.topics.length - 3} more</p>}
                  </div>
                )}
              </div>
              <Link
                href={`/admin/courses/${c.id}`}
                className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-800/30 hover:bg-zinc-800/60 transition-colors"
              >
                <span className="text-xs font-semibold text-violet-400">Manage Topics & Content</span>
                <ChevronRight className="w-4 h-4 text-violet-400" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-5">{editingCourse ? 'Edit Course' : 'Create Course'}</h2>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="space-y-3">
              <input placeholder="Course Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" />
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50">
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 resize-none" />
            </div>
            <button onClick={handleSave} disabled={saving || !form.name} className="w-full mt-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
              {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
