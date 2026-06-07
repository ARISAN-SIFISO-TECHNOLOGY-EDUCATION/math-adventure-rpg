import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Search } from 'lucide-react';
import { FORMULAS } from '../formulas';
import { CURRICULUM } from '../curriculum';
import SeniorNav from '../SeniorNav';

// Build flat list of all topic IDs and their display names
const ALL_TOPICS = CURRICULUM.flatMap(g =>
  g.topics.map(t => ({ id: t.id, label: t.title, icon: t.icon }))
);

export default function FormulaVaultPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTopicId, setActiveTopicId] = useState(topicId ?? ALL_TOPICS[0]?.id ?? '');

  const entries = FORMULAS[activeTopicId] ?? [];
  const filtered = search
    ? entries.filter(
        e =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.formula.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  return (
    <div className="min-h-screen bg-slate-900 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="px-4 pt-8 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <h1 className="text-xl font-outfit font-extrabold text-white">Formula Vault</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search formulas…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 text-white font-inter text-sm pl-9 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-teal/50 placeholder-slate-500"
          />
        </div>

        {/* Topic tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-3 scrollbar-hide">
          {ALL_TOPICS.filter(t => FORMULAS[t.id]?.length > 0).map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTopicId(t.id); setSearch(''); }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-outfit font-semibold transition-colors ${
                activeTopicId === t.id
                  ? 'bg-teal text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t.icon} {t.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Formula list */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-400 font-inter text-sm py-12">
            {search ? 'No formulas match your search.' : 'No formulas for this topic yet.'}
          </div>
        ) : (
          filtered.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-slate-800 rounded-2xl p-4 space-y-2"
            >
              <h3 className="text-white font-outfit font-bold">{entry.name}</h3>
              <div className="bg-slate-900 rounded-xl px-4 py-3">
                <p className="text-teal font-outfit font-semibold text-base tracking-wide whitespace-pre-wrap">
                  {entry.formula}
                </p>
              </div>
              <p className="text-slate-400 text-sm font-inter">{entry.use}</p>
              {entry.example && (
                <p className="text-slate-400 text-xs font-inter border-t border-slate-700 pt-2">
                  e.g. {entry.example}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>

      <SeniorNav />
    </div>
  );
}
