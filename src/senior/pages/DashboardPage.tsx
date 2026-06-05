import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Target, Flame, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CURRICULUM } from '../curriculum';
import {
  getLevelProgress,
  isTopicTestPassed,
  getMockExamScores,
  getMistakes,
} from '../progress';
import SeniorNav from '../SeniorNav';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-outfit font-extrabold text-white">{value}</p>
        <p className="text-slate-400 text-xs font-inter">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const mockScores = getMockExamScores();
  const mistakes = getMistakes();

  // Aggregate stats across the OPEN schools only (locked schools aren't playable).
  let totalPassed = 0;
  let totalLevels = 0;
  let totalAttempts = 0;
  let topicTestsPassed = 0;
  let totalTopics = 0;

  for (const group of CURRICULUM) {
    if (group.locked) continue;
    for (const topic of group.topics) {
      totalTopics++;
      if (isTopicTestPassed(topic.id)) topicTestsPassed++;
      for (let l = 1; l <= topic.levels; l++) {
        totalLevels++;
        const p = getLevelProgress(topic.id, l);
        if (p.passed) totalPassed++;
        totalAttempts += p.attempts;
      }
    }
  }

  const bestMock = mockScores.length > 0 ? Math.max(...mockScores.map(s => s.score)) : null;

  // Per-topic breakdown for the first open school (Age 15 — Builders)
  const age15 = CURRICULUM[0];

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
        <h1 className="text-xl font-outfit font-extrabold text-white">Dashboard</h1>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Trophy} label="Levels passed" value={`${totalPassed}/${totalLevels}`} color="bg-teal" />
        <StatCard icon={Target} label="Topics completed" value={`${topicTestsPassed}/${totalTopics}`} color="bg-sprout-purple" />
        <StatCard icon={Flame} label="Total attempts" value={totalAttempts} color="bg-sprout-orange" />
        <StatCard icon={BookOpen} label="Mistakes saved" value={mistakes.length} color="bg-sprout-pink" />
      </div>

      {/* Mock exam history */}
      <div className="mt-6">
        <h2 className="text-slate-400 text-xs font-inter uppercase tracking-wider mb-3">Mock Exam History</h2>
        {mockScores.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-6 text-center text-slate-500 font-inter text-sm">
            No mock exams taken yet
          </div>
        ) : (
          <div className="space-y-2">
            {[...mockScores].reverse().slice(0, 5).map((s, i) => (
              <div key={i} className="bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-outfit font-semibold">Age {s.age} Mock</p>
                  <p className="text-slate-500 text-xs font-inter">
                    {new Date(s.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xl font-outfit font-extrabold ${
                    s.score >= 80 ? 'text-sprout-green' : s.score >= 60 ? 'text-sprout-gold' : 'text-sprout-orange'
                  }`}
                >
                  {s.score}%
                </span>
              </div>
            ))}
            {bestMock !== null && (
              <p className="text-slate-500 text-xs font-inter text-center pt-1">
                Best score: <span className="text-sprout-green font-semibold">{bestMock}%</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Topic breakdown */}
      <div className="mt-6">
        <h2 className="text-slate-400 text-xs font-inter uppercase tracking-wider mb-3">Age 15 — Topic Breakdown</h2>
        <div className="space-y-3">
          {age15.topics.map(topic => {
            const levelNums = Array.from({ length: topic.levels }, (_, i) => i + 1);
            const passed = levelNums.filter(l => getLevelProgress(topic.id, l).passed).length;
            const pct = Math.round((passed / topic.levels) * 100);
            const testPassed = isTopicTestPassed(topic.id);

            return (
              <div key={topic.id} className="bg-slate-800 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{topic.icon}</span>
                    <p className="text-white font-outfit font-semibold text-sm">{topic.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {testPassed && (
                      <span className="text-sprout-green text-xs font-inter bg-sprout-green/10 px-2 py-0.5 rounded-full border border-sprout-green/30">
                        ✓ Test
                      </span>
                    )}
                    <span className="text-slate-400 text-xs font-inter">{passed}/{topic.levels}</span>
                  </div>
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
            );
          })}
        </div>
      </div>

      <SeniorNav />
    </div>
  );
}
