---
title: Import activities
summary: Parse supported activity formats into Sports Lib's shared event model.
---

# Import activities

Use `SportsLib` to import recorded activities. GPX accepts a DOM parser in Node.js, TCX accepts a parsed XML document, FIT accepts binary data, and native JSON restores a previous Sports Lib export.

Activity types are normalized through `ActivityTypesHelper.resolveActivityType()` before they are stored on
activities. For example, `snorkeling` resolves to `Snorkeling`; `Mermaiding` is a canonical diving activity
when a provider supplies that sport name. A provider-specific numeric FIT mapping is added only when the FIT
profile or a representative file establishes one.

Canonical activity types also receive a stable activity group. `Skating` and `Inline Skating` belong to the dedicated
Skating group, while `Ice Skating` remains in Winter Sports. Aerial activities retain altitude, ascent, and descent
while exposing vertical speed. Motorized and Adaptive Mobility activities retain movement data but do not receive
library-calculated Training Stress Score or durability evidence; a source-provided Training Stress Score remains intact.

```sh
npm install @sports-alliance/sports-lib @xmldom/xmldom
```

## GPX

```ts
import { SportsLib } from '@sports-alliance/sports-lib';
import { DOMParser } from '@xmldom/xmldom';

const event = await SportsLib.importFromGPX(gpxText, DOMParser);
const activity = event.getFirstActivity();

const distanceMetres = activity.getDistance().getValue();
const heartRate = activity.getStreamData('Heart Rate');
```

## TCX and FIT

```ts
import { SportsLib } from '@sports-alliance/sports-lib';
import { DOMParser } from '@xmldom/xmldom';

const tcxDocument = new DOMParser().parseFromString(tcxText, 'application/xml');
const tcxEvent = await SportsLib.importFromTCX(tcxDocument);

const fitEvent = await SportsLib.importFromFit(fitArrayBuffer);
```

### FIT workout references

Read optional source references independently of activity imports:

```ts
import { readFITWorkoutReferences, DataSuuntoPlusGuideReferences } from '@sports-alliance/sports-lib';

const result = readFITWorkoutReferences(fitArrayBuffer); // also accepts Uint8Array / Node Buffer views
if (result.status !== 'invalid') {
  const pairs = result.suuntoGuides.getValue().references;
  const stored = JSON.parse(JSON.stringify(result.suuntoGuides.toJSON()));
  const restored = DataSuuntoPlusGuideReferences.fromJSON(stored);
}
```

`trainingFiles`, `workouts` and `suuntoGuides` are respectively `DataFITTrainingFileReferences`,
`DataFITWorkoutDefinitions` and `DataSuuntoPlusGuideReferences`. Every class has validated construction and `setValue`,
defensive-copy getters, canonical `toJSON()` and strict static `fromJSON(unknown)`. JSON envelopes use the canonical
type as their only key; values contain only an ordered `references` or `definitions` array, with no schema-version
field. Unknown fields, invalid numbers and malformed strings are rejected rather than silently normalized.
Validation snapshots array members without invoking caller-provided array methods, and stores the same scalar values
it validates. A rejected `setValue()` leaves the previous value intact.

Training-file references retain FIT message 72 fields: `type`, `manufacturer`, `product`, `serialNumber`,
`timeCreatedUnixMs` and `timestampUnixMs`. The serial is native uint32z: zero is missing, while 4294967295 is valid.
Workout definitions retain message 26 `name`, `sport`, `subSport` and `numValidSteps`, not full recipes. Native enums
remain numeric FIT codes; timestamps are UTC Unix milliseconds. Missing source fields are absent, not inferred.
Both lists remain file-scoped. `sessions` separately records zero-based source order, start/end timestamps and native
sport/sub-sport. Malformed optional fields are omitted individually with diagnostics, preserving other valid context
and independently valid Guide pairs in that session; an index-only entry is retained if no context is usable. Do not blindly equate a
session ordinal with a consumer activity ID or assign every file reference to every session.

Suunto Guide pairs preserve `sessionIndex`, `developerDataIndex`, `applicationId`, `ownerId` and `externalId`.
The owner is an OAuth client ID, not the Guide owner's display name. The reader resolves developer field descriptions
and preserves NUL-separated positional arrays, grouping strictly within one session and developer index. It accepts
`SuuntoFitExport1` and `SuuntoplusFitExt`, both identified in Suunto's decoder example. Developer indexes and field
numbers are resolved from each file, not hard-coded. Different indexes, field numbers, Guide identifiers or unrelated
SuuntoPlus apps do not require a library update. Changed Guide semantics or a new metadata exporter require reviewed
support; arbitrary field names or app IDs do not establish Guide usage.

