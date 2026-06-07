#!/usr/bin/env node
// Release automation for Math Adventure RPG (Android / Capacitor).
//
//   node scripts/release.mjs            → bump versionCode +1, keep versionName
//   node scripts/release.mjs 1.5        → bump versionCode +1, set versionName "1.5"
//   node scripts/release.mjs --dry-run  → show what would change, touch nothing
//
// What it does, in order (a real release gate — stops on the first failure):
//   1. Verify a clean git tree (no uncommitted changes).
//   2. Run the safety net: lint → test → smoke.
//   3. Bump versionCode (and optionally versionName) in android/app/build.gradle.
//   4. Build the web app + copy into the Android project (vite build + cap sync).
//   5. Print the remaining MANUAL steps (signed AAB in Android Studio + device test).
//
// It deliberately does NOT sign or upload — that stays a manual, on-device-verified
// step (see the printed checklist and docs/android-build-guide.md).
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GRADLE = join(ROOT, 'android', 'app', 'build.gradle');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const newVersionName = args.find((a) => !a.startsWith('--'));

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m',
};
const log = (m) => console.log(m);
const step = (m) => log(`\n${c.cyan}${c.bold}▶ ${m}${c.reset}`);
const ok = (m) => log(`${c.green}✓${c.reset} ${m}`);
const die = (m) => { log(`\n${c.red}${c.bold}✗ ${m}${c.reset}`); process.exit(1); };

function run(cmd) {
  log(`${c.dim}$ ${cmd}${c.reset}`);
  if (dryRun) { log(`${c.yellow}  (dry-run: skipped)${c.reset}`); return; }
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

// 1 — clean tree -------------------------------------------------------------
step('Checking git working tree');
const status = execSync('git status --porcelain', { cwd: ROOT }).toString().trim();
if (status && !dryRun) {
  die('Working tree is dirty. Commit or stash changes before releasing.\n' + status);
}
ok(status ? 'dirty tree (allowed under --dry-run)' : 'clean');

// 2 — safety net -------------------------------------------------------------
step('Running safety net (lint → test → smoke)');
run('npm run lint');
run('npm run test');
run('npm run smoke');
ok('lint, tests and smoke passed');

// 3 — version bump -----------------------------------------------------------
step('Bumping version in android/app/build.gradle');
let gradle = readFileSync(GRADLE, 'utf8');

const codeMatch = gradle.match(/versionCode\s+(\d+)/);
if (!codeMatch) die('Could not find versionCode in build.gradle');
const oldCode = Number(codeMatch[1]);
const newCode = oldCode + 1;

const nameMatch = gradle.match(/versionName\s+"([^"]+)"/);
if (!nameMatch) die('Could not find versionName in build.gradle');
const oldName = nameMatch[1];
const finalName = newVersionName ?? oldName;

gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${newCode}`);
if (newVersionName) {
  gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${finalName}"`);
}

log(`  versionCode: ${c.bold}${oldCode} → ${newCode}${c.reset}`);
log(`  versionName: ${c.bold}${oldName} → ${finalName}${c.reset}` +
    (newVersionName ? '' : `  ${c.dim}(unchanged — pass a version to change it)${c.reset}`));

if (dryRun) { log(`${c.yellow}  (dry-run: build.gradle not written)${c.reset}`); }
else { writeFileSync(GRADLE, gradle); ok('build.gradle updated'); }

// 4 — build + sync -----------------------------------------------------------
step('Building web app and syncing to Android');
run('npm run build');
run('npx cap sync android');
ok('dist/ built and copied to android/app/src/main/assets/www/');

// 5 — manual steps -----------------------------------------------------------
log(`\n${c.green}${c.bold}Release prepared.${c.reset} Remaining MANUAL steps:`);
log(`  ${c.bold}1.${c.reset} npx cap open android`);
log(`  ${c.bold}2.${c.reset} Android Studio → Build → Generate Signed Bundle/APK → release ${c.bold}AAB${c.reset}`);
log(`  ${c.bold}3.${c.reset} ${c.yellow}Install the AAB/APK on a REAL device and smoke-test it${c.reset}`);
log(`     ${c.dim}(R8/minify is on — verify the app loads, narration plays, a level completes)${c.reset}`);
log(`  ${c.bold}4.${c.reset} Commit the version bump:  ${c.dim}git commit -am "release: v${finalName} (code ${newCode})"${c.reset}`);
log(`  ${c.bold}5.${c.reset} Upload the AAB to Play Console (closed testing track)`);
log(`\n${c.dim}See docs/android-build-guide.md for keystore details.${c.reset}\n`);
