import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Lightbulb, Calculator } from 'lucide-react';
import {
  generateProblems,
  generateMockExamProblems,
  generateTopicTestProblems,
  generateMastersProblems,
  type Problem,
} from '../mathEngine';
import { recordAttempt, addMistake, recordMockExam } from '../../exam-studio';
import { recordAnswer, recordLevelComplete } from '../../lib/stats';
import { hapticSuccess, hapticError } from '../../lib/haptics';
import ErrorBoundary from '../../components/ErrorBoundary';
import { CURRICULUM } from '../curriculum';
import { useT } from '../../i18n';

// Resolve a topic id (e.g. "age13-numbers") to its friendly title ("Numbers");
// falls back to the id if not found (e.g. dynamic/aggregate modes).
function topicTitle(topicId: string): string {
  for (const group of CURRICULUM) {
    const t = group.topics.find(tc => tc.id === topicId);
    if (t) return t.title;
  }
  return topicId;
}

// ─── Option button ────────────────────────────────────────────────────────────
function OptionBtn({
  label,
  state,
  onPress,
}: {
  // This repo has no @types/react, so JSX doesn't auto-inject `key` on custom
  // components — declare it locally so list rendering type-checks.
  key?: string | number;
  label: string;
  state: 'idle' | 'correct' | 'wrong' | 'reveal';
  onPress: () => void;
}) {
  const base = 'w-full text-left px-4 py-3.5 rounded-xl font-outfit font-semibold text-base transition-all border-2';
  const styles: Record<string, string> = {
    idle: 'bg-slate-800 border-slate-700 text-white hover:border-slate-500',
    correct: 'bg-sprout-green/20 border-sprout-green text-sprout-green',
    wrong: 'bg-sprout-orange/20 border-sprout-orange text-sprout-orange',
    reveal: 'bg-sprout-green/10 border-sprout-green/40 text-sprout-green/80',
  };

  return (
    <motion.button
      whileTap={{ scale: state === 'idle' ? 0.97 : 1 }}
      onClick={state === 'idle' ? onPress : undefined}
      className={`${base} ${styles[state]}`}
    >
      <span className="whitespace-pre-wrap">{label}</span>
    </motion.button>
  );
}

