---
title: Work with routes
summary: Import, export, convert, and preview planned routes and FIT courses.
---

# Work with routes

Recorded activities and planned routes are separate models. Activity imports return an event; route imports return a `RouteFileInterface` containing routes and optional waypoints. Route streams are indexed by point rather than by elapsed second.

```ts
import { RouteParsingOptions, SportsLib } from '@sports-alliance/sports-lib';
import { DOMParser } from '@xmldom/xmldom';

const options = new RouteParsingOptions({
  streams: { includeTypes: ['Distance', 'Grade'] },
  generateUnitStreams: false
});

const routeFile = await SportsLib.importRoutesFromGPX(gpxText, DOMParser, options);
const route = routeFile.getFirstRoute();

const points = route.getPointData();
const distanceMetres = route.getStat('Distance')?.getValue();
const waypoints = routeFile.getWaypoints();
```

## Supported route formats

- `importRoutesFromGPX` imports planned GPX route geometry. Route-only GPX files are intentionally rejected by the activity GPX importer; use this method instead.
- `importRoutesFromFit` imports a FIT Course.
- `importRoutesFromJSON` restores a native `RouteFileJSONInterface` value.
- `exportRoutesToGPX` returns a GPX 1.1 route string, with links before route numbers and waypoint symbols/types as required by the schema.
- `exportRoutesToFit` returns a FIT Course `ArrayBuffer` and requires exactly one route.
- `convertRoutesFromGPXToFit` and `convertRoutesFromFitToGPX` compose the matching import and export operations.

```ts
const fitCourse = await SportsLib.exportRoutesToFit(routeFile);
const gpxRoute = await SportsLib.exportRoutesToGPX(routeFile);

const restoredRouteFile = SportsLib.importRoutesFromJSON(routeFile.toJSON());
```

Previously exported GPX files containing both links and route numbers or waypoint symbols/types need to be exported again for schema-validating consumers. Native JSON, metric values, and public method signatures are unchanged; no reparse or stored-data migration is required.

Route imports generate point-indexed latitude, longitude, distance, GNSS distance, altitude, and grade streams when the source supports them. They also generate distance, ascent/descent, altitude, and grade statistics.

FIT Course files preserve route geometry, altitude, cumulative distance, creation time, supported waypoints, and the closest FIT sport/sub-sport. They cannot preserve every GPX metadata field; use native route JSON when comments, links, symbols, or extensions must round-trip. Use `RoutePreviewUtilities` for compact polyline-encoded previews instead of full route geometry.

For GPX timed-track behavior and route stream filtering, see [Configure parsing](parsing-options.md).

GPX route files and their routes retain the exporter name from `creator`. The GPX schema `version` is not a
manufacturer or device software version. Correcting an older persisted manufacturer value requires reparsing the
original GPX through the consumer’s normal route lifecycle; JSON restoration cannot establish creator provenance.

## Native JSON summaries

Routes and route files omit non-finite scalar summary numbers (`NaN`, `Infinity`, and `-Infinity`) on export.
Native JSON restoration skips those values and legacy `null`/`undefined` summaries instead of treating them as zero
or rejecting the route. Finite values, including zero and negative altitude, structured stats, metadata, waypoints,
and point-indexed stream gaps are preserved. Existing geometry validation still rejects conflicting point/stream data.

When no valid file-level summary remains, restoration uses the existing child-route aggregation. Any valid file-level
summary, including zero, retains its precedence; this does not fill individual missing fields in a partial summary.
No source-file reparse or stored-schema migration is required. Consumers can restore retained native JSON using the
updated reader; separately stored projections change only through their existing refresh or save lifecycle.
These JSON corrections do not change activity imports, sport classifications, or Training load.
