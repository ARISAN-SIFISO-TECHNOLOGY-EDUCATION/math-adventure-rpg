import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, RefreshCw } from 'lucide-react';
import { getMistakes, removeMistake, type MistakeEntry } from '../../exam-studio';
import SeniorNav from '../SeniorNav';

function MistakeCard({ entry, onRemove }: { key?: string | number; entry: MistakeEntry; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-slate-800 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-4 py-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-xs font-inter">
              {entry.topicId} · Level {entry.level}
            </p>
            <p className="text-white font-outfit font-semibold text-sm mt-0.5 line-clamp-2 whitespace-pre-wrap">
              {entry.question}
            </p>
          </div>
          <span className="text-slate-400 text-xs flex-shrink-0 mt-0.5 font-inter">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-700"
          >
            <div className="px-4 py-3 space-y-2">
              <div className="flex gap-2">
                <span className="text-slate-400 text-sm font-inter">Your answer:</span>
                <span className="text-sprout-orange text-sm font-outfit font-semibold">
                  {entry.userAnswer}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-400 text-sm font-inter">Correct:</span>
                <span className="text-sprout-green text-sm font-outfit font-semibold">
                  {entry.correctAnswer}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-600 text-xs font-inter">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
                <button
                  onClick={onRemove}
                  className="flex items-center gap-1 text-slate-400 hover:text-sprout-orange text-xs font-inter transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MistakeBookPage() {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState<MistakeEntry[]>(getMistakes());

  function handleRemove(id: string) {
    removeMistake(id);
    setMistakes(getMistakes());
  }

  function handlePractiseWeakSpots() {
    if (mistakes.length === 0) return;
    // Jump back into the topic/level of the most recent mistake to drill it.
    const first = mistakes[0];
    navigate(
      `/senior/activity?topicId=${first.topicId}&level=${first.level}&mode=topic&isTopicTest=false`
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 max-w-md mx-auto px-4 pb-24">
      {/* Header */}
      <div className="pt-8 pb-4 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/senior/topics/15')}
          className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-xl font-outfit font-extrabold text-white">Mistake Book</h1>
          <p className="text-slate-400 text-sm font-inter">{mistakes.length} saved mistakes</p>
        </div>
        {mistakes.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePractiseWeakSpots}
            className="flex items-center gap-1.5 bg-teal/20 text-teal border border-teal/30 rounded-xl px-3 py-2 text-sm font-outfit font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Practise
          </motion.button>
        )}
      </div>

      {mistakes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <span className="text-6xl">🎯</span>
          <h2 className="text-white font-outfit font-bold text-xl mt-4">No mistakes yet!</h2>
          <p className="text-slate-400 font-inter text-sm mt-2">
            When you get a question wrong, it'll appear here for review.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {mistakes.map(entry => (
              <MistakeCard
                key={entry.questionId}
                entry={entry}
                onRemove={() => handleRemove(entry.questionId)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      <SeniorNav />
    </div>
  );
}
