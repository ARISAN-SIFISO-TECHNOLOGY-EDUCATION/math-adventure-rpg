import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, CheckCircle, NotebookPen } from 'lucide-react';
import { CURRICULUM, type TopicCard } from '../curriculum';
import {
  isTopicUnlocked,
  isTopicTestPassed,
  getLevelProgress,
  isLevelUnlocked,
  isDevUnlockAll,
} from '../progress';

// ─── Level dot ───────────────────────────────────────────────────────────────
function LevelDot({
  topicId,
  level,
  color,
  isUnlocked,
}: {
  // No @types/react in this repo → declare `key` so list rendering type-checks.
  key?: string | number;
  topicId: string;
  level: number;
  color: string;
  isUnlocked: boolean;
}) {
  const progress = getLevelProgress(topicId, level);
  const navigate = useNavigate();

  function handlePress() {
    if (!isUnlocked) return;
    navigate(`/senior/activity?topicId=${topicId}&level=${level}&mode=topic&isTopicTest=false`);
  }

  return (
    <motion.button
      whileTap={{ scale: isUnlocked ? 0.9 : 1 }}
      onClick={handlePress}
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-outfit font-bold border-2 transition-all ${
        !isUnlocked
          ? 'border-slate-700 bg-slate-800 text-slate-600 cursor-not-allowed'
          : progress.passed
          ? `${color} border-transparent text-white`
          : 'border-slate-600 bg-slate-700 text-white cursor-pointer'
      }`}
    >
      {!isUnlocked ? <Lock className="w-3.5 h-3.5" /> : progress.passed ? '✓' : level}
    </motion.button>
  );
}

// ─── Topic card ───────────────────────────────────────────────────────────────
function TopicRow({
  topic,
  topicIndex,
  allTopicIds,
}: {
  topic: TopicCard;
  topicIndex: number;
  allTopicIds: string[];
}) {
  const navigate = useNavigate();
  const unlocked = isTopicUnlocked(topicIndex, allTopicIds) || isDevUnlockAll();
  const testPassed = isTopicTestPassed(topic.id);

  const levelNums = Array.from({ length: topic.levels }, (_, i) => i + 1);
  const passedCount = levelNums.filter(l => getLevelProgress(topic.id, l).passed).length;
  const pct = Math.round((passedCount / topic.levels) * 100);

  return (
    <div
      className={`rounded-2xl p-4 space-y-3 transition-opacity ${
        unlocked ? 'bg-slate-800' : 'bg-slate-800 opacity-50'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${topic.color} flex items-center justify-center text-xl flex-shrink-0`}>
          {unlocked ? topic.icon : '🔒'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-outfit font-bold leading-tight">{topic.title}</h3>
          <p className="text-slate-400 text-xs font-inter mt-0.5">{topic.subtitle}</p>
        </div>
        {testPassed && <CheckCircle className="w-5 h-5 text-sprout-green flex-shrink-0 mt-0.5" />}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs font-inter text-slate-500 mb-1">
          <span>{passedCount}/{topic.levels} levels</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${topic.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Level dots */}
      <div className="flex items-center gap-2 flex-wrap">
        {levelNums.map(l => (
          <LevelDot
            key={l}
            topicId={topic.id}
            level={l}
            color={topic.color}
            isUnlocked={unlocked && isLevelUnlocked(topic.id, l)}
          />
        ))}
      </div>

      {/* Topic test */}
      {unlocked && topic.hasTest && (
        <div className="pt-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              navigate(`/senior/activity?topicId=${topic.id}&level=1&mode=test&isTopicTest=true`)
            }
            className={`w-full py-2 rounded-xl text-sm font-outfit font-semibold transition-colors ${
              testPassed
                ? 'bg-sprout-green/20 text-sprout-green border border-sprout-green/30'
                : 'bg-teal text-white'
            }`}
          >
            {testPassed ? '✓ Topic Test Passed' : 'Topic Test'}
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TopicsPage() {
  const { age } = useParams<{ age: string }>();
  const navigate = useNavigate();
  const ageNum = Number(age);

  const group = CURRICULUM.find(g => g.age === ageNum);

  // Unknown age, or a school that isn't open yet → friendly "coming soon".
  if (!group || group.locked || group.topics.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 max-w-md mx-auto px-4">
        <div className="pt-8 pb-4 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <div>
            <p className="text-slate-400 text-xs font-inter uppercase tracking-wider">Age {age}</p>
            <h1 className="text-xl font-outfit font-extrabold text-white">{group?.school ?? 'Exam Studio'}</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center py-24">
          <span className="text-6xl">🔒</span>
          <h2 className="text-white font-outfit font-bold text-xl mt-4">Coming soon</h2>
          <p className="text-slate-400 font-inter text-sm mt-2 max-w-xs">
            We're building the {group?.school ?? 'next school'} now. The{' '}
            <span className="text-teal font-semibold">School of Builders (Age 15)</span> is fully
            playable today — start there.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/senior/topics/15')}
            className="mt-6 px-6 py-3 bg-teal text-white font-outfit font-bold rounded-2xl"
          >
            Go to Age 15 →
          </motion.button>
        </div>
      </div>
    );
  }

  const allTopicIds = group.topics.map(t => t.id);

  return (
    <div className="min-h-screen bg-slate-900 max-w-md mx-auto px-4 pb-8">
      {/* Header */}
      <div className="pt-8 pb-4 flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <div className="flex-1">
          <p className="text-slate-400 text-xs font-inter uppercase tracking-wider">Age {age} · IGCSE</p>
          <h1 className="text-xl font-outfit font-extrabold text-white">{group.school}</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/senior/mistakes')}
          className="flex items-center gap-1.5 bg-slate-800 text-slate-300 rounded-xl px-3 py-2 text-sm font-outfit font-semibold"
        >
          <NotebookPen className="w-4 h-4" />
          Mistakes
        </motion.button>
      </div>

      {/* Topics */}
      <div className="space-y-4">
        {group.topics.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <TopicRow topic={topic} topicIndex={i} allTopicIds={allTopicIds} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
