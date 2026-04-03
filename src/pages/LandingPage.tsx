import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

export default function LandingPage() {
  return (
    <div className="font-[Inter] bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="py-20 text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h1
            className="font-[Nunito] text-6xl font-extrabold leading-tight mb-6"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Learn Math.<br />Slay Monsters.<br />Save the Kingdom.
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto mb-8">
            A turn‑based educational RPG for kids ages 5–12. Solve math problems to defeat enemies and progress through a magical world.
          </p>
          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <Link to="/play" className="font-[Nunito] inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] hover:scale-105 text-white px-8 py-4 rounded-full font-bold text-base shadow-lg transition-all no-underline">
              🎮 Play Web Demo
            </Link>
            <Link to="/preschool" className="font-[Nunito] inline-flex items-center gap-2 bg-white border-2 border-[#4F46E5] text-[#4F46E5] hover:bg-indigo-50 hover:scale-105 px-8 py-4 rounded-full font-bold text-base transition-all no-underline">
              📖 Explore Curriculum
            </Link>
          </div>
          <div className="flex justify-center gap-12 flex-wrap mt-12">
            {[
              { num: '20', label: 'Difficulty Levels' },
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

      {/* Features */}
      <section id="features" className="py-20 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold text-center mb-12">Why Parents & Kids Love It</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon="🧮" title="Adaptive Math" desc="Problems scale automatically with your child's progress — from counting to percentages." />
            <FeatureCard icon="🎮" title="RPG Adventure" desc="Defeat monsters, earn XP, level up, and unlock new worlds. Learning feels like play." />
            <FeatureCard icon="🔒" title="100% Private" desc="Zero data collection. No accounts. No ads. No tracking. COPPA/GDPR‑K compliant." />
            <FeatureCard icon="📴" title="Works Offline" desc="No internet? No problem. Play anywhere — on a plane, in a car, or at the park." />
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="py-20 bg-gray-100 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold text-center mb-3">Curriculum-Aligned Learning</h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-12">Following K–6 math standards across 20 levels and 4 phases</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { color: '#10B981', title: '🏫 Pre‑School', ages: 'Ages 3–5', topics: ['Counting 1–10', 'More or less', 'Addition within 5', 'Subtraction within 5'], to: '/preschool' },
              { color: '#F59E0B', title: '📚 Lower Primary', ages: 'Grades 1–3 (Ages 6–8)', topics: ['Addition up to 100', 'Subtraction up to 100', 'Times tables (×2, ×5, ×10)', 'Missing number problems'], to: '/lower-primary' },
              { color: '#EF4444', title: '⚔️ Higher Primary', ages: 'Grade 4 (Ages 9–10)', topics: ['All times tables (×1–×12)', 'Division basics', 'Simple fractions', 'Rounding to 10s & 100s'], to: '/higher-primary' },
              { color: '#8B5CF6', title: '🏆 Advanced Primary', ages: 'Grades 5–6 (Ages 11–12)', topics: ['Fraction operations', 'Decimals', 'Percentages', 'Order of operations'], to: '/higher-primary' },
            ].map(ph => (
              <Link key={ph.title} to={ph.to} className="bg-white rounded-2xl p-6 no-underline text-gray-800 hover:-translate-y-1 hover:shadow-lg transition-all block" style={{ borderLeft: `4px solid ${ph.color}` }}>
                <div className="font-[Nunito] font-extrabold text-xl mb-1">{ph.title}</div>
                <div className="text-sm text-gray-400 mb-4">{ph.ages}</div>
                <ul className="space-y-1">
                  {ph.topics.map(t => (
                    <li key={t} className="text-sm flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span> {t}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="py-20 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold text-center mb-12">Designed with Safety First</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <SafetyItem badge="🚫" title="No Ads" desc="Zero third‑party ad networks. No interruptions." />
            <SafetyItem badge="🔐" title="No Data Collection" desc="We don't collect names, emails, location, or usage data." />
            <SafetyItem badge="👨‍👩‍👧" title="Parental Gate" desc="In‑app purchases and external links require a parent to solve a math puzzle." />
            <SafetyItem badge="📜" title="COPPA & GDPR‑K" desc="Fully compliant with kid‑privacy regulations worldwide." />
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="py-20 bg-gray-100 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold mb-12">See the Adventure</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Battle Screen', 'Map Screen', 'Victory Screen', 'Phase Select'].map(label => (
              <div key={label} className="bg-gray-200 rounded-[32px] flex items-center justify-center text-gray-400 text-sm border-2 border-gray-300 p-6" style={{ aspectRatio: '9/19' }}>
                📱 {label}<br /><span className="text-xs">Mockup</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-gray-400 text-sm">Actual screens coming soon. Art style: colorful, kid‑friendly 2D.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center px-6" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[Nunito] text-4xl font-bold text-white mb-4">Ready to start the adventure?</h2>
          <p className="text-lg mb-8 opacity-90">Try the web demo now — no download required.</p>
          <Link to="/play" className="font-[Nunito] inline-flex items-center gap-2 bg-white text-[#4F46E5] px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all no-underline">
            🎮 Play Now — It's Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
