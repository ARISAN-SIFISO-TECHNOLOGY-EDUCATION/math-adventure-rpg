import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GRADES } from '../data/grades';

const accent = '#4F46E5';

const PHASE_DETAIL = [
  {
    phase: 1,
    worlds: null,
    levels: [
      { n: 1,  topic: 'Count objects 1–5' },
      { n: 2,  topic: 'Count objects 1–10' },
      { n: 3,  topic: 'More or less (compare two numbers)' },
      { n: 4,  topic: 'Addition within 5' },
      { n: 5,  topic: 'Subtraction within 5' },
      { n: 6,  topic: 'Subitizing — recognise quantity at a glance' },
      { n: 7,  topic: 'Number bonds to 5' },
      { n: 8,  topic: 'Counting objects 11–20' },
      { n: 9,  topic: 'Shape Explorer — circles, squares, triangles' },
      { n: 10, topic: 'Pattern Detective — what comes next?' },
    ],
  },
  {
    phase: 2,
    worlds: ['Academy of Numbers', "Merchant's Guild", "Dragon's Tower"],
    levels: [
      { n: 1,  topic: 'Addition to 20' },
      { n: 2,  topic: 'Subtraction within 20' },
      { n: 3,  topic: 'Add & subtract to 100' },
      { n: 4,  topic: 'Times tables: ×2, ×5, ×10' },
      { n: 5,  topic: 'Missing number problems — BOSS' },
      { n: 6,  topic: 'Place value: tens & units' },
      { n: 7,  topic: 'Money: count coins & make change' },
      { n: 8,  topic: 'Time: read clocks & calculate hours' },
      { n: 9,  topic: 'Word problems — add & subtract' },
      { n: 10, topic: 'Doubles & halves — BOSS' },
      { n: 11, topic: 'Times tables: ×3, ×4, ×6' },
      { n: 12, topic: 'Division by sharing equally' },
      { n: 13, topic: 'Simple fractions: ½, ¼, ¾' },
      { n: 14, topic: 'Perimeter of rectangles' },
      { n: 15, topic: 'Multi-step word problems — FINAL BOSS' },
    ],
  },
  {
    phase: 3,
    worlds: ['Merchant Republic', "Engineers' Citadel", 'Storm Observatory'],
    levels: [
      { n: 1,  topic: 'Long multiplication (2-digit × 2-digit)' },
      { n: 2,  topic: 'Division with remainders' },
      { n: 3,  topic: 'Decimal add & subtract (1 d.p.)' },
      { n: 4,  topic: 'Percentages — 10% anchor method' },
      { n: 5,  topic: 'Multi-step money problems — BOSS' },
      { n: 6,  topic: 'Area of rectangles (m²)' },
      { n: 7,  topic: 'Simplify fractions to lowest terms' },
      { n: 8,  topic: 'Fractions with unlike denominators' },
      { n: 9,  topic: 'Ratio & proportion' },
      { n: 10, topic: 'Area, fractions & ratio combined — BOSS' },
      { n: 11, topic: 'Negative integers & number lines' },
      { n: 12, topic: 'Mean, median & mode' },
      { n: 13, topic: 'Algebra — solve for n' },
      { n: 14, topic: 'BODMAS with brackets' },
      { n: 15, topic: 'Multi-step synthesis — FINAL BOSS' },
    ],
  },
  {
    phase: 4,
    worlds: ['The Pinnacle'],
    levels: [
      { n: 1, topic: 'Fraction operations (unlike denominators)' },
      { n: 2, topic: 'Decimal arithmetic (2 d.p.) & multiplication' },
      { n: 3, topic: 'Percentage change & reverse percentage' },
      { n: 4, topic: 'BODMAS with exponents (squares & cubes)' },
      { n: 5, topic: 'Multi-step synthesis — FINAL BOSS' },
    ],
  },
];

