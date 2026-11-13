// scripts/verify-build.mjs
/*
 * Project: J.A.R. QubitLab (Joint Applied Research)
 * Creator: 羅子淇 Jacky Law (https://jackylawck.github.io/jackylawck)
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const REPO_NAME = 'JAR-QubitLab';
// 🌟 優化 1：對齊 vite.config.ts 的 isBuild 邏輯，無論 CI 或本機，只要是 npm run build，路徑皆為子路徑
const basePrefix = `/${REPO_NAME}/`;

const distDir = resolve('dist');
const htmlPath = join(distDir, 'index.html');

if (!existsSync(htmlPath)) {
  console.error('❌ dist/index.html does not exist. Run "npm run build" first.');
  process.exit(1);
}
const html = readFileSync(htmlPath, 'utf8');

// ==========================================
// 1. CSP 存在性與內容檢查
// ==========================================
const cspMatch =
  html.match(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*content=(["'])([\s\S]*?)\1/i) ||
  html.match(/<meta[^>]*content=(["'])([\s\S]*?)\1[^>]*http-equiv=["']Content-Security-Policy["']/i);

if (!cspMatch) {
  console.error('❌ CSP meta tag is missing.');
  process.exit(1);
}

const csp = cspMatch[2];

const basicDirectives = [
  "default-src 'self'",
  "script-src 'self'",
  "object-src 'none'",
];

for (const d of basicDirectives) {
  if (!csp.includes(d)) {
    console.error(`❌ CSP missing directive: ${d}`);
    process.exit(1);
  }
}

const workerSrcMatch = csp.match(/worker-src\s+([^;]+)/i);
if (
  !workerSrcMatch ||
  !workerSrcMatch[1].includes('blob:') ||
  !workerSrcMatch[1].includes("'self'")
) {
  console.error("❌ CSP missing valid worker-src directive (requires both 'self' and blob:)");
  process.exit(1);
}

// ==========================================
// 2. Inline Script 檢測
// ==========================================
const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
const dangerousInline = scriptTags.filter((tag) => {
  const openTag = tag.match(/<script[^>]*>/i)?.[0] || '';
  return !/\ssrc=/i.test(openTag);
});

if (dangerousInline.length > 0) {
  console.error(`❌ ${dangerousInline.length} dangerous inline script(s) detected.`);
  process.exit(1);
}

// ==========================================
// 3. Base Prefix 與靜態資源引用檢查
// ==========================================
if (!html.includes(basePrefix)) {
  console.error(`❌ Base path "${basePrefix}" not applied in build HTML.`);
  process.exit(1);
}

const assetRefs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
  .map((m) => m[1])
  .filter((url) => url.length > 0)
  .filter((url) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url));

const missing = [];
const badBase = [];

for (const url of assetRefs) {
  if (url.startsWith('/')) {
    if (!url.startsWith(basePrefix)) {
      badBase.push(url);
      continue;
    }
    const rel = url.slice(basePrefix.length);
    if (rel && !existsSync(join(distDir, rel))) missing.push(url);
  } else {
    if (!existsSync(join(distDir, url))) missing.push(url);
  }
}

if (badBase.length > 0) {
  console.error(`❌ Build has absolute paths not under "${basePrefix}":`);
  badBase.forEach((u) => console.error(`  - ${u}`));
  process.exit(1);
}
if (missing.length > 0) {
  console.error(`❌ ${missing.length} referenced asset(s) missing from dist:`);
  missing.forEach((u) => console.error(`  - ${u}`));
  process.exit(1);
}

// ==========================================
// 4. PWA 核心資源與字體存在性檢查 (擴充)
// ==========================================
const requiredAssets = [
  join('fonts', 'NotoSansMath-Regular.woff'),
  'sw.js',
  'manifest.json',
  'JARQubitLab192icon.png',
  'JARQubitLab512icon.png'
];

for (const asset of requiredAssets) {
  if (!existsSync(join(distDir, asset))) {
    console.error(`❌ Core asset missing in dist: ${asset}`);
    process.exit(1);
  }
}

// ==========================================
// 5. 原始碼未抽換環境變數語法掃描 (精準優化)
// ==========================================
function scanJSFilesForSecrets(dir) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      scanJSFilesForSecrets(fullPath);
    } else if (extname(fullPath) === '.js') {
      const content = readFileSync(fullPath, 'utf8');
      // 🌟 優化 3：精準捕捉 Vite 構建遺漏的原始 Token，避免誤殺合法字串
      const leakMatch = content.match(/(import\.meta\.env\.[a-zA-Z0-9_]+|process\.env\.[a-zA-Z0-9_]+)/);
      if (leakMatch) {
        console.error(`❌ Unreplaced environment variable token detected in: ${fullPath}`);
        console.error(`   -> Found: ${leakMatch[1]}`);
        process.exit(1);
      }
    }
  }
}
scanJSFilesForSecrets(distDir);

// ==========================================
// 完成驗證
// ==========================================
console.log('✅ Build verification passed:');
console.log('  - CSP Directives valid');
console.log('  - 0 Inline Scripts');
console.log('  - Asset References, Fonts & PWA Manifest Resolved');
console.log('  - No Environment Variables Leaked');
