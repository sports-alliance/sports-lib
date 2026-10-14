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

The GPX `creator` attribute supplies the exporter name. Its `version` attribute is the GPX schema version,
not the manufacturer or device software version; neither is inferred from the exporter name. Reparse original GPX
to correct manufacturer values persisted by older importers.

Heart-rate observations include direct `heartrate`, Garmin track-point extensions and direct ClueTrust GPXDATA `hr`
elements in `http://www.cluetrust.com/XML/GPXDATA/1/0`, as used by COROS. The namespace URI establishes this alias;
an arbitrary XML prefix or unrelated `hr` element does not. Original-file reparsing recovers previously missed samples
and related summaries. HR observations alone do not provide the calibration required for HR TSS.

Recorded `trkpt/extensions/TrackPointExtension/speed` uses canonical `Speed` in m/s when the block and field
belong to Garmin's `http://www.garmin.com/xmlschemas/TrackPointExtension/v2` namespace. The v1 schema never
defined speed; compatibility is limited to the evidenced Amazfit/Zepp (`Amazfit ` creator prefix or `Zepp App`),
`Intervals.icu`, and older QS exports identified by their direct GPX metadata link to `https://quantified-self.io/`.
An unknown v1 exporter does not inherit a unit assumption. Prefix spelling is irrelevant; namespace and direct
ownership are required. One extension, one recognized block and one finite nonnegative scalar speed are required.
Zero is retained; blank, non-finite, negative, nested, attributed or duplicate/conflicting fallback values are ignored
(namespace declarations are allowed). Existing direct `extensions/speed` retains precedence and behavior.

Recovery supplies the existing Speed stream, without adding a metric or blending missing samples with GPS speed.
When no usable speed stream exists, the established distance/GPS fallback remains. Speed-dependent pace, moving time,
work and durability summaries can change; recorded distance and timer duration remain independent. Pace-based TSS
still requires eligible calibration, and no calibration is inferred from these readings. Selective stream parsing
and canonical JSON names/units remain unchanged. Reparse original GPX files and refresh dependent summaries to
recover previously ignored observations; regenerating saved JSON cannot restore discarded source values.
New [GPX exports](exporting.md) use v2 and retain recorded zero speeds. Old exports that omitted zeros cannot recover
those readings without an independent original containing them. Saved-route parsing is unchanged.

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

TCX sport values use the canonical activity-type resolver. Unrecognized, missing or blank sports become
`Unknown Sport`; recognized Running/Biking values retain existing indoor detection when GPS is absent.
Reparse original TCX to correct previously missing sport classifications, then refresh consuming summaries.

TCX also recovers recorded speed when a trackpoint directly contains a single `TPX` in the
`http://www.garmin.com/xmlschemas/ActivityExtension/v2` namespace but omits the `Extensions` wrapper.
Its directly owned `Speed` must be a finite, nonnegative number; zero is retained, and ambiguous or invalid
values stay missing. Normal wrapped extensions retain precedence. This compatibility path applies only to speed,
using the existing canonical `Speed` (m/s), derived `Pace`, and summary calculations; it does not recover unwrapped
power or cadence or supply missing TSS calibration. Canonical names, units, and native JSON schemas are unchanged.
Previously omitted observations require reparsing the original TCX and refreshing consuming summaries; restoring
saved activity JSON cannot recover them.

Two further TCX layouts are supported with standard fields retaining precedence:

