// WCAG-AA colour-contrast audit. Loads each key screen in headless Chrome,
// injects axe-core, runs the wcag2aa ruleset, and reports colour-contrast
// violations (the failing text, its colours, and the actual vs required ratio).
//
// Usage:  npm run dev   (terminal 1)   then   node scripts/a11y-audit.mjs
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AXE = path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP = 'http://localhost:5173';

const PAGES = [
  { name: 'Home',             url: `${APP}/` },
  { name: 'Curriculum',       url: `${APP}/curriculum` },
  { name: 'Grown-up Corner',  url: `${APP}/grown-up-corner` },
  { name: 'Kids RPG (start)', url: `${APP}/play?phase=1` },
  { name: 'Academy topics',   url: `${APP}/senior/topics/17` },
  { name: 'Academy dashboard',url: `${APP}/senior/dashboard` },
  { name: 'Academy question', url: `${APP}/senior/activity?topicId=age13-numbers&level=1&mode=topic&isTopicTest=false` },
];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 })).newPage();

// Seed so Academy renders unlocked content.
await page.goto(APP, { waitUntil: 'networkidle' });
const today = new Date().toISOString().slice(0, 10);
await page.evaluate((today) => {
  localStorage.setItem('mathadv-senior-onboarded', '1');
  localStorage.setItem('tutorialDone', '1');
  localStorage.setItem('mathadv-senior-progress', JSON.stringify({
    _v: 1, levels: {}, mistakes: [], mockExamScores: [], devUnlockAll: true,
    streak: { lastActiveDate: today, count: 5, longest: 7 }, daily: { date: today, passed: 2 },
  }));
}, today);

let total = 0;
for (const { name, url } of PAGES) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.addScriptTag({ path: AXE });
  const res = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { runOnly: ['cat.color'], resultTypes: ['violations'] });
    return r.violations.filter(v => v.id === 'color-contrast');
  });

  const nodes = res.flatMap(v => v.nodes);
  console.log(`\n=== ${name} ===  ${nodes.length ? `❌ ${nodes.length} contrast issue(s)` : '✅ clean'}`);
  for (const n of nodes) {
    const d = (n.any[0] && n.any[0].data) || {};
    const text = (n.html || '').replace(/\s+/g, ' ').slice(0, 70);
    console.log(`  • ${d.contrastRatio}:1 (need ${d.expectedContrastRatio})  fg ${d.fgColor} / bg ${d.bgColor}`);
    console.log(`      ${n.target.join(' ')}`);
    console.log(`      ${text}`);
  }
  total += nodes.length;
}

await browser.close();
console.log(`\n${total ? `❌ ${total} colour-contrast violation(s) total` : '✅ no colour-contrast violations'}`);
