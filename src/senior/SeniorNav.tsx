import { useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, CalendarDays, NotebookPen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Bottom navigation for the senior Exam Studio hub pages (Topics, Dashboard,
// Planner, Mistakes, Formulas). Hidden on the full-screen Activity/Success
// flow. Dark, to match the exam aesthetic; lives above the page's pb-20.
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
      className="fixed inset-x-0 bottom-0 z-40 bg-slate-800 border-t border-slate-700"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-md mx-auto grid grid-cols-4">
        {ITEMS.map(item => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                active ? 'text-teal' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-inter font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
