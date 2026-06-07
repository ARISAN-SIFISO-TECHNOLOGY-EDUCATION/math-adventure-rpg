// Compact language switcher (EN | ZU pill). On-device only; persists via i18n.
import { LANGS, useI18n } from '../i18n';

interface Props {
  /** Tailwind/inline tweaks from the host (positioning, colour scheme). */
  className?: string;
  /** Light pill on dark backgrounds (e.g. the Academy) vs dark on light. */
  dark?: boolean;
}

export default function LanguageToggle({ className = '', dark = false }: Props) {
  const { lang, setLang, t } = useI18n();

  const idleColor = dark ? 'rgba(255,255,255,0.6)' : '#6B7280';
  const trackBg = dark ? 'rgba(255,255,255,0.12)' : '#F3F4F6';

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className={`inline-flex items-center rounded-full p-0.5 ${className}`}
      style={{ background: trackBg }}
    >
      {LANGS.map(({ code, native }) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            aria-label={active ? native : t('lang.switchTo', { lang: native })}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold no-underline transition-colors"
            style={{
              background: active ? (dark ? '#5EEAD4' : '#4338ca') : 'transparent',
              color: active ? (dark ? '#0d1117' : '#ffffff') : idleColor,
            }}
          >
            {native}
          </button>
        );
      })}
    </div>
  );
}
