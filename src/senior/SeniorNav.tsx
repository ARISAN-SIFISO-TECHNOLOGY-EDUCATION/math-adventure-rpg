import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, CalendarDays, NotebookPen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Navigation for the Academy hub pages (Topics, Dashboard, Planner, Mistakes,
// Formulas). Hidden on the full-screen Activity/Success flow. Dark, to match the
// exam aesthetic.
//   • Mobile (< lg) → fixed bottom bar
//   • Desktop (lg+) → fixed left sidebar (fills the otherwise-empty margin; the
//                     page offsets itself with lg:pl-60 via AppShell)
const ITEMS: { label: string; icon: LucideIcon; to: string; match: (p: string) => boolean }[] = [
  { label: 'Studio',    icon: GraduationCap,   to: '/senior/topics/15', match: p => p.startsWith('/senior/topics') || p.startsWith('/senior/formulas') },
  { label: 'Dashboard', icon: LayoutDashboard, to: '/senior/dashboard', match: p => p.startsWith('/senior/dashboard') },
  { label: 'Planner',   icon: CalendarDays,    to: '/senior/planner',   match: p => p.startsWith('/senior/planner') },
  { label: 'Mistakes',  icon: NotebookPen,     to: '/senior/mistakes',  match: p => p.startsWith('/senior/mistakes') },
];

export default function SeniorNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed z-40 bg-slate-800 border-slate-700
                 inset-x-0 bottom-0 border-t
                 lg:inset-y-0 lg:left-0 lg:right-auto lg:w-60 lg:border-t-0 lg:border-r lg:overflow-y-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Academy navigation"
    >
      {/* Brand header — desktop sidebar only */}
      <button
        onClick={() => navigate('/')}
        className="hidden lg:flex items-center gap-2 px-5 pt-6 pb-4 text-left w-full"
        aria-label="Math Adventure RPG — home"
      >
        <span className="text-xl">🎓</span>
        <span className="font-outfit font-extrabold text-white leading-tight">The Academy</span>
      </button>

      <div className="max-w-md mx-auto grid grid-cols-4
                      lg:max-w-none lg:mx-0 lg:flex lg:flex-col lg:gap-1 lg:px-3">
        {ITEMS.map(item => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 py-2.5 transition-colors
                          lg:flex-row lg:gap-3 lg:px-3 lg:rounded-xl lg:justify-start
                          ${active
                            ? 'text-[#5EEAD4] lg:bg-slate-700/60'
                            : 'text-slate-400 hover:text-slate-300 lg:hover:bg-slate-700/40'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-inter font-semibold lg:text-sm lg:font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
