import { cp, mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceDir = resolve('src/public/assets/vendor');
const targetDir = resolve('docs/assets/vendor');

try {
  await stat(sourceDir);
} catch {
  console.warn(`Vendor source folder not found: ${sourceDir}`);
  process.exit(0);
}

await mkdir(resolve('docs/assets'), { recursive: true });
await cp(sourceDir, targetDir, { recursive: true, force: true });
console.log(`Copied vendor assets to ${targetDir}`);
