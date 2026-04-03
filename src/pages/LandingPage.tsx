import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Sub-components ───────────────────────────────────────────────────────────

const FeatureCard = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div className="text-center p-8 bg-gray-50 rounded-3xl hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="font-[Nunito] text-2xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-500">{desc}</p>
  </div>
);

const SafetyItem = ({ badge, title, desc }: { badge: string; title: string; desc: string }) => (
  <div className="text-center p-6">
    <div className="text-4xl mb-3">{badge}</div>
    <h3 className="font-[Nunito] text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{desc}</p>
  </div>
);

// ─── Grade card data ───────────────────────────────────────────────────────────

const GRADES = [
  {
    phase: 1,
    emoji: '🌱',
    color: '#059669',
    bg: '#F0FDF4',
    border: '#6EE7B7',
    badge: 'Pre-School',
    ages: 'Ages 3–5',
    levels: 10,
    description: 'Counting, comparing, shapes, patterns & simple sums — perfect first steps.',
    topics: ['Counting 1–10', 'More or less', 'Addition within 5', 'Shapes & patterns'],
    detailLink: '/preschool',
    playLink: '/play?phase=1',
    tip: 'Sit with your child and read each question aloud.',
  },
  {
    phase: 2,
    emoji: '📚',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    badge: 'Lower Primary',
    ages: 'Ages 6–8',
    levels: 15,
    description: '3 worlds, 15 levels — numbers, money, time, multiplication, fractions & more.',
    topics: ['Numbers & operations', 'Money, time & place value', 'Multiply & divide', 'Fractions & perimeter'],
    detailLink: '/lower-primary',
    playLink: '/play?phase=2',
    tip: 'Let them try independently — stay nearby to celebrate!',
  },
  {
    phase: 3,
    emoji: '⚔️',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    badge: 'Higher Primary',
    ages: 'Ages 9–10',
    levels: 5,
    description: 'All times tables, division, fractions, and rounding.',
    topics: ['All times tables ×1–×12', 'Division basics', 'Simple fractions', 'Rounding'],
    detailLink: '/higher-primary',
    playLink: '/play?phase=3',
    tip: 'Give them space — check in after each level.',
  },
  {
    phase: 4,
    emoji: '🏆',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    badge: 'Advanced Primary',
    ages: 'Ages 11–12',
    levels: 5,
    description: 'Decimals, percentages, order of operations, and multi-step word problems.',
    topics: ['Fractions & decimals', 'Percentages', 'Order of operations (BODMAS)', 'Word problems'],
    detailLink: '/higher-primary',
    playLink: '/play?phase=4',
    tip: 'They can play fully independently at this stage.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

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
              { num: '25', label: 'Difficulty Levels' },
              { num: '4', label: 'Learning Phases' },
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

      {/* ── Features ── */}
      <section id="features" className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold text-center mb-12">Why Parents &amp; Kids Love It</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon="🧮" title="Adaptive Math"    desc="Problems scale automatically with your child's progress — from counting to percentages." />
            <FeatureCard icon="🐉" title="Companion Guide"  desc="Sparky the Dragon gives encouragement, hints, and reads questions aloud so non-readers can play." />
            <FeatureCard icon="🔒" title="100% Private"     desc="Zero data collection. No accounts. No ads. No tracking. COPPA/GDPR‑K compliant." />
            <FeatureCard icon="📴" title="Works Offline"    desc="No internet? No problem. Play anywhere — on a plane, in a car, or at the park." />
          </div>
        </div>
      </section>

      {/* ── Grade Cards ── */}
      <section id="grades" className="py-20 bg-gray-50 px-6">
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

      {/* ── Curriculum (compact) ── */}
      <section id="curriculum" className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold text-center mb-3">Curriculum‑Aligned Learning</h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-12">Following K–6 math standards across 35 levels and 4 phases</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GRADES.map(g => (
              <Link
                key={g.phase}
                to={g.detailLink}
                className="bg-gray-50 rounded-2xl p-6 no-underline text-gray-800 hover:-translate-y-1 hover:shadow-lg transition-all block"
                style={{ borderLeft: `4px solid ${g.color}` }}
              >
                <div className="font-[Nunito] font-extrabold text-xl mb-1">{g.emoji} {g.badge}</div>
                <div className="text-sm text-gray-400 mb-4">{g.ages}</div>
                <ul className="space-y-1">
                  {g.topics.map(t => (
                    <li key={t} className="text-sm flex items-center gap-2">
                      <span className="font-bold" style={{ color: g.color }}>✓</span> {t}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Safety ── */}
      <section id="safety" className="py-20 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold text-center mb-12">Designed with Safety First</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <SafetyItem badge="🚫" title="No Ads"            desc="Zero third‑party ad networks. No interruptions, ever." />
            <SafetyItem badge="🔐" title="No Data Collection" desc="We don't collect names, emails, location, or usage data." />
            <SafetyItem badge="👨‍👩‍👧" title="Parental Gate"    desc="Grade changes require a parent to solve a math puzzle first." />
            <SafetyItem badge="📜" title="COPPA & GDPR‑K"    desc="Fully compliant with child-privacy regulations worldwide." />
          </div>
        </div>
      </section>

      {/* ── Parents & Caregivers ── */}
      <section id="parents" className="py-20 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold text-center mb-3">For Parents &amp; Caregivers</h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-12">
            Young children learn best with a caring adult nearby. Here's everything you need to
            help your child get the most out of Math Adventure RPG.
          </p>

          {/* Age guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {GRADES.map(g => (
              <div
                key={g.phase}
                className="rounded-2xl p-6 border-2"
                style={{ background: g.bg, borderColor: g.border }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{g.emoji}</span>
                  <div>
                    <p className="font-[Nunito] font-black text-base" style={{ color: g.color }}>{g.badge}</p>
                    <p className="text-sm text-gray-500">{g.ages}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{g.tip}</p>
              </div>
            ))}
          </div>

          {/* Controls & tips grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Switching Grade Levels',
                body: 'Tap the lock icon ("Change") on the game start screen. You\'ll need to solve a short math puzzle — designed so young children can\'t accidentally change levels.',
              },
              {
                icon: '🔇',
                title: 'Audio Controls',
                body: 'The speaker icon mutes all music and sound effects. Audio narration (Sparky reading questions aloud) is also silenced — useful if the device is shared.',
              },
              {
                icon: '🏠',
                title: 'Getting Back Home',
                body: 'A Home button is always visible on the game screen. You can also use your browser\'s back button at any time — progress is automatically saved between sessions.',
              },
              {
                icon: '✅',
                title: 'Signs of Progress',
                body: 'Watch for: counting without fingers, recalling addition facts instantly, quick times table answers, and solving word problems independently.',
              },
              {
                icon: '🎯',
                title: 'Choosing the Right Level',
                body: 'Start at your child\'s current school year. If they find a level too easy, move up; if frustration sets in, drop down — the game adapts within each level too.',
              },
              {
                icon: '💬',
                title: 'Talking About the Game',
                body: 'Ask "How did Sparky help you today?" or "Which question was the trickiest?" Conversation deepens learning and keeps children motivated.',
              },
            ].map(tip => (
              <div key={tip.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl mb-3">{tip.icon}</div>
                <h3 className="font-[Nunito] text-lg font-bold mb-2 text-gray-800">{tip.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 text-center px-6" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold text-white mb-4">Ready to start the adventure?</h2>
          <p className="text-lg mb-8 opacity-90">No download. No sign‑up. Just pick a grade and play.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/play"
              className="font-[Nunito] inline-flex items-center gap-2 bg-white text-[#4F46E5] px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all no-underline"
            >
              🎮 Play Now
            </Link>
            <a
              href="#grades"
              className="font-[Nunito] inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 hover:bg-white/10 transition-all no-underline"
            >
              Choose a Grade
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
