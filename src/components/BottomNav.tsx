// BottomNav — persistent app navigation for mobile / tablet.
//   • Mobile / tablet (< lg) → fixed bottom bar
//   • Desktop (lg+)          → hidden (the top Navbar serves desktop)
// Respects the device safe-area inset so it clears the Android gesture pill /
// iPhone home indicator. Rendered by App on every page except the immersive
// game screen (/play).

import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, ShieldCheck, Gamepad2 } from 'lucide-react';

const ITEMS = [
  { to: '/',                label: 'Home',      Icon: Home },
  { to: '/curriculum',      label: 'Learn',     Icon: BookOpen },
  { to: '/grown-up-corner', label: 'Grown-Ups', Icon: ShieldCheck },
  { to: '/play',            label: 'Play',      Icon: Gamepad2 },
] as const;

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto flex items-stretch h-16">
        {ITEMS.map(({ to, label, Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.6 : 2} />
              <span className="text-[10px] font-extrabold tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
