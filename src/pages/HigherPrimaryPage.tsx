import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const accent = '#7C3AED';

const worlds = [
  {
    name: 'World 1 — Merchant Republic',
    emoji: '🏦',
    color: '#0EA5E9',
    bg: '#F0F9FF',
    border: '#7DD3FC',
    levels: [
      { n: 1, title: 'Long Multiplication (2-digit × 2-digit)', example: '"23 × 14 = ?"' },
      { n: 2, title: 'Division with Remainders',                example: '"29 ÷ 4 = ? remainder ?"' },
      { n: 3, title: 'Decimal Operations',                      example: '"4.7 + 3.5 = ?"' },
      { n: 4, title: 'Percentages (10% method)',                example: '"20% of 80 = ?"' },
      { n: 5, title: 'BOSS: Multi-step Money',                  example: '"4 items at R12.50 with 10% off — total?"' },
    ],
  },
  {
    name: "World 2 — Engineers' Citadel",
    emoji: '🏗️',
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#86EFAC',
    levels: [
      { n: 6,  title: 'Area of Rectangles & Squares',        example: '"Room 8 m × 5 m — area in m²?"' },
      { n: 7,  title: 'Simplifying Fractions',               example: '"Simplify 6/8"' },
      { n: 8,  title: 'Fractions: Unlike Denominators',      example: '"1/2 + 1/4 = ?"' },
      { n: 9,  title: 'Ratio & Proportion',                  example: '"2:3 ratio — 6 red, how many blue?"' },
      { n: 10, title: 'BOSS: Area + Fraction + Ratio',       example: '"Floor 6 m × 4 m, 3/4 tiled at R85/m²"' },
    ],
  },
  {
    name: 'World 3 — Storm Observatory',
    emoji: '🌩️',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#C4B5FD',
    levels: [
      { n: 11, title: 'Negative Integers',            example: '"−3°C drops 5° = ?"' },
      { n: 12, title: 'Mean, Median & Mode',          example: '"Scores: 7,8,6,9,5 — mean = ?"' },
      { n: 13, title: 'Algebraic Equations',          example: '"n + 7 = 15 → n = ?"' },
      { n: 14, title: 'Advanced BODMAS',              example: '"(8 + 4) × 3 − 6 = ?"' },
      { n: 15, title: 'FINAL BOSS: Storm Warden',     example: '"Multi-step synthesis of all 3 worlds"' },
    ],
  },
];

