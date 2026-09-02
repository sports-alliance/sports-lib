import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const esmOutputDirectory = path.resolve('out-tsc/esm');

async function listJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(entry => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listJavaScriptFiles(entryPath);
      }
      return entryPath.endsWith('.js') ? [entryPath] : [];
    })
  );
  return nestedFiles.flat();
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function resolveRelativeSpecifier(sourceFilePath, specifier) {
  if (!specifier.startsWith('.')) {
    return specifier;
  }

  const resolvedPath = path.resolve(path.dirname(sourceFilePath), specifier);
  if (await fileExists(resolvedPath)) {
    return specifier;
  }
  if (await fileExists(`${resolvedPath}.js`)) {
    return `${specifier}.js`;
  }
  if (await fileExists(path.join(resolvedPath, 'index.js'))) {
    return `${specifier.replace(/\/$/, '')}/index.js`;
  }

  throw new Error(`Unable to resolve relative ESM specifier ${specifier} from ${sourceFilePath}`);
}

function collectModuleSpecifiers(sourceFile) {
  const specifiers = [];

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0]);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

async function rewriteFile(filePath) {
  const sourceText = await readFile(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const replacements = [];

  for (const moduleSpecifier of collectModuleSpecifiers(sourceFile)) {
    const rewrittenSpecifier = await resolveRelativeSpecifier(filePath, moduleSpecifier.text);
    if (rewrittenSpecifier !== moduleSpecifier.text) {
      replacements.push({
        end: moduleSpecifier.getEnd() - 1,
        start: moduleSpecifier.getStart(sourceFile) + 1,
        value: rewrittenSpecifier
      });
    }
  }

  if (!replacements.length) {
    return 0;
  }

  const rewrittenSource = replacements
    .sort((first, second) => second.start - first.start)
    .reduce(
      (currentSource, replacement) =>
        currentSource.slice(0, replacement.start) + replacement.value + currentSource.slice(replacement.end),
      sourceText
    );
  await writeFile(filePath, rewrittenSource, 'utf8');
  return replacements.length;
}

const javascriptFiles = await listJavaScriptFiles(esmOutputDirectory);
const rewrittenSpecifierCounts = await Promise.all(javascriptFiles.map(rewriteFile));
const rewrittenSpecifierCount = rewrittenSpecifierCounts.reduce((total, count) => total + count, 0);

console.log(`Rewrote ${rewrittenSpecifierCount} relative specifiers across ${javascriptFiles.length} ESM modules.`);
