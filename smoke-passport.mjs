// People's Home Passport round-trip smoke for Math Adventure.
// Run: node --experimental-strip-types smoke-passport.mjs
// Pure logic only — no DOM, no network. Asserts the envelope is interoperable
// with Our World / Everyday Foundations and that merge never loses or double-counts.
import { buildPassport, parsePassport, mergeImport, APP_NAME } from './src/lib/passport.ts';

let fail = 0;
const err = (m) => { console.error('✗ ' + m); fail++; };

const nativeStamps = [{ label: 'I earned the Sprout badge', app: APP_NAME, icon: '🌱' }];
const env = buildPassport({ name: 'Sipho', emoji: '🐉', nativeStamps, earnedBadges: ['phase1_complete'], imported: [] });
if (env.kind !== 'peoples-home-passport') err('wrong envelope kind');
if (env.stamps.length !== 1) err('export lost the native badge stamp');
const reparsed = parsePassport(JSON.stringify(env));
if (reparsed.learner.name !== 'Sipho') err('learner did not survive round-trip');

// A foreign passport (e.g. from Our World) must carry its stamp in as imported.
const foreign = {
  kind: 'peoples-home-passport', passportVersion: 1, exportedAt: new Date().toISOString(),
  exportedFrom: 'Our World', learner: { name: 'Sipho', emoji: '🐉' },
  stamps: [{ label: 'I Found My First Province', app: 'Our World', icon: '⭐' }],
  apps: { 'our-world': {} },
};
const r = mergeImport({ earnedBadges: ['phase1_complete'], imported: [] }, foreign);
if (r.foreignAdded !== 1) err('foreign stamp was not carried in');
if (r.imported.some((s) => s.app === APP_NAME)) err('own app leaked into imported');

// Re-importing our OWN export must restore badges without double-counting.
const r2 = mergeImport({ earnedBadges: [], imported: [] }, env);
if (r2.nativeAdded !== 1) err('own badges not restored on import');
const r3 = mergeImport({ earnedBadges: ['phase1_complete'], imported: [] }, env);
if (r3.nativeAdded !== 0 || r3.foreignAdded !== 0) err('re-importing own passport double-counted');

if (fail) { console.error(`\n${fail} problem(s) found.`); process.exit(1); }
console.log('✅ Math Adventure passport round-trip holds (interoperable envelope).');
