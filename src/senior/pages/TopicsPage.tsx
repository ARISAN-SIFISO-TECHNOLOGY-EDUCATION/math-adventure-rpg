import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, CheckCircle, BookOpen } from 'lucide-react';
import { CURRICULUM, type TopicCard } from '../curriculum';
import { FORMULAS } from '../formulas';
import SeniorNav from '../SeniorNav';
import {
  isTopicUnlocked,
  isTopicTestPassed,
  getLevelProgress,
  isLevelUnlocked,
  isDevUnlockAll,
  setDevUnlockAll,
  isDevButtonRevealed,
  revealDevButton,
  getMockExamScores,
} from '../progress';

// True only when running the Vite dev server (npm run dev). In a release build
// this is false, so the Dev Mode button stays hidden until the secret gesture.
// Contained cast avoids needing global vite/client types.
const IS_DEV_BUILD = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);

// Number of taps on the school title that reveals the Dev Mode button in a
// release build — obscure enough that ordinary users never trigger it.
const SECRET_TAP_COUNT = 7;

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

      {/* Actions: topic test + formula vault */}
      {unlocked && (
        <div className="flex gap-2 pt-1">
          {topic.hasTest && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                navigate(`/senior/activity?topicId=${topic.id}&level=1&mode=test&isTopicTest=true`)
              }
              className={`flex-1 py-2 rounded-xl text-sm font-outfit font-semibold transition-colors ${
                testPassed
                  ? 'bg-sprout-green/20 text-sprout-green border border-sprout-green/30'
                  : 'bg-teal text-white'
              }`}
            >
              {testPassed ? '✓ Topic Test Passed' : 'Topic Test'}
            </motion.button>
          )}
          {(FORMULAS[topic.id]?.length ?? 0) > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/senior/formulas/${topic.id}`)}
              aria-label="Formula Vault"
              className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0"
            >
              <BookOpen className="w-4 h-4 text-slate-300" />
            </motion.button>
          )}
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
      <div className="min-h-screen bg-slate-900 max-w-md mx-auto px-4 pb-24">
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
        <SeniorNav />
      </div>
    );
  }

  const allTopicIds = group.topics.map(t => t.id);
  const lastMock = getMockExamScores().filter(m => m.age === ageNum).slice(-1)[0];

  // Dev Mode — unlocks every topic & level so the whole syllabus can be reviewed
  // freely (bypasses the ≥80% mastery gate). Global across all ages 15–17.
  const [devUnlock, setDevUnlock] = useState(isDevUnlockAll());
  function toggleDevUnlock() {
    const next = !devUnlock;
    setDevUnlockAll(next);
    setDevUnlock(next);
  }

  // Dev button visibility: always on the dev server; in a release build only
  // after the developer taps the school title SECRET_TAP_COUNT times.
  const [devRevealed, setDevRevealed] = useState(isDevButtonRevealed());
  const [titleTaps, setTitleTaps] = useState(0);
  const devButtonVisible = IS_DEV_BUILD || devRevealed;

  function handleTitleTap() {
    if (devButtonVisible) return;
    const next = titleTaps + 1;
    setTitleTaps(next);
    if (next >= SECRET_TAP_COUNT) {
      revealDevButton();
      setDevRevealed(true);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 max-w-md mx-auto px-4 pb-24">
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
          <p className="text-slate-400 text-xs font-inter uppercase tracking-wider">Age {age} · Exam Studio</p>
          <h1
            onClick={handleTitleTap}
            className="text-xl font-outfit font-extrabold text-white select-none"
          >
            {group.school}
          </h1>
        </div>
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

      {/* Mock Exam — full 40-question timed-style paper across all topics */}
      {group.hasMockExam && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: group.topics.length * 0.05 }}
          className="mt-4"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              navigate(`/senior/activity?topicId=mock-age${ageNum}&level=1&mode=mock&isTopicTest=false&age=${ageNum}`)
            }
            className={`w-full rounded-2xl p-5 text-left text-white ${group.color}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-inter opacity-80">Age {age} Mock Exam</p>
              {lastMock && (
                <span className="text-xs font-outfit font-bold bg-white/20 rounded-full px-2.5 py-1">
                  Best/last: {lastMock.score}%
                </span>
              )}
            </div>
            <h3 className="text-xl font-outfit font-extrabold mt-0.5">40-Question Mock Paper</h3>
            <p className="text-sm opacity-70 mt-1 font-inter">All topics · IGCSE style · marks &amp; exam tips</p>
          </motion.button>
        </motion.div>
      )}

      {/* Dev Mode toggle — unlock the whole syllabus for review (bypasses mastery gate).
          Visible on the dev server, or after the secret title-tap gesture in a release build. */}
      {devButtonVisible && (
        <div className="mt-8 border-t border-slate-800 pt-4">
          <button
            onClick={toggleDevUnlock}
            className={`w-full py-2.5 rounded-xl text-sm font-inter font-medium transition-colors ${
              devUnlock
                ? 'bg-sprout-orange/20 text-sprout-orange border border-sprout-orange/30'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {devUnlock ? '🔓 Dev Mode ON — all levels unlocked' : '🔒 Dev Mode OFF'}
          </button>
        </div>
      )}

      <SeniorNav />
    </div>
  );
}
