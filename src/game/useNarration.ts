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
 *
 * Voice quality guard: most Android devices have an English TTS voice but NOT an
 * isiZulu (zu-ZA) one. Letting the system read isiZulu words through an English
 * voice produces a bad, inaccurate accent. So we only speak isiZulu aloud when a
 * real zu voice is installed; otherwise we speak the ENGLISH lines with an
 * English voice (clean pronunciation) while the on-screen UI stays in isiZulu.
 * If the user installs an isiZulu TTS voice, narration upgrades automatically.
 */
export function useNarration(muted: boolean, lang: Lang = 'en') {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    const load = () => { voicesRef.current = synth.getVoices() ?? []; };
    load(); // some platforms populate lazily via the event below
    synth.addEventListener?.('voiceschanged', load);
    return () => synth.removeEventListener?.('voiceschanged', load);
  }, []);

  const hasVoiceFor = (code: string) =>
    voicesRef.current.some(v => v.lang?.toLowerCase().startsWith(code));

  // The language we can actually SPEAK well. Fall back to English audio when the
  // chosen language has no installed voice, rather than mispronouncing it.
  const speechLang: Lang = lang === 'zu' && !hasVoiceFor('zu') ? 'en' : lang;
  const lines = NARRATION[speechLang];

  const speak = useCallback(
    (text: string) => {
      const synth = synthRef.current;
      if (muted || !synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const tag = BCP47[speechLang];
      u.lang = tag;
      // Pin an actual matching voice so the platform can't substitute a wrong one.
      const base = tag.slice(0, 2).toLowerCase();
      const voice = voicesRef.current.find(v => v.lang?.toLowerCase().startsWith(base));
      if (voice) u.voice = voice;
      u.rate = 0.88;
      u.pitch = 1.1;
      u.volume = 1;
      synth.speak(u);
    },
    [muted, speechLang],
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