- Activities whose single, directly owned `Creator/Name` is `COROS Wearables` can supply speed through
  `Trackpoint/Extensions/Speed`, with all three elements in the TCX v2 namespace. This exporter records
  **km/h**, so the importer divides by 3.6 before creating canonical Speed/Pace streams or calculating lap
  speed summaries and moving time. Standard TPX speed remains in m/s, including in COROS activities.
  This conversion is scoped to the recognized layout and creator; it never guesses units from sample magnitudes.
  Unknown creators and ambiguous containers remain unsupported. The exporter convention is also described in
  [GPS Wizard's TCX format analysis](https://logiqx.github.io/gps-wizard/formats/tcx.html).
- A single `Trackpoint/Position/AltitudeMeters`, with all three elements in the TCX v2 namespace, supplies
  missing standard altitude in metres. Negative elevations and zero are valid. Existing altitude processing
  (gap filling, optional smoothing, terrain metrics and summaries) applies identically to standard altitude.

Both fallback paths reject blank, non-finite, nested-value and duplicate/conflicting candidates. An existing
standard container/field keeps its precedence even if empty or malformed. Recorded duration, timestamps and
distance remain independent; recovered speed can change moving time and speed summaries, and recovered altitude
can change terrain-derived metrics. No TSS calibration is invented. Canonical metric tokens, units and JSON
schemas remain unchanged, including the existing numeric metrics used by Quantified Self MCP. Reparse original
TCX files and refresh dependent summaries to recover historical omissions; no token migration is required.

`Trackpoint/Extensions/TPX/Cadence` is **not** treated as an alias for standard Cadence/RunCadence. Its exporter
convention may count both feet rather than complete cycles; units must be established before adding a conversion.
Standard trackpoint Cadence and TPX RunCadence retain their existing behavior, including activity-aware Stroke Rate.
Recorded lap cadence is read only from a single, finite, nonnegative `Cadence` directly owned by that lap,
in the lap's TCX namespace (including existing v1 and unnamespaced legacy documents). Trackpoint values cannot
supply that field, even when they appear before the recorded lap value. This also prevents unsupported TPX/Cadence
from entering through the lap-summary path. Existing stream-derived averages and explicit LX AvgRunCadence remain
unchanged. The existing lap-stat token is retained; reparse the original TCX to remove historical false lap values.
See [#156](https://github.com/sports-alliance/sports-lib/issues/156).

### Recorded timing and sensor coverage

`importFromFit` accepts recorded activity files and completed `activity_summary` files with explicit sessions. Summary
files can retain session values without record streams, as in Wahoo exports, but cannot synthesize missing sessions.
Explicit non-activity `file_id.type` values, including monitoring, settings, planned workouts and courses, reject with
`ParsingEventLibError`, including conflicting file IDs. Missing file IDs or type fields still permit legacy
activity/sessionless recovery. Use `importRoutesFromFit` for courses; this does not change route parsing.
Existing wrongly imported monitoring files fail original-file reparsing instead of producing replacement workouts;
consumers must retain or separately review their existing stored data rather than automatically delete it.

FIT combines complementary records at the same absolute timestamp before padding missing sensor fields. Later
explicit values retain precedence; an absent field does not erase another record's observation. Pool swims with
recorded HR retain explicit zero/invalid readings as dropout boundaries through load recalculation.

FIT sessions retain credible explicit start/end timestamps when elapsed and timer summaries are absent or zero.
Missing summaries alone do not replace a leg's bounds with the whole recording. Corrupt-date recovery uses the
session's own records, including records across its laps; whole-file records are a fallback only for a sole session.
An unresolved multisport leg is rejected rather than assigned another leg's record range. Elapsed statistics use the
resolved dates, and explicit timer events can still recover paused time within each leg. The configured maximum
activity duration remains enforced. Existing affected activities require an original-file reparse and a refresh of
derived summaries; restoring their saved JSON cannot reconstruct the missing session boundaries. This correction
adds no metrics or fields and preserves canonical names, units, imported TSS and public JSON schemas.

A missing final FIT session can be recovered as the existing `Unknown Sport` type when the activity message declares
exactly one more session than the file contains. The recorded prefix must have contiguous, ordered bounds and either
no session indexes or consecutive zero-based indexes. The final activity timestamp, last record and closing timer
event must agree. One ordered timer timeline must corroborate every existing session's active duration within the
existing one-second timestamp tolerance; the tail's active time excludes its recorded pauses. A nondecreasing distance
counter at both tail boundaries supplies the distance delta. Conflicting readings at the same timestamp reject recovery.

This recovery preserves earlier legs, including their closing samples, summaries and calibration context. Only records
strictly after the last recorded session are added to the new leg. Trailing laps or pool lengths, ambiguous bounds,
explicit sport messages, conflicting timer groups, multiple missing sessions and duration-limit violations are left
unchanged for separate investigation. It does not guess a sport, redistribute laps, copy earlier calories or infer
calibration. Existing summary generation uses the recovered streams; TSS stays unavailable unless independently eligible
inputs exist. `Generic` remains a separate intentional sport type.
Incomplete files containing jumps also remain unchanged: existing jump association can extend beyond a recorded leg,
so appending a tail without resolving that ownership could duplicate events and skew workout jump averages.

Consumers must reparse the original file to recover a missing leg, keep the existing event identity and reconcile child
identities and user controls before persistence. Repeated reparses must reuse the recovered leg instead of adding another
copy. In Quantified Self the existing Other training policy applies to Unknown Sport; manual overrides and exclusions
remain attached to their original legs. Adopt a released library version in both app and Functions before any production
reparse, then refresh affected derived summaries. No new metric tokens, fields, MCP scopes or public schemas are required;
existing stored activities remain unchanged until reparse. Route import behavior is unaffected.

A sole explicit FIT session can also retain chronology omitted by an inconsistent elapsed summary. The pause-only
proof requires ordered records from the source start through the final stop (the final sample may precede that stop
by one whole-second tick), a complete alternating timer timeline in one event group, and records at distinct times
within every active interval. The summed intervals must agree with the positive source timer summary. Its precision
tolerance is one second per closed interval plus one millisecond: FIT event timestamps encode whole seconds and timer
summaries encode milliseconds. It does not grow with workout duration.

A separate delayed-save proof can use the last recorded exercise stop rather than a later save timestamp. It additionally
requires a complete monotonic distance counter ending at the source session distance, records supporting every active
interval, and the same active-time agreement. Repeated `stop_all` events while already stopped do not add active time or
extend the exercise end. Records during a stop must retain the preceding distance. The explicit source start remains
unchanged; a one-tick difference in the initial timer timestamp does not move it. Missing starts, unclosed intervals,
conflicting groups, advancing distance during a stop, inconsistent timer sums and unrecorded final stops reject this proof.

An early ending timestamp that agrees with active time can instead be repaired from the independently supplied elapsed
duration when a single start/stop envelope agrees with that elapsed duration and a complete, ordered distance counter
reaches the session distance after the premature end. Those envelope events do not redefine active time. Both proofs
require a sole explicit session, preserve the configured duration limit and leave unsupported files on the existing
recovery path. `Elapsed time` and `Pause Time` reflect the corroborated chronology, while `Duration` and `Timer time`
retain the supplied active time; long pauses do not become training load.

For malformed multisport ending timestamps, a valid explicit leg start can be retained with its own elapsed duration
only when its earliest cascaded record belongs to an independently bounded, disjoint earlier session, and the
repaired end contains every later cascaded record. This prevents a contaminated cascade from moving the later leg to the
workout's start. Conflicting ownership, insufficient duration evidence and ordinary single-session date recovery retain
their existing behavior.

FIT lap bounds also retain an independently corroborated source end when the decoder's cascaded
lap records extend into later workout data. This requires a unique source lap start, a positive
start/end span consistent with the millisecond elapsed summary at FIT's whole-second timestamp
precision, one containing explicit source session, and containment within the resolved activity.
A supplied timer must be finite and nonnegative. If it exceeds elapsed, it must also agree with
the source span at whole-second timestamp precision; contradictory summaries retain the existing
timing-recovery path rather than corroborating an end before normalization.
Uncorroborated or ambiguous lap timestamps retain the existing recovery behavior. This changes
the lap's time window, not its supplied duration, distance or activity samples.

A fractional elapsed summary can also clip a terminal whole-second record. The importer retains
that record only when a complete, alternating timer timeline from the same event group and
ordered records independently establish the stop at that next timestamp tick. Each timer
interval must have distinct supporting records, and the timer sum must agree with the source
active duration within FIT timestamp precision. Only elapsed chronology advances; the supplied
active duration remains unchanged. Unsupported terminal records, zero-length timer intervals
and contradictory timelines do not gain this recovery.

Existing affected imports need original-file reparsing and derived-summary refreshes; saved JSON cannot reconstruct
omitted samples. Imported TSS remains authoritative. Calculated metrics can change when valid recorded samples are
restored. These corrections add no metric tokens, units, options, exports or serialized fields, and do not change route
parsing or MCP schemas, scopes, projections or mutation capabilities.

Pool length end dates use credible ending timestamps, retaining fractional elapsed precision when it agrees with
the FIT timestamp's whole-second resolution. Positive elapsed duration, then positive timer duration, can recover a
missing or invalid end. Resolved activity and owning-lap ends bound each length. Generated samples additionally retain
the existing active-timer limit, so a longer elapsed interval does not invent HR exposure during a pause, and a
contradictory long timer cannot extend samples into another leg. Explicit indexed lengths crossing a lap's start keep
their ownership only when their sampling interval overlaps that lap. Recorded HR and single-lap counters retain their
existing precedence. Reparse original FIT files and refresh derived summaries to correct historical swim bounds;
the source timer/elapsed stats, imported TSS, metric names, units and JSON shape are retained.

Some pool exports give consecutive lengths the same later summary timestamp. Elapsed time supplies an earlier
endpoint only when the next length's explicitly recorded start corroborates it at FIT's whole-second precision, both message indexes are
unique and consecutive, and both lengths already belong to one explicit lap range. The elapsed interval must fit
inside that lap and session, with a nonnegative timer no longer than elapsed time. This does not guess an endpoint
for a terminal length, change ownership, or rewrite source timer/elapsed statistics.

A complete generated pool-distance counter also requires complete source evidence. When a non-overlapping explicit
lap range contains every declared active/rest length and agrees with its active count, an active member omitted from
the session proves that the retained lengths cannot establish a complete counter. The importer disables that
length-derived counter and retains recorded distance samples when available. Recorded totals and individual length
distances remain intact. It does not redistribute missing distance, invent lengths, or extend the session. Missing or
contradictory range/count evidence does not activate this additional guard. These checks apply only to swimming with
a lap-swimming sub-sport or positive pool length. Corrupt source durations and ambiguous timestamps remain unresolved.
Historical corrections require original-file reparse after adopting a release containing the fix; JSON restoration
alone cannot supply the omitted evidence. Recorded pace, SWOLF and TSS inputs, pool units and public schemas are unchanged.

TCX lap elapsed time covers every Track, starting at `Lap.StartTime` when valid, otherwise the earliest valid
trackpoint. A stated start overlapping the previous lap is rejected when this lap’s recorded points all follow that
previous lap; its earliest point supplies the start instead. `TotalTimeSeconds` retains its active-duration meaning and is also the elapsed-time minimum. Separate
tracks do not create moving-time intervals across their gaps. Reparse original files to apply these corrections to
saved activities, then refresh derived summaries. Canonical metric names, units and JSON schemas are unchanged.

### FIT reserved-header compatibility

Ordinary FIT activity imports recover existing device files whose normal record headers set reserved bit 4.
Messages using this compatibility path must have complete definitions and native/developer payloads within the
source data section. Other invalid data-header bits remain rejected. This restores imports rejected by FIT Parser
5.2.0 through 6.2.1 without rewriting the source or changing imported TSS, calibration rules, or checksum policy.
Strict/raw FIT readers, including the independent workout-reference reader below, retain their existing validation;
a recoverable activity does not automatically establish valid workout-reference metadata. Retry previously rejected
original files with Sports Lib 21.6.11 or later. Existing successful imports need no migration.

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

`wahooWorkouts` is a plain, ordered `FITWahooWorkoutReference[]`, not a `Data*` class. It reads only the observed
`wahoo-app-plan-v1` layout from native manufacturer message 65285 in a file with exactly one `file_id` identifying a
Wahoo (manufacturer 32) recorded activity (type 4). Its field 3 byte payload must have the exact `35 00 05` header,
bounded positive-decimal Plan ID, terminators and fixed-length tail; envelope fields 0–2 must have the observed types
and lengths. The payload's scheduled Workout ID is little-endian independently of the FIT definition architecture.
The explicit `0xffffffff` sentinel becomes `workoutId: null`; a zero ID is invalid. `startTimeUnixMs` retains the
source metadata's recording start, not the planned date. The opaque final four bytes are deliberately not returned
or assigned a meaning. Other private messages are ignored; the reader never searches arbitrary bytes or titles for IDs.

This layout is an empirical compatibility contract, reproduced in synthetic tests from multiple authorized QA
recordings, **not a published Wahoo binary specification**. `invalid_wahoo_reference` identifies malformed recognized
records; `unsupported_wahoo_reference` identifies unknown reference-layout headers or an absent/conflicting Wahoo
activity-file identity. Either rejects the entire Wahoo reference group, including earlier apparently valid entries,
while preserving independent native and Suunto evidence. Duplicate and conflicting valid observations are returned,
not silently deduplicated or matched. All references are file-scoped: consumers must separately establish the recorded
session, trusted source provenance, exact owned provider delivery and ambiguity policy. A null scheduled Workout ID
does not justify title/date/duration matching or account-wide Plan ID matching.

Restore an explicitly authorized metadata snapshot with the strict codec; unknown fields, unsupported formats,
out-of-range values and incomplete/sparse arrays are rejected. Array bounds, object keys and scalar fields are
snapshotted once, so validation and copying use the same values even for inputs with accessors or proxies:

```ts
import { parseFITWahooWorkoutReferences, readFITWorkoutReferences } from '@sports-alliance/sports-lib';

const source = readFITWorkoutReferences(fitArrayBuffer);
const stored = JSON.parse(JSON.stringify(source.wahooWorkouts));
const restored = parseFITWahooWorkoutReferences(stored); // owned plain-object snapshot
```

The synchronous reader delegates FIT wire-format validation and selected-message extraction to the lightweight
`fit-file-parser/raw` entry point. That entry point does not load the full activity decoder or semantic profile.
Sports Lib interprets the retained native field bytes and base types, session-scoped developer fields, interior NUL
separators, endianness and compressed timestamps as workout-reference metadata. Source-native enums remain their
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
completion matching are separate consumer work; its numeric MCP catalog must continue excluding these structured
classes (numeric construction with `0` is rejected) and plain Wahoo metadata. Existing consumers can ignore the
additive `wahooWorkouts` result field. No QS private source references are automatically exposed, and this library
change alone does not complete or relink a planned workout.

Regression fixtures reproduce the metadata topology of an inspected Guide-bearing Suunto export using synthetic
values: standard metrics on one developer index and Guide pairs on a separate `SuuntoplusFitExt` index. A renumbered
variant exercises dynamic resolution. Tests also cover unrelated application-less metadata in existing Garmin/Wahoo
samples. No private recordings or identifiers are embedded in these fixtures.

Sources: [Suunto FIT description](https://apizone.suunto.com/fit-description) and
[Suunto decoder example](https://aspartnercontent.blob.core.windows.net/apizone/docs/SuuntoDeveloperFieldsDecodingExample.java).
The description documents positional owner/external-ID pairing; the example identifies both metadata exporters and
distinguishes them from the variable IDs of individual SuuntoPlus apps.

### Recorded FIT metrics

The FIT parser applies profile scaling to record-level `depth`, `next_stop_depth`, summary depth, and bottom-time
fields. Sports Lib stores those scaled values directly as canonical meters or seconds without another conversion.
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

Suunto JSON/SML activity and lap windows without `PauseDuration` supply active time, not elapsed time.
Elapsed time comes from the owning interval; an explicit elapsed/pause pair retains its supplied semantics.
Negative pauses are never emitted. An impossible active summary can be recovered from an explicit Activity start
and non-conflicting boolean pause states inside the recorded timeline. Repeated equal states are idempotent.
A single-leg header can corroborate window precision only when its start agrees, its active value agrees at float32
precision and its entire elapsed interval lies inside the source sample envelope. This does not extend the activity
or its streams. Float32-equivalent timestamp/summary differences alone cannot create a negative pause.

Mismatched window counts or conflicting sport identifiers cannot donate timing to a leg. Without independent recovery
evidence, contradictory active time leaves `Duration`, `Timer time` and `Pause Time` absent, not zero; duration-dependent
load candidates (including HR) and newly calculated or cached durability evidence stay unavailable on that parsed instance.
Valid imported scores remain eligible, including zero; HR calibration alone cannot establish active duration.
Event summaries do not publish partial active/pause totals when a leg is unresolved. Missing summaries retain the
existing timestamp fallback. Original-file reparse is required for historical corrections and for retaining private
source evidence during regeneration; native JSON preserves the resulting values/absence but cannot recover that evidence.
No metric names, units, public fields, route behavior or JSON schemas change.

Native Suunto JSON multisport laps match timestamped `Lap`/`Autolap` windows to their recorded endpoints and
sport identifiers, never to sample-array positions. A sport change can supply a partial lap without a separate Lap
sample; that remainder stays with its sport leg instead of shifting all subsequent summaries. A final summary batch
can be reconciled to Stop only when the same timestamp also contains the final sport's Activity summary and the Move
summary. Independent manual and automatic counters keep their own starts when both flush at Stop.
Conflicting windows or sport identifiers do not supply another lap's distance or active duration.

A genuine lap spanning sports remains one lap on the leg containing its endpoint. An unmatched source marker is
retained once with its inferred interval, but that interval alone cannot establish active duration. Cross-leg laps keep
source summaries; a single leg's samples cannot generate whole-lap averages or determine cadence/stroke or terrain
semantics for the complete lap. Lap JSON and metric tokens are unchanged. Original-file reparse is required to correct
historical source matching; native JSON cannot recover discarded source windows. Activity/event totals, streams and
training-load methods are unchanged by this lap correction. Consumers should label cross-leg laps separately from
sport-local laps and must not clamp their endpoints onto earlier legs' final map or chart samples.

In mixed-sport Suunto files, a header speed-zone boundary is not owned by every leg. Only applicable leg-local speed
boundaries populate those legs' intensity zones; local durations remain available. A header threshold remains eligible
when all legs have one resolved sport type. Without an independent running/swimming threshold, pace TSS falls back
through the existing eligible methods, or reports unavailable. Overrides and imported scores retain their usual priority.
Reparse original Suunto files to correct older copied boundaries; saved JSON cannot establish their original ownership.

Native JSON hydration preserves each child activity’s saved name independently of the parent event title.
Names already present in stored JSON need no source reparse; a name discarded before storage cannot be recovered
from that JSON.

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
