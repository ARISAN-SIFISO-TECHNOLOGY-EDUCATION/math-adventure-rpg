import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const accent = '#059669';
const levels = [
  { n: 1, title: 'Count objects (1–5)', example: '"How many stars? ⭐⭐⭐"' },
  { n: 2, title: 'Count objects (1–10)', example: '"How many monsters? 🐉🐉🐉🐉"' },
  { n: 3, title: 'More or less', example: '"Which is more: 3 or 7?"' },
  { n: 4, title: 'Addition within 5', example: '"2 + 1 = ?"' },
  { n: 5, title: 'Subtraction within 5', example: '"4 – 2 = ?"' },
];

export default function PreSchoolPage() {
  return (
    <div className="font-[Inter] min-h-screen text-gray-800" style={{ background: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)' }}>
      <Navbar breadcrumb="Pre‑School" accentColor={accent} borderColor="#D1FAE5"
        nextLink={{ href: '/lower-primary', label: 'Ages 6–8' }} />

      {/* Back to home */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold no-underline hover:opacity-70 transition-opacity" style={{ color: accent }}>
          ← Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="py-12 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-4 py-1 rounded-full mb-6">
            🎯 Perfect for Pre‑School & Kindergarten
          </span>
          <h1 className="font-[Nunito] text-6xl font-extrabold leading-tight mb-6"
            style={{ background: `linear-gradient(135deg,${accent},#10B981)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            First Math Adventures<br />for Little Heroes
          </h1>
          <p className="text-xl text-emerald-800 max-w-xl mx-auto mb-8">
            Your child will learn counting, comparing, shapes, patterns, and basic math — all while playing a fun, gentle fantasy game.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/play?phase=1" className="font-[Nunito] inline-flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-md no-underline"
              style={{ background: accent }}>
              🎮 Play Pre‑School
            </Link>
            <Link to="/lower-primary" className="font-[Nunito] inline-flex items-center gap-2 bg-white border-2 text-emerald-700 px-8 py-4 rounded-full font-bold hover:bg-emerald-50 hover:scale-105 transition-all no-underline"
              style={{ borderColor: accent }}>
              Next: Ages 6–8 →
            </Link>
          </div>
        </div>
      </section>

      {/* What they'll learn */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#065F46' }}>What They'll Learn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🔢', title: 'Counting 1–10', desc: 'Count stars, monsters, and treasure with visual feedback.' },
            { icon: '⚖️', title: 'More or Less', desc: 'Compare numbers and choose the bigger or smaller group.' },
            { icon: '➕', title: 'Simple Addition', desc: 'Sums up to 5 using pictures and friendly characters.' },
            { icon: '➖', title: 'Simple Subtraction', desc: 'Taking away within 5 — no negative numbers, no frustration.' },
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
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#065F46' }}>Levels in Pre‑School Phase</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map(l => (
            <div key={l.n} className="bg-white p-6 rounded-2xl shadow-sm" style={{ borderLeft: `4px solid #10B981` }}>
              <div className="font-[Nunito] text-2xl font-extrabold mb-2" style={{ color: accent }}>Level {l.n}</div>
              <strong>{l.title}</strong>
              <p className="text-gray-400 text-sm mt-2">{l.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parent tip */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl p-8 border-2 border-emerald-200 shadow-sm flex gap-6 flex-wrap md:flex-nowrap items-start">
          <div className="text-5xl shrink-0">👨‍👩‍👧</div>
          <div>
            <h2 className="font-[Nunito] text-2xl font-bold mb-2" style={{ color: '#065F46' }}>A Note for Parents &amp; Caregivers</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Children aged 3–5 cannot yet read independently. <strong>Sit beside your child</strong> and read each question aloud.
              The companion dragon Sparky will also read questions, but your voice and encouragement make the biggest difference.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><span className="text-emerald-600 font-bold">✓</span> Point at each object together as you count</li>
              <li className="flex gap-2"><span className="text-emerald-600 font-bold">✓</span> Let your child tap the answer — resist jumping in too fast</li>
              <li className="flex gap-2"><span className="text-emerald-600 font-bold">✓</span> Praise the attempt, not just correct answers</li>
              <li className="flex gap-2"><span className="text-emerald-600 font-bold">✓</span> 5–10 minutes per session is plenty for this age group</li>
            </ul>
            <div className="mt-4 flex gap-3 flex-wrap">
              <Link to="/play?phase=1" className="font-[Nunito] inline-flex items-center gap-2 text-white text-sm px-6 py-3 rounded-full font-bold no-underline hover:opacity-90 transition-opacity" style={{ background: accent }}>
                🎮 Start Playing Together
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
        <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10" style={{ color: '#065F46' }}>Safe for Your Little One</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: '🚫', title: 'No Ads Ever', desc: 'Zero interruptions. Zero inappropriate content.' },
            { icon: '🔒', title: 'No Data Collection', desc: "We don't ask for names, emails, or location." },
            { icon: '👪', title: 'Parental Gate', desc: 'Purchases and links require parent approval.' },
            { icon: '📴', title: 'Works Offline', desc: 'No internet? No problem. Play anywhere.' },
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
          <h2 className="font-[Nunito] text-3xl font-bold text-white mb-4">Ready to start the adventure?</h2>
          <p className="mb-6 opacity-90">Try the Pre‑School levels right now in your browser.</p>
          <Link to="/play?phase=1" className="font-[Nunito] inline-flex items-center gap-2 bg-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all no-underline"
            style={{ color: accent }}>
            Play Now →
          </Link>
        </div>
      </section>

      <Footer edition="Pre‑School Edition" borderColor="#D1FAE5" />
    </div>
  );
}
