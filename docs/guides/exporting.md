---
title: Export and persist data
summary: Export positional activities as GPX and round-trip native JSON safely.
---

# Export and persist data

Use the public exporters for event output. `EventExporterGPX` writes activities with positional data as GPX; activities without positional data do not contribute tracks to the result.

```ts
import { EventExporterGPX, SportsLib } from '@sports-alliance/sports-lib';

const event = await SportsLib.importFromFit(fitArrayBuffer);
const exporter = new EventExporterGPX();
const gpxText = await exporter.getAsString(event);

const file = new Blob([gpxText], { type: exporter.fileType });
```

GPX represents both cadence and stroke rate through its cadence extension. `EventExporterGPX` writes the canonical
`Stroke Rate` stream there for supported stroke-rate activities so the values survive a GPX round trip.

## Native JSON round trips

Native JSON is the persistence format for the Sports Lib model. Call `toJSON()` to obtain the typed contract and restore
it with the corresponding `SportsLib` method. Restoration preserves explicit stats except terrain summaries excluded
for the Diving activity group, canonicalizes compatible legacy keys, may add missing speed-derived pace summaries on
events, activities, and laps, and applies activity-aware cadence-to-stroke-rate normalization without requiring the
original source file.

Starting with 20.0.2, restoring older Diving-group JSON also removes terrain ascent/descent, altitude min/max/avg,
and grade min/max/avg summaries from events, activities, and laps. The restored model needs no source-file reparse;
re-serializing it intentionally writes the corrected summary set while retaining any raw source streams.

```ts
import { EventExporterJSON, SportsLib } from '@sports-alliance/sports-lib';

const eventJson = event.toJSON();
const restoredEvent = SportsLib.importFromJSON(eventJson);

const jsonText = await EventExporterJSON.getAsString(event);
const restoredFromText = SportsLib.importFromJSON(JSON.parse(jsonText));

const routeJson = routeFile.toJSON();
const restoredRouteFile = SportsLib.importRoutesFromJSON(routeJson);
```

The `EventJSONInterface` and `RouteFileJSONInterface` API pages describe the JSON shapes. Use native route JSON when route metadata must be retained beyond FIT Course capabilities.