export default function HigherPrimaryPage() {
  return (
    <div className="font-[Inter] min-h-screen text-gray-800" style={{ background: 'linear-gradient(135deg,#F3E8FF,#E9D5FF)' }}>
      <Navbar breadcrumb="Higher Primary" accentColor={accent} borderColor="#DDD6FE"
        prevLink={{ href: '/lower-primary', label: 'Ages 6–8' }} />

      {/* Back to home */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold no-underline hover:opacity-70 transition-opacity" style={{ color: accent }}>
          ← Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="py-12 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-violet-100 text-violet-800 text-xs font-semibold px-4 py-1 rounded-full mb-6">
            🎯 Grades 4–6 | Ages 9–12
          </span>
          <h1 className="font-[Nunito] text-6xl font-extrabold leading-tight mb-6"
            style={{ background: `linear-gradient(135deg,${accent},#8B5CF6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            3 Worlds.<br />15 Levels. Final Boss.
          </h1>
          <p className="text-xl max-w-xl mx-auto mb-4" style={{ color: '#4C1D95' }}>
            Journey through the Merchant Republic, the Engineers' Citadel, and the Storm Observatory. Defeat three bosses to become a Higher Primary champion.
          </p>
          <div className="flex gap-3 justify-center flex-wrap mb-8">
            <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full">🏦 Merchant Republic</span>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">🏗️ Engineers' Citadel</span>
            <span className="bg-violet-100 text-violet-800 text-xs font-bold px-3 py-1 rounded-full">🌩️ Storm Observatory</span>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/play?phase=3" className="font-[Nunito] inline-flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-md no-underline"
              style={{ background: accent }}>
              🎮 Play Higher Primary
            </Link>
            <Link to="/play?phase=4" className="font-[Nunito] inline-flex items-center gap-2 bg-white border-2 px-8 py-4 rounded-full font-bold hover:scale-105 transition-all no-underline"
              style={{ borderColor: accent, color: accent }}>
              🏆 Play Advanced →
            </Link>
          </div>
        </div>
      </section>

      {/* What they'll learn */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#5B21B6' }}>Master Key Math Concepts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: '🏦', title: 'Commerce Maths',        desc: 'Long multiplication, remainders, decimals, percentages, and money problems.' },
            { icon: '🏗️', title: 'Measurement & Shapes', desc: 'Area, equivalent fractions, unlike-denominator arithmetic, and ratio.' },
            { icon: '🌩️', title: 'Data & Algebra',       desc: 'Negative numbers, mean/median/mode, solving equations, and BODMAS.' },
            { icon: '👑', title: '3 Boss Battles',        desc: 'Each world ends with a boss challenge that tests everything you have learned.' },
            { icon: '📊', title: 'Real-World Contexts',  desc: 'Markets, blueprints, weather data — maths that means something.' },
            { icon: '🧠', title: 'Algebraic Thinking',   desc: 'Solve for n — building the bridge to secondary school algebra.' },
          ].map(c => (
            <div key={c.title} className="bg-white text-center p-6 rounded-3xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">{c.icon}</div>
              <h3 className="font-[Nunito] text-xl font-semibold mb-2">{c.title}</h3>
              <p className="text-gray-400 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Worlds + Levels */}
      <section id="levels" className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#5B21B6' }}>3 Worlds · 15 Levels</h2>
        <div className="flex flex-col gap-10">
          {worlds.map(world => (
            <div key={world.name}>
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="text-3xl">{world.emoji}</div>
                <h3 className="font-[Nunito] text-xl font-extrabold" style={{ color: world.color }}>{world.name}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {world.levels.map(l => (
                  <div key={l.n} className="bg-white p-5 rounded-2xl shadow-sm" style={{ borderLeft: `4px solid ${world.color}` }}>
                    <div className="font-[Nunito] text-xl font-extrabold mb-1" style={{ color: world.color }}>Level {l.n}</div>
                    <strong className="text-sm">{l.title}</strong>
                    <p className="text-gray-400 text-xs mt-1">{l.example}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Parent tip */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl p-8 border-2 shadow-sm flex gap-6 flex-wrap md:flex-nowrap items-start" style={{ borderColor: '#DDD6FE' }}>
          <div className="text-5xl shrink-0">👨‍👩‍👧</div>
          <div>
            <h2 className="font-[Nunito] text-2xl font-bold mb-2" style={{ color: '#5B21B6' }}>A Note for Parents &amp; Caregivers</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Ages 9–12 can play independently, but a quick check-in after each level deepens learning.
              This stage introduces abstract concepts — fractions, algebra, and data — that benefit from
              short real-world conversations.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> Ask "which question was trickiest?" to surface misconceptions</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> For percentages, connect to real discounts: "20% off R80 — let's check together"</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> 15–20 minutes daily builds strong recall over time</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> Use the parental gate to keep them in the right challenge zone</li>
            </ul>
            <div className="mt-4 flex gap-3 flex-wrap">
              <Link to="/play?phase=3" className="font-[Nunito] inline-flex items-center gap-2 text-white text-sm px-6 py-3 rounded-full font-bold no-underline hover:opacity-90 transition-opacity" style={{ background: accent }}>
                🎮 Start Playing
              </Link>
              <Link to="/#parents" className="font-[Nunito] inline-flex items-center gap-2 text-sm px-6 py-3 rounded-full font-bold no-underline border-2 hover:opacity-80 transition-opacity" style={{ borderColor: accent, color: accent }}>
                Full Parent Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#5B21B6' }}>Trusted by Parents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🚫', title: 'No Ads',              desc: 'Never. Not one. Ever.' },
            { icon: '🔒', title: 'No Data Collection',  desc: "Your child's privacy is absolute." },
            { icon: '👨‍👩‍👧', title: 'Parental Gate',  desc: 'You stay in control of difficulty.' },
            { icon: '📴', title: '100% Offline',        desc: 'No internet required after loading.' },
          ].map(s => (
            <div key={s.title} className="bg-white text-center p-6 rounded-3xl shadow-sm">
              <div className="text-5xl mb-4">{s.icon}</div>
              <h3 className="font-[Nunito] text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="text-center py-16 px-6" style={{ background: accent, color: 'white' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-white mb-4">Can you defeat the Storm Warden?</h2>
          <p className="mb-6 opacity-90">Start your Higher Primary adventure in your browser — right now.</p>
          <Link to="/play?phase=3" className="font-[Nunito] inline-flex items-center gap-2 bg-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all no-underline"
            style={{ color: accent }}>
            Play Now →
          </Link>
        </div>
      </section>

      <Footer edition="Higher Primary Edition" borderColor="#DDD6FE" />
    </div>
  );
}
