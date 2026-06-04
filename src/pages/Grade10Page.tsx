import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Grade10Page() {
  return (
    <div className="font-[Inter] bg-gradient-to-br from-[#FFFBEB] to-[#ECFEFF] text-gray-800 min-h-screen">
      <Navbar breadcrumb="Grade 10" accentColor="#B45309" borderColor="#FCD34D" />

      <section className="py-16 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            Age 15 · CAPS FET Grade 10
          </span>
          <h1 className="font-[Nunito] text-5xl font-extrabold leading-tight mb-4"
            style={{ background: 'linear-gradient(135deg,#B45309,#0891B2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🏭 Grade 10<br />School of Foundations
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            The FET phase begins. Algebra and exponents, functions and patterns, trigonometry,
            analytical &amp; Euclidean geometry, finance and statistics — the foundation for matric.
          </p>
          <Link to="/play?phase=7"
            className="font-[Nunito] inline-flex items-center gap-2 bg-[#B45309] hover:bg-[#92400E] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg transition-all no-underline hover:scale-105">
            🏭 Enter Grade 10
          </Link>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '🏭', world: 'The Algebra Foundry', color: '#B45309', bg: '#FFFBEB', border: '#FCD34D',
              topics: ['Exponent laws & rational exponents', 'Factorising: difference of squares & trinomials', 'Simplifying algebraic fractions', 'Linear, quadratic & simultaneous equations'] },
            { emoji: '🔭', world: 'The Function Observatory', color: '#0891B2', bg: '#ECFEFF', border: '#67E8F9',
              topics: ['Linear number patterns (Tₙ)', 'Lines & parabolas: intercepts, turning points', 'Hyperbolas & exponentials: asymptotes', 'Simple & compound interest, growth & decay'] },
            { emoji: '🏰', world: 'The Geometry Citadel', color: '#4F46E5', bg: '#EEF2FF', border: '#A5B4FC',
              topics: ['Trig ratios & special angles', 'Analytical geometry: distance, midpoint, gradient', 'Euclidean geometry: angles & polygons', 'Statistics & probability'] },
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
