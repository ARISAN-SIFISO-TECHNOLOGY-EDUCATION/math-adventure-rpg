import { Link } from 'react-router-dom';

type AgeCard = {
  age: number;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  phase: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  advanced?: boolean;
  senior?: boolean; // ages 13–17 → dark Exam Studio instead of the kids' RPG
};

// Kids' "Math Monsters" RPG — cards sit inside coloured panels, so each card
// uses a white background and gets its identity from its border + text colour.
// Pre-School (Ages 3–5).
const PRESCHOOL_CARDS: AgeCard[] = [
  { age: 3, label: 'Pre-School', emoji: '🌱', color: '#059669', bg: '#FFFFFF', border: '#6EE7B7', phase: 1 },
  { age: 4, label: 'Pre-School', emoji: '🌱', color: '#059669', bg: '#FFFFFF', border: '#6EE7B7', phase: 1 },
  { age: 5, label: 'Pre-School', emoji: '🌱', color: '#059669', bg: '#FFFFFF', border: '#6EE7B7', phase: 1 },
];

// Primary (Ages 6–12).
const PRIMARY_CARDS: AgeCard[] = [
  { age: 6,  label: 'Lower Primary',  emoji: '📚', color: '#D97706', bg: '#FFFFFF', border: '#FDE68A', phase: 2 },
  { age: 7,  label: 'Lower Primary',  emoji: '📚', color: '#D97706', bg: '#FFFFFF', border: '#FDE68A', phase: 2 },
  { age: 8,  label: 'Lower Primary',  emoji: '📚', color: '#D97706', bg: '#FFFFFF', border: '#FDE68A', phase: 2 },
  { age: 9,  label: 'Higher Primary', emoji: '⚔️', color: '#2563EB', bg: '#FFFFFF', border: '#BFDBFE', phase: 3 },
  { age: 10, label: 'Higher Primary', emoji: '⚔️', color: '#2563EB', bg: '#FFFFFF', border: '#BFDBFE', phase: 3 },
  { age: 11, label: 'Higher Primary', emoji: '⚔️', color: '#2563EB', bg: '#FFFFFF', border: '#BFDBFE', phase: 3 },
  { age: 12, label: 'Higher Primary', emoji: '⚔️', color: '#2563EB', bg: '#FFFFFF', border: '#BFDBFE', phase: 3 },
  { age: 11, label: 'Advanced',       emoji: '🏆', color: '#9F1239', bg: '#FFFFFF', border: '#FECDD3', phase: 4, advanced: true },
  { age: 12, label: 'Advanced',       emoji: '🏆', color: '#9F1239', bg: '#FFFFFF', border: '#FECDD3', phase: 4, advanced: true },
];

// Exam Studio — ages 13–17 (dark, exam-prep). One continuous ramp:
// Explorers → Pioneers → Builders → Systems → Thinkers.
const SENIOR_CARDS: AgeCard[] = [
  { age: 13, label: 'Explorers', emoji: '🧭', color: '#5EEAD4', bg: '#0f2e2b', border: '#134e4a', phase: 5, senior: true },
  { age: 14, label: 'Pioneers',  emoji: '🚩', color: '#FCD34D', bg: '#2e2410', border: '#854d0e', phase: 6, senior: true },
  { age: 15, label: 'Builders',  emoji: '🏗️', color: '#5EEAD4', bg: '#0f2e2b', border: '#134e4a', phase: 7, senior: true },
  { age: 16, label: 'Systems',   emoji: '🛰️', color: '#C4B5FD', bg: '#221b3a', border: '#5b21b6', phase: 8, senior: true },
  { age: 17, label: 'Thinkers',  emoji: '🧩', color: '#FCD34D', bg: '#2e2410', border: '#854d0e', phase: 9, senior: true },
];

function AgeCardItem({ card }: { card: AgeCard }) {
  return (
    <Link
      to={card.senior ? `/senior/topics/${card.age}` : `/play?phase=${card.phase}`}
      className="flex flex-col items-center justify-center rounded-2xl border-2 py-3 px-1 gap-0.5 no-underline active:scale-95 transition-transform shadow-sm"
      style={{ background: card.bg, borderColor: card.border }}
    >
      <span className="text-2xl leading-none">{card.emoji}</span>
      <span className="text-lg font-black leading-tight" style={{ color: card.color }}>
        Age {card.age}
      </span>
      {card.advanced ? (
        <span
          className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full text-white mt-0.5"
          style={{ background: card.color }}
        >
          Advanced
        </span>
      ) : (
        <span
          className="text-[9px] font-semibold text-center leading-tight"
          style={{ color: card.senior ? card.color : '#9CA3AF' }}
        >
          {card.label}
        </span>
      )}
    </Link>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">

      {/* ── Hero Image ── */}
      <div className="relative w-full overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Math Adventure RPG — learning maths from age 3 to 17"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          draggable={false}
        />
        {/* subtle bottom fade so the image blends into white */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
        />
      </div>

      {/* ── Pre-School (Ages 3–5) ── */}
      <div className="px-4 pt-3">
        <div className="rounded-2xl p-4 border" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
          <h2 className="font-[Nunito] text-xl font-extrabold leading-tight" style={{ color: '#047857' }}>
            🌱 Little Learners
          </h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#10B981' }}>
            Ages 3–5 · first numbers, shapes &amp; counting
          </p>
          <div className="flex flex-col gap-2 mt-3">
            {chunk(PRESCHOOL_CARDS, 3).map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-3 gap-2">
                {row.map((card, i) => (
                  <div key={i}><AgeCardItem card={card} /></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Primary (Ages 6–12) ── */}
      <div className="px-4 mt-3">
        <div className="rounded-2xl p-4 border" style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <h2 className="font-[Nunito] text-xl font-extrabold leading-tight" style={{ color: '#1D4ED8' }}>
            ⚔️ Primary Quest
          </h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#3B82F6' }}>
            Ages 6–12 · the Math Monsters adventure
          </p>
          <div className="flex flex-col gap-2 mt-3">
            {chunk(PRIMARY_CARDS, 3).map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-3 gap-2">
                {row.map((card, i) => (
                  <div key={i}><AgeCardItem card={card} /></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── The Academy (Ages 13–17) ── */}
      <div className="px-4 mt-3">
        <div className="rounded-2xl p-4" style={{ background: '#0d1117' }}>
          <h2 className="font-[Nunito] text-xl font-extrabold leading-tight" style={{ color: '#5EEAD4' }}>
            🎓 The Academy
          </h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#94A3B8' }}>
            Ages 13–17 · serious maths, mastery levels &amp; mock papers
          </p>
          <div className="flex flex-col gap-2 mt-3">
            {chunk(SENIOR_CARDS, 3).map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-3 gap-2">
                {row.map((card, i) => (
                  <div key={i}><AgeCardItem card={card} /></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer Links ── */}
      <div className="px-4 py-4 mt-4 border-t border-gray-100 flex justify-center gap-6 flex-wrap">
        <Link to="/about"          className="text-xs text-gray-400 font-semibold no-underline hover:text-gray-700">About</Link>
        <Link to="/parents"        className="text-xs text-gray-400 font-semibold no-underline hover:text-gray-700">For Parents</Link>
        <Link to="/grown-up-corner" className="text-xs text-gray-400 font-semibold no-underline hover:text-gray-700">Grown-up Corner</Link>
        <Link to="/curriculum"     className="text-xs text-gray-400 font-semibold no-underline hover:text-gray-700">Curriculum</Link>
      </div>

    </div>
  );
}
