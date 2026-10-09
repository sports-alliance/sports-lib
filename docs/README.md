# Sports Lib documentation

Sports Lib normalizes GPX, TCX, FIT, and service-specific JSON into shared activity and route models. Activity imports
and native JSON hydration consistently fill missing speed-derived pace summaries on events, activities, and laps while
preserving applicable explicit values except Diving-group terrain summaries. Supported activity aliases are normalized to
canonical types, including Diving-group Snorkeling and Mermaiding. The API reference documents the supported consumer
API; implementation adapters and parsers remain available for compatibility but are intentionally outside this reference.

Meditation belongs to Indoor Sports. FIT `generic/breathing` imports preserve that classification; correcting older
`Generic` imports requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

Padel belongs to Team/Racket. FIT `racket/padel` imports preserve Padel instead of Racquet Ball; correcting older
classifications requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

FIT `cycling/hand_cycling` imports resolve to the existing Hand Cycle type in the Cycling group; correcting older
Cycling classifications requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

Cyclocross belongs to Cycling. FIT `cycling/cyclocross` imports preserve Cyclocross instead of Mountain Biking;
correcting older classifications requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

Gravel Cycling belongs to Cycling. FIT `cycling/gravel_cycling` and the `GravelRide` alias preserve Gravel Cycling;
correcting older Cycling classifications requires reparsing their retained sources. See [Import activities](guides/importing-activities.md).

Splitboarding belongs to Winter Sports. FIT `snowboarding/backcountry` imports preserve Splitboarding; correcting older
Backcountry Skiing classifications requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

Ski Mountaineering belongs to Winter Sports and remains distinct from Ski Touring and Backcountry Skiing.
FIT `backcountry` sub-sports retain sport context, preventing running, cycling, and swimming from becoming skiing.
Historical corrections require reparsing retained FIT sources. See [Import activities](guides/importing-activities.md).

Regenerated multi-activity events carry the positive `Recovery Time` reported by their chronologically final activity.
They do not combine child recovery estimates or promote an earlier estimate when the final activity has none.

Provider-neutral Health and sleep `Data*` classes cover movement, energy, cardiovascular values, wellness, body
composition, sleep stages, sleep scores, and sleep-qualified vital aggregates. Their canonical tokens, units, display
formatting, aliases, and JSON behavior are documented in the metrics guide; provider transport and persistence remain
consumer responsibilities.

Canonical kilogram `DataWeight` values also support an independent optional `WeightUnits.Pounds` display preference.
Older settings remain in kilograms. This can format planned external loads without adding a workout-specific metric
or changing stored `Weight` JSON. See the [metrics guide](guides/metrics-and-calculations.md).

