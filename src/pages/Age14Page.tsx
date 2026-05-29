import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Age14Page() {
  return (
    <div className="font-[Inter] bg-gradient-to-br from-[#F0F9FF] to-[#F0FDFA] text-gray-800 min-h-screen">
      <Navbar breadcrumb="Age 14" accentColor="#0369A1" borderColor="#7DD3FC" />

      <section className="py-16 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-sky-100 text-sky-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            Age 14 · Advanced Secondary
          </span>
          <h1 className="font-[Nunito] text-5xl font-extrabold leading-tight mb-4"
            style={{ background: 'linear-gradient(135deg,#0369A1,#0F766E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🎓 Age 14<br />Adventure
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            Advanced algebra, transformations on the coordinate plane, financial maths, and data analysis —
            all wrapped in the same adventure format.
          </p>
          <Link to="/play?phase=6"
            className="font-[Nunito] inline-flex items-center gap-2 bg-[#0369A1] hover:bg-[#025587] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg transition-all no-underline hover:scale-105">
            🧪 Enter Age 14
          </Link>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '🧪', world: 'The Algebra Lab', color: '#0369A1', bg: '#F0F9FF', border: '#BAE6FD',
              topics: ['Exponent laws (product, quotient, power)', 'Zero and negative exponents', 'Trinomial factorising', 'Financial maths: VAT & hire purchase'] },
            { emoji: '⚔️', world: 'The Proof Chamber', color: '#059669', bg: '#F0FDF4', border: '#6EE7B7',
              topics: ['Translations by vector', 'Reflections over axes and y=x', 'Rotations 90° and 180°', 'Congruency conditions: SAS, SSS, AAS, RHS'] },
            { emoji: '🔭', world: 'The Data Observatory', color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD',
              topics: ['Five-number summary & IQR', 'Compound shape areas', 'Tree diagrams & compound probability', 'Exchange rates & ratio sharing'] },
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
