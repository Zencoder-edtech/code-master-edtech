// =============================================================================
// Admin Content Manager Page — /admin/courses (Unified Courses/Topics/MCQs/Problems)
// =============================================================================
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Plus, BookOpen, ChevronRight, Trash2, Pencil, X, Globe, GlobeLock, 
  Search, Layers, HelpCircle, Code2, Save, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface CourseTopic { id: string; title: string; isPublished: boolean; order: number; }
interface Course {
  id: string; name: string; slug: string; language: string; description: string | null;
  isPublished: boolean; order: number; topics: CourseTopic[]; createdAt: string;
}

interface Topic {
  id: string; title: string; slug: string; description: string | null;
  videoUrl: string | null; conceptHtml: string; isPublished: boolean; order: number; courseId: string;
  course: { id: string; name: string; language: string } | null;
  mcqs: { id: string }[];
  problems: { id: string }[];
}

interface MCQ {
  id: string; question: string; options: string[]; correctIndex: number; 
  explanation: string | null; order: number; topicId: string;
  topic: { id: string; title: string; course: { id: string; name: string } | null } | null;
}

interface Problem {
  id: string; title: string; description: string; starterCode: string | null;
  solutionCode: string; difficulty: string; testCases: { input: string; expected: string }[]; 
  language: string; order: number; topicId: string;
  topic: { id: string; title: string; course: { id: string; name: string } | null } | null;
}

function AdminCoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State
  const activeTab = searchParams.get('tab') || 'courses';

  const setTab = (tabName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabName);
    router.push(`/admin/courses?${params.toString()}`);
  };

  // Common Search & Loading State
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);

  // Modals & Forms States
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ name: '', language: 'python', description: '' });

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({ title: '', description: '', videoUrl: '', conceptHtml: '', isPublished: false });

  const [showMcqModal, setShowMcqModal] = useState(false);
  const [editingMcq, setEditingMcq] = useState<MCQ | null>(null);
  const [mcqForm, setMcqForm] = useState({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });

  const [showProblemModal, setShowProblemModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [problemForm, setProblemForm] = useState({ title: '', description: '', starterCode: '', solutionCode: '', difficulty: 'fill_blank', testInput: '', testExpected: '' });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const q = encodeURIComponent(search);
      if (activeTab === 'courses') {
        const res = await fetch(`/api/admin/courses?search=${q}`);
        const data = await res.json();
        setCourses(data.courses || []);
      } else if (activeTab === 'topics') {
        const res = await fetch(`/api/admin/topics?search=${q}`);
        const data = await res.json();
        setTopics(data.topics || []);
      } else if (activeTab === 'mcqs') {
        const res = await fetch(`/api/admin/mcqs?search=${q}`);
        const data = await res.json();
        setMcqs(data.mcqs || []);
      } else if (activeTab === 'problems') {
        const res = await fetch(`/api/admin/problems?search=${q}`);
        const data = await res.json();
        setProblems(data.problems || []);
      }
    } catch {
      setError('Failed to fetch data');
    }
    setLoading(false);
  }, [activeTab, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset search when switching tabs
  useEffect(() => {
    setSearch('');
  }, [activeTab]);

  // ---------------------------------------------------------------------------
  // Courses Handlers
  // ---------------------------------------------------------------------------
  const openCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({ name: '', language: 'python', description: '' });
    setError('');
    setShowCourseModal(true);
  };

  const openEditCourse = (c: Course) => {
    setEditingCourse(c);
    setCourseForm({ name: c.name, language: c.language, description: c.description || '' });
    setError('');
    setShowCourseModal(true);
  };

  const handleSaveCourse = async () => {
    setSaving(true);
    setError('');
    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save course'); setSaving(false); return; }
      setShowCourseModal(false);
      fetchData();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    setSaving(false);
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Delete course "${name}" and ALL its topics, MCQs, problems? This cannot be undone.`)) return;
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleCoursePublish = async (c: Course) => {
    await fetch(`/api/admin/courses/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !c.isPublished }),
    });
    fetchData();
  };

  // ---------------------------------------------------------------------------
  // Topics Handlers
  // ---------------------------------------------------------------------------
  const openEditTopic = (t: Topic) => {
    setEditingTopic(t);
    setTopicForm({
      title: t.title,
      description: t.description || '',
      videoUrl: t.videoUrl || '',
      conceptHtml: t.conceptHtml || '',
      isPublished: t.isPublished
    });
    setError('');
    setShowTopicModal(true);
  };

  const handleSaveTopic = async () => {
    if (!editingTopic) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/topics/${editingTopic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save topic'); setSaving(false); return; }
      setShowTopicModal(false);
      fetchData();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    setSaving(false);
  };

  const handleDeleteTopic = async (id: string, title: string) => {
    if (!confirm(`Delete topic "${title}" and all its MCQs & problems?`)) return;
    await fetch(`/api/admin/topics/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleTopicPublish = async (t: Topic) => {
    await fetch(`/api/admin/topics/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !t.isPublished }),
    });
    fetchData();
  };

  // ---------------------------------------------------------------------------
  // MCQs Handlers
  // ---------------------------------------------------------------------------
  const openEditMcq = (m: MCQ) => {
    setEditingMcq(m);
    setMcqForm({
      question: m.question,
      options: [...m.options],
      correctIndex: m.correctIndex,
      explanation: m.explanation || ''
    });
    setError('');
    setShowMcqModal(true);
  };

  const handleSaveMcq = async () => {
    if (!editingMcq) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/mcqs/${editingMcq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mcqForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save MCQ'); setSaving(false); return; }
      setShowMcqModal(false);
      fetchData();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    setSaving(false);
  };

  const handleDeleteMcq = async (id: string) => {
    if (!confirm('Delete this MCQ?')) return;
    await fetch(`/api/admin/mcqs/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // ---------------------------------------------------------------------------
  // Problems Handlers
  // ---------------------------------------------------------------------------
  const openEditProblem = (p: Problem) => {
    setEditingProblem(p);
    setProblemForm({
      title: p.title,
      description: p.description,
      starterCode: p.starterCode || '',
      solutionCode: p.solutionCode,
      difficulty: p.difficulty,
      testInput: p.testCases[0]?.input || '',
      testExpected: p.testCases[0]?.expected || ''
    });
    setError('');
    setShowProblemModal(true);
  };

  const handleSaveProblem = async () => {
    if (!editingProblem) return;
    setSaving(true);
    setError('');
    const payload = {
      title: problemForm.title,
      description: problemForm.description,
      starterCode: problemForm.starterCode,
      solutionCode: problemForm.solutionCode,
      difficulty: problemForm.difficulty,
      testCases: [{ input: problemForm.testInput, expected: problemForm.testExpected }]
    };
    try {
      const res = await fetch(`/api/admin/problems/${editingProblem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save problem'); setSaving(false); return; }
      setShowProblemModal(false);
      fetchData();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    setSaving(false);
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm('Delete this problem?')) return;
    await fetch(`/api/admin/problems/${id}`, { method: 'DELETE' });
    fetchData();
  };

  // Styles helpers
  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50";
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Content Manager</h1>
          <p className="text-sm text-zinc-500 mt-1">Configure and manage all platform content</p>
        </div>
        {activeTab === 'courses' && (
          <button onClick={openCreateCourse} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
            <Plus className="w-4 h-4" /> New Course
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 overflow-x-auto gap-2 scrollbar-none">
        {[
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'topics', label: 'Topics', icon: Layers },
          { id: 'mcqs', label: 'MCQs', icon: HelpCircle },
          { id: 'problems', label: 'Problems', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm transition-all whitespace-nowrap ${
                active 
                  ? 'border-violet-500 text-violet-400' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
        />
      </div>

      {/* Content Renderers */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-zinc-500 animate-pulse">Loading {activeTab}...</div>
        ) : error ? (
          <div className="p-16 text-center text-sm text-red-400">{error}</div>
        ) : activeTab === 'courses' ? (
          // ==========================================
          // COURSES TAB
          // ==========================================
          courses.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 text-sm">
              No courses found. Create one or seed from the dashboard.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              {courses.map((c) => (
                <div key={c.id} className="group bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700/80 transition-all duration-300">
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
                        <button onClick={() => toggleCoursePublish(c)} className={`p-1.5 rounded-lg transition-colors ${c.isPublished ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-zinc-500 hover:bg-zinc-850'}`} title={c.isPublished ? 'Published' : 'Draft'}>
                          {c.isPublished ? <Globe className="w-4 h-4" /> : <GlobeLock className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEditCourse(c)} className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-zinc-850 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteCourse(c.id, c.name)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-850 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {c.description && <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{c.description}</p>}
                    {c.topics.length > 0 && (
                      <div className="space-y-1">
                        {c.topics.slice(0, 3).map((t) => (
                          <div key={t.id} className="flex items-center gap-2 text-xs text-zinc-500">
                            <div className={`w-1.5 h-1.5 rounded-full ${t.isPublished ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                            {t.title}
                          </div>
                        ))}
                        {c.topics.length > 3 && <p className="text-xs text-zinc-600 font-medium">+{c.topics.length - 3} more</p>}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/admin/courses/${c.id}`}
                    className="flex items-center justify-between px-5 py-3 border-t border-zinc-850 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors"
                  >
                    <span className="text-xs font-semibold text-violet-400">Manage Topics & Content</span>
                    <ChevronRight className="w-4 h-4 text-violet-400" />
                  </Link>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'topics' ? (
          // ==========================================
          // TOPICS TAB
          // ==========================================
          topics.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 text-sm">No topics found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Title</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Course</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">MCQs</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Problems</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {topics.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">{t.title}</p>
                          {t.description && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{t.description}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {t.course ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
                            {t.course.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-zinc-400">{t.mcqs.length}</td>
                      <td className="px-5 py-4 text-xs font-medium text-zinc-400">{t.problems.length}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => toggleTopicPublish(t)} className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          t.isPublished ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}>
                          {t.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditTopic(t)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteTopic(t.id, t.title)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <Link href={`/admin/courses/${t.courseId}/${t.id}`} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition-colors" title="Manage content">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'mcqs' ? (
          // ==========================================
          // MCQs TAB
          // ==========================================
          mcqs.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 text-sm">No MCQs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Question</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Topic</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Course</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Correct Answer</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {mcqs.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4 max-w-sm">
                        <p className="text-sm font-semibold text-zinc-200 line-clamp-2">{m.question}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-400">{m.topic?.title || '—'}</td>
                      <td className="px-5 py-4">
                        {m.topic?.course ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                            {m.topic.course.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                          {String.fromCharCode(65 + m.correctIndex)}. {m.options[m.correctIndex]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditMcq(m)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteMcq(m.id)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {m.topic && (
                            <Link href={`/admin/courses/${m.topic.course?.id}/${m.topic.id}`} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition-colors" title="Go to Topic Detail">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // ==========================================
          // PROBLEMS TAB
          // ==========================================
          problems.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 text-sm">No problems found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Problem</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Topic</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Course</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Difficulty</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Language</th>
                    <th className="px-5 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {problems.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">{p.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{p.description}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-400">{p.topic?.title || '—'}</td>
                      <td className="px-5 py-4">
                        {p.topic?.course ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                            {p.topic.course.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                          p.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          p.difficulty === 'full_code' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {p.difficulty === 'hard' ? 'Hard' : p.difficulty === 'full_code' ? 'Medium' : 'Easy'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-zinc-400">{p.language}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditProblem(p)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteProblem(p.id)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {p.topic && (
                            <Link href={`/admin/courses/${p.topic.course?.id}/${p.topic.id}`} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-violet-400 transition-colors" title="Go to Topic Detail">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ======================================================================= */}
      {/* MODALS */}
      {/* ======================================================================= */}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowCourseModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-5">{editingCourse ? 'Edit Course' : 'Create Course'}</h2>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="space-y-3">
              <input placeholder="Course Name *" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} className={inputCls} />
              <select value={courseForm.language} onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value })} className={inputCls}>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <textarea placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={3} className={textareaCls} />
            </div>
            <button onClick={handleSaveCourse} disabled={saving || !courseForm.name} className="w-full mt-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
              {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </div>
      )}

      {/* Topic Edit Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowTopicModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-5">Edit Topic Info</h2>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="space-y-3">
              <input placeholder="Topic Title *" value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} className={inputCls} />
              <textarea placeholder="Short description" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} rows={2} className={textareaCls} />
              <input placeholder="Video URL (optional)" value={topicForm.videoUrl} onChange={(e) => setTopicForm({ ...topicForm, videoUrl: e.target.value })} className={inputCls} />
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Concept HTML</label>
                <textarea value={topicForm.conceptHtml} onChange={(e) => setTopicForm({ ...topicForm, conceptHtml: e.target.value })} rows={6} className={`${textareaCls} font-mono text-xs`} />
              </div>
            </div>
            <button onClick={handleSaveTopic} disabled={saving || !topicForm.title} className="w-full mt-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
              {saving ? 'Saving...' : 'Save Topic'}
            </button>
          </div>
        </div>
      )}

      {/* MCQ Modal */}
      {showMcqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowMcqModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-5">Edit MCQ</h2>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="space-y-3">
              <textarea placeholder="Question *" value={mcqForm.question} onChange={(e) => setMcqForm({ ...mcqForm, question: e.target.value })} rows={2} className={textareaCls} />
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Options (select correct answer)</p>
              {mcqForm.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button type="button" onClick={() => setMcqForm({ ...mcqForm, correctIndex: i })} className={`w-7 h-7 rounded-lg border text-xs font-bold shrink-0 transition-all ${i === mcqForm.correctIndex ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}>{String.fromCharCode(65 + i)}</button>
                  <input placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={(e) => { const opts = [...mcqForm.options]; opts[i] = e.target.value; setMcqForm({ ...mcqForm, options: opts }); }} className={inputCls} />
                </div>
              ))}
              <textarea placeholder="Explanation (shown after answering)" value={mcqForm.explanation} onChange={(e) => setMcqForm({ ...mcqForm, explanation: e.target.value })} rows={2} className={textareaCls} />
            </div>
            <button onClick={handleSaveMcq} disabled={saving || !mcqForm.question || mcqForm.options.some(o => !o)} className="w-full mt-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20">
              {saving ? 'Saving...' : 'Save MCQ'}
            </button>
          </div>
        </div>
      )}

      {/* Problem Modal */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowProblemModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-5">Edit Problem</h2>
            {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
            <div className="space-y-3">
              <input placeholder="Problem Title *" value={problemForm.title} onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })} className={inputCls} />
              <textarea placeholder="Description *" value={problemForm.description} onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })} rows={3} className={textareaCls} />
              <select value={problemForm.difficulty} onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })} className={inputCls}>
                <option value="fill_blank">Fill in the Blank (Easy)</option>
                <option value="full_code">Full Code (Medium)</option>
                <option value="hard">Hard</option>
              </select>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Starter Code (given to student)</label>
                <textarea value={problemForm.starterCode} onChange={(e) => setProblemForm({ ...problemForm, starterCode: e.target.value })} rows={4} className={`${textareaCls} font-mono text-xs`} placeholder="# Student starts with this code..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Solution Code *</label>
                <textarea value={problemForm.solutionCode} onChange={(e) => setProblemForm({ ...problemForm, solutionCode: e.target.value })} rows={4} className={`${textareaCls} font-mono text-xs`} placeholder="# Correct solution..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Test Input (stdin)</label>
                  <textarea value={problemForm.testInput} onChange={(e) => setProblemForm({ ...problemForm, testInput: e.target.value })} rows={2} className={`${textareaCls} font-mono text-xs`} placeholder="(empty if no input)" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Expected Output *</label>
                  <textarea value={problemForm.testExpected} onChange={(e) => setProblemForm({ ...problemForm, testExpected: e.target.value })} rows={2} className={`${textareaCls} font-mono text-xs`} placeholder="Expected stdout..." />
                </div>
              </div>
            </div>
            <button onClick={handleSaveProblem} disabled={saving || !problemForm.title || !problemForm.solutionCode} className="w-full mt-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20">
              {saving ? 'Saving...' : 'Save Problem'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-zinc-500 animate-pulse bg-zinc-900 border border-zinc-800 rounded-2xl">Loading content manager...</div>}>
      <AdminCoursesContent />
    </Suspense>
  );
}