The synchronous reader uses a bounded, metadata-only FIT walker. It retains native field bytes and base types,
session-scoped developer fields, interior NUL separators, endianness and compressed timestamps only for the selected
reference messages. This keeps the general-purpose `fit-file-parser` dependency behind the existing asynchronous
activity and route import paths instead of adding it to package-root startup bundles. Source-native enums remain their
original numeric FIT codes rather than parser display labels.

Malformed or conflicting application identities invalidate references for that developer index, including earlier
observations. Malformed/conflicting field descriptions invalidate only references depending on those fields, not
unrelated fields sharing the exporter. Unresolvable malformed messages report diagnostics without invalidating other
identified groups. Unrelated developer IDs may omit an application ID. Strings are not trimmed, case-folded or
Unicode-normalized. All valid owners are returned; consumers filter their own identities.
Malformed extra Guide owner/external-ID fields make their session/index group ambiguous; they cannot be silently
dropped to accept a remaining apparent pair, even when their type metadata cannot be decoded.

The result is `ok`, `partial` (some optional metadata rejected or unsupported), or `invalid` (no evidence returned).
`unsupported_exporter` means Guide-named fields came from a well-formed but unrecognized application ID, not malformed
data. Missing application/field definitions report `unresolved_developer_field`; malformed definitions report
`invalid_metadata`, and contradictory definitions report `conflicting_developer_definition`. None of these diagnostics
establishes completion. Valid independent references can remain in a `partial` result. `diagnostics` contains only a
bounded set of codes, never IDs or raw bytes. The reader validates headers, CRC, record structure, relevant field
types, endianness and compressed timestamps while retaining only selected metadata messages. Safety bounds are 64 MiB per
file and 10,000 records per result collection; exceeding a bound is invalid, never silent truncation. Each Suunto
developer group allows up
to ten paired IDs of up to 64 Unicode characters, following the documented format. Invalid metadata does not throw
into or otherwise change the ordinary activity importer. No credentials or provider requests are involved.

These classes are registered for dynamic loading but are **not numeric metrics**. The reader never adds them to
Event/Activity stats or default JSON. Treat identifiers as private: validate source provenance and account ownership,
then persist only through an explicitly authorized metadata path. A standard FIT serial is not a universal Garmin
Training API workout ID or schedule ID; embedded names are not identity proof. References may show selected workout
or Guide usage but do not prove all prescribed targets or steps were completed.

No existing activity/route migration, derived-summary regeneration or global reparse is required. Consumers can read
selected retained originals for historical evidence without rewriting activity data. Quantified Self adoption and
completion matching are separate work under #651; its numeric MCP catalog must continue excluding these structured
classes (numeric construction with `0` is rejected). No QS private source references are automatically exposed.

Regression fixtures reproduce the metadata topology of an inspected Guide-bearing Suunto export using synthetic
values: standard metrics on one developer index and Guide pairs on a separate `SuuntoplusFitExt` index. A renumbered
variant exercises dynamic resolution. Tests also cover unrelated application-less metadata in existing Garmin/Wahoo
samples. No private recordings or identifiers are embedded in these fixtures.

