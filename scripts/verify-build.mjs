// scripts/verify-build.mjs
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const isCI = process.env.GITHUB_ACTIONS === 'true';
const REPO_NAME = 'QubitLab'; // ⚠️ 與 vite.config.ts 的 base 保持一致
const basePrefix = isCI ? `/${REPO_NAME}/` : '/';

const htmlPath = resolve('dist/index.html');
if (!existsSync(htmlPath)) {
  console.error('❌ dist/index.html does not exist. Run "npm run build" first.');
  process.exit(1);
}
const html = readFileSync(htmlPath, 'utf8');

// 1. CSP 存在性 + 內容
const cspMatch = html.match(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*content=["']([^"']*)["']/i);
if (!cspMatch) {
  console.error('❌ CSP meta tag is missing.');
  process.exit(1);
}
const csp = cspMatch[1];
for (const d of ["default-src 'self'", "script-src 'self'", "object-src 'none'"]) {
  if (!csp.includes(d)) {
    console.error(`❌ CSP missing directive: ${d}`);
    process.exit(1);
  }
}

// 2. Inline script
const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
const dangerousInline = scriptTags.filter((tag) => {
  const openTag = tag.match(/<script[^>]*>/i)?.[0] || '';
  return !/\ssrc=/i.test(openTag);
});
if (dangerousInline.length > 0) {
  console.error(`❌ ${dangerousInline.length} dangerous inline script(s) detected.`);
  process.exit(1);
}

// 3. Base 快速檢查
if (isCI && !html.includes(basePrefix)) {
  console.error(`❌ Base path "${basePrefix}" not applied in CI build.`);
  process.exit(1);
}

// 4. 資源引用：過濾協議/錨點/協議相對，CI 下檢查 base 前綴
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
    if (rel && !existsSync(resolve('dist', rel))) missing.push(url);
  } else {
    if (!existsSync(resolve('dist', url))) missing.push(url);
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

// 5. 字體
if (!existsSync(resolve('dist/fonts/NotoSansMath-Regular.woff'))) {
  console.error('❌ Font "NotoSansMath-Regular.woff" missing in dist/fonts/');
  process.exit(1);
}

console.log('✅ Build verification passed: CSP content valid, 0 inline scripts, all asset references resolved, font present.');
