import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// A short, one-time intro to how The Academy works — mastery gating, the exam
// surfaces, and the support tools. Shown on the first topic-list visit so teens
// understand the 80%-to-pass / sequential-unlock model instead of churning.

interface Card {
  emoji: string;
  title: string;
  body: string;
}

const CARDS: Card[] = [
  {
    emoji: '🎯',
    title: 'Master each level',
    body: 'Score 80% or more to pass a level. Levels and topics unlock in order, so each builds on the last — no skipping the foundations.',
  },
  {
    emoji: '📝',
    title: 'Tests & mock exams',
    body: 'Pass a Topic Test to open the next topic. When you’re ready, sit the 40-question Mock Exam — IGCSE-style, with marks and exam tips.',
  },
  {
    emoji: '🧰',
    title: 'Tools that help you',
    body: 'Every question shows working, hints, and common mistakes. The Formula Vault and your Mistake Book are always a tap away in the bottom bar.',
  },
];

export default function AcademyOnboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;

  function next() {
    if (isLast) onDone();
    else setIndex(i => i + 1);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="How The Academy works"
    >
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-800 rounded-3xl p-8 text-center"
          >
            <div className="text-6xl mb-4" aria-hidden="true">{card.emoji}</div>
            <h2 className="text-white font-outfit font-extrabold text-2xl mb-3">{card.title}</h2>
            <p className="text-slate-300 font-inter leading-relaxed">{card.body}</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6" aria-hidden="true">
          {CARDS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-teal' : 'w-2 bg-slate-600'}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={onDone}
            className="text-slate-400 font-inter text-sm px-3 py-2"
          >
            Skip
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={next}
            className="px-8 py-3 bg-teal text-white font-outfit font-bold rounded-2xl"
          >
            {isLast ? 'Start learning →' : 'Next'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
