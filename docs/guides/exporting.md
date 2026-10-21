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

Activity exports declare Garmin TrackPointExtension/v2, whose schema defines speed in metres/second. They preserve
finite, nonnegative canonical `Speed` readings, including zero, and omit missing or invalid readings. Sensor fields
follow the v2 schema sequence; independent power/distance extensions retain their existing behavior. Importing the
result restores recorded speed rather than deriving a replacement from coordinates. Native JSON names and units
are unchanged. Some recognized legacy GPX exports used v1 and omitted zero speeds: the importer recognizes their metadata for
legacy m/s compatibility, but cannot invent observations absent from the exported file. Re-export from a source that
retains those readings to recover them. See [recorded GPX speed](importing-activities.md#gpx).

## Native JSON round trips

Native JSON is the persistence format for the Sports Lib model. Call `toJSON()` to obtain the typed contract and restore
it with the corresponding `SportsLib` method. Event, activity, lap, route, and route-file summary exports omit non-finite
scalar numbers (`Infinity`, `-Infinity`, and `NaN`), which JSON would otherwise convert to `null`. A stopped pace can
still be infinite in memory; its summary key is omitted in JSON. Finite zero and negative values, imported TSS and its
method, structured stats, and stream null gaps retain their existing values.

Event/activity/lap restoration skips legacy null, undefined, and non-finite scalar stats before canonicalizing aliases;
a valid legacy alias can survive an invalid canonical entry. Missing pace can be hydrated from retained speed, including
an infinite runtime pace that remains omitted on the next export. Existing JSON needs no source-file reparse for this
read correction. Route and route-file restoration also skip legacy null, undefined, and non-finite scalar stats.
If no valid route-file summaries remain, they are regenerated from the child routes using the existing aggregation policy.
Restoration preserves other explicit stats except terrain summaries excluded
for the Diving activity group, canonicalizes compatible legacy keys, may add missing speed-derived pace summaries on
events, activities, and laps, and applies activity-aware cadence-to-stroke-rate normalization without requiring the
original source file.

Native lap JSON retains nonnegative safe-integer `lapId` values, including zero and nonconsecutive IDs. These are
source identifiers, not display row numbers. Missing or invalid legacy IDs receive deterministic one-based fallbacks;
activity hydration avoids collisions with saved IDs. Existing duplicate source IDs remain unchanged. Already-renumbered
saved IDs cannot be recovered without the original file. This correction adds no JSON fields and changes no lap timing,
rest classification, order, or measurements.

Event, activity, lap and shared summary serialization omit non-finite scalar numbers such as infinite pace at zero
speed. Native event restoration also skips legacy null or non-finite scalar summaries before resolving aliases, so
an invalid canonical entry cannot hide a valid legacy value. Finite zero, negative values, structured stats and null
stream gaps retain their meanings. Existing saved event JSON can be restored and reserialized without a source-file
reparse for this compatibility repair; runtime calculations and canonical metric names/units are unchanged.

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

## Sparse distance and calculated intervals

Activity Distance streams preserve missing readings as `null`; zero and repeated distances are retained. Other sensors
keep their own timestamps. `Activity.toJSON()` exports exactly one Time stream based on the union of regular stream
timestamps, so a sparse Distance stream cannot remove HR or power readings from the exported clock. IBI-only exports
retain their existing projected time behavior.

Consumers must check for finite numeric readings before converting values: `Number(null)` produces zero and loses
the distinction between missing and stationary distance. Distance cursors should match only finite distance/time
pairs and return unavailable when no such pair exists.

Generated interval-rate streams may include the additive `StreamJSONInterface.intervalSupport` field:

```json
{
  "type": "Speed",
  "data": [null, null, 2],
  "intervalSupport": { "direction": "ending", "durations": [null, null, 2] }
}
```

This example represents 2 m/s over the two-second interval ending at index 2. `starting` is used for calculated grade.
The duration array is parallel to `data`; null means no supported interval at that sample. Values are positive integer
seconds, bounded by the stream and nonoverlapping. Malformed evidence is ignored during hydration. Legacy streams
without the field remain readable, with their existing summary policy. Retain the complete stream object when storing
JSON to preserve duration-weighted recalculation. Older consumers can read the ordinary values but may discard the
additional field when writing JSON again.

`Stream.setData()` and `Activity.addDataToStream()` invalidate interval evidence. The activity setter edits the
original values even while a read filter is active; filtered display values are never persisted by that setter. A stream
filter disables interval evidence for filtered reads, while serialization still exports the original unfiltered data and
evidence. Consumers editing arrays in place must replace the data through `setData()` to invalidate old weights.

Time cropping retains weights only for intervals wholly inside the crop; a retained boundary sample does not imply
that the full interval belongs to the crop. Both boundaries are inclusive, including one-sided crops. The range is
bounded by the original activity, and a fractional start advances to the first retained sample on the original
one-second grid. Invalid ranges or ranges containing no sample slot throw before changing the activity; omitted
bounds leave it unchanged. Cropping also rebases retained events and preserves a pause already active at the crop
start, without mutating shared event objects or dropping retained event payloads. Existing summary statistics remain
unchanged until callers explicitly refresh them.

Existing persisted summaries are not automatically overwritten on JSON hydration. Historical filled distance streams
require an original-file reparse: neither JSON hydration nor summary regeneration can reconstruct their missing-value
mask. After adopting this version, regenerate affected summaries/Training snapshots from corrected imports as needed.
Canonical metric names, units, recorded statistics, swim lengths/rests, and route JSON contracts remain unchanged.
The optional interval evidence is calculation metadata, not a new numeric metric or an MCP response field.

## Missing power

FIT, TCX and GPX power now preserves missing values as `null` and keeps recorded zero watts. Native JSON preserves
those gaps. Generated Time is the union of sensor values and stays consistent after JSON restoration.
Original record timestamps are used only during import to retain the existing fill behavior of other sensors.
The JSON format, metric names and units are unchanged; no coverage or provenance fields are added.
`ActivityUtilities.getPowerCoverage(activity)` calculates observed duration, average and work on demand without
changing the activity. Derived left/right power also retains explicit nulls where total power or balance is missing.
GPX exports retain genuine zero watts and omit missing power, without adding or removing activity streams.
Supplied summaries and imported TSS retain priority. Missing power extrema, side watts and balance summaries are
calculated from original samples rather than attached stream-filter views. If older code persisted summaries or side
streams calculated from filtered inputs, a native JSON parse preserves those saved values; reparse the original file to
rebuild them. Ordinary imports without attached filters need no extra migration for this correction.
Calculated lap power extrema also include a leading reading with active support across a fractional lap start,
consistent with the lap's power average. Native JSON keeps saved lap statistics; reparse originals to replace
earlier calculated extrema. Original readings, activity summaries and supplied lap summaries remain unchanged.

Old zero-filled power streams cannot distinguish missing readings from real coasting. Correcting them requires the
retained original FIT/TCX/GPX file, not simply another native JSON parse. Systems that reparse originals on demand need
no separate stored-stream migration. Persist refreshed summaries/evaluations and rebuild affected power curves or
capacity snapshots through the application's normal workflow. No automatic migration or reparse is triggered.

FIT session/lap balance corrections require an original-file reparse: older native JSON did not retain those source
summaries. Stored balance statistics remain readable and are not overwritten during JSON restoration. To correct a
multisport event's average/maximum power and W/kg, call `EventUtilities.reGenerateStatsForEvent(event)` with its existing leg
statistics, then persist the refreshed event summary. This does not need an original-file reparse or change leg data.
Saved power curves and FTP summaries are not replaced by JSON hydration. To apply the timer-boundary correction,
refresh affected calculated snapshots from original files or retained power streams and timer events; keep supplied
summaries authoritative. There are no new metric names, units, serialized fields or MCP schemas.

See [Power coverage and observed work](metrics-and-calculations.md#power-coverage-and-observed-work) for formulas,
partial-result handling and the computed-power TSS coverage gate. Routes are unchanged.
