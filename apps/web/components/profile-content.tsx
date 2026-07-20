// =============================================================================
// Student Profile Page Content — Light Theme, Kid-Friendly
// =============================================================================
// High-fidelity student dashboard containing editable profiles, avatar picker,
// XP levels, streaks, contribution heatmaps, achievements, and submissions.
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { StreakCard } from '@/components/streak-card';
import { BadgeDisplay } from '@/components/badge-display';

// ---------------------------------------------------------------------------
// Constants & Configuration
// ---------------------------------------------------------------------------
const AVATAR_OPTIONS = ['🐯', '🦄', '🦖', '🤖', '🦊', '🐼', '🐨', '🦁'];

const ACHIEVEMENTS = [
  {
    id: 'first_steps',
    title: 'First Steps 🚀',
    description: 'Solve your first problem or answer an MCQ to begin your quest.',
    badgeIcon: '🚀',
    check: (solvedProblems: number, solvedMCQs: number, streak: number) => (solvedProblems > 0 || solvedMCQs > 0),
    accentClass: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
  },
  {
    id: 'bug_hunter',
    title: 'Bug Hunter 🐛',
    description: 'Solve your first coding problem successfully on the compiler.',
    badgeIcon: '🐛',
    check: (solvedProblems: number, solvedMCQs: number, streak: number) => solvedProblems > 0,
    accentClass: 'from-teal-50 to-emerald-50 border-teal-200 text-teal-800'
  },
  {
    id: 'quiz_wizard',
    title: 'Quiz Wizard 🧙',
    description: 'Answer all 3 Loops MCQs correctly to master the concepts.',
    badgeIcon: '🧙',
    check: (solvedProblems: number, solvedMCQs: number, streak: number) => solvedMCQs >= 3,
    accentClass: 'from-pink-50 to-rose-50 border-pink-200 text-pink-800'
  },
  {
    id: 'super_streaker',
    title: 'Super Streaker 🔥',
    description: 'Maintain a daily coding streak of 3 days or more.',
    badgeIcon: '🔥',
    check: (solvedProblems: number, solvedMCQs: number, streak: number) => streak >= 3,
    accentClass: 'from-orange-50 to-amber-50 border-orange-200 text-orange-800'
  }
];

interface StreakData {
  streak: number;
  longestStreak: number;
  lastActivityAt: string;
}

interface SavedProgress {
  solved: string[];
  solvedMCQs?: string[];
  isComplete: boolean;
}

interface Activity {
  date: string;
  type: string;
  id: string;
}

interface Submission {
  id: string;
  title: string;
  status: string;
  language: string;
  timestamp: string;
  code: string;
}

