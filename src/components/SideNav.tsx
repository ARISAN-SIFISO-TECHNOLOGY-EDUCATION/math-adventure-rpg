// SideNav — desktop (lg+) left navigation for the home/app shell.
// Mobile keeps the fixed BottomNav; on wide screens that bar is hidden and this
// sidebar fills the otherwise-empty left margin with the same primary links plus
// the important secondary links (About, Features, Parent Guide, Privacy,
// Contact) that otherwise only live in the marketing footer/navbar.
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Rocket, BookOpen, Sparkles, ShieldCheck,
  Info, HeartHandshake, Lock, Mail,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useT, type TranslationKey } from '../i18n';

type Item = { to: string; labelKey: TranslationKey; Icon: LucideIcon };

const PRIMARY: Item[] = [
  { to: '/',                labelKey: 'nav.home',     Icon: Home },
  { to: '/?start=1',        labelKey: 'nav.start',    Icon: Rocket },
  { to: '/curriculum',      labelKey: 'nav.learn',    Icon: BookOpen },
  { to: '/features',        labelKey: 'nav.features', Icon: Sparkles },
  { to: '/grown-up-corner', labelKey: 'nav.grownups', Icon: ShieldCheck },
];

const SECONDARY: Item[] = [
  { to: '/about',   labelKey: 'footer.about',       Icon: Info },
  { to: '/parents', labelKey: 'footer.parentGuide', Icon: HeartHandshake },
  { to: '/privacy', labelKey: 'footer.privacy',     Icon: Lock },
  { to: '/contact', labelKey: 'footer.contact',     Icon: Mail },
];

export default function SideNav() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const t = useT();

  const isActive = (to: string) => {
    const path = to.split('?')[0];
    if (path === '/') return pathname === '/' && (to.includes('start') ? search.includes('start') : !search.includes('start'));
    return pathname.startsWith(path);
  };

  const Row = ({ to, labelKey, Icon }: Item) => {
    const active = isActive(to);
    return (
      <button
        onClick={() => navigate(to)}
        aria-current={active ? 'page' : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
          active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.6 : 2} />
        {t(labelKey)}
      </button>
    );
  };

  return (
    <nav
      className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-60 flex-col bg-white border-r border-gray-200 px-4 py-6 overflow-y-auto"
      aria-label="Main navigation"
    >
      {/* Brand */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-2 mb-6 text-left"
        aria-label="Math Adventure RPG — home"
      >
        <span className="text-2xl">🗡️</span>
        <span className="font-[Nunito] font-black text-lg leading-tight text-gray-900">
          Math Adventure <span className="text-indigo-600">RPG</span>
        </span>
      </button>

      <div className="flex flex-col gap-1">
        {PRIMARY.map(item => <Row key={item.to} {...item} />)}
      </div>

      <div className="my-4 border-t border-gray-100" />

      <div className="flex flex-col gap-1">
        {SECONDARY.map(item => <Row key={item.to} {...item} />)}
      </div>

      {/* Footer: language + promise */}
      <div className="mt-auto pt-6 flex flex-col gap-3">
        <LanguageToggle />
        <p className="text-[11px] font-bold text-emerald-600 px-1">{t('nav.promise')}</p>
        <p className="text-[10px] text-gray-400 px-1">© 2026 Math Adventure RPG</p>
      </div>
    </nav>
  );
}
