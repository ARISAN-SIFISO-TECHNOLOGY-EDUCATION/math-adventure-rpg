import { Link } from 'react-router-dom';
import { useT, type TranslationKey } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';

type AgeCard = {
  age: number;
  labelKey?: TranslationKey; // translated descriptive label (kids' age bands)
  label?: string;            // literal proper-noun label (Academy schools, Masters)
  emoji: string;
  color: string;
  bg: string;
  border: string;
  phase: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  advanced?: boolean;
  senior?: boolean;          // ages 13–17 → dark Academy instead of the kids' RPG
  to?: string;               // feature card (not an age) → route directly here
  subKey?: TranslationKey;   // small caption for a feature card
};

// Kids' "Math Monsters" RPG — cards sit inside coloured panels, so each card
// uses a white background and gets its identity from its border + text colour.
// Pre-School (Ages 3–5).
const PRESCHOOL_CARDS: AgeCard[] = [
  { age: 3, labelKey: 'label.preschool', emoji: '🌱', color: '#047857', bg: '#FFFFFF', border: '#6EE7B7', phase: 1 },
  { age: 4, labelKey: 'label.preschool', emoji: '🌱', color: '#047857', bg: '#FFFFFF', border: '#6EE7B7', phase: 1 },
  { age: 5, labelKey: 'label.preschool', emoji: '🌱', color: '#047857', bg: '#FFFFFF', border: '#6EE7B7', phase: 1 },
];

// Primary (Ages 6–12).
const PRIMARY_CARDS: AgeCard[] = [
  { age: 6,  labelKey: 'label.lowerPrimary',  emoji: '📚', color: '#B45309', bg: '#FFFFFF', border: '#FDE68A', phase: 2 },
  { age: 7,  labelKey: 'label.lowerPrimary',  emoji: '📚', color: '#B45309', bg: '#FFFFFF', border: '#FDE68A', phase: 2 },
  { age: 8,  labelKey: 'label.lowerPrimary',  emoji: '📚', color: '#B45309', bg: '#FFFFFF', border: '#FDE68A', phase: 2 },
  { age: 9,  labelKey: 'label.higherPrimary', emoji: '⚔️', color: '#2563EB', bg: '#FFFFFF', border: '#BFDBFE', phase: 3 },
  { age: 10, labelKey: 'label.higherPrimary', emoji: '⚔️', color: '#2563EB', bg: '#FFFFFF', border: '#BFDBFE', phase: 3 },
  { age: 11, labelKey: 'label.higherPrimary', emoji: '⚔️', color: '#2563EB', bg: '#FFFFFF', border: '#BFDBFE', phase: 3 },
  { age: 12, labelKey: 'label.higherPrimary', emoji: '⚔️', color: '#2563EB', bg: '#FFFFFF', border: '#BFDBFE', phase: 3 },
  { age: 11, labelKey: 'label.advanced',      emoji: '🏆', color: '#9F1239', bg: '#FFFFFF', border: '#FECDD3', phase: 4, advanced: true },
  { age: 12, labelKey: 'label.advanced',      emoji: '🏆', color: '#9F1239', bg: '#FFFFFF', border: '#FECDD3', phase: 4, advanced: true },
];

// The Academy — ages 13–17 (dark, exam-prep). One continuous ramp:
// Explorers → Pioneers → Builders → Systems → Thinkers, capped by the
// cross-age Masters Quiz (critical thinking). School names are proper nouns
// (untranslated) — see [[feedback-no-grades-ages-only]] / i18n/en.ts.
const SENIOR_CARDS: AgeCard[] = [
  { age: 13, label: 'Explorers', emoji: '🧭', color: '#5EEAD4', bg: '#0f2e2b', border: '#134e4a', phase: 5, senior: true },
  { age: 14, label: 'Pioneers',  emoji: '🚩', color: '#FCD34D', bg: '#2e2410', border: '#854d0e', phase: 6, senior: true },
  { age: 15, label: 'Builders',  emoji: '🏗️', color: '#5EEAD4', bg: '#0f2e2b', border: '#134e4a', phase: 7, senior: true },
  { age: 16, label: 'Systems',   emoji: '🛰️', color: '#C4B5FD', bg: '#221b3a', border: '#5b21b6', phase: 8, senior: true },
  { age: 17, label: 'Thinkers',  emoji: '🧩', color: '#FCD34D', bg: '#2e2410', border: '#854d0e', phase: 9, senior: true },
];

