import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Home, RotateCcw, ChevronRight } from 'lucide-react';
import { hapticCelebrate } from '../../lib/haptics';
import { useT } from '../../i18n';

function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#2CA9A0', '#FF7043', '#7C4DFF', '#43A047', '#FFB300'],
  });
}

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const t = useT();

  const score = Number(searchParams.get('score') ?? 0);
  const total = Number(searchParams.get('total') ?? 5);
  const topicId = searchParams.get('topicId') ?? 'age15-numbers';
  const level = Number(searchParams.get('level') ?? 1);
  const isTopicTest = searchParams.get('isTopicTest') === 'true';
  const mode = searchParams.get('mode') ?? 'topic';

  const correct = Math.round((score / 100) * total);
  const passed = score >= 80;

  useEffect(() => {
    if (passed) {
      fireConfetti();
      hapticCelebrate();
    }
  }, [passed]);

  const emoji = score === 100 ? '🏆' : score >= 80 ? '🎉' : score >= 60 ? '💪' : '📚';
  const title = score === 100 ? t('sr.perfect') : passed ? t('sr.wellDone') : score >= 60 ? t('sr.goodEffort') : t('sr.keepPractising');
  const subtitle =
    score === 100
      ? t('sr.subPerfect')
      : passed
      ? t('sr.subPassed')
      : score >= 60
      ? t('sr.subClose')
      : t('sr.subRetry');

  // Radial progress ring
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const ringColor = score >= 80 ? '#43A047' : score >= 60 ? '#FFB300' : '#FF7043';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      {/* Score ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative flex items-center justify-center w-40 h-40"
      >
        <svg width="140" height="140" className="-rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#1E293B" strokeWidth="10" />
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl">{emoji}</span>
          <span className="text-2xl font-outfit font-extrabold text-white">{score}%</span>
        </div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-6"
      >
        <h1 className="text-3xl font-outfit font-extrabold text-white">{title}</h1>
        <p className="text-slate-400 font-inter mt-2">{subtitle}</p>
        <p className="text-slate-400 font-inter text-sm mt-1">
          {t('sr.scoreLine', { correct, total })} · {mode === 'masters' ? t('sr.mastersQuiz') : mode === 'mock' ? t('sr.mockExam') : isTopicTest ? t('sr.topicTest') : t('sr.level', { n: level })}
        </p>
      </motion.div>

      {/* Score breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full mt-8 bg-slate-800 rounded-2xl p-4 grid grid-cols-3 gap-4 text-center"
      >
        <div>
          <p className="text-2xl font-outfit font-extrabold text-sprout-green">{correct}</p>
          <p className="text-slate-400 text-xs font-inter mt-0.5">{t('sr.resultCorrect')}</p>
        </div>
        <div>
          <p className="text-2xl font-outfit font-extrabold text-sprout-orange">{total - correct}</p>
          <p className="text-slate-400 text-xs font-inter mt-0.5">{t('sr.resultWrong')}</p>
        </div>
        <div>
          <p className={`text-2xl font-outfit font-extrabold ${passed ? 'text-sprout-green' : 'text-sprout-orange'}`}>
            {passed ? t('sr.pass') : t('sr.retry')}
          </p>
          <p className="text-slate-400 text-xs font-inter mt-0.5">{t('sr.resultLabel')}</p>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full mt-6 space-y-3"
      >
        {!passed && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              navigate(
                `/senior/activity?topicId=${topicId}&level=${level}&mode=${mode}&isTopicTest=${isTopicTest}`,
                { replace: true }
              )
            }
            className="w-full py-4 bg-teal text-slate-900 font-outfit font-bold text-lg rounded-2xl flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            {t('sr.tryAgain')}
          </motion.button>
        )}

        {passed && !isTopicTest && mode === 'topic' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              navigate(
                `/senior/activity?topicId=${topicId}&level=${level + 1}&mode=topic&isTopicTest=false`,
                { replace: true }
              )
            }
            className="w-full py-4 bg-teal text-slate-900 font-outfit font-bold text-lg rounded-2xl flex items-center justify-center gap-2"
          >
            {t('sr.nextLevel')}
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(mode === 'masters' ? '/' : `/senior/topics/${topicId.match(/age(\d+)/)?.[1] ?? 15}`)}
          className="w-full py-4 bg-slate-800 text-white font-outfit font-semibold text-lg rounded-2xl flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          {mode === 'masters' ? t('sr.backToHome') : t('sr.backToTopics')}
        </motion.button>
      </motion.div>
    </div>
  );
}