The opt-in [FIT workout-reference reader](guides/importing-activities.md#fit-workout-references) exposes standard FIT
training-file references, embedded workout summaries and paired SuuntoPlus Guide IDs as serializable `DataBare`
classes with unversioned `references` or `definitions` values. These are nonnumeric source metadata, separate from
normal activity JSON; consumers own account validation,
privacy and completion matching. Developer indexes and field numbers resolve dynamically; unsupported exporters and
malformed metadata have distinct diagnostics, and unrelated developer errors or malformed optional session fields do
not discard independent valid reference groups. Ambiguous Guide groups are rejected rather than partially paired.
The same reader returns the exact observed Wahoo app plan-reference layout as a plain `wahooWorkouts` array,
with strict JSON restoration through `parseFITWahooWorkoutReferences`. Unknown layouts are rejected; the scheduled
Workout ID may be explicitly absent while the Plan ID remains present. These file-scoped references are not
numeric metrics, do not enter activity JSON, and cannot by themselves establish account ownership or completion.

Activity-aware cadence semantics produce stroke rate for swimming, rowing, and paddle sports. Consumers that store event
summaries separately from activities can explicitly canonicalize those projections with
`normalizeActivityMetricSemanticsForStats` after determining the contributing activity types.

Activity groups distinguish generic and inline skating from Ice Skating, retain flight altitude metrics with vertical
speed for aerial activities, and classify motorized and adaptive-mobility activities without deriving training stress or
durability evidence.

FIT creator attribution prefers `file_id` metadata and recovers only missing identity fields from a `device_info` row
explicitly marked as the creator or local device. Compacted device metadata retains that identity row even when it has
no timestamp, while timed battery calculations remain unchanged. `deviceInfoMode: 'changes'` also compacts alternating
device rows independently per device index, preserving state changes and source order; see the
[parsing guide](guides/parsing-options.md#fit-device-metadata).

FIT imports retain parser-scaled record depth samples in canonical meters and native session/lap dive summaries plus
decompression, gas-consumption, tissue-load, PO₂, ascent-rate, and air-time-remaining record streams. Ordered FIT gas,
tank-summary, and tank-update records are available separately through `ActivityInterface.getDiveSourceRecords()` and
round-trip through the native `ActivityJSONInterface.diveSourceRecords` field. These values follow the FIT profile
without record-to-summary calculation, interpolation, clamping, gas/tank linking, or gas/tank flattening. Depth,
average/maximum depth, next-stop depth, and dive-rate display variants follow the first swim-pace preference, using
meters and meters per second for `/100m` or feet and feet per second for `/100yd`. Dive depths display to three decimal
places, rates to three, SAC/RMV values to two, and PO₂ retains both FIT decimal places.
Garmin single-gas, multi-gas, and gauge sub-sports import as `Scuba Diving`; apnea sub-sports import as `Free Diving`.
FIT session and lap intensity enums are retained as the string-valued `Intensity` stat. Diving-group activities do not
retain or derive terrain ascent, descent, altitude min/max/avg, or grade min/max/avg summaries, including when older
native JSON is restored or an all-diving event summary is regenerated. Mixed event summaries use terrain values only
from non-diving activities. Their vertical movement is represented by depth; raw altitude and grade streams remain
available when provided by the source.

## Start here

Swim distances support optional meter or yard display while preserving canonical meter values; see
[Swim distance display](guides/metrics-and-calculations.md#swim-distance-display).

Install the package:

```sh
npm install @sports-alliance/sports-lib
```

When parsing GPX in Node.js, also install a DOM parser implementation:

```sh
npm install @xmldom/xmldom
```

Version 21 provides module-preserving ESM and CommonJS output through the existing package-root API. Bundlers can remove
unrelated importers and utilities when focused exports are used; the `SportsLib` facade continues to expose the complete
format surface in the initial bundle. Startup-sensitive consumers should use focused root imports. Upgrading does not
require reparsing activities or routes, regenerating summaries, or migrating native JSON and persisted metrics.

## Guides

- [Import activities](guides/importing-activities.md) — parse GPX, TCX, FIT, Suunto JSON, and native JSON.
- [Work with routes](guides/routes.md) — import, export, convert, and preview planned routes, including GPX 1.1 metadata ordering.
- [Configure parsing](guides/parsing-options.md) — control stream output and FIT device metadata.
- [Export and persist data](guides/exporting.md) — create GPX or native JSON and restore it later.
- [Metrics and calculations](guides/metrics-and-calculations.md) — canonical metric tokens, units, and derivation rules.
- [Three-dimensional power and training-response model](guides/three-dimensional-training-model.md) — research
  provenance, implemented equations, capacity estimation, strain scoring, calibration, and limitations.

## API reference

Use the navigation to browse the curated API, including [SportsLib](https://sports-alliance.github.io/sports-lib/classes/API.SportsLib.html), [activity parsing options](https://sports-alliance.github.io/sports-lib/classes/API.ActivityParsingOptions.html), [route parsing options](https://sports-alliance.github.io/sports-lib/classes/API.RouteParsingOptions.html), [streams](https://sports-alliance.github.io/sports-lib/classes/API.Stream.html), and the [JSON contracts](https://sports-alliance.github.io/sports-lib/interfaces/API.EventJSONInterface.html).

## Analytics

`analyzeActivityDurability` produces deterministic durability evidence when an activity has enough eligible source data. Its steady aerobic adapter supports standard mountain biking but records Enduro MTB and Downhill Cycling as explicit unsupported contexts. `samplePowerCurveAtDuration` and `comparePowerCurveWindows` support power-curve comparisons without extrapolating beyond known samples. Parsing retains power streams and power curves but does not infer athlete CP/W′ or persist three-dimensional strain from one workout. `buildPowerDurationEnvelope` and `fitThreeDimensionalCapacityModel` instead use a dated, same-activity-type history to produce a confidence-gated CP/W′/Pmax snapshot; `calculateThreeDimensionalStrain` scores a workout only when the caller supplies a complete ready model. Follow the [rolling capacity and scoring recipe](guides/metrics-and-calculations.md#rolling-capacity-estimation-and-scoring) and the complete [research and implementation guide](guides/three-dimensional-training-model.md).

Capacity diagnostics separately report usable curves and the distinct activities that supplied each component's
retained envelope anchors, so consumers can disclose concentrated evidence without treating it as a different fit.

`calculateThreeDimensionalImpulseResponse` applies independently calibrated fitness-fatigue responses to the three daily load series. `fitThreeDimensionalImpulseResponseParameters` adds bounded, chronologically validated calibration when callers provide dated daily strain loads and independent CP/W′/Pmax observations; it deliberately returns no generic athlete model when evidence or held-out fit quality is inadequate. Follow the [practical response-calibration recipe](guides/metrics-and-calculations.md#practical-response-calibration-recipe) before integrating it.