// Capstone critical-thinking quiz — not tied to one age.
const MASTERS_CARD: AgeCard = {
  age: 0, label: 'Masters', emoji: '🧠', color: '#F0ABFC', bg: '#2a1335', border: '#86198f', phase: 9,
  subKey: 'masters.sub', to: '/senior/activity?topicId=masters&mode=masters&age=0',
};

function AgeCardItem({ card }: { card: AgeCard }) {
  const t = useT();
  const isFeature = !!card.to;
  const label = card.labelKey ? t(card.labelKey) : (card.label ?? '');
  const to = card.to ?? (card.senior ? `/senior/topics/${card.age}` : `/play?phase=${card.phase}`);
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center rounded-2xl border-2 py-3 px-1 gap-0.5 no-underline active:scale-95 transition-transform shadow-sm"
      style={{ background: card.bg, borderColor: card.border }}
    >
      <span className="text-2xl leading-none">{card.emoji}</span>
      <span className="text-lg font-black leading-tight" style={{ color: card.color }}>
        {isFeature ? label : t('card.age', { n: card.age })}
      </span>
      {card.advanced ? (
        <span
          className="text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full text-white mt-0.5"
          style={{ background: card.color }}
        >
          {t('label.advanced')}
        </span>
      ) : (
        <span
          className="text-[9px] font-semibold text-center leading-tight"
          style={{ color: isFeature || card.senior ? card.color : '#4B5563' }}
        >
          {isFeature ? (card.subKey ? t(card.subKey) : '') : label}
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
  const t = useT();
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-lg mx-auto">

      {/* ── Brand Hero (all ages 3–17) ── */}
      <div
        className="relative w-full px-5 pt-8 pb-7 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #4338ca 55%, #86198f 100%)' }}
      >
        <div className="flex items-start justify-between gap-2">
          <h1 className="font-[Nunito] text-3xl font-black text-white leading-tight tracking-tight">
            Math Adventure RPG
          </h1>
          <LanguageToggle dark />
        </div>
        <p className="font-inter text-sm font-semibold mt-1" style={{ color: '#C7D2FE' }}>
          {t('home.tagline')}
        </p>
        <div className="flex flex-wrap gap-2 mt-3 text-[11px] font-bold">
          <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>{t('home.badge.play')}</span>
          <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>{t('home.badge.master')}</span>
          <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }}>{t('home.badge.free')}</span>
        </div>
      </div>

      {/* ── Pre-School (Ages 3–5) ── */}
      <div className="px-4 pt-3">
        <div className="rounded-2xl p-4 border" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
          <h2 className="font-[Nunito] text-xl font-extrabold leading-tight" style={{ color: '#047857' }}>
            {t('home.preschool.title')}
          </h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#047857' }}>
            {t('home.preschool.sub')}
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
            {t('home.primary.title')}
          </h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#1D4ED8' }}>
            {t('home.primary.sub')}
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
            {t('home.academy.title')}
          </h2>
          <p className="text-xs font-semibold mt-0.5" style={{ color: '#94A3B8' }}>
            {t('home.academy.sub')}
          </p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {SENIOR_CARDS.map((card, i) => (
              <div key={i}><AgeCardItem card={card} /></div>
            ))}
            <div><AgeCardItem card={MASTERS_CARD} /></div>
          </div>
        </div>
      </div>

      {/* ── Footer Links ── info pages only; Learn (Curriculum) and Grown-Ups
          live in the bottom bar, so they are NOT repeated here. ── */}
      <div className="px-4 py-4 mt-4 border-t border-gray-100 flex justify-center gap-6 flex-wrap">
        <Link to="/about"    className="text-xs text-gray-600 font-semibold no-underline hover:text-gray-700">{t('footer.about')}</Link>
        <Link to="/parents"  className="text-xs text-gray-600 font-semibold no-underline hover:text-gray-700">{t('footer.parentGuide')}</Link>
        <Link to="/privacy"  className="text-xs text-gray-600 font-semibold no-underline hover:text-gray-700">{t('footer.privacy')}</Link>
        <Link to="/contact"  className="text-xs text-gray-600 font-semibold no-underline hover:text-gray-700">{t('footer.contact')}</Link>
      </div>

    </div>
  );
}
