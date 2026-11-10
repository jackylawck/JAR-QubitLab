// scripts/verify-build.mjs
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const isCI = process.env.GITHUB_ACTIONS === 'true';
const REPO_NAME = 'JAR-QubitLab'; // ⚠️ 與 vite.config.ts 的 base 保持一致
const basePrefix = isCI ? `/${REPO_NAME}/` : '/';

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

// 基本指令字串檢查
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

// 彈性檢查 worker-src：必須同時包含 blob: 與 'self'（相容任意順序）
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
if (isCI && !html.includes(basePrefix)) {
  console.error(`❌ Base path "${basePrefix}" not applied in CI build.`);
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
    if (isCI && !url.startsWith(basePrefix)) {
      badBase.push(url);
      continue;
    }
    const rel = url.startsWith(basePrefix) ? url.slice(basePrefix.length) : url.slice(1);
    if (rel && !existsSync(join(distDir, rel))) missing.push(url);
  } else {
    if (!existsSync(join(distDir, url))) missing.push(url);
  }
}

if (badBase.length > 0) {
  console.error(`❌ CI build has absolute paths not under "${basePrefix}":`);
  badBase.forEach((u) => console.error(`  - ${u}`));
  process.exit(1);
}
if (missing.length > 0) {
  console.error(`❌ ${missing.length} referenced asset(s) missing from dist:`);
  missing.forEach((u) => console.error(`  - ${u}`));
  process.exit(1);
}

// ==========================================
// 4. 字體資源存在性
// ==========================================
if (!existsSync(join(distDir, 'fonts', 'NotoSansMath-Regular.woff'))) {
  console.error('❌ Font "NotoSansMath-Regular.woff" missing in dist/fonts/');
  process.exit(1);
}

// ==========================================
// 5. 原始碼未抽換環境變數語法掃描
// ==========================================
function scanJSFilesForSecrets(dir) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      scanJSFilesForSecrets(fullPath);
    } else if (extname(fullPath) === '.js') {
      const content = readFileSync(fullPath, 'utf8');
      if (content.includes('import.meta.env.') || content.includes('process.env.')) {
        console.error(`❌ Potential environment variable leak detected in: ${fullPath}`);
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
console.log('  - Asset References & Fonts Resolved');
console.log('  - No Environment Variables Leaked');
