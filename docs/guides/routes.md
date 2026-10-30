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

FIT exports explicitly use the FIT 2.0 protocol header (`0x20`), matching the corrected
encoder default. This corrects the header and its checksum without changing route messages
or measurements. Exact binary hashes change. Re-export retained
routes to correct older exports; no activity reparse or stored-data migration is required.

```ts
const fitCourse = await SportsLib.exportRoutesToFit(routeFile);
const gpxRoute = await SportsLib.exportRoutesToGPX(routeFile);

const restoredRouteFile = SportsLib.importRoutesFromJSON(routeFile.toJSON());
```

FIT Course export and import preserve these specific route sports using the standard sport/sub-sport pairs:

| Route type | FIT sport | FIT sub-sport |
| --- | --- | --- |
| Road Running | Running | Street |
| Road Cycling | Cycling | Road |
| Track Cycling | Cycling | Track Cycling |
| Gravel Cycling | Cycling | Gravel Cycling |
| Cyclocross | Cycling | Cyclocross |
| Indoor Walking | Walking | Indoor Walking |
| Skate Skiing | Crosscountry Skiing | Skate Skiing |

Their existing aliases export the same pairs. Reimporting a FIT course restores the specific canonical sport, which
also survives subsequent GPX and native JSON export. Export leaves the source route unchanged. These pairs are defined
in [Garmin's FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js).

Courses with an absent, generic, or unrecognized sub-sport retain their parent sport. A sub-sport only refines its
matching parent sport. Other route mappings retain their existing behavior. Previously exported FIT courses that
omitted these sub-sports need re-export from a retained specific route; the broader FIT label alone cannot recover
the original detail. Existing FIT courses containing these sub-sports can be reimported to recover their specific names.

Route and route-file JSON omit non-finite scalar summary stats, and restoration skips legacy null/non-finite summary
values. Finite zero/negative values, metadata, geometry, and stream null gaps are preserved. If a route file has no valid
summaries, existing aggregation regenerates them from its child routes. This read correction needs no source reparse;
see [native JSON round trips](exporting.md#native-json-round-trips).

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
