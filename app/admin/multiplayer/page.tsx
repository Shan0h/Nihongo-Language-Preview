'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { questions, Category, Question } from '@/data/questions';
import { supabase } from '@/app/utils/supabase';

interface LeaderboardRecord {
  id?: string;
  name: string;
  category: string;
  points: number;
  accuracy: number;
  badge: string;
  created_at?: string;
}

interface ClassroomPreset {
  id: string;
  title: string;
  japanese: string;
  emoji: string;
  category: string;
  questionCount: number;
  timerSeconds: number;
  description: string;
  badgeColor: string;
}

const CLASSROOM_PRESETS: ClassroomPreset[] = [
  {
    id: 'greetings-warmup',
    title: 'Morning Greetings Warmup',
    japanese: 'あいさつ・ウォームアップ',
    emoji: '🎌',
    category: 'Greetings',
    questionCount: 5,
    timerSeconds: 15,
    description: 'Quick 5-question morning drill covering essential Japanese hellos and goodbyes.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'food-challenge',
    title: 'Food & Dining Challenge',
    japanese: 'たべもの・クイズ',
    emoji: '🍣',
    category: 'Food',
    questionCount: 5,
    timerSeconds: 20,
    description: 'Comfortable 20s pace testing Japanese food, sushi, ramen, and tea vocabulary.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'verbs-drill',
    title: 'Action Verbs Speed Drill',
    japanese: 'どうし・スピードラン',
    emoji: '🏃',
    category: 'Verbs',
    questionCount: 4,
    timerSeconds: 10,
    description: 'Fast-paced 10s per question drill for recognizing essential Japanese actions.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'animals-vocab',
    title: 'Animals & Pets Sprint',
    japanese: 'どうぶつ・スプリント',
    emoji: '🐻',
    category: 'Animals',
    questionCount: 3,
    timerSeconds: 15,
    description: 'Fun visual quiz covering dogs, cats, and bears with custom illustrations.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'jlpt-exam',
    title: 'Comprehensive JLPT N5 Exam',
    japanese: 'そうごう・JLPTしけん',
    emoji: '🏆',
    category: 'All',
    questionCount: 20,
    timerSeconds: 15,
    description: 'Full 20-question mixed topic test testing mastery across all vocabulary sets.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
];

export default function AdminMultiplayerStudio() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  // Room Customization State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Leaderboard Analytics State
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState<boolean>(true);

  useEffect(() => {
    const admin = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(admin);
    if (admin) {
      fetchMatchHistory();
    }
  }, []);

  const fetchMatchHistory = async () => {
    setIsLoadingScores(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('points', { ascending: false })
        .limit(20);

      if (!error && data) {
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Failed to load match history:', err);
    } finally {
      setIsLoadingScores(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4">
        <div className="text-center max-w-sm w-full bg-white p-6 rounded-2xl shadow-md border border-[#f4c2c2]">
          <p className="text-xl mb-4 font-bold text-[#2d2d2d]">Access Denied</p>
          <p className="text-sm text-[#8a8a8a] mb-6">Please log in to access the Classroom Game Studio.</p>
          <Link href="/admin/login" className="btn-torii w-full py-3 block text-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Categories with count
  const distinctCategories = Array.from(new Set(questions.map((q) => q.category)));
  const availableQuestionsInCategory =
    selectedCategory === 'All'
      ? questions.length
      : questions.filter((q) => q.category === selectedCategory).length;

  const handleApplyPreset = (preset: ClassroomPreset) => {
    setActivePreset(preset.id);
    setSelectedCategory(preset.category);
    setQuestionCount(preset.questionCount);
    setTimerSeconds(preset.timerSeconds);
  };

  const handleLaunchRoom = () => {
    const params = new URLSearchParams();
    params.set('category', selectedCategory);
    params.set('count', questionCount.toString());
    params.set('timer', timerSeconds.toString());

    // Navigate to host with custom room parameters
    router.push(`/host?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-6 text-[#2d2d2d]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-[#8a8a8a] hover:text-[#d32f2f] mb-1 font-medium transition-colors"
            >
              ← Back to Admin Dashboard
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2d2d2d]">
                Classroom Game Studio
              </h1>
              <span className="bg-[#d32f2f] text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-xs">
                Teacher Command Center
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5a5a5a] mt-1">
              Configure tailored lesson topics, question counts, and timers for your students.
            </p>
          </div>

          <button
            onClick={handleLaunchRoom}
            className="btn-torii px-6 py-3 rounded-2xl font-bold text-sm shadow-md hover:scale-[1.02] transition-transform flex items-center gap-2"
          >
            <span>🚀</span>
            <span>Launch Game Room</span>
          </button>
        </div>

        {/* 1. Quick Presets Bar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#2d2d2d] flex items-center gap-2">
              <span>⚡</span>
              <span>1-Click Lesson Presets</span>
            </h2>
            <span className="text-xs text-[#8a8a8a]">Click any preset to instant-configure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {CLASSROOM_PRESETS.map((preset) => {
              const isSelected = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#d32f2f] shadow-md ring-2 ring-[#d32f2f]/20 scale-[1.02]'
                      : 'bg-white/80 border-[#f4c2c2]/60 hover:border-[#d32f2f]/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{preset.emoji}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${preset.badgeColor}`}
                    >
                      {preset.timerSeconds}s
                    </span>
                  </div>
                  <div className="font-bold text-sm text-[#2d2d2d] mb-0.5 leading-snug">
                    {preset.title}
                  </div>
                  <div className="text-[11px] text-[#d32f2f] font-medium mb-1.5">
                    {preset.japanese}
                  </div>
                  <div className="text-xs text-[#8a8a8a] line-clamp-2">{preset.description}</div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-[#5a5a5a]">
                    <span>{preset.questionCount} Questions</span>
                    <span className="text-[#d32f2f]">Apply →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Room Configuration Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-cultural p-6 border-2 border-[#f4c2c2]">
              <h2 className="text-lg font-bold text-[#2d2d2d] mb-4 flex items-center gap-2">
                <span>🛠️</span>
                <span>Customize Room Settings</span>
              </h2>

              <div className="space-y-5">
                {/* 1. Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#5a5a5a] uppercase tracking-wider mb-2">
                    1. Lesson Topic / Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('All');
                        setActivePreset(null);
                      }}
                      className={`p-3 rounded-xl border text-left font-medium text-xs transition-all ${
                        selectedCategory === 'All'
                          ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-sm font-bold'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#f4c2c2]'
                      }`}
                    >
                      <div className="text-lg mb-1">📋</div>
                      <div>All Topics</div>
                      <div className={`text-[10px] ${selectedCategory === 'All' ? 'text-white/80' : 'text-gray-400'}`}>
                        {questions.length} Questions
                      </div>
                    </button>

                    {distinctCategories.map((cat) => {
                      const count = questions.filter((q) => q.category === cat).length;
                      const isCatActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setActivePreset(null);
                            if (questionCount > count) {
                              setQuestionCount(count);
                            }
                          }}
                          className={`p-3 rounded-xl border text-left font-medium text-xs transition-all ${
                            isCatActive
                              ? 'bg-[#d32f2f] text-white border-[#d32f2f] shadow-sm font-bold'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-[#f4c2c2]'
                          }`}
                        >
                          <div className="text-lg mb-1">
                            {cat === 'Greetings'
                              ? '🎌'
                              : cat === 'Food'
                              ? '🍣'
                              : cat === 'Verbs'
                              ? '🏃'
                              : cat === 'Animals'
                              ? '🐻'
                              : cat === 'Colors'
                              ? '🎨'
                              : cat === 'Numbers'
                              ? '🔢'
                              : '💬'}
                          </div>
                          <div className="truncate">{cat}</div>
                          <div
                            className={`text-[10px] ${
                              isCatActive ? 'text-white/80' : 'text-gray-400'
                            }`}
                          >
                            {count} Questions
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Question Count Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#5a5a5a] uppercase tracking-wider mb-2">
                    2. Question Deck Size
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { count: 5, label: '5 Questions', sub: 'Quick Drill (2-3m)' },
                      { count: 10, label: '10 Questions', sub: 'Standard Lesson (5m)' },
                      { count: 15, label: '15 Questions', sub: 'Extended Quiz (8m)' },
                      { count: 20, label: '20 Questions', sub: 'Classroom Exam (10m)' },
                    ].map((opt) => {
                      const isDisabled = opt.count > availableQuestionsInCategory;
                      const isCountActive = questionCount === opt.count;
                      return (
                        <button
                          key={opt.count}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            setQuestionCount(opt.count);
                            setActivePreset(null);
                          }}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isDisabled
                              ? 'opacity-40 bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400'
                              : isCountActive
                              ? 'bg-[#2d2d2d] text-white border-[#2d2d2d] shadow-sm font-bold'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-sm font-bold">{opt.label}</div>
                          <div
                            className={`text-[10px] ${
                              isCountActive ? 'text-white/80' : 'text-gray-400'
                            }`}
                          >
                            {isDisabled ? 'Not enough Qs' : opt.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Timer Duration Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#5a5a5a] uppercase tracking-wider mb-2">
                    3. Time per Question
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { sec: 10, label: '10 Seconds', emoji: '⚡', desc: 'Speedrun / Advanced' },
                      { sec: 15, label: '15 Seconds', emoji: '⏱️', desc: 'Balanced / Standard' },
                      { sec: 20, label: '20 Seconds', emoji: '🧘', desc: 'Comfortable Pace' },
                      { sec: 30, label: '30 Seconds', emoji: '🐢', desc: 'Beginner Friendly' },
                    ].map((opt) => {
                      const isTimerActive = timerSeconds === opt.sec;
                      return (
                        <button
                          key={opt.sec}
                          type="button"
                          onClick={() => {
                            setTimerSeconds(opt.sec);
                            setActivePreset(null);
                          }}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isTimerActive
                              ? 'bg-[#f59e0b] text-white border-[#f59e0b] shadow-sm font-bold'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                          }`}
                        >
                          <div className="text-base mb-0.5">{opt.emoji}</div>
                          <div className="text-sm font-bold">{opt.label}</div>
                          <div
                            className={`text-[10px] ${
                              isTimerActive ? 'text-white/90' : 'text-gray-400'
                            }`}
                          >
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Configuration Summary Card */}
          <div className="space-y-4">
            <div className="card-cultural p-6 border-2 border-[#d32f2f] bg-gradient-to-b from-white to-[#fff8f8] sticky top-6 shadow-lg">
              <div className="text-xs font-bold uppercase tracking-wider text-[#d32f2f] mb-1">
                Room Preview
              </div>
              <h3 className="text-xl font-black text-[#2d2d2d] mb-4">
                Ready to Launch
              </h3>

              <div className="space-y-3 pb-5 border-b border-[#f4c2c2]/60 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#8a8a8a]">Selected Topic</span>
                  <span className="font-bold text-[#d32f2f] bg-[#f4c2c2]/40 px-2.5 py-0.5 rounded-full text-xs">
                    {selectedCategory === 'All' ? 'All Japanese Topics' : selectedCategory}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8a8a8a]">Questions</span>
                  <span className="font-bold text-[#2d2d2d]">
                    {questionCount} Questions
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8a8a8a]">Timer Countdown</span>
                  <span className="font-bold text-[#f59e0b]">
                    {timerSeconds} seconds / Q
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8a8a8a]">Est. Session Time</span>
                  <span className="font-bold text-[#2e7d32]">
                    ~{Math.ceil((questionCount * (timerSeconds + 5)) / 60)} minutes
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8a8a8a]">Speech Audio</span>
                  <span className="font-semibold text-gray-700">Native TTS (Auto)</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={handleLaunchRoom}
                  className="btn-torii w-full py-4 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <span>🚀</span>
                  <span>Launch Classroom Room</span>
                </button>
                <p className="text-[11px] text-center text-[#8a8a8a]">
                  Generates a dedicated game PIN for students to join on their mobile devices or laptops.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Classroom Match History & Leaderboard Analytics */}
        <div className="card-cultural p-6 border border-[#f4c2c2]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#2d2d2d] flex items-center gap-2">
                <span>📊</span>
                <span>Classroom Match History & Student Leaderboard</span>
              </h2>
              <p className="text-xs text-[#8a8a8a]">
                Live records of student performance and tournament winners from multiplayer matches.
              </p>
            </div>
            <button
              onClick={fetchMatchHistory}
              disabled={isLoadingScores}
              className="text-xs text-[#d32f2f] hover:bg-[#f4c2c2]/20 font-bold px-3 py-1.5 rounded-lg border border-[#f4c2c2] transition-colors flex items-center gap-1"
            >
              <span>🔄</span>
              <span>Refresh Records</span>
            </button>
          </div>

          {isLoadingScores ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-[#d32f2f] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-[#8a8a8a]">Loading student records...</p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-[#5a5a5a] uppercase">
                    <th className="pb-3 px-3">Rank</th>
                    <th className="pb-3 px-3">Student / Player</th>
                    <th className="pb-3 px-3">Score</th>
                    <th className="pb-3 px-3">Accuracy</th>
                    <th className="pb-3 px-3">Rank Title</th>
                    <th className="pb-3 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboard.map((record, index) => (
                    <tr key={record.id || index} className="hover:bg-[#fff9f9] transition-colors">
                      <td className="py-3 px-3 font-bold">
                        {index === 0 ? (
                          <span className="text-amber-500 font-extrabold text-base">🥇 #1</span>
                        ) : index === 1 ? (
                          <span className="text-gray-400 font-extrabold text-base">🥈 #2</span>
                        ) : index === 2 ? (
                          <span className="text-orange-500 font-extrabold text-base">🥉 #3</span>
                        ) : (
                          <span className="text-gray-600 font-medium">#{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#2d2d2d]">{record.name}</td>
                      <td className="py-3 px-3 font-bold text-[#d32f2f]">{record.points.toLocaleString()} pts</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                          {record.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-[#5a5a5a]">{record.badge || 'Quizzer'}</td>
                      <td className="py-3 px-3 text-xs text-[#8a8a8a]">
                        {record.created_at
                          ? new Date(record.created_at).toLocaleDateString()
                          : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-[#fffcfc] rounded-xl border border-dashed border-[#f4c2c2]">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm font-bold text-[#2d2d2d] mb-1">No Match Records Yet</p>
              <p className="text-xs text-[#8a8a8a] max-w-sm mx-auto">
                Once you launch a multiplayer game from this studio and students finish playing, the leaderboard results will appear here automatically!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
