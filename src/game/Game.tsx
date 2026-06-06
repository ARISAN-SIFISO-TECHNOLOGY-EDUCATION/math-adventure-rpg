/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ChevronRight, Coins, Sparkles, Volume2, VolumeX, Lock, Home } from 'lucide-react';
import { generateProblem, type Problem } from '../mathEngine';
import confetti from 'canvas-confetti';
import { Companion, type CompanionEmotion } from './Companion';
import { useNarration } from './useNarration';
import { registerScreenBack } from '../lib/backHandler';
import { safeGet } from '../lib/safeStorage';
import { useSoundSystem } from './useSoundSystem';
import {
  TUTORIAL_SLIDES, LEVEL_INTROS, PHASE1_HINTS,
  P2_LEVEL_INTROS, P2_HINTS, P2_WORLDS,
  P3_LEVEL_INTROS, P3_HINTS, P3_WORLDS,
  P4_LEVEL_INTROS, P4_HINTS, P4_WORLDS,
  BADGES, getHint, isBossLevel, PARENTAL_GATE_PROBLEMS,
} from './levelContent';
// Phase curriculum config lives in ./phases so lightweight consumers (e.g.
// GrownUpCorner) and the lazy-load split in App.tsx don't pull in this whole
// component. Re-exported for backwards compatibility with existing imports.
import { PHASES, type PhaseConfig } from './phases';
export { PHASES, type PhaseConfig };

// --- Types ---
type GameState = 'START' | 'TUTORIAL' | 'LEVEL_INTRO' | 'PLAYING' | 'VICTORY';



// --- Components ---

const ProgressBar = ({ current, max, color }: { current: number; max: number; color: string }) => (
  <div className="w-full bg-white rounded-full h-6 overflow-hidden border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${(current / max) * 100}%` }}
      className={`h-full ${color} border-r-4 border-black`}
    />
  </div>
);