export function ProfileContent() {
  const [profileName, setProfileName] = useState('Student');
  const [profileAvatar, setProfileAvatar] = useState('🐯');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('Student');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // States for student metrics
  const [streakData, setStreakData] = useState<StreakData>({ streak: 1, longestStreak: 1, lastActivityAt: new Date().toISOString() });
  const [solvedProblemsCount, setSolvedProblemsCount] = useState(0);
  const [solvedMCQsCount, setSolvedMCQsCount] = useState(0);
  const [isLoopsComplete, setIsLoopsComplete] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // --- Load Profile Name & Avatar ---
    const storedName = localStorage.getItem('cm_profile_name') || 'Student';
    const storedAvatar = localStorage.getItem('cm_profile_avatar') || '🐯';
    setProfileName(storedName);
    setNewName(storedName);
    setProfileAvatar(storedAvatar);

    // --- Seed mock activities & submissions if not present ---
    const today = new Date();
    if (!localStorage.getItem('cm_activities')) {
      const mockActivities: Activity[] = [];
      const activityDaysAgo = [1, 2, 4, 7, 8, 9, 12, 15, 18, 19, 22, 23, 26, 28];
      activityDaysAgo.forEach((daysAgo) => {
        const date = new Date(today);
        date.setDate(today.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0] || '';
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) {
          mockActivities.push({
            date: dateStr,
            type: i % 2 === 0 ? 'problem' : 'mcq',
            id: `seed-${daysAgo}-${i}`
          });
        }
      });
      localStorage.setItem('cm_activities', JSON.stringify(mockActivities));
    }

    if (!localStorage.getItem('cm_submissions')) {
      const mockSubmissions: Submission[] = [
        {
          id: 'sub-1',
          title: 'Printing Hello World',
          status: 'success',
          language: 'python',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          code: 'print("Hello World!")'
        },
        {
          id: 'sub-2',
          title: 'Loops in Python - Problem 1',
          status: 'success',
          language: 'python',
          timestamp: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          code: 'for i in range(5):\n    print(i)'
        },
        {
          id: 'sub-3',
          title: 'Loops in Python - Problem 2',
          status: 'compile_error',
          language: 'python',
          timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          code: 'while counter < 5\n    print("looping!")'
        }
      ];
      localStorage.setItem('cm_submissions', JSON.stringify(mockSubmissions));
    }

    // --- Load Streak Card ---
    const rawStreak = localStorage.getItem('cm_streak');
    if (rawStreak) {
      setStreakData(JSON.parse(rawStreak));
    }

    // --- Load Course Progress & Solved Counts ---
    const rawProgress = localStorage.getItem('cm_progress_python-loops');
    let solvedProbs: string[] = [];
    let solvedQuizzes: string[] = [];
    let loopsDone = false;

    if (rawProgress) {
      const parsed: SavedProgress = JSON.parse(rawProgress);
      solvedProbs = parsed.solved || [];
      solvedQuizzes = parsed.solvedMCQs || [];
      loopsDone = parsed.isComplete || false;
    }
    
    setSolvedProblemsCount(solvedProbs.length);
    setSolvedMCQsCount(solvedQuizzes.length);
    setIsLoopsComplete(loopsDone);

    // --- Load Submissions & Activities ---
    const rawActivities = localStorage.getItem('cm_activities');
    if (rawActivities) {
      setActivities(JSON.parse(rawActivities));
    }

    const rawSubmissions = localStorage.getItem('cm_submissions');
    if (rawSubmissions) {
      setSubmissions(JSON.parse(rawSubmissions));
    }

    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-8 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-gray-100 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-100 rounded-2xl md:col-span-2" />
            <div className="h-48 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  // --- XP & Level System Calculations ---
  // Problems: 50 XP each. MCQs: 20 XP each.
  const totalXP = (solvedProblemsCount * 50) + (solvedMCQsCount * 20);
  const xpPerLevel = 200;
  const currentLevel = Math.floor(totalXP / xpPerLevel) + 1;
  const currentLevelXP = totalXP % xpPerLevel;
  const xpProgressPercent = Math.min(Math.round((currentLevelXP / xpPerLevel) * 100), 100);

  // --- Profile Modifications ---
  const saveName = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      localStorage.setItem('cm_profile_name', trimmed);
      setProfileName(trimmed);
      setIsEditingName(false);
      window.dispatchEvent(new Event('cm_profile_updated'));
    }
  };

  const selectAvatar = (avatar: string) => {
    localStorage.setItem('cm_profile_avatar', avatar);
    setProfileAvatar(avatar);
    setShowAvatarPicker(false);
    window.dispatchEvent(new Event('cm_profile_updated'));
  };

  // --- Generate Heatmap Days (Last 16 weeks / 112 days) ---
  const calendarDays: Date[] = [];
  const today = new Date();
  for (let i = 111; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    calendarDays.push(d);
  }

  const badgeData = [
    {
      topicTitle: 'Loops in Python',
      badge: isLoopsComplete ? 'Loops Master 🐍' : null,
      isComplete: isLoopsComplete
    }
  ];

  return (
    <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      {/* 1. Header Profile Banner */}
      <section className="bg-white border-2 border-purple-100 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden animate-bounce-in">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-50 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-50 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Avatar Area */}
          <div className="relative">
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-4 border-purple-200 shadow-md flex items-center justify-center text-5xl transition-all duration-200 active:scale-95 group relative"
              title="Click to change avatar!"
            >
              <span className="group-hover:scale-110 transition-transform">{profileAvatar}</span>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow text-xs">
                ✏️
              </div>
            </button>

            {/* Avatar Picker Modal Dropdown */}
            {showAvatarPicker && (
              <div className="absolute top-28 left-1/2 transform -translate-x-1/2 bg-white border-2 border-purple-100 rounded-2xl p-4 shadow-xl z-50 w-52 animate-slide-in">
                <h4 className="text-[10px] font-black text-[#9E9EB8] uppercase tracking-widest text-center mb-3">Choose Your Companion!</h4>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => selectAvatar(emoji)}
                      className="text-2xl p-1.5 hover:bg-purple-50 rounded-xl transition-all active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Bio & Level Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2.5 mb-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={15}
                    className="px-3 py-1.5 border-2 border-purple-200 rounded-xl text-lg font-extrabold text-[#1A1A2E] focus:outline-none focus:border-purple-500 w-44"
                  />
                  <button
                    onClick={saveName}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setIsEditingName(false); setNewName(profileName); }}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#64648B] font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1A2E]">{profileName}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 hover:bg-purple-50 text-[#9E9EB8] hover:text-purple-600 rounded-lg transition"
                    title="Edit Display Name"
                  >
                    ✏️
                  </button>
                </div>
              )}
              
              <span className="px-3 py-1 bg-purple-100 text-purple-700 font-extrabold text-xs rounded-full border border-purple-200 w-fit mx-auto sm:mx-0">
                Level {currentLevel} Scholar 🎓
              </span>
            </div>

            <p className="text-sm text-[#64648B] font-medium mb-5">
              CodeMaster Apprentice · Journey started June 2026
            </p>

            {/* XP Level Progress Bar */}
            <div className="max-w-md mx-auto md:mx-0">
              <div className="flex justify-between text-xs font-bold text-[#64648B] mb-1.5">
                <span>XP Level Progress</span>
                <span>{currentLevelXP} / {xpPerLevel} XP ({xpProgressPercent}%)</span>
              </div>
              <div className="w-full bg-purple-50 border border-purple-100 rounded-full h-3.5 p-0.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-1000"
                  style={{ width: `${xpProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main content split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Streak, Achievements & Badges (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Daily Streak Integration */}
          <StreakCard
            streak={streakData.streak}
            longestStreak={streakData.longestStreak}
          />

          {/* GitHub-style Contribution Calendar */}
          <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-base font-extrabold text-[#1A1A2E] flex items-center gap-2">
                <span>📅</span> Coding Activities (16 Weeks)
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] text-[#9E9EB8] font-bold">
                <span>Less</span>
                <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm border border-gray-200/50" />
                <div className="w-2.5 h-2.5 bg-purple-100 rounded-sm border border-purple-200" />
                <div className="w-2.5 h-2.5 bg-purple-300 rounded-sm border border-purple-400" />
                <div className="w-2.5 h-2.5 bg-purple-600 rounded-sm border border-purple-700" />
                <span>More</span>
              </div>
            </div>

            {/* Heatmap Grid wrapper */}
            <div className="bg-purple-50/20 border border-purple-100/50 rounded-2xl p-4 overflow-x-auto scrollbar-none">
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[500px]">
                {calendarDays.map((day, idx) => {
                  const dateStr = day.toISOString().split('T')[0] || '';
                  const dayActivities = activities.filter((a) => a.date === dateStr);
                  const count = dayActivities.length;

                  let colorClass = 'bg-gray-100/80 border border-gray-200/40';
                  if (count === 1) colorClass = 'bg-purple-200 border border-purple-300/50';
                  else if (count === 2) colorClass = 'bg-purple-400 border border-purple-500/50';
                  else if (count >= 3) colorClass = 'bg-purple-600 border border-purple-700/50';

                  const formattedDate = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const tooltip = `${count} activity${count !== 1 ? 'ies' : ''} on ${formattedDate}`;

                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 hover:scale-125 cursor-pointer ${colorClass}`}
                      title={tooltip}
                    />
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-[#9E9EB8] font-semibold mt-3 text-center">
              Solve code compiler challenges and complete MCQs daily to light up your calendar! 🌟
            </p>
          </div>

          {/* Badges Section */}
          <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-sm">
            <BadgeDisplay badges={badgeData} />
          </div>

          {/* Achievements Grid */}
          <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-[#1A1A2E] mb-5 flex items-center gap-2">
              <span>🏆</span> Quest Achievements
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = ach.check(solvedProblemsCount, solvedMCQsCount, streakData.streak);
                
                return (
                  <div
                    key={ach.id}
                    className={`relative p-5 rounded-2xl border-2 flex items-start gap-4 transition-all duration-300 ${
                      isUnlocked
                        ? `bg-gradient-to-br ${ach.accentClass} shadow-sm`
                        : 'bg-gray-50/50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border shrink-0 ${
                      isUnlocked ? 'bg-white border-white' : 'bg-gray-100 border-gray-200'
                    }`}>
                      {isUnlocked ? ach.badgeIcon : '🔒'}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-sm font-extrabold ${isUnlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                        {ach.title}
                      </h4>
                      <p className="text-xs text-[#64648B] font-medium leading-relaxed">
                        {ach.description}
                      </p>
                      {isUnlocked ? (
                        <span className="inline-block mt-2 text-[9px] font-black text-teal-600 bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Unlocked
                        </span>
                      ) : (
                        <span className="inline-block mt-2 text-[9px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Mini Stats Summary & Recent Submissions (1/3 width) */}
        <div className="space-y-8">
          
          {/* Stats Breakdown Panel */}
          <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-[#1A1A2E] mb-4 flex items-center gap-2">
              <span>📊</span> Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-sm font-semibold text-[#64648B]">Total XP Earned</span>
                <span className="text-sm font-extrabold text-purple-600">{totalXP} XP</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-sm font-semibold text-[#64648B]">Coding Solves</span>
                <span className="text-sm font-extrabold text-teal-600">{solvedProblemsCount} problems</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <span className="text-sm font-semibold text-[#64648B]">Quiz Answers</span>
                <span className="text-sm font-extrabold text-pink-600">{solvedMCQsCount} correct</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm font-semibold text-[#64648B]">Active Streak</span>
                <span className="text-sm font-extrabold text-orange-600">{streakData.streak} days</span>
              </div>
            </div>
          </div>

          {/* Recent Submissions Log */}
          <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-[#1A1A2E] mb-4 flex items-center gap-2">
              <span>💻</span> Recent Submissions
            </h3>
            
            {submissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9E9EB8] font-medium">
                No recent submissions. Open the compiler to execute code! 🚀
              </div>
            ) : (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {submissions.map((sub) => {
                  const dateVal = new Date(sub.timestamp);
                  const relTime = dateVal.toLocaleDateString() + ' ' + dateVal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={sub.id} className="p-3.5 bg-gray-50 hover:bg-purple-50/20 border border-gray-100 hover:border-purple-100 rounded-xl transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-extrabold text-[#1A1A2E] truncate max-w-[130px]" title={sub.title}>
                          {sub.title}
                        </h4>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          sub.status === 'success'
                            ? 'bg-teal-100 text-teal-700 border-teal-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {sub.status === 'success' ? 'Passed' : 'Error'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-[#9E9EB8] font-semibold mb-2">
                        <span>Python 3</span>
                        <span>{relTime}</span>
                      </div>
                      
                      <pre className="text-[10px] font-mono bg-[#1E1E2E] text-white p-2 rounded-lg max-h-[60px] overflow-y-auto overflow-x-auto scrollbar-none whitespace-pre-wrap select-all">
                        {sub.code}
                      </pre>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
