import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, copyFile, cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import ts from 'typescript';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
const packageLock = JSON.parse(await readFile(path.join(packageRoot, 'package-lock.json'), 'utf8'));
const esmIndexPath = path.join(packageRoot, packageJson.exports['.'].import);
const declaredDependencyNames = Object.keys(packageJson.dependencies || {});
const bundleExternalDependencies = declaredDependencyNames.flatMap(dependencyName => [
  dependencyName,
  `${dependencyName}/*`
]);

const normalizePath = filePath => filePath.split(path.sep).join('/');

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(entry => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    })
  );
  return nestedFiles.flat();
}

function collectModuleSpecifiers(filePath, sourceText) {
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
  const specifiers = [];

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      const literal = node.argument.literal;
      if (ts.isStringLiteral(literal)) {
        specifiers.push(literal.text);
      }
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteral(node.moduleReference.expression)
    ) {
      specifiers.push(node.moduleReference.expression.text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

async function verifyRelativeModuleSpecifiers(files, declarationFiles) {
  for (const filePath of files) {
    const sourceText = await readFile(filePath, 'utf8');
    const relativeSpecifiers = collectModuleSpecifiers(filePath, sourceText).filter(specifier =>
      specifier.startsWith('.')
    );

    for (const specifier of relativeSpecifiers) {
      assert.ok(specifier.endsWith('.js'), `${normalizePath(filePath)} contains unstable specifier ${specifier}`);
      const emittedTargetPath = path.resolve(path.dirname(filePath), specifier);
      const targetPath = declarationFiles ? emittedTargetPath.replace(/\.js$/, '.d.ts') : emittedTargetPath;
      await assert.doesNotReject(
        access(targetPath),
        `${normalizePath(filePath)} references missing module ${specifier}`
      );
    }
  }
}

function findEntryOutput(metafile, entryFileName) {
  const normalizedEntryFileName = normalizePath(entryFileName);
  const matchingOutput = Object.entries(metafile.outputs).find(
    ([, output]) => output.entryPoint && normalizePath(output.entryPoint).endsWith(normalizedEntryFileName)
  );
  assert.ok(matchingOutput, `Unable to find bundle output for ${entryFileName}`);
  return matchingOutput;
}

function collectInitialOutputs(metafile, entryOutputPath) {
  const normalizedOutputs = new Map(
    Object.entries(metafile.outputs).map(([outputPath, output]) => [normalizePath(outputPath), output])
  );
  const pendingOutputPaths = [normalizePath(entryOutputPath)];
  const initialOutputs = new Map();

  while (pendingOutputPaths.length) {
    const outputPath = pendingOutputPaths.pop();
    if (initialOutputs.has(outputPath)) {
      continue;
    }

    const output = normalizedOutputs.get(outputPath);
    assert.ok(output, `Unable to resolve output ${outputPath}`);
    initialOutputs.set(outputPath, output);

    output.imports
      .filter(importedOutput => !importedOutput.external && importedOutput.kind !== 'dynamic-import')
      .forEach(importedOutput => {
        const normalizedImportPath = normalizePath(importedOutput.path);
        const resolvedImportPath = path.posix.normalize(
          path.posix.join(path.posix.dirname(outputPath), normalizedImportPath)
        );
        const matchingPath = normalizedOutputs.has(normalizedImportPath) ? normalizedImportPath : resolvedImportPath;
        assert.ok(normalizedOutputs.has(matchingPath), `Unable to resolve bundled import ${importedOutput.path}`);
        pendingOutputPaths.push(matchingPath);
      });
  }

  return initialOutputs;
}

function assertInputsExcluded(outputs, excludedInputFragments) {
  const retainedInputs = [...outputs.values()].flatMap(output =>
    Object.entries(output.inputs)
      .filter(([, contribution]) => contribution.bytesInOutput > 0)
      .map(([inputPath]) => normalizePath(inputPath))
  );

  excludedInputFragments.forEach(fragment => {
    assert.equal(
      retainedInputs.some(inputPath => inputPath.includes(fragment)),
      false,
      `Unexpected initial-bundle input matching ${fragment}`
    );
  });
}

function assertDependenciesExcluded(outputs) {
  const externalImports = [...outputs.values()].flatMap(output =>
    output.imports.filter(importedOutput => importedOutput.external).map(importedOutput => importedOutput.path)
  );

  declaredDependencyNames.forEach(dependencyName => {
    assert.equal(
      externalImports.some(importPath => importPath === dependencyName || importPath.startsWith(`${dependencyName}/`)),
      false,
      `Unexpected dependency in initial bundle: ${dependencyName}`
    );
  });
}

async function verifyModuleFormats() {
  const esmExports = await import(packageJson.name);
  const require = createRequire(import.meta.url);
  const cjsExports = require(packageJson.name);

  assert.deepEqual(Object.keys(esmExports).sort(), Object.keys(cjsExports).sort(), 'ESM and CommonJS exports differ');
  assert.equal(new esmExports.User('esm-smoke-test').uid, 'esm-smoke-test');
  assert.equal(new cjsExports.User('cjs-smoke-test').uid, 'cjs-smoke-test');
  assert.equal(new esmExports.DataDistance(123).getValue(), 123);
  assert.equal(new cjsExports.DataDistance(123).getValue(), 123);

  const createNativeEventJson = () => ({
    activities: [],
    description: null,
    endDate: 1,
    isMerge: false,
    name: 'package-smoke-test',
    powerCurve: null,
    privacy: esmExports.Privacy.Private,
    srcFileType: esmExports.FileType.FIT,
    startDate: 0,
    stats: {}
  });
  assert.equal(esmExports.SportsLib.importFromJSON(createNativeEventJson()).name, 'package-smoke-test');
  assert.equal(cjsExports.SportsLib.importFromJSON(createNativeEventJson()).name, 'package-smoke-test');

  return Object.keys(esmExports).length;
}

async function verifyTypeDeclarations(temporaryDirectory) {
  const typeScriptPath = path.join(packageRoot, 'node_modules/typescript/bin/tsc');
  const fixtureNames = ['package-types.cts', 'package-types.mts'];
  const fixturePaths = fixtureNames.map(fixtureName => path.join(temporaryDirectory, fixtureName));
  await Promise.all(
    fixtureNames.map((fixtureName, index) =>
      copyFile(path.join(packageRoot, 'scripts/fixtures', fixtureName), fixturePaths[index])
    )
  );

  const compile = (module, moduleResolution, fixtures) =>
    execFileSync(
      process.execPath,
      [
        typeScriptPath,
        '--lib',
        'es2020,dom',
        '--module',
        module,
        '--moduleResolution',
        moduleResolution,
        '--noEmit',
        '--skipLibCheck',
        '--strict',
        '--target',
        'es2020',
        '--typeRoots',
        path.join(packageRoot, 'node_modules/@types'),
        ...fixtures
      ],
      { cwd: temporaryDirectory, stdio: 'inherit' }
    );

  compile('NodeNext', 'NodeNext', fixturePaths);
  compile('commonjs', 'node', [fixturePaths[0]]);
  compile('esnext', 'bundler', [fixturePaths[1]]);
}

async function verifySpecifierRewriter(temporaryDirectory) {
  const fixtureDirectory = path.join(temporaryDirectory, 'specifier-rewriter');
  const inputPath = path.join(fixtureDirectory, 'input.d.ts');
  await mkdir(fixtureDirectory);
  await Promise.all([
    writeFile(
      inputPath,
      [
        'export type InlineType = import("./target").Target;',
        'import Alias = require("./target");',
        'export { Alias };',
        ''
      ].join('\n'),
      'utf8'
    ),
    writeFile(path.join(fixtureDirectory, 'target.js'), 'export {};\n', 'utf8'),
    writeFile(path.join(fixtureDirectory, 'target.d.ts'), 'export interface Target {}\n', 'utf8')
  ]);

  execFileSync(
    process.execPath,
    [path.join(packageRoot, 'scripts/rewrite-esm-specifiers.mjs'), fixtureDirectory, '.d.ts'],
    { stdio: 'pipe' }
  );
  const rewrittenDeclaration = await readFile(inputPath, 'utf8');
  assert.ok(rewrittenDeclaration.includes('import("./target.js")'));
  assert.ok(rewrittenDeclaration.includes('require("./target.js")'));
}

async function verifyBuildLayout() {
  const sourceRoot = path.join(packageRoot, 'src');
  const sourceFiles = (await listFiles(sourceRoot)).filter(filePath => {
    const relativeSourcePath = normalizePath(path.relative(sourceRoot, filePath));
    return filePath.endsWith('.ts') && !filePath.endsWith('.spec.ts') && !relativeSourcePath.startsWith('specs/');
  });
  const esmFiles = await listFiles(path.join(packageRoot, 'lib/esm'));
  const cjsFiles = await listFiles(path.join(packageRoot, 'lib/cjs'));
  const allBuildFiles = [...esmFiles, ...cjsFiles].map(normalizePath);
  const esmJavaScriptFiles = esmFiles.filter(filePath => filePath.endsWith('.js'));
  const esmDeclarationFiles = esmFiles.filter(filePath => filePath.endsWith('.d.ts'));
  const cjsJavaScriptFiles = cjsFiles.filter(filePath => filePath.endsWith('.js'));
  const cjsDeclarationFiles = cjsFiles.filter(filePath => filePath.endsWith('.d.ts'));

  assert.equal(esmJavaScriptFiles.length, sourceFiles.length, 'Not every source module was emitted as ESM');
  assert.equal(esmJavaScriptFiles.length, esmDeclarationFiles.length, 'ESM modules and declarations differ');
  assert.equal(cjsJavaScriptFiles.length, esmJavaScriptFiles.length, 'ESM and CommonJS module counts differ');
  assert.equal(cjsDeclarationFiles.length, 0, 'CommonJS contains duplicate declarations');
  assert.equal(
    allBuildFiles.some(filePath => /\.spec\.(?:js|d\.ts)$/.test(filePath)),
    false,
    'Tests leaked into lib'
  );
  assert.ok((await stat(esmIndexPath)).size < 100_000, 'ESM entry point appears to be bundled');
  await verifyRelativeModuleSpecifiers(esmJavaScriptFiles, false);
  await verifyRelativeModuleSpecifiers(esmDeclarationFiles, true);
  for (const format of ['esm', 'cjs']) {
    const formatPackageJson = JSON.parse(await readFile(path.join(packageRoot, `lib/${format}/package.json`), 'utf8'));
    assert.equal(formatPackageJson.sideEffects, false, `${format} package metadata masks side-effect information`);
  }
  await assert.rejects(access(path.join(packageRoot, 'out-tsc/esm')), { code: 'ENOENT' });
}

async function bundleFixture(temporaryDirectory, fixtureName) {
  const fixturePath = path.join(temporaryDirectory, fixtureName);
  const outputDirectory = path.join(temporaryDirectory, 'startup');
  await copyFile(path.join(packageRoot, 'scripts/fixtures', fixtureName), fixturePath);

  return build({
    absWorkingDir: temporaryDirectory,
    bundle: true,
    chunkNames: 'chunks/[name]-[hash]',
    entryNames: '[name]',
    entryPoints: [fixturePath],
    external: bundleExternalDependencies,
    format: 'esm',
    logLevel: 'silent',
    metafile: true,
    minify: true,
    outExtension: { '.js': '.mjs' },
    outdir: outputDirectory,
    platform: 'browser',
    splitting: true,
    target: 'es2020',
    treeShaking: true,
    write: false
  });
}

async function verifyRepresentativeTreeShaking(temporaryDirectory) {
  const fixtureName = 'representative-startup.mjs';
  const result = await bundleFixture(temporaryDirectory, fixtureName);

  const [entryOutputPath] = findEntryOutput(result.metafile, fixtureName);
  const initialOutputs = collectInitialOutputs(result.metafile, entryOutputPath);
  const initialBytes = [...initialOutputs.values()].reduce((total, output) => total + output.bytes, 0);
  const initialOutputPaths = new Set(
    [...initialOutputs.keys()].map(outputPath =>
      normalizePath(path.isAbsolute(outputPath) ? outputPath : path.resolve(temporaryDirectory, outputPath))
    )
  );
  const initialOutputFiles = result.outputFiles.filter(outputFile =>
    initialOutputPaths.has(normalizePath(outputFile.path))
  );
  assert.equal(initialOutputFiles.length, initialOutputs.size, 'Unable to inspect every initial bundle output');
  const initialOutputText = initialOutputFiles.map(outputFile => outputFile.text).join('\n');

  assert.ok(initialBytes <= 60_000, `Representative startup bundle is ${initialBytes} bytes; expected at most 60000`);
  assertInputsExcluded(initialOutputs, [
    '/events/adapters/importers/',
    '/events/adapters/exporters/',
    '/routes/adapters/',
    '/geodesy/',
    '/data/ibi/data.ibi.filters.',
    '/events/utilities/activity.utilities.'
  ]);
  assertDependenciesExcluded(initialOutputs);
  declaredDependencyNames.forEach(dependencyName => {
    assert.equal(
      initialOutputText.includes(dependencyName),
      false,
      `Unexpected dependency reference in initial bundle: ${dependencyName}`
    );
  });

  return initialBytes;
}

function verifyPackContents() {
  const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: packageRoot,
    encoding: 'utf8'
  });
  const [pack] = JSON.parse(packOutput);
  const paths = pack.files.map(file => normalizePath(file.path));
  const unexpectedFiles = paths.filter(
    filePath => !['LICENSE', 'README.md', 'package.json'].includes(filePath) && !filePath.startsWith('lib/')
  );

  assert.deepEqual(unexpectedFiles, [], `Unexpected package files: ${unexpectedFiles.join(', ')}`);
  assert.equal(
    paths.some(filePath => /\.spec\.(?:js|d\.ts)$/.test(filePath)),
    false,
    'Tests leaked into package'
  );
  assert.equal(
    paths.some(filePath => filePath.startsWith('lib/cjs/') && filePath.endsWith('.d.ts')),
    false
  );
  return pack;
}

