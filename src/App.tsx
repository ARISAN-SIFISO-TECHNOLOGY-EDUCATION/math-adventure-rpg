/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ChevronRight, Coins, Sparkles, Loader2, Volume2, VolumeX, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
type GameState = 'START' | 'PLAYING' | 'VICTORY';

type Problem = {
  question: string;
  options: (number | string)[];
  correctAnswer: number | string;
};

type PhaseConfig = {
  id: number;
  name: string;
  ageRange: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  levels: { n: number; topic: string }[];
};

// --- Phase Curriculum Config ---
const PHASES: PhaseConfig[] = [
  {
    id: 1,
    name: 'Pre-School',
    ageRange: 'Ages 3–5',
    emoji: '🌱',
    bgColor: 'bg-[#FEF9C3]',
    borderColor: 'border-[#EAB308]',
    badgeBg: 'bg-[#FDE047]',
    levels: [
      { n: 1, topic: 'counting objects from 1 to 5' },
      { n: 2, topic: 'counting objects from 1 to 10' },
      { n: 3, topic: 'comparing two numbers — which is more or which is less' },
      { n: 4, topic: 'simple addition where the answer is 5 or less' },
      { n: 5, topic: 'simple subtraction where both numbers are 5 or less' },
    ],
  },
  {
    id: 2,
    name: 'Lower Primary',
    ageRange: 'Ages 6–8',
    emoji: '📚',
    bgColor: 'bg-[#DCFCE7]',
    borderColor: 'border-[#22C55E]',
    badgeBg: 'bg-[#4ADE80]',
    levels: [
      { n: 6, topic: 'addition with answers up to 20' },
      { n: 7, topic: 'subtraction within 20' },
      { n: 8, topic: 'addition and subtraction with numbers up to 100' },
      { n: 9, topic: 'times tables for 2, 5, and 10' },
      { n: 10, topic: 'missing number problems such as ? + 4 = 11 or 7 − ? = 3' },
    ],
  },
  {
    id: 3,
    name: 'Higher Primary',
    ageRange: 'Ages 9–10',
    emoji: '🔢',
    bgColor: 'bg-[#DBEAFE]',
    borderColor: 'border-[#3B82F6]',
    badgeBg: 'bg-[#60A5FA]',
    levels: [
      { n: 11, topic: 'all times tables from 1 to 12' },
      { n: 12, topic: 'basic division with no remainders' },
      { n: 13, topic: 'simple fractions such as half or quarter of a number' },
      { n: 14, topic: 'word problems involving addition and subtraction' },
      { n: 15, topic: 'rounding numbers to the nearest 10 or 100' },
    ],
  },
  {
    id: 4,
    name: 'Advanced Primary',
    ageRange: 'Ages 11–12',
    emoji: '🧮',
    bgColor: 'bg-[#F3E8FF]',
    borderColor: 'border-[#A855F7]',
    badgeBg: 'bg-[#C084FC]',
    levels: [
      { n: 16, topic: 'adding and subtracting simple fractions' },
      { n: 17, topic: 'adding and subtracting decimal numbers' },
      { n: 18, topic: 'finding a percentage of a number such as 20% of 60' },
      { n: 19, topic: 'order of operations using BODMAS or PEMDAS' },
      { n: 20, topic: 'multi-step word problems requiring two or more calculations' },
    ],
  },
];

const PARENTAL_GATE_PROBLEMS = [
  { question: '(14 + 22) ÷ 4 = ?', answer: 9 },
  { question: '7 × 8 − 16 = ?', answer: 40 },
  { question: '144 ÷ 12 = ?', answer: 12 },
  { question: '(25 − 7) × 3 = ?', answer: 54 },
  { question: '3² + 4² = ?', answer: 25 },
];

