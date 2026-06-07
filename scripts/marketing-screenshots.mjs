// Marketing screenshots for the Play Store listing — 8 frames spanning the full
// journey: new landing → Kids' RPG → The Academy (ages 13 → 17).
// Output: screenshots/marketing/*.png  (1080×1920, Play-Store phone size).
//
// Usage:
//   1. npm run dev          (in another terminal — serves http://localhost:5173)
//   2. npm run screenshots
//
// Drives the real app in headless system Chrome via Playwright, seeds
// localStorage so the Academy shows unlocked, then captures each screen.
import { chromium } from 'playwright';
import path from 'path';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'screenshots', 'marketing');
mkdirSync(OUT, { recursive: true });

const APP_URL = 'http://localhost:5173';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VIEWPORT = { width: 540, height: 960 }; // ×2 deviceScaleFactor → 1080×1920 PNG

const errors = [];
const today = new Date().toISOString().slice(0, 10);

// Seed localStorage so the Kids' RPG skips the tutorial and the Academy shows
// fully unlocked with a healthy streak (for representative, polished frames).
async function seed(page) {
  await page.evaluate((today) => {
    localStorage.setItem('tutorialDone', '1');
    localStorage.setItem('mathadv-lang', 'en');
    localStorage.setItem('mathadv-senior-onboarded', '1');
    localStorage.setItem('mathadv-senior-progress', JSON.stringify({
      _v: 1,
      levels: {}, mistakes: [], mockExamScores: [],
      devUnlockAll: true,
      streak: { lastActiveDate: today, count: 5, longest: 7 },
      daily: { date: today, passed: 2 },
    }));
  }, today);
}

async function shot(page, name, waitText, ms = 700) {
  try {
    if (waitText) await page.waitForSelector(`text=${waitText}`, { timeout: 7000 });
  } catch {
    errors.push(`⚠ "${waitText}" not found for ${name} (captured anyway)`);
  }
  await page.waitForTimeout(ms);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(`  📸 ${name}.png`);
}

async function run() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await (await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 })).newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));

  // Prime the origin, seed state, then start clean.
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await seed(page);

  // 1 — Home / new landing (hero + Free-forever badge + age chooser)
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await shot(page, '1-home-landing', 'Math Adventure RPG');

  // 2 — Kids' RPG: the Math Monsters hub (set the companion, then land on Play Now)
  await page.goto(`${APP_URL}/play?phase=1`, { waitUntil: 'networkidle' });
  try {
    const startBtn = page.locator('button:has-text("Start Adventure")');
    if (await startBtn.count()) { await startBtn.click(); await page.waitForTimeout(800); }
  } catch (e) { errors.push('kids-hub nav: ' + e.message); }
  await shot(page, '2-kids-hub', 'PLAY NOW');

  // 3 — Kids' RPG: a gameplay screen (Play Now → level intro → a question)
  try {
    await page.locator('button:has-text("PLAY NOW")').click();
    await page.waitForTimeout(900);
    const cont = page.locator('button:has-text("Continue")');
    if (await cont.count()) { await cont.first().click(); await page.waitForTimeout(800); }
    // Level-intro card → "I'm Ready!" → the actual question
    const ready = page.locator('button:has-text("Ready")');
    if (await ready.count()) { await ready.first().click(); await page.waitForTimeout(1100); }
  } catch (e) { errors.push('kids-play nav: ' + e.message); }
  await shot(page, '3-kids-play', null, 700);

  // 4 — The Academy: age 13 (Explorers) topic list
  await page.goto(`${APP_URL}/senior/topics/13`, { waitUntil: 'networkidle' });
  await shot(page, '4-academy-13-explorers', 'Explorers');

  // 5 — The Academy: a question (working steps, marks, options)
  await page.goto(`${APP_URL}/senior/activity?topicId=age13-numbers&level=1&mode=topic&isTopicTest=false`, { waitUntil: 'networkidle' });
  await shot(page, '5-academy-question', null, 1800);

  // 6 — The Academy: dashboard (streak + daily goal)
  await page.goto(`${APP_URL}/senior/dashboard`, { waitUntil: 'networkidle' });
  await shot(page, '6-academy-dashboard', 'Dashboard');

  // 7 — The Academy: age 15 (Builders) topic list
  await page.goto(`${APP_URL}/senior/topics/15`, { waitUntil: 'networkidle' });
  await shot(page, '7-academy-15-builders', 'Builders');

  // 8 — The Academy: age 17 (Thinkers) — the pinnacle
  await page.goto(`${APP_URL}/senior/topics/17`, { waitUntil: 'networkidle' });
  await shot(page, '8-academy-17-thinkers', 'Thinkers');

  await browser.close();
  console.log(`\n${errors.length ? '⚠ notes:\n  ' + errors.join('\n  ') : '✅ no console errors'}`);
  console.log(`📁 ${OUT}`);
}
run().catch(e => { console.error(e); process.exit(1); });