assert.equal(packageLock.version, packageJson.version);
assert.equal(packageLock.packages[''].version, packageJson.version);
assert.equal(packageJson.sideEffects, false);
assert.deepEqual(Object.keys(packageJson.exports), ['.']);
assert.equal(packageJson.main, 'lib/cjs/index.js');
assert.equal(packageJson.module, 'lib/esm/index.js');
assert.equal(packageJson.types, 'lib/esm/index.d.ts');
assert.equal(packageJson.exports['.'].types, './lib/esm/index.d.ts');
assert.equal(packageJson.exports['.'].import, './lib/esm/index.js');
assert.equal(packageJson.exports['.'].require, './lib/cjs/index.js');

const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'sports-lib-package-verification-'));
try {
  const packageLinkDirectory = path.join(temporaryDirectory, 'node_modules/@sports-alliance');
  const packageLink = path.join(packageLinkDirectory, 'sports-lib');
  await mkdir(packageLinkDirectory, { recursive: true });
  await mkdir(packageLink);
  await copyFile(path.join(packageRoot, 'package.json'), path.join(packageLink, 'package.json'));
  await cp(path.join(packageRoot, 'lib'), path.join(packageLink, 'lib'), { recursive: true });

  await verifyBuildLayout();
  const rootExportCount = await verifyModuleFormats();
  await verifySpecifierRewriter(temporaryDirectory);
  await verifyTypeDeclarations(temporaryDirectory);
  const representativeBundleBytes = await verifyRepresentativeTreeShaking(temporaryDirectory);
  const pack = verifyPackContents();

  console.log(
    `Verified ${rootExportCount} exports, ${representativeBundleBytes} startup bytes, ` +
      `and ${pack.entryCount} packed files.`
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
