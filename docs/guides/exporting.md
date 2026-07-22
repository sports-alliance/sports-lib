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

## Native JSON round trips

Native JSON is the lossless persistence format for the Sports Lib model. Call `toJSON()` to obtain the typed contract and restore it with the corresponding `SportsLib` method.

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
