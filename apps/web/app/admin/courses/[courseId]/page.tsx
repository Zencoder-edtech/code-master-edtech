// =============================================================================
// Admin Course Detail — /admin/courses/[courseId]
// =============================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, ChevronRight, Trash2, X, Globe, GlobeLock } from 'lucide-react';
import Link from 'next/link';

interface MCQ { id: string; question: string; order: number; }
interface Problem { id: string; title: string; difficulty: string; order: number; }
interface Topic {
  id: string; title: string; slug: string; description: string | null;
  isPublished: boolean; order: number; mcqs: MCQ[]; problems: Problem[];
}
interface Course {
  id: string; name: string; slug: string; language: string; description: string | null;
  isPublished: boolean; topics: Topic[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: '', description: '', videoUrl: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`);
      const data = await res.json();
      if (data.course) setCourse(data.course);
      else router.push('/admin/courses');
    } catch { router.push('/admin/courses'); }
    setLoading(false);
  }, [courseId, router]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const handleCreateTopic = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, ...topicForm }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return; }
      setShowTopicModal(false);
      setTopicForm({ title: '', description: '', videoUrl: '' });
      fetchCourse();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    setSaving(false);
  };

  const handleDeleteTopic = async (id: string, title: string) => {
    if (!confirm(`Delete topic "${title}" and all its MCQs & problems?`)) return;
    await fetch(`/api/admin/topics/${id}`, { method: 'DELETE' });
    fetchCourse();
  };

  const toggleTopicPublish = async (t: Topic) => {
    await fetch(`/api/admin/topics/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !t.isPublished }),
    });
    fetchCourse();
  };

  if (loading || !course) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-48 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-violet-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      {/* Course Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{course.language === 'python' ? '🐍' : course.language === 'javascript' ? '🟨' : '💻'}</span>
              <h1 className="text-2xl font-extrabold tracking-tight">{course.name}</h1>
            </div>
            {course.description && <p className="text-sm text-zinc-400 max-w-xl">{course.description}</p>}
            <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
              <span className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 font-medium">{course.language}</span>
              <span>{course.topics.length} topic{course.topics.length !== 1 ? 's' : ''}</span>
              <span className={`flex items-center gap-1 ${course.isPublished ? 'text-emerald-400' : 'text-zinc-600'}`}>
                {course.isPublished ? <Globe className="w-3 h-3" /> : <GlobeLock className="w-3 h-3" />}
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Topics</h2>
        <button onClick={() => { setShowTopicModal(true); setError(''); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
          <Plus className="w-4 h-4" /> Add Topic
        </button>
      </div>

      {course.topics.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-sm text-zinc-500 mb-3">No topics yet. Add your first topic to this course.</p>
          <button onClick={() => setShowTopicModal(true)} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all">Add Topic</button>
        </div>
      ) : (
        <div className="space-y-3">
          {course.topics.map((t, idx) => (
            <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{t.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-zinc-500 font-medium">
                      <span>{t.mcqs.length} MCQs</span>
                      <span>·</span>
                      <span>{t.problems.length} Problems</span>
                      <span>·</span>
                      <span className={t.isPublished ? 'text-emerald-500' : ''}>{t.isPublished ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleTopicPublish(t)} className={`p-1.5 rounded-lg transition-colors ${t.isPublished ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}>
                    {t.isPublished ? <Globe className="w-4 h-4" /> : <GlobeLock className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDeleteTopic(t.id, t.title)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link href={`/admin/courses/${courseId}/${t.id}`} className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-zinc-800 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Topic Create Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowTopicModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-5">Add Topic</h2>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="space-y-3">
              <input placeholder="Topic Title *" value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" />
              <textarea placeholder="Short description" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 resize-none" />
              <input placeholder="Video URL (optional)" value={topicForm.videoUrl} onChange={(e) => setTopicForm({ ...topicForm, videoUrl: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50" />
            </div>
            <button onClick={handleCreateTopic} disabled={saving || !topicForm.title} className="w-full mt-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
              {saving ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
