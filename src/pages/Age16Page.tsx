import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Age16Page() {
  return (
    <div className="font-[Inter] bg-gradient-to-br from-[#FEF2F2] to-[#F0FDFA] text-gray-800 min-h-screen">
      <Navbar breadcrumb="Age 16" accentColor="#B91C1C" borderColor="#FCA5A5" />

      <section className="py-16 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            Age 16 · School of Systems
          </span>
          <h1 className="font-[Nunito] text-5xl font-extrabold leading-tight mb-4"
            style={{ background: 'linear-gradient(135deg,#B91C1C,#0F766E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🛰️ Age 16<br />School of Systems
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            Deepen the senior-phase skills. Surds and quadratics, the nature of roots, shifted functions,
            analytical geometry, the trig rules, circle geometry, and statistics.
          </p>
          <Link to="/senior/topics/16"
            className="font-[Nunito] inline-flex items-center gap-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg transition-all no-underline hover:scale-105">
            🛰️ Enter the Academy
          </Link>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '⚒️', world: 'The Quadratic Forge', color: '#B91C1C', bg: '#FEF2F2', border: '#FCA5A5',
              topics: ['Exponents & surds', 'Quadratic equations: factorising & the formula', 'Discriminant & nature of roots', 'Quadratic number patterns'] },
            { emoji: '🗼', world: 'The Analytical Tower', color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD',
              topics: ['Quadratic functions in turning-point form', 'Hyperbola & exponential shifts', 'Parallel & perpendicular lines', 'Compound depreciation & growth'] },
            { emoji: '📐', world: 'The Trigon Sanctum', color: '#0F766E', bg: '#F0FDFA', border: '#99F6E4',
              topics: ['Trig identities & reduction formulae', 'Sine, cosine & area rules', 'Circle geometry & measurement', 'Probability: tree diagrams & spread'] },
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
