import { useCallback, useEffect, useRef } from 'react';

const CORRECT_LINES = [
  "Great job! That's correct!",
  "Awesome! You got it!",
  "Brilliant! Well done!",
  "Fantastic! Keep going!",
];

const WRONG_LINES = [
  "Try again — you can do it!",
  "Not quite. Have another go!",
  "Keep trying! You're almost there!",
  "Don't give up — try once more!",
];

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

export function useNarration(muted: boolean) {
  const synthRef = useRef<SpeechSynthesis | null>(null);

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
      u.lang = 'en-US';
      u.rate = 0.88;
      u.pitch = 1.1;
      u.volume = 1;
      synthRef.current.speak(u);
    },
    [muted],
  );

  const stop = useCallback(() => synthRef.current?.cancel(), []);

  const speakQuestion = useCallback(
    (question: string, isSubitizing?: boolean) => {
      if (isSubitizing) {
        speak('Quick! Look at the screen carefully. How many do you see?');
        return;
      }
      const cleaned = cleanForSpeech(question);
      if (cleaned.length > 2) speak(cleaned);
    },
    [speak],
  );

  const speakCorrect  = useCallback(() => speak(pick(CORRECT_LINES)), [speak]);
  const speakWrong    = useCallback(() => speak(pick(WRONG_LINES)),   [speak]);
  const speakLevelUp  = useCallback((lvl: number) => speak(`Level up! You reached level ${lvl}. Amazing!`), [speak]);
  const speakVictory  = useCallback(() => speak('Victory! You are a math superstar!'), [speak]);
  const speakWelcome  = useCallback(() => speak("Let's start the adventure! Are you ready?"), [speak]);

  return { speak, stop, speakQuestion, speakCorrect, speakWrong, speakLevelUp, speakVictory, speakWelcome };
}
