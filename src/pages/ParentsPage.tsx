import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GRADES } from '../data/grades';

const accent = '#4F46E5';

const TIPS = [
  {
    icon: '🔒',
    title: 'Switching Grade Levels',
    body: 'Tap the lock icon ("Change") on the game start screen. You\'ll need to solve a short math puzzle — designed so young children can\'t accidentally change levels.',
  },
  {
    icon: '🔇',
    title: 'Audio Controls',
    body: 'The speaker icon mutes all music and sound effects. Voice narration (Sparky reading questions aloud) is also silenced — useful if the device is shared.',
  },
  {
    icon: '🏠',
    title: 'Getting Back Home',
    body: 'A Home button is always visible on the game screen. You can also use your browser\'s back button at any time — progress is saved automatically between sessions.',
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
  {
    icon: '📅',
    title: 'How Long to Play',
    body: 'Ages 3–5: 5–10 minutes with a parent. Ages 6–8: 15 minutes independently. Ages 9–12: 20–25 minutes. The streak counter rewards consistent daily sessions.',
  },
  {
    icon: '🔥',
    title: 'Understanding Streaks',
    body: 'The 🔥 streak badge in the HUD shows consecutive days played. A new streak day rewards bonus coins — gentle motivation without pressure.',
  },
  {
    icon: '💡',
    title: 'When They Get Stuck',
    body: 'After two wrong answers the correct answer is shown with a hint. Encourage your child to read it aloud before pressing "Got it! Next →" — verbalising the answer aids retention.',
  },
];

export default function ParentsPage() {
  return (
    <div className="font-[Inter] min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <Navbar breadcrumb="Parents" />

      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold no-underline hover:opacity-70 transition-opacity" style={{ color: accent }}>
          ← Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="py-16 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            Parent & Caregiver Guide
          </span>
          <h1
            className="font-[Nunito] text-5xl font-extrabold leading-tight mb-5"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Everything You Need<br />to Support Your Child
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            Young children learn best with a caring adult nearby. Here's how to get the most out of Math Adventure RPG at every age.
          </p>
        </div>
      </section>

      {/* Age-by-age guidance */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10">Age-by-Age Guidance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Link
                    to={g.detailLink}
                    className="ml-auto text-xs font-bold no-underline hover:underline"
                    style={{ color: g.color }}
                  >
                    Full details →
                  </Link>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{g.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips grid */}
      <section className="py-16 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10">Controls, Tips &amp; Best Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIPS.map(tip => (
              <div key={tip.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{tip.icon}</div>
                <h3 className="font-[Nunito] text-lg font-bold mb-2 text-gray-800">{tip.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research backing */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-center mb-10">Why the RPG Format Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: '🎮',
                title: 'Motivation Without Pressure',
                desc: 'Game mechanics (coins, levels, boss battles) maintain intrinsic motivation far longer than sticker charts or timed tests. Children choose to replay because they want to — not because they have to.',
              },
              {
                icon: '🔁',
                title: 'Immediate Corrective Feedback',
                desc: 'Research consistently shows that feedback given within 2 seconds of a mistake produces stronger retention than end-of-session correction. Every wrong answer gets feedback instantly.',
              },
              {
                icon: '📊',
                title: 'Spaced Repetition',
                desc: 'Topics revisit earlier skills at higher complexity — a technique proven to transfer knowledge from short-term to long-term memory more effectively than massed practice.',
              },
              {
                icon: '🗣️',
                title: 'Multi-Sensory Input',
                desc: 'Sparky reads every question aloud. Hearing and seeing a problem simultaneously activates more memory pathways than reading alone — particularly beneficial for early readers.',
              },
            ].map(r => (
              <div key={r.title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-4xl mb-4">{r.icon}</div>
                <h3 className="font-[Nunito] text-xl font-bold mb-2">{r.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety reassurance */}
      <section className="py-16 bg-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-[Nunito] text-3xl font-bold mb-6">Your Child Is Safe Here</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10">
            We built this for our own children first. Every privacy and safety decision was made as a parent, not as a product team.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { badge: '🚫', label: 'No Ads' },
              { badge: '🔐', label: 'No Data' },
              { badge: '🔗', label: 'No External Links' },
              { badge: '📴', label: '100% Offline' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="text-4xl mb-2">{s.badge}</div>
                <div className="font-[Nunito] font-bold text-sm">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/features" className="text-sm font-bold no-underline hover:underline" style={{ color: accent }}>
              Full safety & feature details →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: 'white' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="font-[Nunito] text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="mb-8 opacity-90 text-lg">Pick your child's grade and play together right now — no download needed.</p>
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
