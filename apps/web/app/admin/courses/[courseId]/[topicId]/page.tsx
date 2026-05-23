'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Pencil, X, Save, HelpCircle, Code2 } from 'lucide-react';
import Link from 'next/link';

interface MCQ { id: string; question: string; options: string[]; correctIndex: number; explanation: string | null; order: number; }
interface Problem { id: string; title: string; description: string; starterCode: string | null; solutionCode: string; difficulty: string; testCases: { input: string; expected: string }[]; order: number; }
interface TopicData {
  id: string; title: string; slug: string; description: string | null;
  conceptHtml: string; videoUrl: string | null; isPublished: boolean;
  course: { id: string; name: string }; mcqs: MCQ[]; problems: Problem[];
}

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ title: '', description: '', conceptHtml: '', videoUrl: '' });
  const [savingTopic, setSavingTopic] = useState(false);
  const [topicMsg, setTopicMsg] = useState('');

  // MCQ state
  const [showMcqModal, setShowMcqModal] = useState(false);
  const [editingMcq, setEditingMcq] = useState<MCQ | null>(null);
  const [mcqForm, setMcqForm] = useState({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
  const [savingMcq, setSavingMcq] = useState(false);
  const [mcqError, setMcqError] = useState('');

  // Problem state
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [problemForm, setProblemForm] = useState({ title: '', description: '', starterCode: '', solutionCode: '', difficulty: 'fill_blank', testInput: '', testExpected: '' });
  const [savingProblem, setSavingProblem] = useState(false);
  const [problemError, setProblemError] = useState('');

  const fetchTopic = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/topics/${topicId}`);
      const data = await res.json();
      if (data.topic) {
        setTopic(data.topic);
        setEditForm({ title: data.topic.title, description: data.topic.description || '', conceptHtml: data.topic.conceptHtml, videoUrl: data.topic.videoUrl || '' });
      } else router.push(`/admin/courses/${courseId}`);
    } catch { router.push(`/admin/courses/${courseId}`); }
    setLoading(false);
  }, [topicId, courseId, router]);

  useEffect(() => { fetchTopic(); }, [fetchTopic]);

  const saveTopic = async () => {
    setSavingTopic(true); setTopicMsg('');
    try {
      const res = await fetch(`/api/admin/topics/${topicId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
      if (res.ok) { setTopicMsg('✅ Saved'); fetchTopic(); } else { const d = await res.json(); setTopicMsg(`❌ ${d.error}`); }
    } catch { setTopicMsg('❌ Network error'); }
    setSavingTopic(false);
  };

  // --- MCQ handlers ---
  const openCreateMcq = () => { setEditingMcq(null); setMcqForm({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }); setMcqError(''); setShowMcqModal(true); };
  const openEditMcq = (m: MCQ) => { setEditingMcq(m); setMcqForm({ question: m.question, options: [...m.options], correctIndex: m.correctIndex, explanation: m.explanation || '' }); setMcqError(''); setShowMcqModal(true); };

  const saveMcq = async () => {
    setSavingMcq(true); setMcqError('');
    const payload = { ...mcqForm, topicId, options: mcqForm.options };
    try {
      const url = editingMcq ? `/api/admin/mcqs/${editingMcq.id}` : '/api/admin/mcqs';
      const res = await fetch(url, { method: editingMcq ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setShowMcqModal(false); fetchTopic(); } else { const d = await res.json(); setMcqError(d.error || 'Failed'); }
    } catch { setMcqError('Network error'); }
    setSavingMcq(false);
  };

  const deleteMcq = async (id: string) => { if (!confirm('Delete this MCQ?')) return; await fetch(`/api/admin/mcqs/${id}`, { method: 'DELETE' }); fetchTopic(); };

  // --- Problem handlers ---
  const openCreateProblem = () => { setEditingProblem(null); setProblemForm({ title: '', description: '', starterCode: '', solutionCode: '', difficulty: 'fill_blank', testInput: '', testExpected: '' }); setProblemError(''); setShowProblemModal(true); };
  const openEditProblem = (p: Problem) => { setEditingProblem(p); setProblemForm({ title: p.title, description: p.description, starterCode: p.starterCode || '', solutionCode: p.solutionCode, difficulty: p.difficulty, testInput: p.testCases[0]?.input || '', testExpected: p.testCases[0]?.expected || '' }); setProblemError(''); setShowProblemModal(true); };

  const saveProblem = async () => {
    setSavingProblem(true); setProblemError('');
    const payload = { topicId, title: problemForm.title, description: problemForm.description, starterCode: problemForm.starterCode, solutionCode: problemForm.solutionCode, difficulty: problemForm.difficulty, testCases: [{ input: problemForm.testInput, expected: problemForm.testExpected }] };
    try {
      const url = editingProblem ? `/api/admin/problems/${editingProblem.id}` : '/api/admin/problems';
      const res = await fetch(url, { method: editingProblem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setShowProblemModal(false); fetchTopic(); } else { const d = await res.json(); setProblemError(d.error || 'Failed'); }
    } catch { setProblemError('Network error'); }
    setSavingProblem(false);
  };

  const deleteProblem = async (id: string) => { if (!confirm('Delete this problem?')) return; await fetch(`/api/admin/problems/${id}`, { method: 'DELETE' }); fetchTopic(); };

  if (loading || !topic) return <div className="space-y-4"><div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" /><div className="h-64 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" /></div>;

  const inputCls = "w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50";
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div className="space-y-8">
      <Link href={`/admin/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-violet-400 transition-colors"><ArrowLeft className="w-4 h-4" /> {topic.course.name}</Link>

      {/* ===== TOPIC INFO ===== */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">📝 Topic Info</h2>
        <input placeholder="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputCls} />
        <input placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={inputCls} />
        <input placeholder="Video URL" value={editForm.videoUrl} onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })} className={inputCls} />
        <div>
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 block">Concept HTML</label>
          <textarea value={editForm.conceptHtml} onChange={(e) => setEditForm({ ...editForm, conceptHtml: e.target.value })} rows={8} className={`${textareaCls} font-mono text-xs`} />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveTopic} disabled={savingTopic} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20">
            <Save className="w-4 h-4" /> {savingTopic ? 'Saving...' : 'Save Topic'}
          </button>
          {topicMsg && <span className={`text-sm font-medium ${topicMsg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{topicMsg}</span>}
        </div>
      </section>

      {/* ===== MCQs ===== */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2"><HelpCircle className="w-5 h-5 text-amber-400" /> MCQs ({topic.mcqs.length})</h2>
          <button onClick={openCreateMcq} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-all"><Plus className="w-3.5 h-3.5" /> Add MCQ</button>
        </div>
        {topic.mcqs.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No MCQs yet. Add your first question.</div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {topic.mcqs.map((m, i) => (
              <div key={m.id} className="px-6 py-4 hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200"><span className="text-zinc-500 mr-2">Q{i + 1}.</span>{m.question}</p>
                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                      {m.options.map((opt: string, oi: number) => (
                        <span key={oi} className={`text-xs px-2.5 py-1.5 rounded-lg border ${oi === m.correctIndex ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500'}`}>
                          {String.fromCharCode(65 + oi)}. {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditMcq(m)} className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-zinc-800 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteMcq(m.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== PROBLEMS ===== */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2"><Code2 className="w-5 h-5 text-rose-400" /> Problems ({topic.problems.length})</h2>
          <button onClick={openCreateProblem} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-all"><Plus className="w-3.5 h-3.5" /> Add Problem</button>
        </div>
        {topic.problems.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No problems yet. Add your first coding challenge.</div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {topic.problems.map((p, i) => (
              <div key={p.id} className="px-6 py-4 hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-600">#{i + 1}</span>
                      <p className="text-sm font-semibold text-zinc-200">{p.title}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                        p.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        p.difficulty === 'full_code' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>{p.difficulty}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{p.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditProblem(p)} className="p-1.5 rounded-lg text-zinc-500 hover:text-violet-400 hover:bg-zinc-800 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteProblem(p.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== MCQ MODAL ===== */}
      {showMcqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowMcqModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-5">{editingMcq ? 'Edit MCQ' : 'Add MCQ'}</h2>
            {mcqError && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{mcqError}</div>}
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
            <button onClick={saveMcq} disabled={savingMcq || !mcqForm.question || mcqForm.options.some(o => !o)} className="w-full mt-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20">
              {savingMcq ? 'Saving...' : editingMcq ? 'Update MCQ' : 'Create MCQ'}
            </button>
          </div>
        </div>
      )}

      {/* ===== PROBLEM MODAL ===== */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowProblemModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-bold mb-5">{editingProblem ? 'Edit Problem' : 'Add Problem'}</h2>
            {problemError && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{problemError}</div>}
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
                <textarea value={problemForm.starterCode} onChange={(e) => setProblemForm({ ...problemForm, starterCode: e.target.value })} rows={5} className={`${textareaCls} font-mono text-xs`} placeholder="# Student starts with this code..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Solution Code *</label>
                <textarea value={problemForm.solutionCode} onChange={(e) => setProblemForm({ ...problemForm, solutionCode: e.target.value })} rows={5} className={`${textareaCls} font-mono text-xs`} placeholder="# Correct solution..." />
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
            <button onClick={saveProblem} disabled={savingProblem || !problemForm.title || !problemForm.solutionCode} className="w-full mt-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20">
              {savingProblem ? 'Saving...' : editingProblem ? 'Update Problem' : 'Create Problem'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
