# Sports Lib API Reference

Sports Lib normalizes GPX, TCX, FIT, and service-specific JSON into a shared activity model. This reference documents the supported consumer API; implementation adapters and parsers remain available in the package for compatibility but are intentionally not part of this reference.

## Install

```sh
npm install @sports-alliance/sports-lib
```

When parsing GPX in Node.js, also install a DOM parser implementation:

```sh
npm install @xmldom/xmldom
```

## Import an activity

Use `SportsLib` for all activity import formats. GPX parsing accepts a DOM parser for Node.js environments; FIT imports receive binary data as an `ArrayBuffer`.

```ts
import { SportsLib } from '@sports-alliance/sports-lib';
import { DOMParser } from '@xmldom/xmldom';

const event = await SportsLib.importFromGPX(gpxText, DOMParser);
const activity = event.getFirstActivity();

const distanceMetres = activity.getDistance().getValue();
const heartRate = activity.getStreamData('Heart Rate');
```

`ActivityParsingOptions` lets you control stream derivation, output filtering, training-stress calculation, unit streams, and FIT device-info compaction. `streams.includeTypes` always takes canonical metric tokens such as `Distance`, `Heart Rate`, and `Pace`.

## Work with routes

Routes and recorded activities are different models. Route import methods return a `RouteFileInterface`, and routes use point-indexed streams rather than one-second activity streams.

```ts
import { RouteParsingOptions, SportsLib } from '@sports-alliance/sports-lib';
import { DOMParser } from '@xmldom/xmldom';

const routeFile = await SportsLib.importRoutesFromGPX(
  gpxText,
  DOMParser,
  new RouteParsingOptions({ streams: { includeTypes: ['Distance', 'Grade'] } })
);

const route = routeFile.getFirstRoute();
const pointCount = route.getPointCount();
const fitCourse = await SportsLib.exportRoutesToFit(routeFile);
```

Use `RoutePreviewUtilities` when a compact, polyline-encoded preview is more useful than full route geometry.

## Streams, stats, and data

Activities expose one-second streams; route streams are indexed by point. Both use canonical data-type strings. Stats are typed `Data` values, so obtain raw values with `getValue()` and display values with `getDisplayValue()`.

```ts
const pace = activity.getStreamData('Pace');
const ascent = activity.getStat('Ascent')?.getValue();
```

The complete metric catalog, canonical type tokens, units, and calculation rules are maintained in the [Data Coverage & Calculation Reference](https://github.com/sports-alliance/sports-lib#data-coverage--calculation-reference).

## JSON round trips

Use `toJSON()` to persist the native model and `SportsLib.importFromJSON()` or `SportsLib.importRoutesFromJSON()` to restore it. The `*JSONInterface` types document the stable JSON shapes.

```ts
const savedEvent = event.toJSON();
const restoredEvent = SportsLib.importFromJSON(savedEvent);

const savedRouteFile = routeFile.toJSON();
const restoredRouteFile = SportsLib.importRoutesFromJSON(savedRouteFile);
```

## Analytics utilities

`analyzeActivityDurability` produces deterministic durability evidence when an activity has enough eligible source data. `samplePowerCurveAtDuration` and `comparePowerCurveWindows` support robust power-curve comparisons without extrapolating beyond known samples.
