// isiZulu (zu-ZA).
//
// ⚠️ DRAFT TRANSLATIONS — NEEDS NATIVE-SPEAKER REVIEW BEFORE RELEASE.
// These were drafted to bootstrap the i18n layer. For an education app, ship
// isiZulu to production only after a fluent isiZulu speaker has reviewed every
// string (especially noun-class agreement and the numeric "Age {n}" phrasing).
//
// Typed as `Translations`, so this MUST contain exactly the same keys as en.ts
// (a missing or extra key fails `npm run lint`). Keep placeholders (`{n}`,
// `{lang}`) identical to the English source.
import type { Translations } from './en';

export const zu: Translations = {
  // Home — hero
  'home.tagline': 'Ubungcweti bezibalo, iminyaka emi-3 kuya kwemi-17 — dlala, funda futhi ube ngumchwepheshe.',
  'home.badge.play': '🎮 Dlala 3–12',
  'home.badge.master': '🎓 Funda 13–17',
  'home.badge.free': '✨ Mahhala phakade',

  // Home — section panels
  'home.preschool.title': '🌱 Abafundi Abancane',
  'home.preschool.sub': 'Iminyaka emi-3–5 · izinombolo zokuqala, izimo & ukubala',
  'home.primary.title': '⚔️ Uhambo Lwesisekelo',
  'home.primary.sub': 'Iminyaka emi-6–12 · uhambo lwe-Math Monsters',
  'home.academy.title': '🎓 The Academy',
  'home.academy.sub': 'Iminyaka emi-13–17 · izibalo eziqondile, amazinga obungcweti & amaphepha okulingisa',

  // Age cards
  'card.age': 'Iminyaka {n}',
  'label.preschool': 'Isikole Sokuqala',
  'label.lowerPrimary': 'Amabanga Aphansi',
  'label.higherPrimary': 'Amabanga Aphezulu',
  'label.advanced': 'Othuthukile',
  'masters.sub': 'Ukucabanga okujulile',

  // Navigation (BottomNav + SideNav)
  'nav.home': 'Ikhaya',
  'nav.start': 'Qala',
  'nav.learn': 'Funda',
  'nav.features': 'Izici',
  'nav.grownups': 'Abadala',
  'nav.promise': '✨ Mahhala phakade · azikho izikhangiso · i-offline',

  // Footer links
  'footer.about': 'Mayelana',
  'footer.parentGuide': 'Abazali',
  'footer.privacy': 'Ubumfihlo',
  'footer.contact': 'Xhumana',

  // Language switcher
  'lang.label': 'Ulimi',
  'lang.switchTo': 'Shintshela ku-{lang}',
};
