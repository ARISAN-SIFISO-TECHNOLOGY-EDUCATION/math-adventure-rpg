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
  'masters.label': 'Masters',
  'masters.sub': 'Critical thinking',

  // Navigation (BottomNav + SideNav)
  'nav.home': 'Home',
  'nav.start': 'Start',
  'nav.learn': 'Learn',
  'nav.features': 'Features',
  'nav.grownups': 'Grown-Ups',
  'nav.promise': '✨ Free forever · no ads · offline',

  // Footer links
  'footer.about': 'About',
  'footer.parentGuide': 'Parent Guide',
  'footer.privacy': 'Privacy',
  'footer.contact': 'Contact',
  'footer.partOfHome': "Part of The People's Home",

  // Language switcher
  'lang.label': 'Language',
  'lang.switchTo': 'Switch to {lang}',

  // ── Academy UI chrome (ages 13–17). Generated maths content stays English. ──
  // SeniorNav
  'sr.academy': 'The Academy',
  'sr.nav.studio': 'Studio',
  'sr.nav.dashboard': 'Dashboard',
  'sr.nav.planner': 'Planner',
  'sr.nav.mistakes': 'Mistakes',
  // Activity (question screen)
  'sr.calcAllowed': 'Calculator allowed',
  'sr.correct': '✓ Correct!',
  'sr.incorrect': '✗ Incorrect',
  'sr.answer': 'Answer:',
  'sr.working': 'Working',
  'sr.commonMistake': 'Common mistake',
  'sr.examTip': 'Exam tip',
  'sr.showHint': 'Show hint',
  'sr.hideHint': 'Hide hint',
  'sr.correctLabel': 'correct',
  'sr.level': 'Level {n}',
  'sr.topicTest': 'Topic Test',
  'sr.mockExam': 'Mock Exam',
  'sr.mastersQuiz': 'Masters Quiz',
  // Topics
  'sr.comingSoon': 'Coming soon',
  'sr.topicTestPassed': '✓ Topic Test Passed',
  'sr.levels': '{passed}/{total} levels',
  'sr.mockLabel': 'Age {age} Mock Exam',
  'sr.mockTitle': '40-Question Mock Paper',
  'sr.mockSub': 'All topics · IGCSE style · marks & exam tips',
  'sr.bestLast': 'Best/last: {score}%',
  // Dashboard
  'sr.streak': '{n}-day streak',
  'sr.todayGoal': '{done}/{goal} today',
  'sr.goalNudge': 'Pass {n} more to hit today’s goal.',
  'sr.goalDone': 'Daily goal complete — nice work!',
  'sr.startStreak': 'Start a streak today',
  'sr.goalDoneShort': '✓ Goal done',
  'sr.reviewMistakes': 'Review your mistakes',
  'sr.reviewMistakesSub': '{n} saved to revisit — your fastest marks.',
  'sr.ageMock': 'Age {age} Mock',
  'sr.levelsPassed': 'Levels passed',
  'sr.topicsCompleted': 'Topics completed',
  'sr.totalAttempts': 'Total attempts',
  'sr.mistakesSaved': 'Mistakes saved',
  'sr.bestScore': 'Best score:',
  'sr.testBadge': '✓ Test',
  'sr.mockHistory': 'Mock Exam History',
  'sr.noMocks': 'No mock exams taken yet',
  'sr.topicBreakdown': 'Age {age} — Topic Breakdown',
  // Success
  'sr.perfect': 'Perfect Score!',
  'sr.wellDone': 'Well Done!',
  'sr.goodEffort': 'Good Effort!',
  'sr.keepPractising': 'Keep Practising',
  'sr.subPerfect': 'You nailed every question!',
  'sr.subPassed': 'You passed — next level unlocked!',
  'sr.subClose': 'Almost there — try again to pass.',
  'sr.subRetry': 'Review the topic and try again.',
  'sr.scoreLine': '{correct}/{total} correct',
  'sr.tryAgain': 'Try Again',
  'sr.nextLevel': 'Next Level',
  'sr.backToTopics': 'Back to Topics',
  'sr.backToHome': 'Back to Home',
  'sr.resultCorrect': 'Correct',
  'sr.resultWrong': 'Wrong',
  'sr.resultLabel': 'Result',
  'sr.pass': 'PASS',
  'sr.retry': 'RETRY',
  // Mistake Book
  'sr.mistakeBook': 'Mistake Book',
  'sr.savedMistakes': '{n} saved mistakes',
  'sr.practise': 'Practise',
  'sr.noMistakes': 'No mistakes yet!',
  'sr.noMistakesSub': "When you get a question wrong, it'll appear here for review.",
  'sr.remove': 'Remove',

  // Formula Vault
  'sr.formulaVault': 'Formula Vault',
  'sr.searchFormulas': 'Search formulas…',
  'sr.noFormulaMatch': 'No formulas match your search.',
  'sr.noFormulasYet': 'No formulas for this topic yet.',
  'sr.eg': 'e.g.',

  // Study Planner
  'sr.studyPlanner': 'Study Planner',
  'sr.plannerSub': 'Plan your week of practice',
  'sr.recommendedNext': 'Recommended next',
  'sr.thisWeek': 'This Week',
  'sr.noTopicSet': 'No topic set',
  'sr.pickTopic': '— pick —',
  'sr.clearWeekPlan': 'Clear week plan',
  'sr.day.Mon': 'Mon',
  'sr.day.Tue': 'Tue',
  'sr.day.Wed': 'Wed',
  'sr.day.Thu': 'Thu',
  'sr.day.Fri': 'Fri',
  'sr.day.Sat': 'Sat',
  'sr.day.Sun': 'Sun',

  // Academy onboarding (first-run intro)
  'sr.onboard.title': 'How The Academy works',
  'sr.onboard.t1': 'Master each level',
  'sr.onboard.b1': 'Score 80% or more to pass a level. Levels and topics unlock in order, so each builds on the last — no skipping the foundations.',
  'sr.onboard.t2': 'Tests & mock exams',
  'sr.onboard.b2': 'Pass a Topic Test to open the next topic. When you’re ready, sit the 40-question Mock Exam — IGCSE-style, with marks and exam tips.',
  'sr.onboard.t3': 'Tools that help you',
  'sr.onboard.b3': 'Every question shows working, hints, and common mistakes. The Formula Vault and your Mistake Book are always a tap away in the bottom bar.',
  'sr.onboard.skip': 'Skip',
  'sr.onboard.next': 'Next',
  'sr.onboard.start': 'Start learning →',

  // Accessibility (screen-reader labels)
  'sr.a11y.nav': 'Academy navigation',
  'sr.a11y.home': 'Math Adventure RPG — home',
  'sr.a11y.dailyGoal': 'Daily goal progress',
  'sr.a11y.back': 'Go back',

  // ── Kids' RPG UI chrome (ages 3–12). Generated maths, level intros, hints,
  //    tutorial prose and phase names stay English by design. ──
  'kid.next': 'Next →',
  'kid.startPlaying': '🚀 Start Playing!',
  'kid.imReady': "I'm Ready! ✊",
  'kid.nameCompanion': 'Name Your Companion!',
  'kid.companionSub': "They'll cheer you on through every level",
  'kid.startAdventure': 'Start Adventure! 🚀',
  'kid.grownups': '👨‍👩‍👧 Grown-up Corner',
  'kid.paused': 'PAUSED',
  'kid.resume': '▶️ Resume',
  'kid.restartLevel': '🔄 Restart Level',
  'kid.backHome': 'Back to Home',
  'kid.feedMonster': 'Feed your monster by solving fun math puzzles!',
  'kid.playNow': 'PLAY NOW',
  'kid.continue': 'CONTINUE',
  'kid.gotItNext': 'Got it! Next →',
  'kid.playAgain': '🔄 Play Again',
  'kid.badges': 'Badges',
  'kid.change': 'Change',
  'kid.edit': '✏️ Edit',
  'kid.yourCompanion': 'Your companion',
  'kid.fbAwesome': 'Awesome!',
  'kid.fbKeepGoing': '+2 🪙 Keep going!',
  'kid.levelUp': 'LEVEL UP!',
  'kid.bossDefeated': 'BOSS DEFEATED! 💀',
  'kid.nextLevel': 'NEXT LEVEL',
  'kid.champion': 'CHAMPION!',
  'kid.championSub': "You've mastered all 4 phases!",
  'kid.championSub2': 'What an incredible journey — well done!',
  'kid.playAgainBig': 'PLAY AGAIN',
  'kid.phaseUnlocked': 'Phase {n} Unlocked!',
  'kid.startPhase': 'START PHASE {n}',
} as const;

export type TranslationKey = keyof typeof en;
/** Shape every locale must satisfy exactly (no missing / no extra keys). */
export type Translations = Record<TranslationKey, string>;