// --- Sound System ---
function useSoundSystem() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const bgmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgmPlayingRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.gain.value = 1;
      masterGainRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return { ctx: ctxRef.current, master: masterGainRef.current! };
  }, []);

  const playNote = useCallback((
    ctx: AudioContext, master: GainNode,
    freq: number, startTime: number, duration: number,
    type: OscillatorType = 'sine', gainVal = 0.3
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(master);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }, []);

  const BGM_NOTES: [number, number][] = [
    [523.25, 0.25], [659.25, 0.25], [783.99, 0.25], [880.00, 0.25],
    [783.99, 0.50], [659.25, 0.25], [523.25, 0.25], [587.33, 0.50],
    [659.25, 0.25], [523.25, 0.25], [440.00, 0.25], [523.25, 0.75],
    [392.00, 0.25], [440.00, 0.25], [523.25, 0.25], [659.25, 0.25],
    [523.25, 0.50], [440.00, 0.25], [392.00, 0.25], [523.25, 1.00],
  ];

  const scheduleBGMLoop = useCallback((ctx: AudioContext, master: GainNode, startTime: number) => {
    if (!bgmPlayingRef.current) return;
    let t = startTime;
    const totalDur = BGM_NOTES.reduce((sum, [, dur]) => sum + dur, 0);
    BGM_NOTES.forEach(([freq, dur]) => {
      playNote(ctx, master, freq, t, dur - 0.04, 'triangle', 0.07);
      t += dur;
    });
    bgmTimerRef.current = setTimeout(() => {
      if (bgmPlayingRef.current) scheduleBGMLoop(ctx, master, ctx.currentTime + 0.05);
    }, (totalDur - 0.3) * 1000);
  }, [playNote]);

  const startBGM = useCallback(() => {
    if (bgmPlayingRef.current) return;
    bgmPlayingRef.current = true;
    const { ctx, master } = getCtx();
    scheduleBGMLoop(ctx, master, ctx.currentTime + 0.1);
  }, [getCtx, scheduleBGMLoop]);

  const stopBGM = useCallback(() => {
    bgmPlayingRef.current = false;
    if (bgmTimerRef.current) clearTimeout(bgmTimerRef.current);
  }, []);

  const playClick = useCallback(() => {
    const { ctx, master } = getCtx();
    playNote(ctx, master, 1046.5, ctx.currentTime, 0.08, 'sine', 0.35);
  }, [getCtx, playNote]);

  const playCorrect = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      playNote(ctx, master, freq, t + i * 0.12, 0.25, 'sine', 0.35)
    );
  }, [getCtx, playNote]);

  const playWrong = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    playNote(ctx, master, 349.23, t, 0.15, 'sawtooth', 0.18);
    playNote(ctx, master, 261.63, t + 0.18, 0.35, 'sawtooth', 0.18);
  }, [getCtx, playNote]);

  const playVictory = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    const fanfare: [number, number, number][] = [
      [523.25, 0.00, 0.15], [659.25, 0.15, 0.15], [783.99, 0.30, 0.15],
      [523.25, 0.50, 0.10], [659.25, 0.60, 0.10], [783.99, 0.70, 0.10],
      [1046.50, 0.85, 0.65],
    ];
    fanfare.forEach(([freq, offset, dur]) =>
      playNote(ctx, master, freq, t + offset, dur, 'sine', 0.4)
    );
  }, [getCtx, playNote]);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const newMuted = !prev;
      if (masterGainRef.current) masterGainRef.current.gain.value = newMuted ? 0 : 1;
      if (!newMuted) {
        const { ctx, master } = getCtx();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(master);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.05);
        g.gain.setValueAtTime(0.35, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime + 0.05);
        osc.stop(ctx.currentTime + 0.2);
      }
      return newMuted;
    });
  }, [getCtx]);

  useEffect(() => {
    return () => {
      bgmPlayingRef.current = false;
      if (bgmTimerRef.current) clearTimeout(bgmTimerRef.current);
      ctxRef.current?.close();
    };
  }, []);

  return { muted, toggleMute, startBGM, stopBGM, playClick, playCorrect, playWrong, playVictory };
}

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

