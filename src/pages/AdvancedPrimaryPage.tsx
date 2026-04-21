import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const accent = '#9F1239';

const world = {
  name: 'The Pinnacle',
  emoji: '🏔️',
  color: '#9F1239',
  bg: '#FFF1F2',
  border: '#FECDD3',
  levels: [
    { n: 1, title: 'Fraction Operations',        example: '"2/3 + 3/4 = ?"' },
    { n: 2, title: 'Decimal Arithmetic (2 d.p.)', example: '"1.25 × 4 = ?"' },
    { n: 3, title: 'Percentage Problems',         example: '"Price rises R80→R96 — what % increase?"' },
    { n: 4, title: 'BODMAS + Exponents',          example: '"3² + 4 × 5 − (6 ÷ 2) = ?"' },
    { n: 5, title: 'FINAL BOSS: Multi-Step',      example: '"Synthesis of all Pinnacle skills"' },
  ],
};

export default function AdvancedPrimaryPage() {
  return (
    <div className="font-[Inter] min-h-screen text-gray-800" style={{ background: 'linear-gradient(135deg,#FFF1F2,#FFE4E6)' }}>
      <Navbar breadcrumb="Advanced Primary" accentColor={accent} borderColor="#FECDD3"
        prevLink={{ href: '/higher-primary', label: 'Ages 9–12' }} />

      {/* Back to home */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold no-underline hover:opacity-70 transition-opacity" style={{ color: accent }}>
          ← Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="py-12 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-rose-100 text-rose-800 text-xs font-semibold px-4 py-1 rounded-full mb-6">
            🏆 Grades 6–7 | Ages 11–12
          </span>
          <h1 className="font-[Nunito] text-6xl font-extrabold leading-tight mb-6"
            style={{ background: `linear-gradient(135deg,${accent},#BE123C)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            The Pinnacle.<br />5 Levels. Final Boss.
          </h1>
          <p className="text-xl max-w-xl mx-auto mb-4" style={{ color: '#881337' }}>
            The ultimate challenge. Master fractions, decimals, percentages, BODMAS with exponents, and multi-step word problems to conquer The Pinnacle.
          </p>
          <div className="flex gap-3 justify-center flex-wrap mb-8">
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">🏔️ The Pinnacle</span>
            <span className="bg-rose-200 text-rose-900 text-xs font-bold px-3 py-1 rounded-full">🏆 Advanced Challenge</span>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/play?phase=4" className="font-[Nunito] inline-flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-md no-underline"
              style={{ background: accent }}>
              🎮 Play Advanced Primary
            </Link>
            <Link to="/higher-primary" className="font-[Nunito] inline-flex items-center gap-2 bg-white border-2 px-8 py-4 rounded-full font-bold hover:scale-105 transition-all no-underline"
              style={{ borderColor: accent, color: accent }}>
              ← Ages 9–12
            </Link>
          </div>
        </div>
      </section>

      {/* What they'll learn */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#881337' }}>Master Advanced Math Concepts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: '🔢', title: 'Fraction Operations',   desc: 'Add, subtract, multiply and simplify fractions with unlike denominators.' },
            { icon: '💰', title: 'Decimal Mastery',       desc: 'Two decimal place arithmetic including multiplication — essential for finance.' },
            { icon: '📈', title: 'Percentage Problems',   desc: 'Percentage increase/decrease and reverse percentage — real-world power skills.' },
            { icon: '🧮', title: 'BODMAS + Exponents',    desc: 'Deep nested brackets, squares, and cubes — secondary school readiness.' },
            { icon: '📖', title: 'Multi-Step Problems',   desc: 'Complex word problems synthesising all Pinnacle skills in one challenge.' },
            { icon: '👑', title: 'Final Boss Battle',     desc: 'Defeat the Pinnacle guardian using every skill you have mastered.' },
          ].map(c => (
            <div key={c.title} className="bg-white text-center p-6 rounded-3xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">{c.icon}</div>
              <h3 className="font-[Nunito] text-xl font-semibold mb-2">{c.title}</h3>
              <p className="text-gray-400 text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* World + Levels */}
      <section id="levels" className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#881337' }}>1 World · 5 Levels</h2>
        <div>
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
      </section>

      {/* Parent tip */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl p-8 border-2 shadow-sm flex gap-6 flex-wrap md:flex-nowrap items-start" style={{ borderColor: '#FECDD3' }}>
          <div className="text-5xl shrink-0">👨‍👩‍👧</div>
          <div>
            <h2 className="font-[Nunito] text-2xl font-bold mb-2" style={{ color: '#881337' }}>A Note for Parents &amp; Caregivers</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Ages 11–12 are fully independent learners. This stage bridges primary and secondary school mathematics,
              introducing abstract reasoning and multi-step problem solving that will serve them in secondary school.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> Ask "how did you work that out?" to develop metacognition</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> Connect percentages to discounts and interest rates in real life</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> 20–25 minutes daily builds the strongest recall at this age</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> Celebrate persistence — Advanced Primary is genuinely hard</li>
            </ul>
            <div className="mt-4 flex gap-3 flex-wrap">
              <Link to="/play?phase=4" className="font-[Nunito] inline-flex items-center gap-2 text-white text-sm px-6 py-3 rounded-full font-bold no-underline hover:opacity-90 transition-opacity" style={{ background: accent }}>
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
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#881337' }}>Trusted by Parents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🚫', title: 'No Ads',             desc: 'Never. Not one. Ever.' },
            { icon: '🔒', title: 'No Data Collection', desc: "Your child's privacy is absolute." },
            { icon: '👨‍👩‍👧', title: 'Parental Gate', desc: 'You stay in control of difficulty.' },
            { icon: '📴', title: '100% Offline',       desc: 'No internet required after loading.' },
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
          <h2 className="font-[Nunito] text-3xl font-bold text-white mb-4">Can you conquer The Pinnacle?</h2>
          <p className="mb-6 opacity-90">Start your Advanced Primary adventure in your browser — right now.</p>
          <Link to="/play?phase=4" className="font-[Nunito] inline-flex items-center gap-2 bg-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all no-underline"
            style={{ color: accent }}>
            Play Now →
          </Link>
        </div>
      </section>

      <Footer edition="Advanced Primary Edition" borderColor="#FECDD3" />
    </div>
  );
}
