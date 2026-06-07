import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PHASES } from '../game/phases';
import { safeGet, safeSave } from '../lib/safeStorage';
import { getStats, resetStats } from '../lib/stats';

const GATE_PROBLEMS = [
  { question: '8 + 5 = ?', answer: 13 },
  { question: '15 − 7 = ?', answer: 8 },
  { question: '6 × 3 = ?', answer: 18 },
  { question: '4 × 7 = ?', answer: 28 },
  { question: '24 ÷ 4 = ?', answer: 6 },
  { question: '17 + 9 = ?', answer: 26 },
  { question: '36 ÷ 6 = ?', answer: 6 },
  { question: '11 × 3 = ?', answer: 33 },
];

const TIMER_OPTIONS = [5, 10, 15, 20, 30] as const;
type TimerMin = (typeof TIMER_OPTIONS)[number];

function formatRemaining(endTime: number): string {
  const ms = endTime - Date.now();
  if (ms <= 0) return 'Expired';
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')} remaining`;
}

export default function GrownUpCorner() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [problem] = useState(
    () => GATE_PROBLEMS[Math.floor(Math.random() * GATE_PROBLEMS.length)]
  );

  const savedProgress = safeGet<{ phase: number; levelInPhase: number } | null>(
    'mathProgress',
    null,
  );

  // On-device learning insights (never leaves the device).
  const stats = getStats();
  const accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;

  // Replay/skill-guide cover the live kids' RPG only (phases 1–4). Ages 13–17
  // live in The Academy, which has its own progress; clamp so we never open the
  // orphaned phases 5–9 (the game now caps /play at phase 4).
  const [selectedPhase, setSelectedPhase] = useState(Math.min(4, savedProgress?.phase ?? 1));
  const [timerMin, setTimerMin] = useState<TimerMin | null>(null);
  const [activeTimer, setActiveTimer] = useState<{ endTime: number; minutes: number } | null>(
    () => safeGet<{ endTime: number; minutes: number } | null>('sessionTimer', null)
  );
  const [remaining, setRemaining] = useState(() =>
    activeTimer ? formatRemaining(activeTimer.endTime) : ''
  );
  const [showResetConfirm, setShowResetConfirm] = useState<'phase' | 'all' | null>(null);
  // Haptics (vibration feedback) — default ON; only `false` disables it.
  const [hapticsOn, setHapticsOn] = useState(() => safeGet<boolean>('mathadv-haptics', true) !== false);

  const toggleHaptics = () => {
    const next = !hapticsOn;
    setHapticsOn(next);
    safeSave('mathadv-haptics', next);
    if (next && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try { navigator.vibrate(15); } catch { /* ignore */ }
    }
  };

  useEffect(() => {
    if (!activeTimer) return;
    setRemaining(formatRemaining(activeTimer.endTime));
    const interval = setInterval(() => setRemaining(formatRemaining(activeTimer.endTime)), 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(gateAnswer.trim(), 10) === problem.answer) {
      setUnlocked(true);
    } else {
      setGateError(true);
      setGateAnswer('');
      setTimeout(() => setGateError(false), 1500);
    }
  };

  const handleSetTimer = () => {
    if (!timerMin) return;
    const timer = { endTime: Date.now() + timerMin * 60000, minutes: timerMin };
    localStorage.setItem('sessionTimer', JSON.stringify(timer));
    setActiveTimer(timer);
  };

  const handleClearTimer = () => {
    localStorage.removeItem('sessionTimer');
    setActiveTimer(null);
    setTimerMin(null);
  };

  const handleReset = (scope: 'phase' | 'all') => {
    if (scope === 'all') {
      ['mathProgress', 'earnedBadges', 'tutorialDone', 'streakData',
        'lifetimeCoins', 'consolationCoins', 'companionSetup', 'sessionTimer'].forEach(
        k => localStorage.removeItem(k)
      );
      resetStats();
    } else {
      const p = safeGet<{ phase: number; levelInPhase: number } | null>('mathProgress', null);
      if (p) localStorage.setItem('mathProgress', JSON.stringify({ phase: p.phase, levelInPhase: 1 }));
    }
    setShowResetConfirm(null);
    navigate('/');
  };

  // ── Gate screen ────────────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#EFF6FF] flex items-center justify-center p-4">
        <div className="bg-white rounded-[32px] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm">
          <Link to="/" className="flex items-center gap-1 text-sm font-black text-gray-400 hover:text-gray-600 no-underline mb-6 transition-colors">
            ← Back
          </Link>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">👨‍👩‍👧</div>
            <h1 className="text-2xl font-black">Grown-up Corner</h1>
            <p className="text-sm font-bold text-gray-500 mt-2">Solve this to enter — keeps little ones out!</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5 text-center mb-5 border-2 border-black">
            <p className="text-3xl font-black">{problem.question}</p>
          </div>
          <form onSubmit={handleGateSubmit} className="flex flex-col gap-3">
            <input
              type="number"
              value={gateAnswer}
              onChange={e => setGateAnswer(e.target.value)}
              placeholder="Your answer…"
              autoFocus
              className={`text-center text-2xl font-black p-4 rounded-2xl border-4 outline-none transition-colors ${
                gateError ? 'border-[#F87171] bg-[#FEF2F2]' : 'border-black'
              }`}
            />
            {gateError && <p className="text-[#EF4444] font-black text-center text-sm">Wrong! Try again.</p>}
            <button type="submit"
              className="bg-[#3B82F6] text-white border-4 border-black py-3 rounded-2xl font-black text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all">
              Enter →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Main content ───────────────────────────────────────────────────────────────
  const currentPhase = PHASES[(savedProgress?.phase ?? 1) - 1];
  const selectedPhaseConfig = PHASES[selectedPhase - 1];

  return (
    <div className="min-h-screen bg-[#EFF6FF] font-sans text-black">
      <div className="max-w-2xl mx-auto p-4 md:p-8">

        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <Link to="/" className="mt-1 text-sm font-black text-gray-400 hover:text-gray-600 no-underline shrink-0 transition-colors">
            ← Back
          </Link>
          <div>
            <h1 className="text-3xl font-black leading-tight">Grown-up Corner 👨‍👩‍👧</h1>
            <p className="text-sm font-bold text-gray-500 mt-1">Progress, controls &amp; CAPS skill guide</p>
          </div>
        </div>

        {/* ── Section 1: Progress ── */}
        <section className="bg-white rounded-[24px] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
          <h2 className="text-xl font-black mb-4">📊 Current Progress</h2>
          {savedProgress ? (
            <div className="flex items-center gap-4 flex-wrap">
              <div className={`${currentPhase.bgColor} p-4 rounded-2xl border-2 border-black text-3xl shrink-0`}>
                {currentPhase.emoji}
              </div>
              <div className="flex-1">
                <p className="font-black text-lg leading-tight">{currentPhase.name}</p>
                <p className="text-gray-500 font-bold text-sm">{currentPhase.ageRange}</p>
                <p className="font-black text-2xl text-[#3B82F6] mt-1">
                  Level {savedProgress.levelInPhase}
                  <span className="text-sm text-gray-400 font-bold"> of {currentPhase.levels.length}</span>
                </p>
                <p className="text-xs font-bold text-gray-400 mt-1 leading-snug">
                  Up next: {currentPhase.levels.find(l => l.n === savedProgress.levelInPhase)?.topic ?? 'Phase complete!'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 font-bold">No progress yet. Start playing to track progress!</p>
          )}
          <Link to="/play"
            className="mt-4 inline-flex items-center gap-2 bg-[#3B82F6] text-white px-6 py-3 rounded-2xl font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] no-underline hover:bg-[#2563EB] transition-all">
            ▶️ Continue Game
          </Link>
        </section>

        {/* ── Section 1b: Learning Insights (on-device only) ── */}
        <section className="bg-white rounded-[24px] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
          <h2 className="text-xl font-black mb-1">🔍 Learning Insights</h2>
          <p className="text-sm font-bold text-gray-500 mb-4">
            Private to this device — never uploaded or shared.
          </p>
          {stats.answered === 0 ? (
            <p className="text-gray-500 font-bold">No activity yet. Insights appear once your child starts answering questions.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#E0F2FE] rounded-2xl border-2 border-black p-3 text-center">
                  <p className="text-2xl font-black text-[#3B82F6]">{stats.answered}</p>
                  <p className="text-xs font-bold text-gray-500">Questions</p>
                </div>
                <div className="bg-[#DCFCE7] rounded-2xl border-2 border-black p-3 text-center">
                  <p className="text-2xl font-black text-[#22C55E]">{accuracy}%</p>
                  <p className="text-xs font-bold text-gray-500">Accuracy</p>
                </div>
                <div className="bg-[#F3E8FF] rounded-2xl border-2 border-black p-3 text-center">
                  <p className="text-2xl font-black text-[#A855F7]">{stats.levelsCompleted}</p>
                  <p className="text-xs font-bold text-gray-500">Levels done</p>
                </div>
              </div>
              {stats.lastPlayed && (
                <p className="text-xs font-bold text-gray-400 mt-3">
                  Last active: {new Date(stats.lastPlayed).toLocaleDateString()}
                </p>
              )}
            </>
          )}
        </section>

        {/* ── Section 2: Replay any level ── */}
        <section className="bg-white rounded-[24px] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
          <h2 className="text-xl font-black mb-1">🔄 Replay Any Level</h2>
          <p className="text-sm font-bold text-gray-500 mb-4">
            Pick any level to practice again — great for extra repetition or showing grandma!
            <span className="block text-xs text-gray-400 mt-0.5">Replay mode does not overwrite your saved progress.</span>
          </p>

          {/* Phase tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {PHASES.filter(ph => ph.id <= 4).map(ph => (
              <button key={ph.id} onClick={() => setSelectedPhase(ph.id)}
                className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-sm transition-all ${
                  selectedPhase === ph.id ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                {ph.emoji} {ph.name}
              </button>
            ))}
          </div>

          {/* Level grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {selectedPhaseConfig.levels.map(lvl => (
              <button
                key={lvl.n}
                onClick={() => navigate(`/play?phase=${selectedPhase}&level=${lvl.n}&replay=1`)}
                title={lvl.topic}
                className={`${selectedPhaseConfig.bgColor} border-2 border-black p-3 rounded-2xl font-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all hover:brightness-95`}
              >
                <div className="text-base font-black">L{lvl.n}</div>
                <div className="text-xs mt-0.5">🔄</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Section 3: Session Timer ── */}
        <section className="bg-white rounded-[24px] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
          <h2 className="text-xl font-black mb-1">⏱️ Screen Time Limit</h2>
          <p className="text-sm font-bold text-gray-500 mb-4">
            Set a timer — the game pauses with a "break time" screen when it expires.
          </p>

          {activeTimer ? (
            <div className="bg-[#FEF9C3] border-2 border-[#EAB308] rounded-2xl p-4 mb-4">
              <p className="font-black text-[#92400E]">⏰ Active timer: {activeTimer.minutes} min</p>
              <p className="text-sm font-bold text-[#92400E] mt-0.5">{remaining}</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {TIMER_OPTIONS.map(m => (
                <button key={m} onClick={() => setTimerMin(m)}
                  className={`px-4 py-2 rounded-xl border-2 border-black font-black text-sm transition-all ${
                    timerMin === m ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                  {m} min
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {!activeTimer && (
              <button onClick={handleSetTimer} disabled={!timerMin}
                className="bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl border-2 border-black font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 active:shadow-none transition-all">
                Set Timer ▶
              </button>
            )}
            {activeTimer && (
              <button onClick={handleClearTimer}
                className="bg-[#F87171] text-white px-5 py-2.5 rounded-xl border-2 border-black font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                Clear Timer ✕
              </button>
            )}
          </div>
        </section>

        {/* ── Section 4: CAPS Skill Guide ── */}
        <section className="bg-white rounded-[24px] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
          <h2 className="text-xl font-black mb-1">📖 CAPS Skill Guide</h2>
          <p className="text-sm font-bold text-gray-500 mb-4">
            What each level teaches — based on the South African CAPS curriculum.
          </p>
          <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-wider">
            Showing: {selectedPhaseConfig.name} ({selectedPhaseConfig.ageRange})
          </p>
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {selectedPhaseConfig.levels.map(lvl => {
              const isCurrent = savedProgress?.phase === selectedPhase && savedProgress?.levelInPhase === lvl.n;
              return (
                <div key={lvl.n}
                  className={`border-l-4 border-black p-3 rounded-xl flex items-start gap-2 ${
                    isCurrent ? 'bg-[#DBEAFE] border-l-[#3B82F6]' : selectedPhaseConfig.bgColor
                  }`}
                >
                  <span className="font-black text-sm shrink-0 mt-0.5">L{lvl.n}</span>
                  <span className="text-sm font-bold text-gray-700 leading-snug">{lvl.topic}</span>
                  {isCurrent && (
                    <span className="ml-auto bg-[#3B82F6] text-white text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0">NOW</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Preferences ── */}
        <section className="bg-white rounded-[24px] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
          <h2 className="text-xl font-black mb-1">🎚️ Preferences</h2>
          <p className="text-sm font-bold text-gray-500 mb-4">
            Settings for how the app feels. Saved on this device only.
          </p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-gray-800">Vibration feedback</p>
              <p className="text-xs font-bold text-gray-500">A gentle buzz on right/wrong answers and wins.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hapticsOn}
              aria-label="Vibration feedback"
              onClick={toggleHaptics}
              className="relative w-14 h-8 rounded-full border-4 border-black shrink-0 transition-colors"
              style={{ background: hapticsOn ? '#34D399' : '#E5E7EB' }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-black transition-all"
                style={{ left: hapticsOn ? '1.75rem' : '0.25rem' }}
              />
            </button>
          </div>
        </section>

        {/* ── Section 5: Reset Progress ── */}
        <section className="bg-white rounded-[24px] p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8">
          <h2 className="text-xl font-black mb-1">🗑️ Reset Progress</h2>
          <p className="text-sm font-bold text-gray-500 mb-4">
            Use when a new child starts using the same device, or to start fresh.
          </p>

          {showResetConfirm ? (
            <div className="bg-[#FEF2F2] border-2 border-[#F87171] rounded-2xl p-4">
              <p className="font-black text-[#991B1B] mb-3 leading-snug">
                {showResetConfirm === 'all'
                  ? 'Reset ALL progress, badges, and companion? This cannot be undone.'
                  : 'Restart from Level 1 in the current phase? Badges are kept.'}
              </p>
              <div className="flex gap-2">
                <button onClick={() => handleReset(showResetConfirm)}
                  className="bg-[#EF4444] text-white px-5 py-2 rounded-xl border-2 border-black font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                  Yes, Reset
                </button>
                <button onClick={() => setShowResetConfirm(null)}
                  className="bg-gray-100 px-5 py-2 rounded-xl border-2 border-black font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setShowResetConfirm('phase')}
                className="bg-[#FEF9C3] border-2 border-black px-5 py-2.5 rounded-xl font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all hover:brightness-95">
                🔄 Restart Phase
              </button>
              <button onClick={() => setShowResetConfirm('all')}
                className="bg-[#FEF2F2] border-2 border-[#F87171] px-5 py-2.5 rounded-xl font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all text-[#991B1B] hover:brightness-95">
                🗑️ Reset Everything
              </button>
            </div>
          )}
        </section>

        <p className="text-center text-xs font-bold text-gray-400 pb-8">
          Math Adventure RPG · No accounts · No ads · 100% on-device 🔒
        </p>
      </div>
    </div>
  );
}