function ParentalGate({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [problem] = useState(
    () => PARENTAL_GATE_PROBLEMS[Math.floor(Math.random() * PARENTAL_GATE_PROBLEMS.length)]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer.trim(), 10) === problem.answer) {
      onSuccess();
    } else {
      setError(true);
      setAnswer('');
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔒</div>
          <h2 className="text-2xl font-black">Parent Check</h2>
          <p className="text-sm font-bold text-gray-500 mt-1">Solve this to change difficulty</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 text-center mb-5 border-2 border-black">
          <p className="text-3xl font-black">{problem.question}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Your answer..."
            autoFocus
            className={`text-center text-2xl font-black p-4 rounded-2xl border-4 outline-none transition-colors ${
              error ? 'border-[#F87171] bg-[#FEF2F2]' : 'border-black'
            }`}
          />
          {error && <p className="text-[#EF4444] font-black text-center text-sm">Wrong! Try again.</p>}
          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 border-4 border-black py-3 rounded-2xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-[#3B82F6] text-white border-4 border-black py-3 rounded-2xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all">
              Submit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function PhaseSelect({ currentPhase, onSelect, onClose }: {
  currentPhase: number;
  onSelect: (phaseId: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md my-4"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-black">Choose Difficulty</h2>
          <button onClick={onClose}
            className="w-10 h-10 bg-gray-100 border-2 border-black rounded-xl font-black text-lg flex items-center justify-center">
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {PHASES.map(ph => (
            <button
              key={ph.id}
              onClick={() => onSelect(ph.id)}
              className={`${ph.bgColor} ${ph.borderColor} border-4 p-4 rounded-2xl text-left transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 ${
                currentPhase === ph.id ? 'ring-4 ring-black ring-offset-2' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ph.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-base leading-tight">{ph.name}</p>
                    {currentPhase === ph.id && (
                      <span className="bg-black text-white text-xs font-black px-2 py-0.5 rounded-lg">NOW</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-500">{ph.ageRange}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// --- Pre-School Tutorial ---
function TutorialScreen({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const current = TUTORIAL_SLIDES[slide];
  const isLast = slide === TUTORIAL_SLIDES.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Back to home — always accessible from tutorial */}
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-700 text-sm font-black px-3 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] no-underline transition-all z-10">
        ← Home
      </Link>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className={`${current.bg} w-full max-w-sm rounded-[36px] border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center text-center`}
        >
          {/* Slide counter dots */}
          <div className="flex gap-2 mb-6">
            {TUTORIAL_SLIDES.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full border-2 border-black transition-all ${i === slide ? 'bg-black scale-125' : 'bg-white'}`} />
            ))}
          </div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-8xl mb-5 drop-shadow-[0_6px_6px_rgba(0,0,0,0.15)]"
          >
            {current.emoji}
          </motion.div>

          <h2 className="text-2xl font-black mb-3 leading-tight">{current.title}</h2>
          <p className="text-base font-bold text-gray-600 mb-8 leading-relaxed">{current.body}</p>

          <button
            onClick={() => isLast ? onDone() : setSlide(s => s + 1)}
            className="w-full bg-black text-white py-4 rounded-2xl text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            {isLast ? '🚀 Start Playing!' : 'Next →'}
          </button>

          {slide > 0 && (
            <button onClick={() => setSlide(s => s - 1)} className="mt-3 text-sm font-black text-gray-400 hover:text-gray-600">
              ← Back
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- Level Intro Card (Phase 1, 2, and 3 world entries) ---
function LevelIntroCard({ phase, levelInPhase, totalLevels, onStart }: { phase: number; levelInPhase: number; totalLevels: number; onStart: () => void }) {
  const isPhase2 = phase === 2;
  const isPhase3 = phase === 3;
  const isPhase4 = phase === 4;

  const intro = isPhase4
    ? (P4_LEVEL_INTROS[levelInPhase] ?? P4_LEVEL_INTROS[1])
    : isPhase3
      ? (P3_LEVEL_INTROS[levelInPhase] ?? P3_LEVEL_INTROS[1])
      : isPhase2
        ? (P2_LEVEL_INTROS[levelInPhase] ?? P2_LEVEL_INTROS[1])
        : (LEVEL_INTROS[levelInPhase] ?? LEVEL_INTROS[1]);

  const world = isPhase4
    ? P4_WORLDS.find(w => w.levels.includes(levelInPhase))
    : isPhase3
      ? P3_WORLDS.find(w => w.levels.includes(levelInPhase))
      : isPhase2
        ? P2_WORLDS.find(w => w.levels.includes(levelInPhase))
        : null;
  const isWorldEntry = (isPhase2 || isPhase3 || isPhase4) && world?.levels[0] === levelInPhase;

  const badgeBg  = world ? world.badge : 'bg-[#FEF9C3]';
  const tipBg    = world ? world.bg    : 'bg-[#DCFCE7]';
  const tipColor  = world ? '' : 'text-[#15803D]';
  const btnColor  = world ? world.color : '#3B82F6';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Back to home — always accessible from level intro */}
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-700 text-sm font-black px-3 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] no-underline transition-all z-10">
        ← Home
      </Link>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="bg-white w-full max-w-sm rounded-[32px] border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center text-center"
      >
        {isWorldEntry && world && (
          <div className="w-full mb-4 rounded-2xl py-2 px-4 font-black text-sm uppercase tracking-widest text-white text-center" style={{ background: world.color }}>
            {world.emoji} {world.name}
          </div>
        )}
        <div className={`${badgeBg} w-20 h-20 rounded-full border-4 border-black flex items-center justify-center text-4xl mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
          {intro.emoji}
        </div>
        <div className="bg-black text-white text-xs font-black px-4 py-1 rounded-full mb-3 uppercase tracking-widest">
          Level {levelInPhase} of {totalLevels}
        </div>
        <h2 className="text-2xl font-black mb-2">{intro.title}</h2>
        <p className="text-gray-500 font-bold mb-3">{intro.body}</p>
        <div
          className={`${tipBg} border-2 rounded-2xl px-4 py-3 mb-6 w-full`}
          style={world ? { borderColor: world.color } : undefined}
        >
          <p className={`text-sm font-black ${tipColor}`}>💡 Tip: {intro.tip}</p>
        </div>
        <button
          onClick={onStart}
          className="w-full text-white py-4 rounded-2xl text-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
          style={{ background: btnColor }}
        >
          I'm Ready! ✊
        </button>
      </motion.div>
    </div>
  );
}

// --- Companion Setup Modal (B5) ---
const COMPANION_CHOICES = [
  { emoji: '🐉', label: 'Dragon' },
  { emoji: '🤖', label: 'Robot' },
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐼', label: 'Panda' },
];

function CompanionSetup({ onDone }: { onDone: (name: string, emoji: string) => void }) {
  const [name, setName] = useState('Sparky');
  const [emoji, setEmoji] = useState('🐉');

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{emoji}</div>
          <h2 className="text-2xl font-black">Name Your Companion!</h2>
          <p className="text-sm font-bold text-gray-500 mt-1">They'll cheer you on through every level</p>
        </div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value.slice(0, 12))}
          placeholder="Sparky"
          maxLength={12}
          className="w-full text-center text-2xl font-black p-4 rounded-2xl border-4 border-black outline-none mb-4"
        />
        <div className="grid grid-cols-4 gap-2 mb-6">
          {COMPANION_CHOICES.map(c => (
            <button
              key={c.emoji}
              onClick={() => setEmoji(c.emoji)}
              className={`text-4xl p-2 rounded-2xl border-4 transition-all w-full aspect-square flex items-center justify-center ${emoji === c.emoji ? 'border-black bg-yellow-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-200 bg-gray-50'}`}
              title={c.label}
            >
              {c.emoji}
            </button>
          ))}
        </div>
        <button
          onClick={() => onDone(name.trim() || 'Sparky', emoji)}
          className="w-full bg-[#3B82F6] text-white py-4 rounded-2xl text-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
        >
          Start Adventure! 🚀
        </button>
      </motion.div>
    </div>
  );
}

function PauseMenu({ onResume, onRestart }: { onResume: () => void; onRestart: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-xs flex flex-col gap-3"
      >
        <div className="text-center mb-2">
          <div className="text-5xl mb-2">⏸️</div>
          <h2 className="text-2xl font-black">PAUSED</h2>
        </div>
        <button onClick={onResume}
          className="w-full bg-[#4ADE80] border-4 border-black py-4 rounded-2xl font-black text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all">
          ▶️ Resume
        </button>
        <button onClick={onRestart}
          className="w-full bg-[#FEF9C3] border-4 border-black py-4 rounded-2xl font-black text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all">
          🔄 Restart Level
        </button>
        <Link to="/grown-up-corner"
          className="w-full bg-[#EFF6FF] border-4 border-black py-4 rounded-2xl font-black text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center no-underline block hover:bg-blue-50 transition-all">
          👨‍👩‍👧 Grown-up Corner
        </Link>
        <Link to="/"
          className="w-full bg-gray-100 border-4 border-black py-4 rounded-2xl font-black text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center no-underline block hover:bg-gray-200 transition-all">
          🏠 Home
        </Link>
      </motion.div>
    </div>
  );
}

function BreakOverlay({ onParentOverride }: { onParentOverride: () => void }) {
  return (
    <div className="fixed inset-0 bg-[#1E1B4B]/90 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[40px] p-10 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm text-center"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-7xl mb-4"
        >⏰</motion.div>
        <h2 className="text-3xl font-black mb-2">Time for a Break!</h2>
        <p className="text-gray-500 font-bold mb-8 leading-relaxed">
          Great playing today! Come back later for more math adventures.
        </p>
        <Link to="/"
          className="block w-full bg-[#4ADE80] border-4 border-black py-4 rounded-2xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] no-underline text-black mb-3">
          🏠 All done for now!
        </Link>
        <button onClick={onParentOverride}
          className="text-sm font-black text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 mx-auto">
          <Lock size={12} /> Parent override
        </button>
      </motion.div>
    </div>
  );
}

// --- App ---
export default function Game() {
  const [searchParams] = useSearchParams();
  const urlPhaseParam = searchParams.get('phase');
  const urlLevelParam = searchParams.get('level');
  const urlReplayParam = searchParams.get('replay');
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>('START');
  const [phase, setPhase] = useState(() => {
    if (urlPhaseParam) return Math.min(4, Math.max(1, parseInt(urlPhaseParam, 10) || 1));
    const saved = safeGet<{ phase?: number } | null>('mathProgress', null);
    return saved?.phase ?? 1;
  });
  const [levelInPhase, setLevelInPhase] = useState(() => {
    if (urlPhaseParam && urlLevelParam) return Math.max(1, parseInt(urlLevelParam, 10) || 1);
    if (urlPhaseParam) return 1;
    const saved = safeGet<{ levelInPhase?: number } | null>('mathProgress', null);
    return saved?.levelInPhase ?? 1;
  });
  const [isReplayMode] = useState(!!urlReplayParam);
  const [hasSavedProgress] = useState(() => {
    if (urlPhaseParam) return false;
    return !!safeGet('mathProgress', null);
  });
  const [progress, setProgress] = useState(0);
  const [coins, setCoins] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'CORRECT' | 'WRONG'; value: string } | null>(null);
  const [shake, setShake] = useState(false);
  const [isPhaseTransition, setIsPhaseTransition] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showPhaseSelect, setShowPhaseSelect] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(() => localStorage.getItem('tutorialDone') === '1');
  const [flashVisible, setFlashVisible] = useState(true);
  const [companionEmotion, setCompanionEmotion] = useState<CompanionEmotion>('idle');
  const [companionMessage, setCompanionMessage] = useState<string | null>(null);
  // B2 — explanatory feedback
  const [wrongAttempts, setWrongAttempts] = useState(0);
  // Legacy per-level failure overlay (was phase 5+ only; now retired but kept
  // harmless). The wrong-count value is no longer read — keep only the setter.
  const [, setLevelWrongCount] = useState(0);
  const [levelFailed, setLevelFailed] = useState(false);
  // B3 — boss level tracking
  const [bossDefeated, setBossDefeated] = useState(false);
  // B4 — streak
  const [streakCount, setStreakCount] = useState(0);
  const [streakUpdatedToday, setStreakUpdatedToday] = useState(false);
  // Badge system
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() =>
    safeGet<string[]>('earnedBadges', [])
  );
  // B5 — companion personalisation
  const [companionName, setCompanionName] = useState(() => {
    const saved = safeGet<{ name?: string } | null>('companionSetup', null);
    return saved?.name ?? 'Sparky';
  });
  const [companionEmoji, setCompanionEmoji] = useState(() => {
    const saved = safeGet<{ emoji?: string } | null>('companionSetup', null);
    return saved?.emoji ?? '🐉';
  });
  const [showCompanionSetup, setShowCompanionSetup] = useState(() => !localStorage.getItem('companionSetup'));
  const [showBadges, setShowBadges] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showBreakOverlay, setShowBreakOverlay] = useState(false);
  const [showBreakGate, setShowBreakGate] = useState(false);
  const [completedLevel, setCompletedLevel] = useState(1);

  const { muted, toggleMute, startBGM, stopBGM, playClick, playCorrect, playWrong, playVictory } = useSoundSystem();
  const { speakQuestion, speakCorrect, speakWrong, speakVictory, speakWelcome } = useNarration(muted);

  const currentPhaseConfig = PHASES[phase - 1];

  const loadQuestion = useCallback((p: number, l: number) => {
    setProblem(generateProblem(p, l));
  }, []);

  const awardBadge = useCallback((id: string) => {
    setEarnedBadges(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('earnedBadges', JSON.stringify(next));
      return next;
    });
  }, []);

  // B4 — initialise streak from localStorage on mount
  useEffect(() => {
    const saved = safeGet<{ streakCount: number; lastPlayDate: string } | null>('streakData', null);
    if (!saved) return;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (saved.lastPlayDate === today) {
      setStreakCount(saved.streakCount);
      setStreakUpdatedToday(true);
    } else if (saved.lastPlayDate === yesterday) {
      setStreakCount(saved.streakCount);
    } else {
      setStreakCount(0);
    }
  }, []);

  // B2 — reset wrongAttempts whenever a new problem loads
  useEffect(() => {
    setWrongAttempts(0);
  }, [problem]);

  // Subitizing flash: show objects for 1.5 s, then hide and reveal answer buttons
  useEffect(() => {
    if (gameState === 'PLAYING' && problem?.meta?.isSubitizing) {
      setFlashVisible(true);
      const timer = setTimeout(() => setFlashVisible(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setFlashVisible(true);
    }
  }, [problem, gameState]);

  // Companion thinks + narration speaks whenever a new question appears
  useEffect(() => {
    if (gameState === 'PLAYING' && problem) {
      setCompanionEmotion('thinking');
      setCompanionMessage(null);
      speakQuestion(problem.question, problem.meta?.isSubitizing);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // Auto-reset companion to idle after 3 s of non-idle emotion
  useEffect(() => {
    if (companionEmotion === 'idle') return;
    const t = setTimeout(() => {
      setCompanionEmotion('idle');
      setCompanionMessage(null);
    }, 3000);
    return () => clearTimeout(t);
  }, [companionEmotion]);

  useEffect(() => {
    const timer = safeGet<{ endTime: number } | null>('sessionTimer', null);
    if (timer && Date.now() > timer.endTime) {
      setShowBreakOverlay(true);
      localStorage.removeItem('sessionTimer');
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      const timer = safeGet<{ endTime: number } | null>('sessionTimer', null);
      if (timer && Date.now() > timer.endTime) {
        setShowBreakOverlay(true);
        localStorage.removeItem('sessionTimer');
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = useCallback(() => {
    playClick();
    let startPhase = phase;
    let startLevel = levelInPhase;

    if (isGameComplete) {
      startPhase = 1;
      startLevel = 1;
      setPhase(1);
      setLevelInPhase(1);
      setCoins(0);
      setIsGameComplete(false);
      setIsPhaseTransition(false);
    }

    setProgress(0);
    setLevelWrongCount(0);
    setLevelFailed(false);
    setFeedback(null);
    setBossDefeated(false);
    setCompanionEmotion('excited');
    setCompanionMessage(null);
    startBGM();
    speakWelcome();

    // Show tutorial first time in Phase 1; show world intros at sub-world entries
    const isP2WorldEntry = startPhase === 2 && [1, 6, 11, 16].includes(startLevel);
    const isP3WorldEntry = startPhase === 3 && [1, 6, 11].includes(startLevel);
    const isP4WorldEntry = startPhase === 4 && [1, 6, 11].includes(startLevel);
    if (startPhase === 1 && !tutorialDone) {
      setGameState('TUTORIAL');
    } else if (startPhase === 1 || isP2WorldEntry || isP3WorldEntry || isP4WorldEntry) {
      setGameState('LEVEL_INTRO');
      loadQuestion(startPhase, startLevel);
    } else {
      setGameState('PLAYING');
      loadQuestion(startPhase, startLevel);
    }
  }, [phase, levelInPhase, isGameComplete, tutorialDone, playClick, startBGM, loadQuestion]);

  const handleTutorialDone = useCallback(() => {
    localStorage.setItem('tutorialDone', '1');
    setTutorialDone(true);
    setGameState('LEVEL_INTRO');
    loadQuestion(phase, levelInPhase);
  }, [phase, levelInPhase, loadQuestion]);

  const handleLevelIntroStart = useCallback(() => {
    setGameState('PLAYING');
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7'],
    });
  };

  const handleAnswer = useCallback((choice: number | string) => {
    if (!problem) return;

    if (choice === problem.correctAnswer) {
      playCorrect();
      speakCorrect();
      const requiredToWin = isBossLevel(phase, levelInPhase) ? 7 : 5;
      setCompanionEmotion(progress + 1 >= requiredToWin ? 'celebrating' : 'excited');
      setCompanionMessage(null);
      triggerConfetti();
      setCoins(prev => prev + 10);
      setFeedback({ type: 'CORRECT', value: 'Awesome!' });
      const newProgress = progress + 1;
      setProgress(newProgress);

      // B4 — streak: award bonus coins on first correct answer of a new streak day
      if (!streakUpdatedToday) {
        const today = new Date().toISOString().slice(0, 10);
        const saved = safeGet<{ streakCount: number; lastPlayDate: string } | null>('streakData', null);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = saved?.lastPlayDate === yesterday ? (saved.streakCount + 1) : 1;
        const bonus = Math.min(newStreak * 5, 50);
        setStreakCount(newStreak);
        setCoins(prev => prev + bonus);
        localStorage.setItem('streakData', JSON.stringify({ streakCount: newStreak, lastPlayDate: today }));
        setStreakUpdatedToday(true);
        if (newStreak >= 3)  awardBadge('streak_3');
        if (newStreak >= 7)  awardBadge('streak_7');
      }
      // Lifetime coins tracking + badges
      const prevLifetime = parseInt(localStorage.getItem('lifetimeCoins') || '0', 10);
      const newLifetime = prevLifetime + 10;
      localStorage.setItem('lifetimeCoins', String(newLifetime));
      if (newLifetime >= 100)  awardBadge('coins_100');
      if (newLifetime >= 500)  awardBadge('coins_500');

      if (newProgress >= requiredToWin) {
        const wasLastLevel = levelInPhase === currentPhaseConfig.levels.length;
        const wasLastPhase = phase === 4;
        const wasBonus = isBossLevel(phase, levelInPhase);

        setTimeout(() => {
          setFeedback(null);
          stopBGM();
          playVictory();
          speakVictory();
          setCompanionEmotion('celebrating');
          setProgress(0);
          setLevelWrongCount(0);
          setLevelFailed(false);
          setBossDefeated(wasBonus);

          // B1 — persist progress (skip in replay mode to preserve real saved progress)
          if (!isReplayMode) {
            if (wasLastLevel && wasLastPhase) {
              localStorage.removeItem('mathProgress');
            } else if (wasLastLevel) {
              localStorage.setItem('mathProgress', JSON.stringify({ phase: phase + 1, levelInPhase: 1 }));
            } else {
              localStorage.setItem('mathProgress', JSON.stringify({ phase, levelInPhase: levelInPhase + 1 }));
            }
          }

          // Award phase-complete badges
          if (wasLastLevel) {
            if (phase === 1) awardBadge('phase1_complete');
            if (phase === 2) awardBadge('phase2_complete');
            if (phase === 3) awardBadge('phase3_complete');
            if (phase === 4) awardBadge('phase4_complete');
          }
          // Award boss-slayer badge
          if (wasBonus) awardBadge('boss_slayer');

          const nextLevelInPhase = levelInPhase + 1;
          const isP2WorldEntry = !wasLastLevel && phase === 2 && [6, 11, 16].includes(nextLevelInPhase);
          const isP3WorldEntry = !wasLastLevel && phase === 3 && [6, 11].includes(nextLevelInPhase);
          const isP4WorldEntry = !wasLastLevel && phase === 4 && [6, 11].includes(nextLevelInPhase);

          if (wasLastLevel) {
            setIsPhaseTransition(true);
            setIsGameComplete(wasLastPhase);
            if (!wasLastPhase) {
              setPhase(prev => prev + 1);
              setLevelInPhase(1);
            }
          } else {
            setIsPhaseTransition(false);
            setIsGameComplete(false);
            setLevelInPhase(prev => prev + 1);
          }

          setCompletedLevel(levelInPhase);
          setGameState('VICTORY');
          // B3 — boss confetti
          if (wasBonus) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#F97316', '#EF4444', '#DC2626'] });
          }
          // Pre-load next question so level intro card is ready
          if (!wasLastLevel && (phase === 1 || isP2WorldEntry || isP3WorldEntry || isP4WorldEntry)) {
            loadQuestion(phase, nextLevelInPhase);
          }
        }, 1500);
      } else {
        setTimeout(() => {
          setFeedback(null);
          loadQuestion(phase, levelInPhase);
        }, 1500);
      }
    } else {
      playWrong();
      speakWrong();
      setCompanionEmotion('encouraging');
      setCompanionMessage(null);
      const newWrong = wrongAttempts + 1;
      setWrongAttempts(newWrong);

      if (newWrong >= 2) {
        // B2 — reveal correct answer after 2 wrong attempts
        setFeedback({ type: 'WRONG', value: '__REVEAL__' });
      } else {
        // Consolation coins: +2 on first wrong attempt
        setCoins(prev => prev + 2);
        const prevLC = parseInt(localStorage.getItem('lifetimeCoins') || '0', 10);
        const newLC = prevLC + 2;
        localStorage.setItem('lifetimeCoins', String(newLC));
        if (newLC >= 100) awardBadge('coins_100');
        if (newLC >= 500) awardBadge('coins_500');
        const consolationTotal = parseInt(localStorage.getItem('consolationCoins') || '0', 10) + 2;
        localStorage.setItem('consolationCoins', String(consolationTotal));
        if (consolationTotal >= 5) awardBadge('consolation_5');
        setFeedback({ type: 'WRONG', value: '+2 🪙 Keep going!' });
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setTimeout(() => setFeedback(null), 1200);
      }
    }
  }, [problem, progress, phase, levelInPhase, wrongAttempts, streakUpdatedToday, isReplayMode, awardBadge, playCorrect, playWrong, playVictory, stopBGM, loadQuestion]);

  const handlePhaseSelect = (newPhase: number) => {
    setPhase(newPhase);
    setLevelInPhase(1);
    setProgress(0);
    setLevelWrongCount(0);
    setLevelFailed(false);
    setShowPhaseSelect(false);
  };

  const handlePlayAgain = useCallback(() => {
    playClick();
    setLevelInPhase(completedLevel);
    setProgress(0);
    setLevelWrongCount(0);
    setLevelFailed(false);
    setFeedback(null);
    setBossDefeated(false);
    startBGM();
    setGameState(phase === 1 ? 'LEVEL_INTRO' : 'PLAYING');
    loadQuestion(phase, completedLevel);
  }, [completedLevel, phase, playClick, startBGM, loadQuestion]);

  const handleRestartLevel = useCallback(() => {
    setShowPauseMenu(false);
    setProgress(0);
    setLevelWrongCount(0);
    setLevelFailed(false);
    setFeedback(null);
    setWrongAttempts(0);
    loadQuestion(phase, levelInPhase);
  }, [phase, levelInPhase, loadQuestion]);

  // ── Android Back / edge-swipe inside the game ───────────────────────────────
  // Pops one in-game UI level at a time: open overlays first, then the game
  // state machine, then surface the pause menu while playing. When there is
  // nothing left to pop (the START screen), returns false so App.tsx falls
  // through to route-level back (→ home). A ref keeps the logic fresh each
  // render without re-subscribing the native listener.
  const gameBackRef = useRef<() => boolean>(() => false);
  gameBackRef.current = (): boolean => {
    if (showBreakGate)      { setShowBreakGate(false); return true; }
    if (showBreakOverlay)   { return true; }                       // forced break — swallow Back
    if (showCompanionSetup) { setShowCompanionSetup(false); return true; }
    if (showParentalGate)   { setShowParentalGate(false); return true; }
    if (showPhaseSelect)    { setShowPhaseSelect(false); return true; }
    if (showPauseMenu)      { setShowPauseMenu(false); return true; }
    if (showBadges)         { setShowBadges(false); return true; }
    if (levelFailed)        { setLevelFailed(false); return true; }
    if (gameState === 'PLAYING' || gameState === 'LEVEL_INTRO' || gameState === 'TUTORIAL') {
      setShowPauseMenu(true); return true;
    }
    if (gameState === 'VICTORY') { setGameState('START'); return true; }
    return false; // START screen — let the app navigate home
  };
  useEffect(() => registerScreenBack(() => gameBackRef.current()), []);

  // After state updates in handleAnswer, phase/levelInPhase already reflect the NEW values
  const victoryPhaseConfig = PHASES[phase - 1];

  return (
    <div className="min-h-screen bg-[#FFE5F1] font-sans text-black flex flex-col items-center p-2 md:p-8 overflow-x-hidden">

      {/* Overlays */}
      {showCompanionSetup && (
        <CompanionSetup onDone={(name, emoji) => {
          setCompanionName(name);
          setCompanionEmoji(emoji);
          localStorage.setItem('companionSetup', JSON.stringify({ name, emoji }));
          setShowCompanionSetup(false);
        }} />
      )}
      {showParentalGate && (
        <ParentalGate
          onSuccess={() => { setShowParentalGate(false); setShowPhaseSelect(true); }}
          onClose={() => setShowParentalGate(false)}
        />
      )}
      {showPhaseSelect && (
        <PhaseSelect
          currentPhase={phase}
          onSelect={handlePhaseSelect}
          onClose={() => setShowPhaseSelect(false)}
        />
      )}
      {showPauseMenu && (
        <PauseMenu
          onResume={() => setShowPauseMenu(false)}
          onRestart={handleRestartLevel}
        />
      )}

      {/* Phase 5+ Level Failed overlay */}
      {levelFailed && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm text-center"
          >
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-2xl font-black mb-2">Level Failed!</h2>
            <p className="text-sm font-bold text-gray-500 mb-6">
              Too many wrong answers.<br />Study the questions and try again!
            </p>
            <button
              onClick={() => {
                setLevelFailed(false);
                setProgress(0);
                setLevelWrongCount(0);
                setWrongAttempts(0);
                setFeedback(null);
                loadQuestion(phase, levelInPhase);
              }}
              className="w-full bg-[#EF4444] text-white py-4 rounded-2xl text-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
            >
              🔄 Try Again
            </button>
          </motion.div>
        </div>
      )}
      {showBreakOverlay && !showBreakGate && (
        <BreakOverlay onParentOverride={() => setShowBreakGate(true)} />
      )}
      {showBreakGate && (
        <ParentalGate
          onSuccess={() => { setShowBreakGate(false); setShowBreakOverlay(false); }}
          onClose={() => setShowBreakGate(false)}
        />
      )}
      {gameState === 'TUTORIAL' && (
        <TutorialScreen onDone={handleTutorialDone} />
      )}
      {gameState === 'LEVEL_INTRO' && (
        <LevelIntroCard phase={phase} levelInPhase={levelInPhase} totalLevels={currentPhaseConfig.levels.length} onStart={handleLevelIntroStart} />
      )}

      {/* HUD */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 md:mb-8 bg-white p-2 md:p-4 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Phase + Level */}
        <div className="flex items-center gap-1 md:gap-3">
          <div className={`${currentPhaseConfig.badgeBg} p-2 md:p-3 rounded-2xl border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-base md:text-xl leading-none`}>
            {currentPhaseConfig.emoji}
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-wider leading-tight text-gray-500">{currentPhaseConfig.name}</p>
            <p className="text-xl md:text-3xl font-black leading-none">
              {levelInPhase}<span className="text-sm md:text-base font-black text-gray-400">/{currentPhaseConfig.levels.length}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 mx-6 hidden md:block">
          <div className="flex justify-between text-sm font-black uppercase mb-2">
            <span>{isBossLevel(phase, levelInPhase) ? '💀 BOSS HP' : 'Progress'}</span>
            <span>{progress} / {isBossLevel(phase, levelInPhase) ? 7 : 5}</span>
          </div>
          <ProgressBar
            current={isBossLevel(phase, levelInPhase) ? Math.max(0, 7 - progress) : progress}
            max={isBossLevel(phase, levelInPhase) ? 7 : 5}
            color={isBossLevel(phase, levelInPhase) ? 'bg-[#EF4444]' : 'bg-[#4ADE80]'}
          />
        </div>

        {/* Coins + Streak + Mute */}
        <div className="flex items-center gap-1 md:gap-3">
          {streakCount > 0 && (
            <div className="flex items-center gap-1 bg-orange-100 border-2 border-orange-400 px-1 md:px-2 py-1 rounded-xl">
              <span className="text-sm leading-none">🔥</span>
              <span className="font-black text-orange-700 text-xs md:text-sm">{streakCount}</span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-[#FEF3C7] border-4 border-black rounded-2xl px-2 py-1 md:px-3 md:py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Coins className="text-[#F59E0B] fill-[#F59E0B] w-4 h-4 md:w-6 md:h-6 shrink-0" />
            <span className="text-base md:text-2xl font-black leading-none text-[#F59E0B] tabular-nums">{coins}</span>
          </div>
          <button
            onClick={toggleMute}
            className={`p-2 md:p-3 rounded-2xl border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all ${muted ? 'bg-gray-100' : 'bg-[#E0F2FE]'}`}
            title={muted ? 'Unmute' : 'Mute'}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            aria-pressed={muted}
          >
            {muted ? <VolumeX className="text-gray-400 w-4 h-4 md:w-6 md:h-6" /> : <Volume2 className="text-[#3B82F6] w-4 h-4 md:w-6 md:h-6" />}
          </button>
          {gameState !== 'PLAYING' && (
            <Link
              to="/"
              className="p-2 md:p-3 rounded-2xl border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
              title="Back to Home"
            >
              <Home className="text-gray-600 w-4 h-4 md:w-6 md:h-6" />
            </Link>
          )}
          {gameState === 'PLAYING' && (
            <button
              onClick={() => { playClick(); setShowPauseMenu(true); }}
              className="p-2 md:p-3 rounded-2xl border-4 border-black bg-[#FEF3C7] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
              title="Pause"
            >
              <span className="text-base md:text-xl leading-none">⏸️</span>
            </button>
          )}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">

          {/* START */}
          {gameState === 'START' && (
            <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center w-full">
              <div className="mb-12 relative flex justify-center">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-[150px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]"
                >👾</motion.div>
                <div className="absolute -bottom-6 bg-white px-8 py-3 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
                  <h1 className="text-3xl md:text-4xl font-black whitespace-nowrap">MATH MONSTERS</h1>
                </div>
              </div>
              <p className="text-xl font-bold mb-6 max-w-sm mx-auto">Feed your monster by solving fun math puzzles!</p>

              {/* Phase card */}
              <div className={`${currentPhaseConfig.bgColor} ${currentPhaseConfig.borderColor} border-4 rounded-2xl p-4 mb-6 flex items-center justify-between max-w-sm mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{currentPhaseConfig.emoji}</span>
                  <div className="text-left">
                    <p className="font-black leading-tight">{currentPhaseConfig.name}</p>
                    <p className="text-sm font-bold text-gray-500">{currentPhaseConfig.ageRange}</p>
                  </div>
                </div>
                <button
                  onClick={() => { playClick(); setShowParentalGate(true); }}
                  className="bg-white border-4 border-black px-3 py-2 rounded-xl font-black text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all flex items-center gap-1"
                >
                  <Lock size={14} />
                  Change
                </button>
              </div>

              {hasSavedProgress && (
                <div className="inline-flex items-center gap-2 bg-green-100 border-2 border-green-500 text-green-800 text-sm font-black px-4 py-2 rounded-full mb-4">
                  ▶ Continue: {PHASES[phase - 1].name} · Level {levelInPhase}
                </div>
              )}
              <button
                onClick={startGame}
                className="group relative bg-[#3B82F6] hover:bg-[#2563EB] text-white px-12 py-6 rounded-full border-4 border-black text-3xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto"
              >
                {hasSavedProgress ? 'CONTINUE' : 'PLAY NOW'}
                <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </button>

              {/* Companion card */}
              <div className="mt-6 w-full max-w-sm mx-auto flex items-center justify-between bg-white border-4 border-black rounded-2xl px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{companionEmoji}</span>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-wider text-gray-400 leading-none">Your companion</p>
                    <p className="font-black text-lg leading-tight">{companionName}</p>
                  </div>
                </div>
                <button
                  onClick={() => { playClick(); setShowCompanionSetup(true); }}
                  className="bg-gray-100 border-2 border-black px-3 py-1.5 rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
                >
                  ✏️ Edit
                </button>
              </div>

              {/* Badge Gallery — collapsible */}
              <div className="mt-4 w-full max-w-sm mx-auto">
                <button
                  onClick={() => setShowBadges(b => !b)}
                  className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 py-2 hover:text-gray-600 transition-colors"
                >
                  🏅 Badges ({earnedBadges.length}/{BADGES.length})
                  <span className="text-[10px]">{showBadges ? '▲' : '▼'}</span>
                </button>
                {showBadges && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {BADGES.map(b => {
                      const earned = earnedBadges.includes(b.id);
                      return (
                        <div key={b.id} title={earned ? `${b.label}: ${b.desc}` : `Locked: ${b.desc}`}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${earned ? 'border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-200 bg-gray-100 opacity-40'}`}>
                          <span className={`text-2xl ${earned ? '' : 'grayscale'}`}>{b.emoji}</span>
                          <span className="text-[9px] font-black text-center leading-tight mt-1 text-gray-600">{b.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center gap-6 justify-center flex-wrap">
                <Link to="/" className="text-sm font-bold text-gray-400 hover:text-gray-600 no-underline flex items-center gap-1 transition-colors">
                  ← Back to Home
                </Link>
                <Link to="/grown-up-corner" className="text-sm font-bold text-blue-500 hover:text-blue-700 no-underline flex items-center gap-1 transition-colors">
                  👨‍👩‍👧 Grown-up Corner
                </Link>
              </div>
            </motion.div>
          )}

          {/* PLAYING */}
          {gameState === 'PLAYING' && (
            <motion.div key="playing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center">
              {/* Monster + Companion row */}
              <div className="w-full flex items-end justify-center gap-6 mb-3">
                {/* Companion (player's ally) */}
                <div className="mb-1">
                  <Companion emotion={companionEmotion} customMessage={companionMessage} name={companionName} emoji={companionEmoji} />
                </div>
                {/* Monster (enemy) */}
                <motion.div
                  animate={shake ? { x: [-10, 10, -10, 10, 0] } : { y: [0, -8, 0] }}
                  transition={shake ? { duration: 0.4 } : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-[72px] drop-shadow-[0_6px_6px_rgba(0,0,0,0.2)]"
                >
                  {feedback?.type === 'CORRECT' ? '🥰' : feedback?.type === 'WRONG' ? '😵' : '👾'}
                </motion.div>
                {/* Spacer to keep monster centred */}
                <div className="w-12" />
              </div>

              <div className="w-full bg-white rounded-[32px] p-6 md:p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                {feedback && feedback.value !== '__REVEAL__' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    role="alert"
                    aria-live="assertive"
                    className={`absolute inset-0 z-10 flex items-center justify-center text-3xl md:text-5xl font-black border-4 border-black rounded-[28px] text-center px-4 ${
                      feedback.type === 'CORRECT' ? 'bg-[#4ADE80]' : 'bg-[#F87171]'
                    }`}
                  >
                    {feedback.value}
                  </motion.div>
                )}
                {feedback?.value === '__REVEAL__' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    role="alert"
                    aria-live="assertive"
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white border-4 border-black rounded-[28px] p-6 text-center"
                  >
                    <div className="text-lg font-black text-gray-500 mb-1">Correct Answer:</div>
                    <div className="text-5xl font-black text-[#22C55E] mb-3">{problem?.correctAnswer}</div>
                    <div className="bg-[#FEF9C3] border-2 border-[#EAB308] rounded-2xl px-4 py-3 mb-5 w-full">
                      <p className="text-sm font-black text-[#92400E]">{problem?.explanation ?? getHint(phase, levelInPhase)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setFeedback(null);
                        setWrongAttempts(0);
                        loadQuestion(phase, levelInPhase);
                      }}
                      className="bg-[#3B82F6] text-white px-8 py-3 rounded-2xl text-lg font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
                    >
                      Got it! Next →
                    </button>
                  </motion.div>
                )}

                <>
                  {/* Subitizing: show flash or "what did you see?" */}
                  {problem?.meta?.isSubitizing ? (
                    flashVisible ? (
                      <div className="text-center mb-5">
                        <p className="text-sm font-black uppercase tracking-wider text-gray-400 mb-3">
                          ⚡ Quick Count! ⚡
                        </p>
                        <div className="bg-[#FEF9C3] border-4 border-[#EAB308] rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-4xl md:text-5xl leading-loose tracking-widest">{problem?.question}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center mb-5">
                        <p className="text-5xl mb-3">🤔</p>
                        <h2 className="text-2xl md:text-4xl font-black">How many did you see?</h2>
                      </div>
                    )
                  ) : (
                    <div className="text-center mb-5">
                      <p className="text-sm font-black uppercase tracking-wider text-gray-400 mb-2">
                        {currentPhaseConfig.emoji} {currentPhaseConfig.name} · Level {levelInPhase}/{currentPhaseConfig.levels.length}
                      </p>
                      <h2 className="text-2xl md:text-4xl font-black leading-tight whitespace-pre-line">{problem?.question}</h2>
                    </div>
                  )}

                  {/* Number bond visual (level 7) */}
                  {problem?.meta?.bondTotal !== undefined && (
                    <div className="flex flex-col items-center mb-4">
                      <div className="flex gap-1 flex-wrap justify-center mb-1">
                        {Array.from({ length: problem.meta.bondTotal }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-9 h-9 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                              i < (problem.meta!.bondTotal! - problem.meta!.bondKnown!)
                                ? 'bg-[#4ADE80]'
                                : 'bg-[#FDE047]'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                        <span className="text-[#15803D]">■ hidden</span> + <span className="text-[#A16207]">■ {problem.meta.bondKnown}</span> = {problem.meta.bondTotal}
                      </p>
                    </div>
                  )}

                  {/* Hint strip */}
                  {phase === 1 && PHASE1_HINTS[levelInPhase] && (
                    <div className="bg-[#FEF9C3] border-2 border-[#EAB308] rounded-2xl px-4 py-2 mb-4 text-center">
                      <p className="text-sm font-black text-[#92400E]">{PHASE1_HINTS[levelInPhase]}</p>
                    </div>
                  )}
                  {phase === 2 && P2_HINTS[levelInPhase] && (
                    <div className="bg-[#EFF6FF] border-2 border-[#93C5FD] rounded-2xl px-4 py-2 mb-4 text-center">
                      <p className="text-sm font-black text-[#1D4ED8]">{P2_HINTS[levelInPhase]}</p>
                    </div>
                  )}
                  {phase === 3 && P3_HINTS[levelInPhase] && (() => {
                    const w3 = P3_WORLDS.find(w => w.levels.includes(levelInPhase));
                    return (
                      <div className="border-2 rounded-2xl px-4 py-2 mb-4 text-center" style={{ background: w3?.bgHex ?? '#F0F9FF', borderColor: w3?.color ?? '#0EA5E9' }}>
                        <p className="text-sm font-black" style={{ color: w3?.color ?? '#0EA5E9' }}>{P3_HINTS[levelInPhase]}</p>
                      </div>
                    );
                  })()}
                  {phase === 4 && P4_HINTS[levelInPhase] && (() => {
                    const w4 = P4_WORLDS.find(w => w.levels.includes(levelInPhase));
                    return (
                      <div className="border-2 rounded-2xl px-4 py-2 mb-4 text-center" style={{ background: w4?.bgHex ?? '#FFF1F2', borderColor: w4?.color ?? '#9F1239' }}>
                        <p className="text-sm font-black" style={{ color: w4?.color ?? '#9F1239' }}>{P4_HINTS[levelInPhase]}</p>
                      </div>
                    );
                  })()}

                  {/* Answer buttons — hidden during subitizing flash */}
                  {(!problem?.meta?.isSubitizing || !flashVisible) && (
                    <div className="grid grid-cols-2 gap-4">
                      {problem?.options.map((opt, i) => (
                        <button
                          key={`opt-${i}-${String(opt)}`}
                          onClick={() => handleAnswer(opt)}
                          disabled={!!feedback}
                          className="bg-[#E0F2FE] hover:bg-[#BAE6FD] border-4 border-black py-4 rounded-2xl text-2xl md:text-3xl font-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 disabled:opacity-50 focus:outline-none"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              </div>
            </motion.div>
          )}

          {/* VICTORY */}
          {gameState === 'VICTORY' && (
            <motion.div key="victory" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full bg-white p-6 md:p-10 rounded-[40px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {isGameComplete ? (
                <>
                  <div className="text-6xl mb-3">🏆</div>
                  <h2 className="text-4xl font-black mb-3">CHAMPION!</h2>
                  <p className="text-xl font-bold mb-2">You've mastered all 4 phases!</p>
                  <p className="text-sm font-bold text-gray-400 mb-6">From Pre-School counting to Advanced Primary. Incredible!</p>
                  <button onClick={startGame}
                    className="bg-[#FFD700] hover:bg-[#F59E0B] text-black px-10 py-4 rounded-full border-4 border-black text-xl font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-3 mx-auto">
                    PLAY AGAIN <Sparkles size={24} />
                  </button>
                </>
              ) : isPhaseTransition ? (
                <>
                  <div className="text-6xl mb-3">{victoryPhaseConfig.emoji}</div>
                  <div className={`inline-block ${victoryPhaseConfig.bgColor} ${victoryPhaseConfig.borderColor} border-4 px-5 py-2 rounded-full mb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                    <p className="font-black text-base">Phase {victoryPhaseConfig.id} Unlocked!</p>
                  </div>
                  <h2 className="text-3xl font-black mb-2">{victoryPhaseConfig.name}</h2>
                  <p className="text-lg font-bold text-gray-400 mb-6">{victoryPhaseConfig.ageRange}</p>
                  <button onClick={startGame}
                    className={`${victoryPhaseConfig.badgeBg} text-black px-10 py-4 rounded-full border-4 border-black text-xl font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-3 mx-auto`}>
                    START PHASE {victoryPhaseConfig.id} <ChevronRight size={24} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <Trophy className="text-black" size={52} />
                  </div>
                  <h2 className="text-4xl font-black mb-3">{bossDefeated ? 'BOSS DEFEATED! 💀' : 'LEVEL UP!'}</h2>
                  {(phase === 2 || phase === 3 || phase === 4) && (() => {
                    const worlds = phase === 4 ? P4_WORLDS : phase === 3 ? P3_WORLDS : P2_WORLDS;
                    const w = worlds.find(ww => ww.levels.includes(levelInPhase));
                    if (!w) return null;
                    return (
                      <div className="inline-block mb-3 px-4 py-1.5 rounded-full font-black text-sm text-white" style={{ background: w.color }}>
                        {w.emoji} {w.name}
                      </div>
                    );
                  })()}
                  <p className="text-lg font-bold text-gray-500 mb-5">
                    {currentPhaseConfig.emoji} {currentPhaseConfig.name} · Level {levelInPhase} of {currentPhaseConfig.levels.length}
                  </p>
                  <div className="flex flex-col gap-3 items-center">
                    <button onClick={handlePlayAgain}
                      className="bg-white border-4 border-black text-black px-8 py-3 rounded-full text-lg font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 transition-all flex items-center gap-3 mx-auto hover:bg-gray-50">
                      🔄 Play Again
                    </button>
                    {isReplayMode ? (
                      <button onClick={() => { stopBGM(); navigate('/'); }}
                        className="bg-[#4ADE80] hover:bg-[#22C55E] text-black px-10 py-4 rounded-full border-4 border-black text-xl font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-3 mx-auto">
                        🏠 Back to Home
                      </button>
                    ) : (
                      <button onClick={startGame}
                        className="bg-[#4ADE80] hover:bg-[#22C55E] text-black px-10 py-4 rounded-full border-4 border-black text-2xl font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-3 mx-auto">
                        NEXT LEVEL <Sparkles size={28} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

    </div>
  );
}
