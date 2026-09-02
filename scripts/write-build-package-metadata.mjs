import { mkdir, writeFile } from 'node:fs/promises';

const packageFormats = [
  ['lib/cjs', 'commonjs'],
  ['lib/esm', 'module']
];

await Promise.all(
  packageFormats.map(async ([directory, type]) => {
    await mkdir(directory, { recursive: true });
    await writeFile(`${directory}/package.json`, `${JSON.stringify({ type, sideEffects: false })}\n`, 'utf8');
  })
);
