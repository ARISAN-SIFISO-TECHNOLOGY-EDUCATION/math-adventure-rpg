/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, RefreshCw, ChevronRight, Coins, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
type GameState = 'START' | 'PLAYING' | 'VICTORY';

type Problem = {
  question: string;
  options: (number | string)[];
  correctAnswer: number | string;
};

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

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [level, setLevel] = useState(1);
  const [coins, setCoins] = useState(0);
  const [progress, setProgress] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'CORRECT' | 'WRONG'; value: string } | null>(null);
  const [shake, setShake] = useState(false);

  const fetchQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }
      const data = await response.json();
      setProblem(data);
    } catch (error) {
      console.error(error);
      // Fallback question if API fails
      setProblem({
        question: "If 3 alien monsters join 4 other alien monsters, how many are there?",
        options: [7, 5, 8, 12],
        correctAnswer: 7
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = () => {
    setGameState('PLAYING');
    setProgress(0);
    fetchQuestion();
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7']
    });
  };

  const handleAnswer = (choice: number | string) => {
    if (!problem) return;

    if (choice === problem.correctAnswer) {
      // Correct!
      setFeedback({ type: 'CORRECT', value: 'Awesome!' });
      triggerConfetti();
      setCoins(prev => prev + 10);
      
      const newProgress = progress + 1;
      setProgress(newProgress);

      if (newProgress >= 5) {
        setTimeout(() => {
          setLevel(prev => prev + 1);
          setGameState('VICTORY');
          setFeedback(null);
        }, 1500);
      } else {
        setTimeout(() => {
          setFeedback(null);
          fetchQuestion();
        }, 1500);
      }
    } else {
      // Wrong!
      setFeedback({ type: 'WRONG', value: 'Try again!' });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFE5F1] font-sans text-black flex flex-col items-center p-4 md:p-8">
      {/* HUD */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 bg-white p-4 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <div className="bg-[#FFD700] p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Star className="text-black fill-black" size={24} />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-wider">Level</p>
            <p className="text-3xl font-black leading-none">{level}</p>
          </div>
        </div>
        
        <div className="flex-1 mx-6 hidden md:block">
          <div className="flex justify-between text-sm font-black uppercase mb-2">
            <span>Progress</span>
            <span>{progress} / 5</span>
          </div>
          <ProgressBar current={progress} max={5} color="bg-[#4ADE80]" />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-black uppercase tracking-wider">Coins</p>
            <p className="text-3xl font-black leading-none text-[#F59E0B]">{coins}</p>
          </div>
          <div className="bg-[#FEF3C7] p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Coins className="text-[#F59E0B] fill-[#F59E0B]" size={24} />
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center w-full"
            >
              <div className="mb-12 relative flex justify-center">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="text-[150px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]"
                >
                  👾
                </motion.div>
                <div className="absolute -bottom-6 bg-white px-8 py-3 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
                  <h1 className="text-3xl md:text-4xl font-black whitespace-nowrap">MATH MONSTERS</h1>
                </div>
              </div>
              <p className="text-xl font-bold mb-10 max-w-sm mx-auto">Feed your monster by solving fun math puzzles!</p>
              <button
                onClick={startGame}
                className="group relative bg-[#3B82F6] hover:bg-[#2563EB] text-white px-12 py-6 rounded-full border-4 border-black text-3xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto"
              >
                PLAY NOW
                <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center"
            >
              {/* Monster Area */}
              <div className="w-full flex flex-col items-center mb-8">
                <motion.div
                  animate={shake ? { x: [-10, 10, -10, 10, 0] } : { y: [0, -10, 0] }}
                  transition={shake ? { duration: 0.4 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="text-[120px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]"
                >
                  {feedback?.type === 'CORRECT' ? '🥰' : feedback?.type === 'WRONG' ? '😵' : '👾'}
                </motion.div>
              </div>

              {/* Problem Area */}
              <div className="w-full bg-white rounded-[40px] p-8 md:p-12 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute inset-0 z-10 flex items-center justify-center text-5xl font-black text-black border-4 border-black ${
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

          {gameState === 'VICTORY' && (
            <motion.div
              key="victory"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center w-full bg-white p-12 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="w-40 h-40 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Trophy className="text-black" size={80} />
              </div>
              <h2 className="text-5xl font-black mb-4">LEVEL UP!</h2>
              <p className="text-2xl font-bold mb-12">Your monster is getting smarter!</p>
              <button
                onClick={startGame}
                className="bg-[#4ADE80] hover:bg-[#22C55E] text-black px-12 py-6 rounded-full border-4 border-black text-3xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto"
              >
                NEXT LEVEL
                <Sparkles size={32} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
