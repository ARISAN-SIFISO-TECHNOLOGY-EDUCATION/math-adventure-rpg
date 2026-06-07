import { useCallback, useEffect, useRef } from 'react';
import { BCP47, type Lang } from '../i18n';
import { NARRATION } from '../i18n/narration';

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Strips emoji / non-speech characters and collapses whitespace. */
function cleanForSpeech(text: string): string {
  return text
    .replace(/\n/g, ' ')
    // remove emoji (broad Unicode ranges)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[^\w\s\d+\-×÷=?.!,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Speech narration for the Kids' RPG, in the active language.
 * Falls back to the device default voice when no voice matches `lang`
 * (e.g. most devices lack a zu-ZA voice) — utterances are still tagged so a
 * matching voice is used where present.
 */
export function useNarration(muted: boolean, lang: Lang = 'en') {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const lines = NARRATION[lang];

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (muted || !synthRef.current) return;
      synthRef.current.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = BCP47[lang];
      u.rate = 0.88;
      u.pitch = 1.1;
      u.volume = 1;
      synthRef.current.speak(u);
    },
    [muted, lang],
  );

  const stop = useCallback(() => synthRef.current?.cancel(), []);

  const speakQuestion = useCallback(
    (question: string, isSubitizing?: boolean) => {
      if (isSubitizing) {
        speak(lines.subitizing);
        return;
      }
      const withFractions = question.replace(/(\d+)\/(\d+)/g, `$1 ${lines.fractionOver} $2`);
      const cleaned = cleanForSpeech(withFractions);
      if (cleaned.length > 2) speak(cleaned);
    },
    [speak, lines],
  );

  const speakCorrect  = useCallback(() => speak(pick(lines.correct)), [speak, lines]);
  const speakWrong    = useCallback(() => speak(pick(lines.wrong)),   [speak, lines]);
  const speakLevelUp  = useCallback((lvl: number) => speak(lines.levelUp.replace('{lvl}', String(lvl))), [speak, lines]);
  const speakVictory  = useCallback(() => speak(lines.victory), [speak, lines]);
  const speakWelcome  = useCallback(() => speak(lines.welcome), [speak, lines]);

  return { speak, stop, speakQuestion, speakCorrect, speakWrong, speakLevelUp, speakVictory, speakWelcome };
}