// ─── Question card ────────────────────────────────────────────────────────────
function QuestionCard({
  problem,
  qIndex,
  total,
  onAnswer,
}: {
  key?: string | number;
  problem: Problem;
  qIndex: number;
  total: number;
  onAnswer: (correct: boolean, userAnswer: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const answered = selected !== null;
  const t = useT();

  function handleSelect(opt: string) {
    if (answered) return;
    setSelected(opt);
    onAnswer(opt === problem.correctAnswer, opt);
  }

  function optionState(opt: string): 'idle' | 'correct' | 'wrong' | 'reveal' {
    if (!answered) return 'idle';
    if (opt === problem.correctAnswer) return selected === opt ? 'correct' : 'reveal';
    if (opt === selected) return 'wrong';
    return 'idle';
  }

  return (
    <motion.div
      key={problem.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal rounded-full transition-all duration-300"
            style={{ width: `${(qIndex / total) * 100}%` }}
          />
        </div>
        <span className="text-slate-400 text-sm font-inter font-medium">
          {qIndex + 1}/{total}
        </span>
      </div>

      {/* Calculator badge */}
      {problem.calculatorAllowed && (
        <div className="flex items-center gap-1.5 text-teal text-xs font-inter">
          <Calculator className="w-3.5 h-3.5" />
          <span>{t('sr.calcAllowed')}</span>
        </div>
      )}

      {/* Question */}
      <div className="bg-slate-800 rounded-2xl p-5">
        {problem.marks && (
          <span className="text-sprout-orange text-xs font-inter font-semibold">
            [{problem.marks} mark{problem.marks > 1 ? 's' : ''}]
          </span>
        )}
        <p className="text-white font-outfit font-semibold text-lg leading-snug mt-1 whitespace-pre-wrap">
          {problem.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {problem.options.map(opt => (
          <OptionBtn
            key={opt}
            label={opt}
            state={optionState(opt)}
            onPress={() => handleSelect(opt)}
          />
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
            // Announce the result + correct answer to screen readers immediately.
            role="alert"
            aria-live="assertive"
          >
            <div
              className={`rounded-xl p-4 ${
                selected === problem.correctAnswer
                  ? 'bg-sprout-green/10 border border-sprout-green/30'
                  : 'bg-sprout-orange/10 border border-sprout-orange/30'
              }`}
            >
              <p className={`font-outfit font-bold ${selected === problem.correctAnswer ? 'text-sprout-green' : 'text-sprout-orange'}`}>
                {selected === problem.correctAnswer ? t('sr.correct') : t('sr.incorrect')}
              </p>
              {selected !== problem.correctAnswer && (
                <p className="text-slate-300 text-sm font-inter mt-1">
                  {t('sr.answer')} <span className="text-white font-semibold">{problem.correctAnswer}</span>
                </p>
              )}
              {problem.workingSteps?.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-slate-400 text-xs font-inter uppercase tracking-wider">{t('sr.working')}</p>
                  {problem.workingSteps.map((step, i) => (
                    <p key={i} className="text-slate-300 text-sm font-inter whitespace-pre-wrap">
                      {step}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {problem.commonMistake && (
              <div className="bg-sprout-orange/10 border border-sprout-orange/30 rounded-xl p-3 text-sm text-sprout-orange/90 font-inter">
                ⚠️ {t('sr.commonMistake')}: {problem.commonMistake}
              </div>
            )}

            {problem.examTip && (
              <div className="bg-teal/10 border border-teal/30 rounded-xl p-3 text-sm text-teal font-inter">
                💡 {t('sr.examTip')}: {problem.examTip}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint button (before answering) */}
      {!answered && problem.hints?.length > 0 && (
        <div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-slate-400 text-sm font-inter hover:text-teal transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? t('sr.hideHint') : t('sr.showHint')}
          </button>
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="text-slate-300 text-sm font-inter mt-2 bg-slate-800 rounded-xl p-3 space-y-1">
                  {problem.hints.map((h, i) => (
                    <p key={i}>{h}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function ActivityPageInner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const t = useT();

  const topicId = searchParams.get('topicId') ?? 'age15-numbers';
  const level = Number(searchParams.get('level') ?? 1);
  const mode = searchParams.get('mode') ?? 'topic'; // 'topic' | 'test' | 'mock'
  const isTopicTest = searchParams.get('isTopicTest') === 'true';
  const age = Number(searchParams.get('age') ?? 15);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<{ correct: boolean; problem: Problem; userAnswer: string }[]>([]);
  const [waitingNext, setWaitingNext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate problems once on mount
  useEffect(() => {
    let probs: Problem[];
    if (mode === 'masters') {
      probs = generateMastersProblems(15);
    } else if (mode === 'mock') {
      probs = generateMockExamProblems(age, 40);
    } else if (isTopicTest) {
      probs = generateTopicTestProblems(topicId, 10);
    } else {
      probs = generateProblems(topicId, 1, 5, level);
    }
    setProblems(probs);
  }, [topicId, level, mode, isTopicTest]);

  // Scroll to top when question changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIdx]);

  function handleAnswer(correct: boolean, userAnswer: string) {
    const problem = problems[currentIdx];
    if (correct) hapticSuccess(); else hapticError();
    recordAnswer(correct); // on-device only (Grown-up Corner insights)
    const newResults = [...results, { correct, problem, userAnswer }];
    setResults(newResults);

    if (!correct) {
      addMistake({
        questionId: problem.id,
        topicId,
        level,
        question: problem.question,
        correctAnswer: problem.correctAnswer,
        userAnswer,
        timestamp: Date.now(),
      });
    }

    setWaitingNext(true);
  }

  function handleNext() {
    setWaitingNext(false);
    if (currentIdx + 1 >= problems.length) {
      // Done — calculate score and navigate to success
      recordLevelComplete(); // on-device only (Grown-up Corner insights)
      const correct = results.filter(r => r.correct).length;
      const score = Math.round((correct / problems.length) * 100);
      if (mode === 'mock') {
        recordMockExam(age, score);
      } else if (mode !== 'masters') {
        recordAttempt(topicId, level, score, isTopicTest);
      }
      navigate(
        `/senior/success?score=${score}&total=${problems.length}&topicId=${topicId}&level=${level}&isTopicTest=${isTopicTest}&mode=${mode}`,
        { replace: true }
      );
    } else {
      setCurrentIdx(idx => idx + 1);
    }
  }

  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-teal text-2xl animate-pulse">Loading…</div>
      </div>
    );
  }

  const current = problems[currentIdx];
  const answered = results.length > currentIdx;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col max-w-md mx-auto">
      {/* Top bar */}
      <div className="px-4 pt-8 pb-3 flex items-center gap-3 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"
          aria-label={t('sr.a11y.back')}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <div className="flex-1">
          <p className="text-slate-400 text-xs font-inter uppercase tracking-wider">
            {mode === 'masters' ? t('sr.mastersQuiz') : isTopicTest ? t('sr.topicTest') : mode === 'mock' ? t('sr.mockExam') : t('sr.level', { n: level })}
          </p>
          <p className="text-white font-outfit font-bold text-sm truncate">{mode === 'masters' ? t('masters.sub') : topicTitle(topicId)}</p>
        </div>
        <div className="text-right">
          <p className="text-sprout-green font-outfit font-bold text-lg">
            {results.filter(r => r.correct).length}
          </p>
          <p className="text-slate-400 text-xs font-inter">{t('sr.correctLabel')}</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={current.id + currentIdx}
            problem={current}
            qIndex={currentIdx}
            total={problems.length}
            onAnswer={handleAnswer}
          />
        </AnimatePresence>
      </div>

      {/* Next button */}
      <AnimatePresence>
        {answered && waitingNext && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="px-4 pb-8 pt-2 flex-shrink-0"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="w-full py-4 bg-teal text-slate-900 font-outfit font-bold text-lg rounded-2xl"
            >
              {currentIdx + 1 >= problems.length ? 'See Results →' : 'Next Question →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// A bad question (generator edge case) should never white-screen a study session.
// Wrap the page in its own boundary that recovers back to the age's topic list.
export default function ActivityPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const age = Number(searchParams.get('age') ?? 15);
  // Masters Quiz (age 0) isn't tied to a topic list — recover home instead.
  const recoverTo = age >= 13 && age <= 17 ? `/senior/topics/${age}` : '/';
  return (
    <ErrorBoundary
      scopeLabel="this question"
      onReset={() => navigate(recoverTo, { replace: true })}
    >
      <ActivityPageInner />
    </ErrorBoundary>
  );
}