// --- App ---
export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [phase, setPhase] = useState(1);
  const [levelInPhase, setLevelInPhase] = useState(1);
  const [progress, setProgress] = useState(0);
  const [coins, setCoins] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'CORRECT' | 'WRONG'; value: string } | null>(null);
  const [shake, setShake] = useState(false);
  const [isPhaseTransition, setIsPhaseTransition] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showPhaseSelect, setShowPhaseSelect] = useState(false);

  const { muted, toggleMute, startBGM, stopBGM, playClick, playCorrect, playWrong, playVictory } = useSoundSystem();

  const currentPhaseConfig = PHASES[phase - 1];

  const fetchQuestion = useCallback(async (p: number, l: number) => {
    const phaseConfig = PHASES[p - 1];
    const levelConfig = phaseConfig.levels[l - 1];
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: p, level: l, topic: levelConfig.topic }),
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setProblem(data);
    } catch {
      const fallbacks: Record<number, Problem> = {
        1: { question: 'How many stars? ⭐⭐⭐', options: [3, 1, 5, 2], correctAnswer: 3 },
        2: { question: '9 + 7 = ?', options: [16, 14, 15, 17], correctAnswer: 16 },
        3: { question: '6 × 7 = ?', options: [42, 36, 48, 40], correctAnswer: 42 },
        4: { question: '25% of 80 = ?', options: [20, 15, 25, 30], correctAnswer: 20 },
      };
      setProblem(fallbacks[p] || fallbacks[1]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    setFeedback(null);
    setGameState('PLAYING');
    startBGM();
    fetchQuestion(startPhase, startLevel);
  }, [phase, levelInPhase, isGameComplete, playClick, startBGM, fetchQuestion]);

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
      triggerConfetti();
      setCoins(prev => prev + 10);
      setFeedback({ type: 'CORRECT', value: 'Awesome!' });
      const newProgress = progress + 1;
      setProgress(newProgress);

      if (newProgress >= 5) {
        const wasLastLevel = levelInPhase === 5;
        const wasLastPhase = phase === 4;

        setTimeout(() => {
          setFeedback(null);
          stopBGM();
          playVictory();
          setProgress(0);

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

          setGameState('VICTORY');
        }, 1500);
      } else {
        setTimeout(() => {
          setFeedback(null);
          fetchQuestion(phase, levelInPhase);
        }, 1500);
      }
    } else {
      playWrong();
      setFeedback({ type: 'WRONG', value: 'Try again!' });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setFeedback(null), 1000);
    }
  }, [problem, progress, phase, levelInPhase, playCorrect, playWrong, playVictory, stopBGM, fetchQuestion]);

  const handlePhaseSelect = (newPhase: number) => {
    setPhase(newPhase);
    setLevelInPhase(1);
    setProgress(0);
    setShowPhaseSelect(false);
  };

  // After state updates in handleAnswer, phase/levelInPhase already reflect the NEW values
  const victoryPhaseConfig = PHASES[phase - 1];

  return (
    <div className="min-h-screen bg-[#FFE5F1] font-sans text-black flex flex-col items-center p-4 md:p-8">

      {/* Overlays */}
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

      {/* HUD */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 bg-white p-4 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Phase + Level */}
        <div className="flex items-center gap-3">
          <div className={`${currentPhaseConfig.badgeBg} p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xl leading-none`}>
            {currentPhaseConfig.emoji}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider leading-tight text-gray-500">{currentPhaseConfig.name}</p>
            <p className="text-3xl font-black leading-none">
              {levelInPhase}<span className="text-base font-black text-gray-400">/5</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 mx-6 hidden md:block">
          <div className="flex justify-between text-sm font-black uppercase mb-2">
            <span>Progress</span>
            <span>{progress} / 5</span>
          </div>
          <ProgressBar current={progress} max={5} color="bg-[#4ADE80]" />
        </div>

        {/* Coins + Mute */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-black uppercase tracking-wider">Coins</p>
            <p className="text-3xl font-black leading-none text-[#F59E0B]">{coins}</p>
          </div>
          <div className="bg-[#FEF3C7] p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Coins className="text-[#F59E0B] fill-[#F59E0B]" size={24} />
          </div>
          <button
            onClick={toggleMute}
            className={`p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 transition-all ${muted ? 'bg-gray-100' : 'bg-[#E0F2FE]'}`}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="text-gray-400" size={24} /> : <Volume2 className="text-[#3B82F6]" size={24} />}
          </button>
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

              <button
                onClick={startGame}
                className="group relative bg-[#3B82F6] hover:bg-[#2563EB] text-white px-12 py-6 rounded-full border-4 border-black text-3xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto"
              >
                PLAY NOW
                <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* PLAYING */}
          {gameState === 'PLAYING' && (
            <motion.div key="playing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center">
              <div className="w-full flex flex-col items-center mb-8">
                <motion.div
                  animate={shake ? { x: [-10, 10, -10, 10, 0] } : { y: [0, -10, 0] }}
                  transition={shake ? { duration: 0.4 } : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-[120px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]"
                >
                  {feedback?.type === 'CORRECT' ? '🥰' : feedback?.type === 'WRONG' ? '😵' : '👾'}
                </motion.div>
              </div>

              <div className="w-full bg-white rounded-[40px] p-8 md:p-12 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute inset-0 z-10 flex items-center justify-center text-5xl font-black border-4 border-black ${
                      feedback.type === 'CORRECT' ? 'bg-[#4ADE80]' : 'bg-[#F87171]'
                    }`}
                  >
                    {feedback.value}
                  </motion.div>
                )}

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-[#3B82F6]" size={64} />
                    <p className="mt-6 text-2xl font-black text-gray-500 animate-pulse">Thinking of a puzzle...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-10">
                      <p className="text-sm font-black uppercase tracking-wider text-gray-400 mb-3">
                        {currentPhaseConfig.emoji} {currentPhaseConfig.name} · Level {levelInPhase}/5
                      </p>
                      <h2 className="text-3xl md:text-5xl font-black leading-tight">{problem?.question}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {problem?.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt)}
                          disabled={!!feedback}
                          className="bg-[#E0F2FE] hover:bg-[#BAE6FD] border-4 border-black py-6 rounded-3xl text-3xl md:text-4xl font-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 disabled:opacity-50"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* VICTORY */}
          {gameState === 'VICTORY' && (
            <motion.div key="victory" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full bg-white p-12 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              {isGameComplete ? (
                <>
                  <div className="text-7xl mb-4">🏆</div>
                  <h2 className="text-5xl font-black mb-4">CHAMPION!</h2>
                  <p className="text-2xl font-bold mb-3">You've mastered all 4 phases!</p>
                  <p className="text-base font-bold text-gray-400 mb-10">From Pre-School to Advanced Primary. Incredible!</p>
                  <button onClick={startGame}
                    className="bg-[#FFD700] hover:bg-[#F59E0B] text-black px-12 py-6 rounded-full border-4 border-black text-2xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto">
                    PLAY AGAIN <Sparkles size={28} />
                  </button>
                </>
              ) : isPhaseTransition ? (
                <>
                  <div className="text-7xl mb-4">{victoryPhaseConfig.emoji}</div>
                  <div className={`inline-block ${victoryPhaseConfig.bgColor} ${victoryPhaseConfig.borderColor} border-4 px-6 py-2 rounded-full mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                    <p className="font-black text-lg">Phase {victoryPhaseConfig.id} Unlocked!</p>
                  </div>
                  <h2 className="text-4xl font-black mb-2">{victoryPhaseConfig.name}</h2>
                  <p className="text-xl font-bold text-gray-400 mb-10">{victoryPhaseConfig.ageRange}</p>
                  <button onClick={startGame}
                    className={`${victoryPhaseConfig.badgeBg} text-black px-12 py-6 rounded-full border-4 border-black text-2xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto`}>
                    START PHASE {victoryPhaseConfig.id} <ChevronRight size={28} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-40 h-40 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <Trophy className="text-black" size={80} />
                  </div>
                  <h2 className="text-5xl font-black mb-4">LEVEL UP!</h2>
                  <p className="text-xl font-bold text-gray-500 mb-10">
                    {currentPhaseConfig.emoji} {currentPhaseConfig.name} · Level {levelInPhase} of 5
                  </p>
                  <button onClick={startGame}
                    className="bg-[#4ADE80] hover:bg-[#22C55E] text-black px-12 py-6 rounded-full border-4 border-black text-3xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto">
                    NEXT LEVEL <Sparkles size={32} />
                  </button>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
