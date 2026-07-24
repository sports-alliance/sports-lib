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
  'documents/Three-dimensional_power_and_training-response_model.html',
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
  throw new Error('The metrics guide does not include the data coverage reference.');
}

const threeDimensionalGuide = await readFile(
  resolve(siteDirectory, 'documents/Three-dimensional_power_and_training-response_model.html'),
  'utf8'
);
const requiredThreeDimensionalGuideMarkers = [
  'What is published and what is ours',
  'Sports Lib engineering design informed by CP literature',
  'doi.org/10.1371/journal.pone.0341721',
  'f8dc4c0158ce8b8ccb0907fb1ec22e7ce3a031dc',
  'GoldenCheetah or Stryd compatibility',
  '42-completed-day history'
];
for (const marker of requiredThreeDimensionalGuideMarkers) {
  if (!threeDimensionalGuide.includes(marker)) {
    throw new Error(`The three-dimensional model guide is missing required provenance marker: ${marker}`);
  }
}

console.log(`Verified ${requiredPages.length} generated documentation pages.`);
