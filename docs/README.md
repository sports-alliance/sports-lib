# Sports Lib documentation

Sports Lib normalizes GPX, TCX, FIT, and service-specific JSON into shared activity and route models. Activity imports
and native JSON hydration consistently fill missing speed-derived pace summaries on events, activities, and laps while
preserving applicable explicit values except Diving-group terrain summaries. Supported activity aliases are normalized to
canonical types, including Diving-group Snorkeling and Mermaiding. The API reference documents the supported consumer
API; implementation adapters and parsers remain available for compatibility but are intentionally outside this reference.

Native event, activity, lap, route, and route-file JSON omit non-finite scalar summaries and tolerate legacy null
summary values on restoration. Finite stats and stream null gaps are preserved. See [Export and persist data](guides/exporting.md).

With `preserveImportedTss: true` (the default), every sport retains finite imported Training Stress Score, including
zero and legacy scores without a method. With `false`, existing TSS and its method are discarded and a replacement
is calculated where supported; otherwise both remain unset. See [Metrics and calculations](guides/metrics-and-calculations.md).
Automatic calculations for Walking, Indoor Walking, Nordic Walking, Speed Walking, Hiking and Trekking prefer
usable power with a valid threshold, then calibrated HR, then MET. Regenerating summaries applies this priority to
previously calculated scores; preserved provider TSS stays unchanged. Metric tokens, units and JSON schemas are unchanged.

Meditation belongs to Indoor Sports. FIT `generic/breathing` imports default to that classification; an explicit Garmin
Breathwork profile preserves Breathwork separately. Correcting older
`Generic` imports requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

Suunto Stretching (`training/flexibility_training`, `10/19`) imports as the existing Stretching type in Indoor Sports
when the recorded creator manufacturer is Suunto. Provider TSS follows the preservation setting above. Correct older
Flexibility Training classifications by reparsing retained sources and regenerating affected summaries and activity-type
aggregates. See [Import activities](guides/importing-activities.md).

Suunto's distinct FIT exports also retain Motorsports, Climbing, Ski Touring, Crosstrainer, Aerobics, Trekking,
Paragliding and Calisthenics as existing canonical sports. Explicit Kettlebell and Telemark Skiing profiles refine
their shared pairs; unnamed shared pairs keep their broad classifications. These rules use decoded FIT fields and
recorded creator identity, with the existing TSS setting. Historical corrections require source reparsing and
regeneration of affected summaries and Training snapshots. See [Import activities](guides/importing-activities.md).

