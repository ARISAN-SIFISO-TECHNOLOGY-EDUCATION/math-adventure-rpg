// Spoken narration lines for the Kids' RPG, per language.
//
// ⚠️ The isiZulu lines are DRAFTS — review with a native speaker before release.
// Note: most Android devices ship an English TTS voice but not a zu-ZA one, so
// isiZulu narration falls back to the default voice reading the text. That is an
// acceptable graceful degradation; useNarration still tags the utterance lang.
import type { Lang } from './index';

export interface NarrationLines {
  /** Randomly picked on a correct answer. */
  correct: string[];
  /** Randomly picked on a wrong answer. */
  wrong: string[];
  /** `{lvl}` is replaced with the new level number. */
  levelUp: string;
  victory: string;
  welcome: string;
  /** Spoken for subitizing (flash-count) questions. */
  subitizing: string;
  /** Word inserted between fraction parts, e.g. "1 over 2". */
  fractionOver: string;
}

export const NARRATION: Record<Lang, NarrationLines> = {
  en: {
    correct: [
      "Great job! That's correct!",
      'Awesome! You got it!',
      'Brilliant! Well done!',
      'Fantastic! Keep going!',
    ],
    wrong: [
      'Try again — you can do it!',
      'Not quite. Have another go!',
      "Keep trying! You're almost there!",
      "Don't give up — try once more!",
    ],
    levelUp: 'Level up! You reached level {lvl}. Amazing!',
    victory: 'Victory! You are a math superstar!',
    welcome: "Let's start the adventure! Are you ready?",
    subitizing: 'Quick! Look at the screen carefully. How many do you see?',
    fractionOver: 'over',
  },
  zu: {
    correct: [
      'Wenze kahle! Uqinisile!',
      'Uhle kakhulu! Uyitholile!',
      'Kuhle kakhulu! Qhubeka!',
      'Ushaye khona! Halala!',
    ],
    wrong: [
      'Zama futhi — uyakwazi!',
      'Cha, akukubanga khona. Zama futhi!',
      'Qhubeka uzama! Usondele!',
      'Ungalahli ithemba — zama kanye futhi!',
    ],
    levelUp: 'Wenyukile! Usufike ezingeni {lvl}. Uyamangalisa!',
    victory: 'Ushaye khona! Uyinkanyezi yezibalo!',
    welcome: 'Ake siqale uhambo! Usukulungele?',
    subitizing: 'Shesha! Bheka esikrinini ngokucophelela. Zingaki ozibonayo?',
    fractionOver: 'ku',
  },
};