export default function CurriculumPage() {
  return (
    <div className="font-[Inter] min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <Navbar breadcrumb="Curriculum" />

      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold no-underline hover:opacity-70 transition-opacity" style={{ color: accent }}>
          ← Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="py-16 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            K–6 aligned
          </span>
          <h1
            className="font-[Nunito] text-5xl font-extrabold leading-tight mb-5"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            45 Levels.<br />4 Phases.<br />One Complete Journey.
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            Every level is mapped to K–6 math standards. Progress is sequential — each level builds directly on the one before it.
          </p>
        </div>
      </section>

      {/* Phase overview strip */}
      <section className="pb-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GRADES.map(g => (
            <Link
              key={g.phase}
              to={g.detailLink}
              className="bg-white rounded-2xl p-6 no-underline text-gray-800 hover:-translate-y-1 hover:shadow-lg transition-all block border-2"
              style={{ borderColor: g.border }}
            >
              <div className="text-4xl mb-3">{g.emoji}</div>
              <div className="font-[Nunito] font-extrabold text-lg mb-1" style={{ color: g.color }}>{g.badge}</div>
              <div className="text-sm text-gray-400 mb-3">{g.ages} · {g.levels} levels</div>
              <ul className="space-y-1">
                {g.topics.map(t => (
                  <li key={t} className="text-xs flex items-center gap-2">
                    <span className="font-bold" style={{ color: g.color }}>✓</span> {t}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs font-bold" style={{ color: g.color }}>View full details →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Detailed level breakdown */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-center mb-12">Full Level Breakdown</h2>
          <div className="space-y-16">
            {PHASE_DETAIL.map((phase, pi) => {
              const g = GRADES[pi];
              return (
                <div key={phase.phase}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl">{g.emoji}</div>
                    <div>
                      <h3 className="font-[Nunito] text-2xl font-extrabold" style={{ color: g.color }}>{g.badge}</h3>
                      <p className="text-gray-400 text-sm">{g.ages}{phase.worlds ? ` · ${phase.worlds.join(' → ')}` : ''}</p>
                    </div>
                    <Link to={g.playLink} className="ml-auto font-[Nunito] text-sm font-bold text-white px-5 py-2 rounded-full no-underline hover:opacity-90 transition-opacity" style={{ background: g.color }}>
                      🎮 Play
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {phase.levels.map(l => {
                      const isBoss = l.topic.includes('BOSS');
                      return (
                        <div
                          key={l.n}
                          className="p-4 rounded-xl border-2 flex items-start gap-3"
                          style={{ background: isBoss ? g.bg : '#F9FAFB', borderColor: isBoss ? g.color : '#E5E7EB' }}
                        >
                          <span className="font-[Nunito] font-extrabold text-sm shrink-0 w-8" style={{ color: g.color }}>L{l.n}</span>
                          <span className="text-sm text-gray-700">{l.topic}</span>
                          {isBoss && <span className="ml-auto text-base shrink-0">👑</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Approach section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-center mb-12">Our Curriculum Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📈', title: 'Spiral Learning', desc: 'Concepts reappear at higher levels — addition at Pre-School, mental addition at Lower Primary, decimal addition at Higher Primary. Each revisit deepens mastery.' },
              { icon: '🎯', title: 'Mastery Before Advancement', desc: 'Children must answer 5 correct (7 for boss levels) before advancing. Partial understanding doesn\'t unlock the next level.' },
              { icon: '🌍', title: 'Real-World Contexts', desc: 'Problems use shopping, temperature, time, recipes, and sports results — not abstract x\'s and y\'s — so children understand why math matters.' },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{c.icon}</div>
                <h3 className="font-[Nunito] text-xl font-bold mb-3">{c.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-white mb-4">Start at the right level today.</h2>
          <p className="mb-8 opacity-90 text-lg">No download. No sign-up. Just pick a grade and play.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/play" className="font-[Nunito] inline-flex items-center gap-2 bg-white text-[#4F46E5] px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all no-underline">
              🎮 Play Now
            </Link>
            <Link to="/parents" className="font-[Nunito] inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 hover:bg-white/10 transition-all no-underline">
              Parent Guide →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
