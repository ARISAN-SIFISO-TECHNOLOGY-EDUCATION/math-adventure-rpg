import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Age17Page() {
  return (
    <div className="font-[Inter] bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] text-gray-800 min-h-screen">
      <Navbar breadcrumb="Age 17" accentColor="#1D4ED8" borderColor="#93C5FD" />

      <section className="py-16 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            Age 17 · School of Thinkers
          </span>
          <h1 className="font-[Nunito] text-5xl font-extrabold leading-tight mb-4"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#6D28D9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🧩 Age 17<br />School of Thinkers
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            The summit. Sequences and series, financial maths, differential calculus,
            the equation of a circle, compound-angle trigonometry, and statistics — the final apex.
          </p>
          <Link to="/senior/topics/17"
            className="font-[Nunito] inline-flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg transition-all no-underline hover:scale-105">
            🧩 Enter the Academy
          </Link>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '🌀', world: 'The Sequence Spire', color: '#1D4ED8', bg: '#EFF6FF', border: '#93C5FD',
              topics: ['Arithmetic sequences & series', 'Geometric & infinite series', 'Sigma notation', 'Finance: future/present value & loans'] },
            { emoji: '🧮', world: 'The Calculus Crucible', color: '#C2410C', bg: '#FFF7ED', border: '#FDBA74',
              topics: ['Functions, inverses & logarithms', 'Limits & first principles', 'Differentiation & stationary points', 'Tangents, rates & optimisation'] },
            { emoji: '🏔️', world: 'The Apex Observatory', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE',
              topics: ['Equation of a circle & its tangent', 'Compound & double angle identities', 'Proportionality & similar triangles', 'Counting principle & correlation'] },
          ].map(w => (
            <div key={w.world} className="rounded-3xl border-2 p-6 shadow-sm" style={{ background: w.bg, borderColor: w.border }}>
              <div className="text-4xl mb-3">{w.emoji}</div>
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full text-white mb-3 inline-block"
                style={{ background: w.color }}>{w.world}</span>
              <ul className="mt-3 space-y-1">
                {w.topics.map(t => (
                  <li key={t} className="text-sm flex items-center gap-2 text-gray-600">
                    <span className="font-bold" style={{ color: w.color }}>✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
