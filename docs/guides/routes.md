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
- `exportRoutesToGPX` returns a GPX route string.
- `exportRoutesToFit` returns a FIT Course `ArrayBuffer` and requires exactly one route.
- `convertRoutesFromGPXToFit` and `convertRoutesFromFitToGPX` compose the matching import and export operations.

```ts
const fitCourse = await SportsLib.exportRoutesToFit(routeFile);
const gpxRoute = await SportsLib.exportRoutesToGPX(routeFile);

const restoredRouteFile = SportsLib.importRoutesFromJSON(routeFile.toJSON());
```

Route imports generate point-indexed latitude, longitude, distance, GNSS distance, altitude, and grade streams when the source supports them. They also generate distance, ascent/descent, altitude, and grade statistics.

FIT Course files preserve route geometry, altitude, cumulative distance, creation time, supported waypoints, and the closest FIT sport/sub-sport. They cannot preserve every GPX metadata field; use native route JSON when comments, links, symbols, or extensions must round-trip. Use `RoutePreviewUtilities` for compact polyline-encoded previews instead of full route geometry.

For GPX timed-track behavior and route stream filtering, see [Configure parsing](parsing-options.md).
