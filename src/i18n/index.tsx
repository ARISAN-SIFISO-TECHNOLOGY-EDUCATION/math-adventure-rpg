// i18n core: language state, persistence, and the `t()` translator.
//
// Usage:
//   const t = useT();           t('home.tagline')   t('card.age', { n: 5 })
//   const { lang, setLang } = useI18n();
//
// Languages persist in localStorage (`mathadv-lang`) and stay on-device — no
// network, in keeping with the app's offline/no-data promise. New strings go in
// en.ts (source of truth) and every other locale; new LOCALES go in LANGS +
// DICTS + BCP47 below.
import {
  createContext, useCallback, useContext,
  useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { safeGet, safeSave } from '../lib/safeStorage';
import { en, type TranslationKey, type Translations } from './en';
import { zu } from './zu';

export type Lang = 'en' | 'zu';

/** Display metadata for the language switcher. `native` is shown in its own script. */
export const LANGS: ReadonlyArray<{ code: Lang; label: string; native: string }> = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'zu', label: 'isiZulu', native: 'isiZulu' },
];

const DICTS: Record<Lang, Translations> = { en, zu };
/** BCP-47 tags for <html lang> and SpeechSynthesis. */
export const BCP47: Record<Lang, string> = { en: 'en-US', zu: 'zu-ZA' };

const LANG_KEY = 'mathadv-lang';

function isLang(v: unknown): v is Lang {
  return v === 'en' || v === 'zu';
}

/** Replace `{name}` placeholders; leaves unknown placeholders untouched. */
function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export type TFn = (key: TranslationKey, vars?: Record<string, string | number>) => string;

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFn;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = safeGet<string>(LANG_KEY, 'en');
    return isLang(saved) ? saved : 'en';
  });

  // Keep <html lang> accurate so screen readers pick the right pronunciation.
  useEffect(() => {
    document.documentElement.lang = BCP47[lang];
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    safeSave(LANG_KEY, l);
  }, []);

  const t = useCallback<TFn>(
    (key, vars) => interpolate(DICTS[lang][key] ?? en[key] ?? key, vars),
    [lang],
  );

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');
  return ctx;
}

/** Convenience: just the translator. */
export function useT(): TFn {
  return useI18n().t;
}

// Re-export for callers that want the key type.
export type { TranslationKey };
