# Sports Lib

Sports Lib normalizes GPX, TCX, FIT, and service-specific JSON into shared activity and route models.
It also exposes provider-neutral Health and sleep scalar data classes with canonical units, display formatting, aliases,
and JSON round-trip behavior.

**Regression-tested against 195,562 real-world source files.** Coverage includes activity and route imports
and file-type validation. This work has driven
compatibility fixes for vendor quirks, incomplete recordings and malformed data. Importers use evidence in the file
to recover valid observations while preserving zeros, pauses and sport boundaries. See our
[validation guide](https://sports-alliance.github.io/sports-lib/documents/Validation_and_compatibility.html)
for supported recovery examples, activity and route coverage, methodology and known limitations.

Power calculations distinguish missing readings from recorded zero watts and expose observed coverage alongside
partial work. Device summaries retain priority. See [power coverage and migration](docs/guides/exporting.md#missing-power).

## Documentation

The hosted documentation contains the supported API and all consumer guidance:

- [API reference](https://sports-alliance.github.io/sports-lib/)
- [Import activities](https://sports-alliance.github.io/sports-lib/documents/Import_activities.html)
- [Work with routes](https://sports-alliance.github.io/sports-lib/documents/Work_with_routes.html)
- [Configure parsing](https://sports-alliance.github.io/sports-lib/documents/Configure_parsing.html)
- [Export and persist data](https://sports-alliance.github.io/sports-lib/documents/Export_and_persist_data.html)
- [Read event summaries](https://sports-alliance.github.io/sports-lib/documents/Read_event_summaries.html)
- [Metrics and calculations](https://sports-alliance.github.io/sports-lib/documents/Metrics_and_calculations.html)
- [Three-dimensional power and training-response model](https://sports-alliance.github.io/sports-lib/documents/Three-dimensional_power_and_training-response_model.html)
- [Validation and compatibility](https://sports-alliance.github.io/sports-lib/documents/Validation_and_compatibility.html)

Activity R–R analysis provides gap-aware RMSSD, SDNN, pNN50, recording-quality summaries and rolling DFA alpha1.
See [activity R–R calculations](docs/guides/metrics-and-calculations.md#activity-rr-analysis) for units, quality gates and reparse requirements.

## Install

```sh
npm install @sports-alliance/sports-lib
```

For GPX parsing in Node.js, also install a DOM parser:

```sh
npm install @xmldom/xmldom
```

## Quick start

```ts
import { SportsLib } from '@sports-alliance/sports-lib';
import { DOMParser } from '@xmldom/xmldom';

const event = await SportsLib.importFromGPX(gpxText, DOMParser);
const activity = event.getFirstActivity();
const distanceMetres = activity.getDistance().getValue();
```

See [Import activities](https://sports-alliance.github.io/sports-lib/documents/Import_activities.html) for the other supported formats and parsing options.

FIT activity imports reject files explicitly declared as monitoring, settings, courses, or other non-activity types.
Use `SportsLib.importRoutesFromFit` for FIT courses. Completed `activity_summary` files retain their recorded sessions;
legacy activity files without a declared file type retain recovery.

Sports Lib 23.2 requires FIT Parser `^6.2.3`, recovering supported numeric fields from FIT producers that omit the
endian flag in their type definitions. Correct historical imports by reparsing retained originals and refreshing
affected derived summaries; installing the release does not rewrite saved data. See the
[FIT compatibility guide](docs/guides/importing-activities.md#numeric-fit-types-without-endian-flags).

## Package formats

Browser charts and workers can import canonical data classes, unit settings, activity types and stream utilities from
`@sports-alliance/sports-lib/metrics`. This public entry reuses the root API's implementations while excluding file
import/export facades. It prevents unused asynchronous parser chunks from being emitted in worker builds. ESM,
CommonJS and TypeScript consumers are supported; the package-root API stays compatible. No values, metric tokens,
units or JSON representations change, and no reparse or migration is required. See the
[metrics entry guide](docs/guides/metrics-and-calculations.md#browser-and-worker-imports).

Sports Lib 21 publishes module-preserving ESM for `import` consumers and per-module CommonJS for `require` consumers.
The package-root API remains supported; bundlers can discard unrelated parser, exporter, geodesy, and filtering modules
when an application imports focused root exports such as `User`, settings, or data classes. Importing the `SportsLib`
facade retains its complete import/export feature set in the initial bundle, so startup-sensitive consumers should use
focused root imports.

FIT imports keep the full decoder and semantic profile behind the existing asynchronous boundary. Synchronous device,
sport, and route lookups use the lightweight canonical `fit-file-parser/profile` entry point instead of maintaining
protocol mappings in Sports Lib.

The 21.0.3 packaging change does not alter parsed values, native JSON, or persisted metric representations. Consumers do
not need to reparse source files, regenerate summaries, or migrate stored data.
