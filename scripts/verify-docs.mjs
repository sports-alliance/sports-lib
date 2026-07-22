import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const siteDirectory = resolve(repositoryRoot, 'site');

const requiredPages = [
  'index.html',
  'documents/Import_activities.html',
  'documents/Work_with_routes.html',
  'documents/Configure_parsing.html',
  'documents/Export_and_persist_data.html',
  'documents/Metrics_and_calculations.html',
  'classes/API.SportsLib.html',
  'classes/API.ActivityParsingOptions.html',
  'classes/API.RouteParsingOptions.html',
  'classes/API.Stream.html',
  'interfaces/API.EventJSONInterface.html',
  'interfaces/API.RouteFileJSONInterface.html'
];

await Promise.all(requiredPages.map(page => access(resolve(siteDirectory, page))));

const landingPage = await readFile(resolve(siteDirectory, 'index.html'), 'utf8');
const guidePages = requiredPages.filter(page => page.startsWith('documents/'));

for (const guidePage of guidePages) {
  if (!landingPage.includes(`href="${guidePage}"`)) {
    throw new Error(`The documentation landing page does not link to ${guidePage}.`);
  }
}

const readme = await readFile(resolve(repositoryRoot, 'README.md'), 'utf8');
for (const guidePage of guidePages) {
  const hostedGuideUrl = `https://sports-alliance.github.io/sports-lib/${guidePage}`;
  if (!readme.includes(hostedGuideUrl)) {
    throw new Error(`The README does not link to ${hostedGuideUrl}.`);
  }
}

const metricsGuide = await readFile(resolve(siteDirectory, 'documents/Metrics_and_calculations.html'), 'utf8');
if (!metricsGuide.includes('Data Coverage &amp; Calculation Reference')) {
  throw new Error('The metrics guide does not include the README data coverage reference.');
}

console.log(`Verified ${requiredPages.length} generated documentation pages.`);
