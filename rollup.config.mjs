import { readdir } from 'node:fs/promises';
import path from 'node:path';

async function listJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(entry => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listJavaScriptFiles(entryPath) : entryPath.endsWith('.js') ? [entryPath] : [];
    })
  );
  return files.flat();
}

const stagingRoot = path.resolve('out-tsc/esm');
const inputFiles = (await listJavaScriptFiles(stagingRoot)).sort();

// Keep every staged module as an independent strict entry. Linking the root barrel lets Rollup
// expand its wildcard exports and prevents downstream esbuild consumers from pruning the graph.
// Each relative edge stays external because its target is emitted by its own module configuration;
// bare dependencies stay external as well.
export default inputFiles.map(input => ({
  input,
  makeAbsoluteExternalsRelative: false,
  external: moduleId => !path.isAbsolute(moduleId),
  preserveEntrySignatures: 'strict',
  output: {
    dir: 'lib/esm',
    entryFileNames: '[name].js',
    chunkFileNames: '[name].js',
    format: 'esm',
    preserveModules: true,
    preserveModulesRoot: stagingRoot
  },
  treeshake: {
    moduleSideEffects: false
  }
}));