Garmin names such as Bike Indoor, Gravel Bike, MTB, Climb Indoor, Row Indoor, XC Classic Ski, XC Skate Ski, and Pool
Swim reuse existing canonical sports. The expanded Garmin, Polar and Strava catalog has 245 canonical types, with
49 additional sports and the same TSS preservation policy. Provider context resolves ambiguous names such as Polar
Enduro and Garmin Ski. FIT profile fallback needs an actual recognized `sport_profile_name`; activity titles alone do not establish
the sport. See [Import activities](guides/importing-activities.md#garmin-activity-profile-names) for all twenty aliases
and historical correction requirements. See the [complete provider mapping batch](guides/importing-activities.md#garmin-polar-and-strava-provider-names)
for all 146 remaining source entries and their groups.

Racket Sport (`64`) and Ultimate Disc belong to Team/Racket; Para Sport (`68`) belongs to Unspecified.
AMRAP, EMOM, and Tabata reuse HIIT; Dynamic Apnea reuses Pool Apnea; E-Bike Fitness, Casual Walking, and Bike Commute
reuse E-Biking, Walking, and Cycling. Bare Racket imports now preserve the broad Racket Sport category; precise
sub-sports or racket profile names retain their particular sport. See [Import activities](guides/importing-activities.md#racket-para-disc-and-workout-names)
for parent guards, aliases, TSS behavior, and historical corrections after consumer adoption.

Padel belongs to Team/Racket. FIT `racket/padel` imports preserve Padel instead of Racquet Ball; correcting older
classifications requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

FIT Dance (`83`) resolves to the existing Dancing type, and Jump Rope (`84`) has its own Indoor Sports type.
Pickleball (`racket/pickleball`, `64/84`) has its own Team/Racket type, distinct from Racquet Ball and Padel.
Historical Generic or Racquet Ball imports require specific retained sources, then regeneration of affected summaries
and Training snapshots after consumer adoption. See [Import activities](guides/importing-activities.md).

Rucking (`17/124`) belongs to Outdoor Adventures, Sailing Expedition (`32/66`) to Water Sports, and CCR Diving
(`53/63`) to Diving. Their specific FIT classifications and explicit names preserve separate types from Hiking,
Sailing, and general Diving. Historical corrections need retained sources and regeneration of affected summaries
and Training snapshots after consumer adoption. See [Import activities](guides/importing-activities.md).

Walking, Indoor Walking, and Nordic Walking now share the Walking group. Indoor Walking retains its indoor hint;
walking pace, speed, and vertical-speed behavior is preserved. FIT Obstacle Racing (`1/59`) and Ultra Running (`1/67`)
belong to Running, Enduro (`2/123`) reuses Enduro MTB under Mountain Biking, and Rally (`81/125`) belongs to Motorized.
Indoor Walking accepts Walking and Fitness Equipment parents (`11/27`, `4/27`). Correct historical classifications
from specific retained sources; consumers must add the Walking group to exhaustive metadata maps during adoption.
See [Import activities](guides/importing-activities.md).

Spin (`2/5`) reuses Indoor Cycling, E-bike Mountain (`2/47`, also `21/47`) reuses E-Mountain Biking,
Adventure Race (`18/82`, `1/82`) reuses Adventure Racing, and Fly Paraglide (`20/111`) reuses Paragliding.
Broad Hockey (`73`), Winter Sport (`58`), Team Sport (`70`), and Water Sport (`78`) now retain their source
classification without guessing a subtype. Paramotoring (`20/112`) belongs to Aerial Sports and RC Drone Flying
(`20/39`) to Unspecified; both preserve imported TSS without calculating it. See
[Import activities](guides/importing-activities.md) for groups, aliases, parent guards, and historical corrections.

E-Enduro MTB (`2/127`) belongs to Mountain Biking, Track Cycling (`2/13`) and Recumbent Cycling (`2/10`) to Cycling,
Speed Walking (`11/31`) to Walking, and separate Whitewater Kayaking (`41/41`) and Whitewater Rafting (`42/41`)
to Water Sports. Wingsuit Flying (`20/40`), Brick Training (`18/80`), and Hunting with Dogs (`28/72`) belong to
Aerial Sports, Performance, and Outdoor Adventures. Explicit Indoor Track names reuse Indoor Running; the track code
alone does not imply indoor running. See [Import activities](guides/importing-activities.md) for parent guards,
calculation behavior, and historical correction requirements.

BMX (`2/29`) belongs to Cycling, Indoor Skiing (`4/25`, also named XC Ski Indoor) to Indoor Sports, ATV (`22/35`)
and Motocross (`22/36`) to Motorized, and Pool Triathlon (`18/126`) to Performance. Their documented FIT parents
preserve the separate canonical types across manufacturers. ATV and Motocross preserve imported TSS without
calculating it; only Indoor Skiing establishes an indoor hint. Historical corrections require specific retained
sources and regeneration of affected summaries after consumer adoption. See [Import activities](guides/importing-activities.md).

Indoor Hand Cycle (`2/88`) belongs to Cycling; Indoor Wheelchair Push Walk (`65/86`) and Run (`66/87`) belong to
Adaptive Mobility. All three preserve an explicit indoor hint. Overlanding belongs to Motorized, and Trucker Workout
to Indoor Sports. Their specific FIT classifications and explicit names retain distinct canonical types; Motorized
and Adaptive Mobility preserve imported TSS without calculating it. Historical corrections require retained sources
and regeneration of affected summaries after consumer adoption. See [Import activities](guides/importing-activities.md).

Grinding (`59`) belongs to Water Sports, Indoor Grinding (`59/71`) to Indoor Sports, and Sail Racing (`32/65`)
to Water Sports. Garmin's Grind Offshore, Grind Onshore, and Sail Race names preserve these separate types.
Historical Generic, Unknown Sport, or Sailing imports need specific retained sources and regeneration of affected
summaries and Training snapshots after consumer adoption. See [Import activities](guides/importing-activities.md).

Pool Apnea (`85`) has a distinct Diving type, Mobility (`86`) belongs to Indoor Sports, and Video Gaming (`63`)
belongs to Unspecified. Pool Apnea remains separate from Free Diving; Mobility remains separate from Flexibility
Training. Video Gaming omits calculated TSS while preserving source-imported scores. Correcting historical imports
requires retained sources and regeneration of affected summaries and Training snapshots after consumer adoption.
See [Import activities](guides/importing-activities.md).

Shooting (`56`) and Geocaching (`87`) have distinct Outdoor Adventures types; Platform Tennis (`racket/platform`,
`64/93`) has its own Team/Racket type. The FIT mappings apply across manufacturers. Historical Generic or Racquet Ball
imports require specific retained sources, then regeneration of affected summaries and Training snapshots after
consumer adoption. See [Import activities](guides/importing-activities.md).

Disc Golf belongs to Team/Racket alongside Golf and Frisbee, with its own canonical type. FIT `disc_golf` and explicit
Frisbee golf provider names preserve that distinction. Historical corrections need retained sources or specific sport
names; generic FIT classifications alone remain ambiguous. See [Import activities](guides/importing-activities.md).

Lacrosse belongs to Team/Racket with its own canonical type. FIT sport `74` and explicit Lacrosse sport/profile names
preserve that classification across manufacturers. Historical corrections need retained sources or specific sport names;
generic FIT exports alone remain ambiguous. See [Import activities](guides/importing-activities.md).

Water Tubing belongs to Water Sports with its own canonical type. FIT sport `76` and explicit Water Tubing
sport/profile names preserve it separately from Water Skiing and Wakeboarding across manufacturers. Historical Generic
imports require specific retained sources. See [Import activities](guides/importing-activities.md).

Wakesurfing belongs to Water Sports, Archery to Outdoor Adventures, and Mixed Martial Arts to Indoor Sports. Their
explicit FIT sports (`77`, `79`, and `80`) preserve distinct canonical types across manufacturers; MMA aliases resolve
to Mixed Martial Arts. Historical Generic imports require specific retained sources, followed by regeneration of
affected summaries and Training snapshots after consumer adoption. See [Import activities](guides/importing-activities.md).

FIT `cycling/hand_cycling` imports resolve to the existing Hand Cycle type in the Cycling group; correcting older
Cycling classifications requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

Field Hockey belongs to Team/Racket. Suunto FIT `generic/match` imports preserve Field Hockey when the recording
identifies Suunto as its creator manufacturer. Older Match imports require reparsing retained FIT sources.
See [Import activities](guides/importing-activities.md).

Suunto FIT `generic/hand_cycling` imports resolve to the existing Wheel Chair type in Adaptive Mobility when the
recording identifies Suunto as its creator manufacturer. Older Generic imports require reparsing retained FIT sources.
See [Import activities](guides/importing-activities.md).

FIT `wheelchair_push_walk` and `wheelchair_push_run` imports preserve distinct Wheelchair Push Walk and
Wheelchair Push Run types in Adaptive Mobility across manufacturers. The explicit wheelchair sport retains its
mobility context ahead of profile names. Historical corrections require
reparsing retained FIT sources. General Wheel Chair activities retain their existing type.
See [Import activities](guides/importing-activities.md).

Chores belongs to Unspecified. Suunto FIT `generic/exercise` imports preserve Chores when the recording identifies
Suunto as its creator manufacturer. Older Generic imports require reparsing retained FIT sources.
See [Import activities](guides/importing-activities.md).

Cyclocross belongs to Cycling. FIT `cycling/cyclocross` imports preserve Cyclocross instead of Mountain Biking;
correcting older classifications requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

Gravel Cycling belongs to Cycling. FIT `cycling/gravel_cycling` and the `GravelRide` alias preserve Gravel Cycling;
correcting older Cycling classifications requires reparsing their retained sources. See [Import activities](guides/importing-activities.md).

E-Mountain Biking belongs to Mountain Biking. FIT `e_biking/e_bike_mountain` and the `EMountainBikeRide` alias preserve
that distinction; correcting older E-Biking classifications requires reparsing their retained sources. See [Import activities](guides/importing-activities.md).

Splitboarding belongs to Winter Sports. FIT `snowboarding/backcountry` imports preserve Splitboarding; correcting older
Backcountry Skiing classifications requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

Ski Mountaineering belongs to Winter Sports and remains distinct from Ski Touring and Backcountry Skiing.
FIT `backcountry` sub-sports retain sport context, preventing running, cycling, and swimming from becoming skiing.
Historical corrections require reparsing retained FIT sources. See [Import activities](guides/importing-activities.md).

Skate Skiing belongs to Winter Sports. FIT `cross_country_skiing/skate_skiing` preserves Skate Skiing;
correcting older Crosscountry Skiing classifications requires reparsing their retained sources. See [Import activities](guides/importing-activities.md).

Track Running belongs to Running and recognizes explicit Track Run or Track Running sport/profile names.
FIT `running/track` honors recognized Track Running and Track and Field profiles, preserving their Running and Performance
groups respectively. The pair alone remains Running because Suunto uses it for both activities. Historical corrections
require reparsing retained sources that include a recognized name/profile. See [Import activities](guides/importing-activities.md).

Field Hockey belongs to Team/Racket. FIT `hockey/field` imports preserve Field Hockey across manufacturers;
correcting older Unknown Sport classifications requires reparsing retained sources. See [Import activities](guides/importing-activities.md).

Ice Hockey belongs to Team/Racket. FIT `hockey/ice` imports preserve Ice Hockey across manufacturers;
correcting older Unknown Sport classifications requires reparsing retained sources. See [Import activities](guides/importing-activities.md).

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

The expanded sport catalog and synchronous provider aliases contribute about 57 kB to the representative browser
startup fixture, which totals about 79 kB minified before compression. Package verification limits those two tables
separately and still rejects eagerly bundled FIT decoding, importers, exporters, and other heavy dependencies.

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

Power-curve JSON restoration preserves recorded zero W/kg values, keeping saved activity statistics stable for
Training load source validation.

`analyzeActivityDurability` produces deterministic durability evidence when an activity has enough eligible source data. Its steady aerobic adapter supports standard mountain biking but records Enduro MTB and Downhill Cycling as explicit unsupported contexts. `samplePowerCurveAtDuration` and `comparePowerCurveWindows` support power-curve comparisons without extrapolating beyond known samples. Parsing retains power streams and power curves but does not infer athlete CP/W′ or persist three-dimensional strain from one workout. `buildPowerDurationEnvelope` and `fitThreeDimensionalCapacityModel` instead use a dated, same-activity-type history to produce a confidence-gated CP/W′/Pmax snapshot; `calculateThreeDimensionalStrain` scores a workout only when the caller supplies a complete ready model. Follow the [rolling capacity and scoring recipe](guides/metrics-and-calculations.md#rolling-capacity-estimation-and-scoring) and the complete [research and implementation guide](guides/three-dimensional-training-model.md).

Capacity diagnostics separately report usable curves and the distinct activities that supplied each component's
retained envelope anchors, so consumers can disclose concentrated evidence without treating it as a different fit.

`calculateThreeDimensionalImpulseResponse` applies independently calibrated fitness-fatigue responses to the three daily load series. `fitThreeDimensionalImpulseResponseParameters` adds bounded, chronologically validated calibration when callers provide dated daily strain loads and independent CP/W′/Pmax observations; it deliberately returns no generic athlete model when evidence or held-out fit quality is inadequate. Follow the [practical response-calibration recipe](guides/metrics-and-calculations.md#practical-response-calibration-recipe) before integrating it.

[Training stress evaluations](guides/metrics-and-calculations.md) distinguish imported scores, calibrated HR, MET
estimates and unavailable results. The public ActivityUtilities API returns all three requested policies from the
parsed file without requiring athlete settings. Load editors can request one-decimal display through
`DataTrainingStressScore.getDisplayValue(1)` while existing metric displays retain their integer default.
