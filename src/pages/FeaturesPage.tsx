import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const accent = '#4F46E5';

const FEATURES = [
  {
    icon: '🧮',
    title: 'Adaptive Math',
    desc: 'Problems scale automatically with your child\'s progress — from counting stars at age 3 to solving BODMAS equations at age 12.',
  },
  {
    icon: '🐉',
    title: 'Companion Guide',
    desc: 'Sparky the Dragon gives encouragement, hints, and reads every question aloud. Ages 6+ can play independently; ages 3–5 play best alongside a parent.',
  },
  {
    icon: '🔒',
    title: '100% Private',
    desc: 'Zero data collection. No accounts. No ads. No tracking. Fully compliant with COPPA and GDPR-K child privacy regulations.',
  },
  {
    icon: '📴',
    title: 'Works Offline',
    desc: 'No internet? No problem. Play anywhere — on a plane, in a car, or at the park. Everything runs locally on your device.',
  },
  {
    icon: '🏆',
    title: 'RPG Progression',
    desc: 'Earn coins, defeat monster bosses, and unlock new worlds. The game structure keeps children motivated far beyond a worksheet.',
  },
  {
    icon: '🔥',
    title: 'Daily Streaks',
    desc: 'Streak badges reward consistent daily play — the single strongest predictor of long-term math improvement.',
  },
  {
    icon: '💡',
    title: 'Explanatory Feedback',
    desc: 'After two wrong attempts the correct answer is revealed with a targeted hint — children learn from mistakes, not just failures.',
  },
  {
    icon: '🗣️',
    title: 'Voice Narration',
    desc: 'Every question is read aloud — fractions, decimals, word problems. Pre-readers and children with dyslexia play on equal footing.',
  },
];

const SAFETY = [
  { badge: '🚫', title: 'No Ads — Ever',        desc: 'Zero third-party ad networks. No interstitials, no banners, no interruptions.' },
  { badge: '🔐', title: 'No Data Collection',    desc: 'We collect nothing. No names, emails, location, or usage data — not even anonymised.' },
  { badge: '👨‍👩‍👧', title: 'Parental Gate',       desc: 'Grade changes require a parent to solve a math problem — young children cannot accidentally switch.' },
  { badge: '📜', title: 'COPPA & GDPR-K',        desc: 'Designed from the ground up to comply with child-privacy regulations in the US, EU, and UK.' },
  { badge: '📴', title: 'Fully Offline',          desc: 'No CDN calls, no analytics beacons, no third-party scripts. The game is self-contained.' },
  { badge: '🏠', title: 'No External Links',      desc: 'Children cannot accidentally navigate away from the game — every link stays within the app.' },
  { badge: '🔇', title: 'Volume Controls',        desc: 'Full mute for music, sound effects, and voice narration — ideal for shared or quiet environments.' },
  { badge: '👁️', title: 'Age-Appropriate Design', desc: 'Large buttons, high contrast, clear fonts. Designed for small fingers and developing visual systems.' },
];

export default function FeaturesPage() {
  return (
    <div className="font-[Inter] min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <Navbar breadcrumb="Features" />

      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold no-underline hover:opacity-70 transition-opacity" style={{ color: accent }}>
          ← Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="py-16 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            Why it works
          </span>
          <h1
            className="font-[Nunito] text-5xl font-extrabold leading-tight mb-5"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Built for Real Learning,<br />Not Just Entertainment
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            Every design decision in Math Adventure RPG is backed by educational research. Here's what makes it different.
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-4 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-center mb-12">Why Parents &amp; Kids Love It</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="text-center p-8 bg-white rounded-3xl hover:-translate-y-1 hover:shadow-xl transition-all duration-200 border border-gray-100">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="font-[Nunito] text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety grid */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-center mb-3">Designed with Safety First</h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-12">
            Every child-safety consideration has been addressed — not as an afterthought, but as a core requirement.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAFETY.map(s => (
              <div key={s.title} className="text-center p-6 bg-gray-50 rounded-3xl">
                <div className="text-4xl mb-3">{s.badge}</div>
                <h3 className="font-[Nunito] text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-white mb-4">See it for yourself.</h2>
          <p className="mb-8 opacity-90 text-lg">No sign-up. No account. Pick a grade and play in seconds.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/play" className="font-[Nunito] inline-flex items-center gap-2 bg-white text-[#4F46E5] px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all no-underline">
              🎮 Play Now
            </Link>
            <Link to="/curriculum" className="font-[Nunito] inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 hover:bg-white/10 transition-all no-underline">
              View Curriculum →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
