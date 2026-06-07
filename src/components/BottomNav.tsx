// BottomNav — persistent app navigation for mobile / tablet.
//   • Mobile / tablet (< lg) → fixed bottom bar
//   • Desktop (lg+)          → hidden (the top Navbar serves desktop)
// Respects the device safe-area inset so it clears the Android gesture pill /
// iPhone home indicator. Rendered by App on every page except the immersive
// game screen (/play).

import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, ShieldCheck, Rocket } from 'lucide-react';
import { useT, type TranslationKey } from '../i18n';

// 'Start' routes to the home age-chooser (NOT straight into the kids' RPG), so
// teens reach the Academy and little ones reach the RPG by picking their age.
const ITEMS: { to: string; labelKey: TranslationKey; Icon: typeof Home }[] = [
  { to: '/',                labelKey: 'nav.home',     Icon: Home },
  { to: '/curriculum',      labelKey: 'nav.learn',    Icon: BookOpen },
  { to: '/grown-up-corner', labelKey: 'nav.grownups', Icon: ShieldCheck },
  { to: '/?start=1',        labelKey: 'nav.start',    Icon: Rocket },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const t = useT();

  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto flex items-stretch h-16">
        {ITEMS.map(({ to, labelKey, Icon }) => {
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
              <span className="text-[10px] font-extrabold tracking-wide">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
