import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const accent = '#7C3AED';
const levels = [
  { n: 11, title: 'All Times Tables (×1–×12)', example: '"7 × 8 = ?"' },
  { n: 12, title: 'Division Basics', example: '"36 ÷ 4 = ?"' },
  { n: 13, title: 'Simple Fractions', example: '"½ of 20 = ?"' },
  { n: 14, title: 'Word Problems (add/sub)', example: '"Sara had 45 sweets, gave away 18..."' },
  { n: 15, title: 'Rounding to 10s/100s', example: '"Round 347 to the nearest 10"' },
  { n: 16, title: 'Fraction Operations', example: '"¾ + ½ = ?"' },
  { n: 17, title: 'Decimals', example: '"1.5 + 2.3 = ?"' },
  { n: 18, title: 'Percentages', example: '"20% of 60 = ?"' },
  { n: 19, title: 'Order of Operations', example: '"3 + 4 × 2 = ?"' },
  { n: 20, title: 'Multi‑Step Word Problems', example: '"A bag costs R45. You buy 3. Change from R200?"' },
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
            Advanced Math Quests<br />Epic Boss Battles
          </h1>
          <p className="text-xl max-w-xl mx-auto mb-8" style={{ color: '#4C1D95' }}>
            Fractions, decimals, percentages, order of operations, and multi-step word problems. Master them all to defeat the final bosses.
          </p>
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
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#5B21B6' }}>Conquer Higher Math</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🧮', title: 'Fractions & Decimals', desc: 'Add, subtract, and compare fractions and decimals.' },
            { icon: '%', title: 'Percentages', desc: 'Calculate percentages of numbers — real-world skills.' },
            { icon: '⚙️', title: 'Order of Operations', desc: 'PEMDAS/BODMAS mastery through battle puzzles.' },
            { icon: '📖', title: 'Multi‑Step Word Problems', desc: 'Realistic scenarios: change from purchase, area, etc.' },
          ].map(c => (
            <div key={c.title} className="bg-white text-center p-6 rounded-3xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">{c.icon}</div>
              <h3 className="font-[Nunito] text-xl font-semibold mb-2">{c.title}</h3>
              <p className="text-gray-400 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Levels */}
      <section id="levels" className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#5B21B6' }}>Higher Primary Levels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map(l => (
            <div key={l.n} className="bg-white p-6 rounded-2xl shadow-sm" style={{ borderLeft: '4px solid #8B5CF6' }}>
              <div className="font-[Nunito] text-2xl font-extrabold mb-2" style={{ color: accent }}>Level {l.n}</div>
              <strong>{l.title}</strong>
              <p className="text-gray-400 text-sm mt-2">{l.example}</p>
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
              Children aged 9–12 can play independently, but benefit from parents who ask questions
              and celebrate progress. This stage introduces abstract concepts — a quick chat after each
              level helps cement the learning.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> Ask "which question was the trickiest?" after each session</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> For fractions/percentages, connect to real life ("20% off a R50 item")</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> 15–20 minutes per session, ideally daily, builds strong recall</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> Use the grade change lock to keep them in the right challenge zone</li>
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
            { icon: '🚫', title: 'No Ads', desc: 'Never. Not one. Ever.' },
            { icon: '🔒', title: 'No Data Collection', desc: "Your child's privacy is absolute." },
            { icon: '👨‍👩‍👧', title: 'Parental Gate', desc: 'You stay in control of purchases.' },
            { icon: '📴', title: '100% Offline', desc: 'No internet required after download.' },
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
          <h2 className="font-[Nunito] text-3xl font-bold text-white mb-4">The final challenge awaits.</h2>
          <p className="mb-6 opacity-90">Try Higher Primary levels right now in your browser.</p>
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
