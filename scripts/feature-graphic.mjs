// Renders scripts/feature-graphic.html to an exact 1024×500 PNG for the Play
// Store "Feature graphic" slot. No dev server needed — loads the local HTML
// file directly. Output: screenshots/feature-graphic.png
//
// Usage: npm run feature-graphic
import { chromium } from 'playwright';
import path from 'path';
import { mkdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'screenshots');
mkdirSync(OUT, { recursive: true });

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTML = pathToFileURL(path.join(__dirname, 'feature-graphic.html')).href;

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
// deviceScaleFactor 1 → exact 1024×500 (Play Store requires that precise size).
const page = await (await browser.newContext({
  viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1,
})).newPage();

await page.goto(HTML, { waitUntil: 'networkidle' });
await page.waitForTimeout(600); // let webfonts settle
const out = path.join(OUT, 'feature-graphic.png');
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1024, height: 500 } });
await browser.close();
console.log(`📸 feature-graphic.png (1024×500)\n📁 ${out}`);
