import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const accent = '#D97706';
const levels = [
  { n: 6, title: 'Addition within 20', example: '"9 + 6 = ?"' },
  { n: 7, title: 'Subtraction within 20', example: '"15 – 7 = ?"' },
  { n: 8, title: 'Addition within 100', example: '"34 + 25 = ?"' },
  { n: 9, title: 'Times Tables ×2, ×5, ×10', example: '"5 × 6 = ?"' },
  { n: 10, title: 'Missing Number', example: '"? + 4 = 11"' },
];

export default function LowerPrimaryPage() {
  return (
    <div className="font-[Inter] min-h-screen text-gray-800" style={{ background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)' }}>
      <Navbar breadcrumb="Lower Primary" accentColor={accent} borderColor="#FDE68A"
        prevLink={{ href: '/preschool', label: 'Ages 3–5' }}
        nextLink={{ href: '/higher-primary', label: 'Ages 9–12' }} />

      {/* Back to home */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold no-underline hover:opacity-70 transition-opacity" style={{ color: accent }}>
          ← Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="py-12 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-4 py-1 rounded-full mb-6">
            🎯 Grades 1–3 | Ages 6–8
          </span>
          <h1 className="font-[Nunito] text-6xl font-extrabold leading-tight mb-6"
            style={{ background: `linear-gradient(135deg,${accent},#F59E0B)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Level Up Your Math Skills<br />Defeat Stronger Monsters
          </h1>
          <p className="text-xl max-w-xl mx-auto mb-8" style={{ color: '#92400E' }}>
            Addition, subtraction, and times tables become exciting battles. Earn XP, unlock gear, and save the kingdom.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/play?phase=2" className="font-[Nunito] inline-flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-md no-underline"
              style={{ background: accent }}>
              🎮 Play Lower Primary
            </Link>
            <Link to="/higher-primary" className="font-[Nunito] inline-flex items-center gap-2 bg-white border-2 px-8 py-4 rounded-full font-bold hover:scale-105 transition-all no-underline"
              style={{ borderColor: accent, color: accent }}>
              Next: Ages 9–12 →
            </Link>
          </div>
        </div>
      </section>

      {/* What they'll learn */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#B45309' }}>Master Key Math Concepts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '➕', title: 'Addition up to 100', desc: 'With carrying and mental math strategies.' },
            { icon: '➖', title: 'Subtraction up to 100', desc: 'No negative results — confidence building.' },
            { icon: '✖️', title: 'Times Tables (×2, ×5, ×10)', desc: 'Foundational multiplication skills.' },
            { icon: '❓', title: 'Missing Number Problems', desc: '"? + 4 = 11" — algebraic thinking starts here.' },
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
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#B45309' }}>Lower Primary Levels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map(l => (
            <div key={l.n} className="bg-white p-6 rounded-2xl shadow-sm" style={{ borderLeft: '4px solid #F59E0B' }}>
              <div className="font-[Nunito] text-2xl font-extrabold mb-2" style={{ color: accent }}>Level {l.n}</div>
              <strong>{l.title}</strong>
              <p className="text-gray-400 text-sm mt-2">{l.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parent tip */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl p-8 border-2 shadow-sm flex gap-6 flex-wrap md:flex-nowrap items-start" style={{ borderColor: '#FDE68A' }}>
          <div className="text-5xl shrink-0">👨‍👩‍👧</div>
          <div>
            <h2 className="font-[Nunito] text-2xl font-bold mb-2" style={{ color: '#B45309' }}>A Note for Parents &amp; Caregivers</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Children aged 6–8 are building independence but still benefit from encouragement nearby.
              Let them try each question on their own first — then discuss what they found tricky.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> Let them read the question themselves first</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> If stuck, ask "what do you already know?" not "the answer is…"</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> Celebrate effort, not just correct answers</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: accent }}>✓</span> 10–15 minutes per session works best for this age group</li>
            </ul>
            <div className="mt-4 flex gap-3 flex-wrap">
              <Link to="/play?phase=2" className="font-[Nunito] inline-flex items-center gap-2 text-white text-sm px-6 py-3 rounded-full font-bold no-underline hover:opacity-90 transition-opacity" style={{ background: accent }}>
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
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#B45309' }}>Parent‑Approved Safety</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🚫', title: 'No Ads', desc: 'Uninterrupted learning and play.' },
            { icon: '🔒', title: 'No Data Collection', desc: 'Zero personal information requested.' },
            { icon: '👨‍👩‍👧', title: 'Parental Gate', desc: 'You control purchases and external links.' },
            { icon: '📴', title: 'Offline Play', desc: 'Perfect for car rides and waiting rooms.' },
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
          <h2 className="font-[Nunito] text-3xl font-bold text-white mb-4">Ready for the next challenge?</h2>
          <p className="mb-6 opacity-90">Try Lower Primary levels right now in your browser.</p>
          <Link to="/play?phase=2" className="font-[Nunito] inline-flex items-center gap-2 bg-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all no-underline"
            style={{ color: accent }}>
            Play Now →
          </Link>
        </div>
      </section>

      <Footer edition="Lower Primary Edition" borderColor="#FDE68A" />
    </div>
  );
}
