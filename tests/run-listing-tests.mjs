import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const temporary = await mkdtemp(join(tmpdir(), 'booksa-tests-'));
try {
 const suites = ['listing', 'calendar'];
 await build({ entryPoints: suites.map((suite) => `tests/${suite}.test.ts`), bundle: true, tsconfig: 'tsconfig.app.json', jsx: 'automatic', loader: { '.png': 'file' }, platform: 'node', format: 'cjs', outdir: temporary, outExtension: { '.js': '.cjs' }, plugins: [{ name: 'firebase-test-double', setup(b) { b.onResolve({ filter: /^(firebase\/(firestore|storage)|\.\/firebase)$/ }, () => ({ path: resolve('tests/listing-firebase.mock.ts') })); b.onResolve({ filter: /^firebase\/auth$/ }, () => ({ path: resolve('tests/phone-auth.mock.ts') })); } }] });
 const result = spawnSync(process.execPath, ['--test', ...suites.map((suite) => join(temporary, `${suite}.test.cjs`))], { stdio: 'inherit' }); process.exitCode = result.status ?? 1;
} finally { await rm(temporary, { recursive: true, force: true }); }
