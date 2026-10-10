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
- `changes` collapses rows that differ only by timestamp within each device index, retaining the first and last entry
  of each unchanged run. Alternating rows from other device indexes do not interrupt a run. Identity changes (including
  reuse of an index by a replacement sensor), battery changes, and other non-timestamp changes start new runs. Retained
  entries remain in their original order.

Existing JSON remains compatible. Consumers that want smaller device histories in previously stored activities must
reparse their source FIT files with `changes`; no metric regeneration or schema migration is required.

Creator attribution prefers fields from the FIT `file_id` message. If that message omits identity fields, Sports Lib
fills only the missing values from a `device_info` row explicitly marked as the creator or local device. Accessory
sensor rows are not used as the activity creator. In `changes` mode, an untimestamped creator/local row is retained as
activity-wide identity data; battery consumption and lifetime calculations continue to use timestamped rows only.

## Route options

`RouteParsingOptions` applies the same generated-stream controls to point-indexed route streams. Its `includeTypes` filter accepts only route-supported stream types; unknown or activity-only tokens throw a parsing error.

GPX tracks with timestamps normally represent recorded activities. Set `gpx.importTimedTracksAsRoutes` to `true` only when deliberately converting timed track geometry into a reusable route.

## Training stress evaluations

HR calculations require explicit calibration; calorie-derived MET estimates require energy, body mass and duration.
Walking and hiking use imported TSS, then usable power with a valid threshold, calibrated HR, then MET in Automatic.
Explicit HR and MET preferences select their available method first. Other eligible sports retain power and pace methods
in their Automatic order. See [TSS methods](metrics-and-calculations.md) for sport eligibility, validation, fallback
reasons and existing optional physiological overrides.
Imported scores take precedence with `preserveImportedTss: true` or omission. With false, all evaluation policies use
calculated candidates; summary generation replaces the score or removes it when no eligible calculation is available.

```ts
import { ActivityUtilities } from '@sports-alliance/sports-lib';
const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(event.getFirstActivity());
// evaluations.automatic / .hr / .met: score, actual method, provenance, estimated, reasons
```

Read the cached evaluations while retaining the parsed Activity instance. They survive stream disposal on that instance,
but are not serialized into ordinary activity JSON. Use `evaluateTrainingStressScore` only for an explicit recalculation.
For complete method comparisons, omit `streams.includeTypes`: a restrictive allowlist can prevent calculation inputs
from being imported, so evaluations reflect only the inputs that were loaded.
