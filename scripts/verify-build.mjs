// scripts/verify-build.mjs
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const htmlPath = resolve('dist/index.html');
if (!existsSync(htmlPath)) {
  console.error('❌ dist/index.html does not exist. Run "npm run build" first.');
  process.exit(1);
}

const html = readFileSync(htmlPath, 'utf8');

// 1. CSP Meta 存在性
if (!/http-equiv="Content-Security-Policy"/i.test(html)) {
  console.error('❌ Build Check Failed: Content-Security-Policy meta tag is missing.');
  process.exit(1);
}

// 2. 嚴查無 src 屬性的危險 Inline Scripts
const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
const dangerousInline = scriptTags.filter((tag) => {
  const openTag = tag.match(/<script[^>]*>/i)?.[0] || '';
  return !/\ssrc=/i.test(openTag);
});
if (dangerousInline.length > 0) {
  console.error(`❌ Build Check Failed: ${dangerousInline.length} dangerous inline script(s) detected.`);
  process.exit(1);
}

// 3. GitHub Actions 子路徑 Base 與資源完整性實體驗證
const basePrefix = process.env.GITHUB_ACTIONS === 'true' ? '/QubitLab/' : '/';

// 攔截 Base 設定錯誤
if (process.env.GITHUB_ACTIONS === 'true' && !html.includes('/QubitLab/')) {
  console.error('❌ Build Check Failed: Base path "/QubitLab/" was not applied in GitHub Actions build.');
  process.exit(1);
}

const assetRefs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((url) => !url.startsWith('data:') && !url.startsWith('http'))
  .map((url) => url.startsWith(basePrefix) ? url.slice(basePrefix.length) : url.replace(/^\//, ''))
  .filter((p) => p.length > 0);

const missing = assetRefs.filter((p) => !existsSync(resolve('dist', p)));
if (missing.length > 0) {
  console.error(`❌ Build Check Failed: ${missing.length} referenced asset(s) missing from dist:`);
  missing.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

// 4. 自託管字體底線檢驗
if (!existsSync(resolve('dist/fonts/NotoSansMath-Regular.woff'))) {
  console.error('❌ Build Check Failed: Font "NotoSansMath-Regular.woff" missing in dist/fonts/');
  process.exit(1);
}

console.log('✅ Build verification passed: CSP present, 0 inline scripts, all asset references resolved, font present.');
