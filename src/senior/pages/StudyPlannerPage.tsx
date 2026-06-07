import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react';
import { CURRICULUM } from '../curriculum';
import { isTopicTestPassed, getLevelProgress } from '../../exam-studio';
import SeniorNav from '../SeniorNav';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Open schools only (locked schools aren't playable yet).
const OPEN_TOPICS = CURRICULUM.filter(g => !g.locked).flatMap(g => g.topics);

// Find the first incomplete topic/level for smart suggestions
function getNextRecommended() {
  for (const group of CURRICULUM) {
    if (group.locked) continue;
    for (const topic of group.topics) {
      if (!isTopicTestPassed(topic.id)) {
        for (let l = 1; l <= topic.levels; l++) {
          if (!getLevelProgress(topic.id, l).passed) {
            return { topicId: topic.id, level: l, title: topic.title, icon: topic.icon };
          }
        }
      }
    }
  }
  return null;
}

export default function StudyPlannerPage() {
  const navigate = useNavigate();
  const recommended = getNextRecommended();

  // Simple week plan state, persisted locally.
  const [plan, setPlan] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('mathadv-senior-plan') ?? '{}');
    } catch { return {}; }
  });

  function savePlan(updated: Record<string, string>) {
    setPlan(updated);
    localStorage.setItem('mathadv-senior-plan', JSON.stringify(updated));
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
        <div>
          <h1 className="text-xl font-outfit font-extrabold text-white">Study Planner</h1>
          <p className="text-slate-400 text-sm font-inter">Plan your week of practice</p>
        </div>
      </div>

      {/* Smart recommendation */}
      {recommended && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-teal/10 border border-teal/30 rounded-2xl p-4 mb-6"
        >
          <p className="text-teal text-xs font-inter uppercase tracking-wider">Recommended next</p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{recommended.icon}</span>
              <div>
                <p className="text-white font-outfit font-bold">{recommended.title}</p>
                <p className="text-slate-400 text-sm font-inter">Level {recommended.level}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() =>
                navigate(
                  `/senior/activity?topicId=${recommended.topicId}&level=${recommended.level}&mode=topic&isTopicTest=false`
                )
              }
              className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Week plan */}
      <div>
        <h2 className="text-slate-400 text-xs font-inter uppercase tracking-wider mb-3">
          <Calendar className="w-3.5 h-3.5 inline mr-1" />
          This Week
        </h2>
        <div className="space-y-2.5">
          {DAYS.map(day => {
            const selectedId = plan[day];
            const selectedTopic = OPEN_TOPICS.find(t => t.id === selectedId);

            return (
              <div key={day} className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-slate-400 font-outfit font-semibold text-sm w-10">{day}</span>
                <div className="flex-1 min-w-0">
                  {selectedTopic ? (
                    <div className="flex items-center gap-2">
                      <span>{selectedTopic.icon}</span>
                      <span className="text-white font-outfit font-semibold text-sm truncate">
                        {selectedTopic.title}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-600 font-inter text-sm">No topic set</span>
                  )}
                </div>
                <select
                  value={selectedId ?? ''}
                  onChange={e => savePlan({ ...plan, [day]: e.target.value })}
                  className="bg-slate-700 text-white font-inter text-xs rounded-lg px-2 py-1.5 outline-none border-none"
                >
                  <option value="">— pick —</option>
                  {OPEN_TOPICS.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.title}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clear plan */}
      <button
        onClick={() => savePlan({})}
        className="mt-6 w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-inter text-sm hover:text-slate-300 transition-colors"
      >
        Clear week plan
      </button>

      <SeniorNav />
    </div>
  );
}
