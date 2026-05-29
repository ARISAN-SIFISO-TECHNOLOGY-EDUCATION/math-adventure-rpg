import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SecondaryPage() {
  return (
    <div className="font-[Inter] bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] text-gray-800 min-h-screen">
      <Navbar breadcrumb="Secondary" accentColor="#4338CA" borderColor="#A5B4FC" />

      <section className="py-16 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            Ages 13–14 · CAPS Grade 8–9
          </span>
          <h1 className="font-[Nunito] text-5xl font-extrabold leading-tight mb-4"
            style={{ background: 'linear-gradient(135deg,#4338CA,#6D28D9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🧠 Secondary<br />Phase
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            Grade 8–9 CAPS content — algebra, Pythagoras, parallel lines, probability and data.
            Same adventure format, secondary-school difficulty.
          </p>
          <Link to="/play?phase=5"
            className="font-[Nunito] inline-flex items-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg transition-all no-underline hover:scale-105">
            ⚔️ Enter Phase 5
          </Link>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { emoji: '⚔️', world: 'The Iron Citadel', color: '#4338CA', bg: '#EEF2FF', border: '#A5B4FC',
              topics: ['Algebraic substitution', 'Expanding double brackets', 'Factorising', 'Complex equations'] },
            { emoji: '⚡', world: 'The Storm Fortress', color: '#0F766E', bg: '#F0FDFA', border: '#99F6E4',
              topics: ['Pythagoras theorem', 'Find the shorter side', 'Parallel line angles', 'Straight line functions'] },
            { emoji: '🔮', world: "The Oracle's Nexus", color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE',
              topics: ['Scientific notation', 'Integer operations', 'Probability', 'Quartiles & IQR'] },
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
