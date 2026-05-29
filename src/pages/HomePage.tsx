import { Link } from 'react-router-dom';

type AgeCard = {
  age: number;
  label: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  phase: 1 | 2 | 3 | 4;
  advanced?: boolean;
};

const AGE_CARDS: AgeCard[] = [
  // Row 1 — Pre-School (Ages 3–5)
  { age: 3, label: 'Pre-School',    emoji: '🌱', color: '#059669', bg: '#F0FDF4', border: '#6EE7B7', phase: 1 },
  { age: 4, label: 'Pre-School',    emoji: '🌱', color: '#059669', bg: '#F0FDF4', border: '#6EE7B7', phase: 1 },
  { age: 5, label: 'Pre-School',    emoji: '🌱', color: '#059669', bg: '#F0FDF4', border: '#6EE7B7', phase: 1 },
  // Row 2 — Lower Primary (Ages 6–8)
  { age: 6, label: 'Lower Primary', emoji: '📚', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', phase: 2 },
  { age: 7, label: 'Lower Primary', emoji: '📚', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', phase: 2 },
  { age: 8, label: 'Lower Primary', emoji: '📚', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', phase: 2 },
  // Row 3 — Higher Primary (Ages 9–11)
  { age: 9,  label: 'Higher Primary', emoji: '⚔️', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', phase: 3 },
  { age: 10, label: 'Higher Primary', emoji: '⚔️', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', phase: 3 },
  { age: 11, label: 'Higher Primary', emoji: '⚔️', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', phase: 3 },
  // Row 4 — Higher Primary Age 12 + Advanced
  { age: 12, label: 'Higher Primary', emoji: '⚔️', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', phase: 3 },
  { age: 11, label: 'Advanced',       emoji: '🏆', color: '#9F1239', bg: '#FFF1F2', border: '#FECDD3', phase: 4, advanced: true },
  { age: 12, label: 'Advanced',       emoji: '🏆', color: '#9F1239', bg: '#FFF1F2', border: '#FECDD3', phase: 4, advanced: true },
];

function AgeCardItem({ card }: { card: AgeCard }) {
  return (
    <Link
      to={`/play?phase=${card.phase}`}
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
        <span className="text-[9px] text-gray-400 font-semibold text-center leading-tight">
          {card.label}
        </span>
      )}
    </Link>
  );
}

export default function HomePage() {
  const rows = [
    AGE_CARDS.slice(0, 3),
    AGE_CARDS.slice(3, 6),
    AGE_CARDS.slice(6, 9),
    AGE_CARDS.slice(9, 12),
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">

      {/* ── Hero Image ── */}
      <div className="relative w-full overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Math Adventure RPG — kids learning maths"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          draggable={false}
        />
        {/* subtle bottom fade so the image blends into white */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
        />
      </div>

      {/* ── Choose Your Age ── */}
      <div className="px-4 pt-3 pb-1">
        <h2 className="font-[Nunito] text-xl font-extrabold text-gray-800 leading-tight">
          🎯 Choose Your Age
        </h2>
        <p className="text-xs text-gray-400 font-semibold mt-0.5">
          Tap your child's age to start playing
        </p>
      </div>

      {/* ── Age Card Grid ── */}
      <div className="px-4 flex flex-col gap-2 flex-1">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-3 gap-2">
            {row.map((card, i) => (
              <div key={i}><AgeCardItem card={card} /></div>
            ))}
          </div>
        ))}
      </div>

      {/* ── Footer Links ── */}
      <div className="px-4 py-4 mt-3 border-t border-gray-100 flex justify-center gap-6 flex-wrap">
        <Link to="/about"          className="text-xs text-gray-400 font-semibold no-underline hover:text-gray-700">About</Link>
        <Link to="/parents"        className="text-xs text-gray-400 font-semibold no-underline hover:text-gray-700">For Parents</Link>
        <Link to="/grown-up-corner" className="text-xs text-gray-400 font-semibold no-underline hover:text-gray-700">Grown-up Corner</Link>
        <Link to="/curriculum"     className="text-xs text-gray-400 font-semibold no-underline hover:text-gray-700">Curriculum</Link>
      </div>

    </div>
  );
}