Sources: [Garmin FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js),
[Suunto FIT description](https://apizone.suunto.com/fit-description) and
[Suunto decoder example](https://aspartnercontent.blob.core.windows.net/apizone/docs/SuuntoDeveloperFieldsDecodingExample.java).
The description documents positional owner/external-ID pairing; the example identifies both metadata exporters and
distinguishes them from the variable IDs of individual SuuntoPlus apps.

### Recorded FIT metrics

The FIT parser applies the profile scale to record-level `depth`, `next_stop_depth`, summary depth, and bottom-time
fields. Sports Lib stores those SDK-scaled values directly as canonical meters or seconds without another conversion.
The parser emits FIT `avg_vam` in meters per second; Sports Lib converts that present source value to its public
`Average VAM` metric unit of meters per hour.
Parser 4 exposed FIT session field 196 (`metabolic_calories`) a second time as `resting_calories`. Parser 5 retains
only the canonical name, which Sports Lib imports as `Metabolic Calories`; it does not substitute the value into
`Resting Calories`. Existing activities must be reparsed to gain `Metabolic Calories`; existing `Resting Calories`
values in native JSON remain readable.
Suunto depth values also remain canonical meters. Depth is available as an advanced chart metric; callers can request
`Depth` explicitly through `ActivityParsingOptions.streams.includeTypes`.

Garmin `single_gas_diving`, `multi_gas_diving`, and `gauge_diving` sub-sports resolve to `Scuba Diving`;
`apnea_diving` and `apnea_hunting` resolve to `Free Diving`. These are direct FIT profile mappings and all remain in the
Diving activity group.

FIT `dive_gas`, `tank_summary`, and `tank_update` messages are available through
`activity.getDiveSourceRecords()`. Gas messages are file-level source records and retain source order on each
Diving-group activity imported from that FIT file. Tank summaries and tank updates are retained only for the activity
whose session window contains their source timestamp. Oxygen and helium contents are percentages; pressures are bar;
and volume used is liters. Sports Lib does not infer a gas-to-tank relation, consumption, a gas name, or any missing
field. These records are deliberately not scalar metrics; they round-trip in the native
`ActivityJSONInterface.diveSourceRecords` field, with tank timestamps stored as UTC milliseconds.

Diving activities exclude terrain summaries—`Ascent`, `Descent`, altitude min/max/avg, and grade min/max/avg—whether
they were imported from a FIT summary, restored from native JSON, regenerated into an all-diving event summary, or
would otherwise be hydrated from streams. Mixed event summaries aggregate terrain values only from non-diving
activities. Depth represents dive vertical movement. Any source altitude or grade stream remains available when
explicitly requested.

FIT session and lap `intensity` enums are retained as the string-valued `Intensity` stat. Values follow the FIT profile,
such as `active`, `rest`, `warmup`, `cooldown`, `recovery`, `interval`, and `other`.

Cadence-shaped source fields are normalized by activity context. Swimming, open-water swimming, rowing, indoor rowing,
kayaking, canoeing, paddling, and stand-up paddling expose `Stroke Rate` in `spm`; other activities continue to expose
`Cadence` in `rpm`. The same rule covers streams plus activity and lap summaries, and prevents both semantic families
from being emitted for one activity.

Use `importFromSuunto(suuntoJson)` for Suunto JSON. Use `importFromJSON(eventJson)` only for Sports Lib's native `EventJSONInterface` representation.

Native JSON hydration preserves explicit stats, except terrain summaries excluded for the Diving activity group, and
fills missing pace, swim-pace, and grade-adjusted-pace summaries from compatible speed summaries on events, activities,
and laps. This keeps older speed-only exports readable with the same derived-stat behavior as newly parsed files;
serializing the hydrated model includes the additive derived stats.
It also converts cadence-shaped data to stroke rate for the supported activity types, so stored native JSON does not
require reparsing from FIT, TCX, or GPX. Pool-swim length JSON keeps its existing `avgCadence` property name while
hydrating that value as `DataStrokeRate`.

Complete native event JSON contains the activities that determine event-summary semantics. Summary-only native event
JSON removes Diving-group terrain summaries when its `Activity Types` stat is present, but preserves other summary
semantics. An application can opt in after hydration by calling
`normalizeActivityMetricSemanticsForStats(summary, contributingActivityTypes)`. The helper changes only unambiguous
homogeneous stroke-rate summaries and removes terrain summaries from homogeneous Diving-group summaries; empty,
unknown, and mixed activity-type inputs remain unchanged. Sports Lib does not infer relationships omitted by an
application-specific persistence layout.

### 20.0.2 native-JSON migration

Restoring existing Diving-group native JSON now removes terrain ascent/descent, altitude min/max/avg, and grade
min/max/avg summary values from events, activities, and laps. No source-file reparse is needed for the restored
in-memory model. Re-serializing that model intentionally omits those values; raw source streams remain untouched.

### 20.0.3 regenerated-event correction

Regenerating an event from Diving-group activities now omits those terrain summaries, and a mixed event takes them only
from its non-diving activities. No source-file reparse is needed; regenerate and reserialize the event summary when an
application persists regenerated summaries.

### 20.1.0 source-hydrated gas and tank records

FIT imports now expose the parser-provided gas and tank messages through `getDiveSourceRecords()`. Existing native JSON
does not gain a persisted field and needs no schema migration. An application that wants to show the records for an
already-stored activity must hydrate them again from its retained original FIT source; Sports Lib does not reconstruct
them from summary metrics or streams.

### 20.1.1 native-JSON gas and tank records

`diveSourceRecords` is now a native `ActivityJSONInterface` field. JSON export preserves the ordered gas, tank-summary,
and tank-update records, and JSON import restores tank timestamps as `Date` values. The records remain structured data,
not numeric metrics: no gas/tank relationship, mixture name, nitrogen value, or consumption is inferred.

Activities stored from 20.1.0 or earlier do not contain this new field. Reparse or import the retained original FIT
source to backfill it; native JSON cannot reconstruct the records from existing summaries or streams.

Activities expose one-second streams and typed stats. Read numeric values with `getValue()` and display-ready values with
`getDisplayValue()`. Depth presentation follows the first swim-pace preference: `/100m` selects meters and `/100yd`
selects feet, while serialized source values remain meters.

For stream filtering, generated streams, training-stress settings, and FIT device compaction, see [Configure parsing](parsing-options.md). Planned courses are separate models; see [Work with routes](routes.md).
