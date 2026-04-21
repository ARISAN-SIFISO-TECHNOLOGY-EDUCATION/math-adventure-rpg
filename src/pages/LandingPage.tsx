import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GRADES } from '../data/grades';

export default function LandingPage() {
  return (
    <div className="font-[Inter] bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="py-20 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            No ads · No accounts · 100% offline
          </span>
          <h1
            className="font-[Nunito] text-6xl font-extrabold leading-tight mb-6"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Learn Math.<br />Slay Monsters.<br />Save the Kingdom.
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto mb-8">
            A turn‑based educational RPG for kids ages 3–12. Solve math problems to defeat
            enemies, earn coins, and progress through a magical world — guided by Sparky the Dragon.
          </p>
          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <Link
              to="/play"
              className="font-[Nunito] inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] hover:scale-105 text-white px-8 py-4 rounded-full font-bold text-base shadow-lg transition-all no-underline"
            >
              🎮 Play Now — It's Free
            </Link>
            <a
              href="#grades"
              className="font-[Nunito] inline-flex items-center gap-2 bg-white border-2 border-[#4F46E5] text-[#4F46E5] hover:bg-indigo-50 hover:scale-105 px-8 py-4 rounded-full font-bold text-base transition-all no-underline"
            >
              📖 Choose a Grade
            </a>
          </div>
          <div className="flex justify-center gap-12 flex-wrap">
            {[
              { num: '45', label: 'Difficulty Levels' },
              { num: '4',  label: 'Learning Phases' },
              { num: '100%', label: 'Offline & Ad‑Free' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-[Nunito] font-extrabold text-[#4F46E5]">{s.num}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grade Cards ── */}
      <section id="grades" className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold text-center mb-3">Choose Your Grade</h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-12">
            Tap a grade to jump straight into the right level for your child. You can switch any
            time inside the game using the parental lock.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GRADES.map(g => (
              <div
                key={g.phase}
                className="flex flex-col rounded-3xl border-2 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
                style={{ background: g.bg, borderColor: g.border }}
              >
                {/* Card header */}
                <div className="p-6 flex-1">
                  <div className="text-5xl mb-3">{g.emoji}</div>
                  <span
                    className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full text-white mb-3 inline-block"
                    style={{ background: g.color }}
                  >
                    {g.badge}
                  </span>
                  <p className="text-sm font-semibold text-gray-500 mb-3">{g.ages} · {g.levels} levels</p>
                  <p className="text-sm text-gray-600 mb-4">{g.description}</p>
                  <ul className="space-y-1 mb-4">
                    {g.topics.map(t => (
                      <li key={t} className="text-xs flex items-center gap-2 text-gray-600">
                        <span className="font-bold" style={{ color: g.color }}>✓</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Card actions */}
                <div className="p-4 pt-0 flex flex-col gap-2">
                  <Link
                    to={g.playLink}
                    className="font-[Nunito] text-center text-white text-sm font-black py-3 px-4 rounded-2xl no-underline hover:opacity-90 transition-opacity"
                    style={{ background: g.color }}
                  >
                    🎮 Play This Grade
                  </Link>
                  <Link
                    to={g.detailLink}
                    className="font-[Nunito] text-center text-sm font-bold py-2 px-4 rounded-2xl no-underline hover:bg-white/60 transition-colors"
                    style={{ color: g.color }}
                  >
                    View Curriculum →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
