// English — the SOURCE OF TRUTH for every translatable UI string.
//
// Keys are flat, dot-namespaced strings. `{name}`-style placeholders are filled
// by the `t(key, vars)` interpolation in ./index.tsx. To add a string: add it
// here first, then add the SAME key to every other locale (zu.ts). The locale
// files are typed against this object, so a missing/extra key fails the build.
//
// Proper nouns are deliberately NOT keys (they read the same in every language):
// "Math Adventure", "The Academy", "Math Monsters", the Masters quiz, and the
// Academy school names (Explorers, Pioneers, Builders, Systems, Thinkers).
export const en = {
  // Home — hero
  'home.tagline': 'Maths mastery, ages 3 to 17 — play, learn & master.',
  'home.badge.play': '🎮 Play 3–12',
  'home.badge.master': '🎓 Master 13–17',
  'home.badge.free': '✨ Free forever',

  // Home — section panels
  'home.preschool.title': '🌱 Little Learners',
  'home.preschool.sub': 'Ages 3–5 · first numbers, shapes & counting',
  'home.primary.title': '⚔️ Primary Quest',
  'home.primary.sub': 'Ages 6–12 · the Math Monsters adventure',
  'home.academy.title': '🎓 The Academy',
  'home.academy.sub': 'Ages 13–17 · serious maths, mastery levels & mock papers',

  // Age cards
  'card.age': 'Age {n}',
  'label.preschool': 'Pre-School',
  'label.lowerPrimary': 'Lower Primary',
  'label.higherPrimary': 'Higher Primary',
  'label.advanced': 'Advanced',
  'masters.sub': 'Critical thinking',

  // Footer links
  'footer.about': 'About',
  'footer.parentGuide': 'Parent Guide',
  'footer.privacy': 'Privacy',
  'footer.contact': 'Contact',

  // Language switcher
  'lang.label': 'Language',
  'lang.switchTo': 'Switch to {lang}',
} as const;

export type TranslationKey = keyof typeof en;
/** Shape every locale must satisfy exactly (no missing / no extra keys). */
export type Translations = Record<TranslationKey, string>;
