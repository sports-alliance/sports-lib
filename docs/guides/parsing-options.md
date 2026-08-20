---
title: Configure parsing
summary: Control generated streams, output filtering, and FIT device metadata.
---

# Configure parsing

`ActivityParsingOptions` and `RouteParsingOptions` control stream generation and final output. Both accept `streams.includeTypes` with canonical metric tokens from the [Metrics and calculations](metrics-and-calculations.md) guide.

```ts
import { ActivityParsingOptions, SportsLib } from '@sports-alliance/sports-lib';

const options = new ActivityParsingOptions({
  streams: { includeTypes: ['Distance', 'Heart Rate', 'Pace'] },
  generateUnitStreams: false,
  deviceInfoMode: 'changes'
});

const event = await SportsLib.importFromFit(fitArrayBuffer, options);
```

## Activity stream filtering

For FIT, TCX, and GPX imports, an omitted or empty `includeTypes` list keeps the normal stream output. A provided list is a strict final-output allowlist. Unknown tokens throw a parsing error.

Derived requests are supported: Sports Lib resolves required internal dependencies and removes them from the final output unless they were also requested. For example, requesting `Pace` may use `Speed` internally while returning only the pace stream.

For swimming, rowing, kayaking, canoeing, paddling, and stand-up paddling activities, requesting `Stroke Rate` may read
a protocol field named cadence internally. The strict final output contains only `Stroke Rate`; `Cadence` remains the
canonical token for activities whose values are revolutions per minute.

## FIT device metadata

FIT files can repeat equivalent `device_info` rows every second. `deviceInfoMode` controls the values exposed through `activity.creator.devices`:

- `raw` is the backwards-compatible default and keeps every parsed row.
- `changes` collapses contiguous rows that differ only by timestamp, retaining the first and last entry of a run.

## Route options

`RouteParsingOptions` applies the same generated-stream controls to point-indexed route streams. Its `includeTypes` filter accepts only route-supported stream types; unknown or activity-only tokens throw a parsing error.

GPX tracks with timestamps normally represent recorded activities. Set `gpx.importTimedTracksAsRoutes` to `true` only when deliberately converting timed track geometry into a reusable route.
