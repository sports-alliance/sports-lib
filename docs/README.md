# Sports Lib documentation

Sports Lib normalizes GPX, TCX, FIT, and service-specific JSON into shared activity and route models. Activity imports
and native JSON hydration consistently fill missing speed-derived pace summaries on events, activities, and laps while
preserving applicable explicit values except Diving-group terrain summaries. Supported activity aliases are normalized to
canonical types, including Diving-group Snorkeling and Mermaiding. The API reference documents the supported consumer
API; implementation adapters and parsers remain available for compatibility but are intentionally outside this reference.

**Regression-tested against 191,548 real-world source files.** Coverage includes activity and route imports
and file-type validation. Corpus investigations
have driven compatibility fixes for vendor quirks, incomplete recordings and malformed data, with recovery based on
evidence in the file. See
[Validation and compatibility](guides/validation.md) for examples, the dated corpus snapshot, activity and route
coverage, methodology and known limitations.

EHPE and EVPE position-error metrics, including Average/Minimum/Maximum, display one decimal place in meters.
Stored values and calculations retain full precision; existing stats need no reparse or migration. See
[Position error display](guides/metrics-and-calculations.md#position-error-display).

Native event, activity, lap, route, and route-file JSON omit non-finite scalar summaries and tolerate legacy null
summary values on restoration. Finite stats and stream null gaps are preserved. See [Export and persist data](guides/exporting.md).

Every sport retains valid nonnegative imported Training Stress Score, including zero and legacy scores without a method.
The legacy `preserveImportedTss` flag is deprecated and does not discard imported scores. See
[Metrics and calculations](guides/metrics-and-calculations.md).
Automatic calculations for Walking, Indoor Walking, Nordic Walking, Speed Walking, Hiking and Trekking prefer
usable power with a valid threshold, then calibrated HR, then MET. Regenerating summaries applies this priority to
previously calculated scores; preserved provider TSS stays unchanged. Metric tokens, units and JSON schemas are unchanged.

Meditation belongs to Indoor Sports. FIT `generic/breathing` imports default to that classification; an explicit Garmin
Breathwork profile preserves Breathwork separately. Correcting older
`Generic` imports requires reparsing their retained FIT sources. See [Import activities](guides/importing-activities.md).

Suunto Stretching (`training/flexibility_training`, `10/19`) imports as the existing Stretching type in Indoor Sports
when the recorded creator manufacturer is Suunto. Provider TSS stays preserved. Correct older
Flexibility Training classifications by reparsing retained sources and regenerating affected summaries and activity-type
aggregates. See [Import activities](guides/importing-activities.md).

Suunto's distinct FIT exports also retain Motorsports, Climbing, Ski Touring, Crosstrainer, Aerobics, Trekking,
Paragliding and Calisthenics as existing canonical sports. Explicit Kettlebell and Telemark Skiing profiles refine
their shared pairs; unnamed shared pairs keep their broad classifications. These rules use decoded FIT fields and
recorded creator identity, while retaining provider TSS. Historical corrections require source reparsing and
regeneration of affected summaries and Training snapshots. See [Import activities](guides/importing-activities.md).

The catalog now has 284 canonical types. Polar dance styles, mobility variants, classic skiing, road sports and
Les Mills programs keep separate names. HIIT timer formats, Dynamic Apnea and Indoor Track Running also retain
their recorded distinctions. Road Bike resolves to Road Cycling; XC Classic Ski resolves to Classic Crosscountry
Skiing. Broad stored labels remain readable, and valid imported TSS stays preserved.
Parkour belongs to Performance, Vertical Running to Trail Running, and Spearfishing to Diving. Recognized source
profiles preserve these names; unnamed shared Suunto exports retain their broader labels.
Name lookup accepts string sport names; invalid native JSON names restore Unknown Sport. RPM, SPRINT and THE TRIP
retain Indoor Cycling's trainer flag as well as their own names.

Every canonical type belongs to exactly one of 18 groups, and group member lists include each type once. The 12 broad
or special types assigned to Unspecified are also listed explicitly. Indoor status remains independent of the group.

Provider context resolves ambiguous names such as Polar Enduro and Garmin Ski. FIT refinement requires a recognized
`sport_profile_name`; activity titles alone do not establish a sport. Consumer adoption must update its exact Training
contexts before production use. See [distinct sport names](guides/importing-activities.md#distinct-sport-and-workout-names)
for the names, groups, TSS policy and historical corrections, and the
[complete provider mappings](guides/importing-activities.md#garmin-polar-and-strava-provider-names) for all 146 source entries.
The [Quantified Self adoption guide](guides/importing-activities.md#quantified-self-coordinated-adoption) links the two
open PRs, all 284 reviewed classifications (25 Training groups and nine deliberate Other labels), and the
package/consumer/reparse rollout order.

Racket Sport (`64`) and Ultimate Disc belong to Team/Racket; Para Sport (`68`) belongs to Unspecified.
AMRAP, EMOM, and Tabata retain separate canonical types; Dynamic Apnea retains its own Diving type; E-Bike Fitness, Casual Walking, and Bike Commute
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
Aerial Sports, Performance, and Outdoor Adventures. Explicit Indoor Track names preserve Indoor Track Running; the track code
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

FIT imports preserve credible per-session timestamps when duration summaries are missing, keeping multisport records
and load scoped to their own legs. See [recorded timing and sensor coverage](guides/importing-activities.md#recorded-timing-and-sensor-coverage)
for recovery behavior and reparsing existing activities.
Sole-session FIT recordings with a complete corroborated timer timeline also retain later records across long pauses,
keeping full elapsed time separate from recorded active time and training load. Existing truncated imports need an
original-file reparse; duration limits and public metric/JSON contracts remain unchanged.
Whole-workout timing recovery and pool timing rejection decline when the source declares additional or invalid
session counts or multiple activity summaries, even if only one session was decoded. Missing legacy counts retain their existing behavior.
Corroborated timer and distance evidence can also recover premature endings and distinguish exercise stops from
delayed saves. Malformed multisport cascades retain a later leg's explicit start only with independent session ownership
and duration evidence. Explicit zero-distance delayed saves require a declared sole session, complete zero counters
and a corroborated closed timer timeline; active time remains unchanged. See the same timing guide for eligibility.
An explicitly declared missing final session can be retained as `Unknown Sport` only with corroborating record,
timer and distance evidence. Earlier legs and their boundary samples remain unchanged; ambiguous laps and multiple
missing sessions stay unresolved. Recovery requires original-file reparse and consumer identity/control reconciliation.
Recovered legs cannot borrow earlier VO₂ max, training effect or recovery estimates through unscoped metric fallbacks.
A user-metric observation is retained only when its explicit start uniquely matches the recovered leg.

Suunto JSON/SML imports distinguish active and elapsed time and never emit a negative pause. Inconsistent timing
requires independent recorded evidence; otherwise active duration and its dependent load candidates stay unavailable.
Historical corrections require an original-file reparse; saved JSON alone cannot recover private timing evidence.
Native Suunto multisport lap summaries match source timestamps and sport ownership, including sport-change remainders.
Final lap summaries retain their own manual/automatic counter despite interleaved markers.
Final-batch recovery cannot move earlier same-sport summaries or independently recorded lap endpoints to Stop.
Ambiguous automatic remainders stay unassigned even when a valid manual summary ends at the same Stop.
Cross-leg laps remain once on their ending leg and never derive whole-lap averages from that leg's partial streams.
Original-file reparse corrects affected historical laps without changing activity totals or public JSON schemas.

Activity imports reject explicitly non-activity FIT files instead of synthesizing workouts from monitoring events.
Completed `activity_summary` files remain supported when they contain recorded sessions, even without record streams.
Suunto mixed-sport pace thresholds must belong to their leg; pool-distance recovery avoids adding a cumulative final
lap total twice when independent length and recorded-distance evidence agree. GPX imports retain ClueTrust GPXDATA
heart-rate extensions, including COROS exports. These corrections require original-file reparsing and derived-summary
refreshes for affected activities; existing non-activity imports need separate consumer review, not automatic deletion.

Native activity JSON restores child names independently of event titles. GPX activity and route imports retain the
exporter name without assigning the schema version as a manufacturer; unknown TCX sports use `Unknown Sport`.
GPX activity imports retain recorded m/s speed from standard TrackPointExtension/v2 and evidenced legacy v1
exporters, preserving zero, gaps and canonical Speed/Pace identities. Activity exports use v2 and keep zero speeds.
Historical recovery requires original-file reparse and dependent-summary refresh; see the
[GPX compatibility guide](guides/importing-activities.md#gpx). Saved-route parsing is unchanged.
TCX imports recover recorded speed from an unambiguous ActivityExtension/v2 TPX directly under a trackpoint when
the Extensions wrapper is missing. Existing canonical Speed/Pace metrics and JSON schemas are unchanged; original-file
reparsing and summary refreshes recover historical omissions. Normal wrapped extensions retain precedence.
Compatibility recovery rejects unit/validity attributes and competing namespace lookalikes; namespace declarations
remain allowed.
Recognized COROS direct Extensions/Speed is converted from km/h for both streams and lap calculations; other
creators do not inherit this unit assumption. Position/AltitudeMeters can supply missing standard altitude in metres.
Both use existing canonical metrics and require original-file reparsing; ambiguous TPX/Cadence units remain unsupported.
Recorded TCX lap cadence comes only from the lap's own field; a trackpoint can no longer masquerade as a lap summary.
Historical false lap values need source reparsing; stream-derived cadence summaries keep their existing behavior.
TSS diagnostics distinguish missing inputs from calculations that cannot return a valid score, preserving the formulas,
limits and fallback order. See [activity import compatibility](guides/importing-activities.md) and
[TSS calculations](guides/metrics-and-calculations.md) for source-reparse requirements.

Native route JSON omits non-finite scalar summaries and tolerates legacy invalid summaries on restoration while
preserving valid values and geometry checks. Files without valid summaries use existing child-route aggregation;
no original-file reparse is needed. See [native route JSON summaries](guides/routes.md#native-json-summaries).

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
- [Validation and compatibility](guides/validation.md) — verified corpus counts, testing scope, route coverage and known limitations.

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

Power TSS now requires independent FTP, uses the full eligible duration, and computes missing normalized power with
complete rolling 30-second windows. MTB/downhill/enduro use biking-specific maximum HR. Internally inconsistent
percent-max-HR threshold settings are rejected, preserving imported scores and eligible fallbacks.
For percent-HRR zones, a complete session calibration is also rejected when its threshold lies below the lowest
boundary of an exact six-boundary 50–100% reserve pattern. This narrow file-consistency check preserves custom
patterns and uses the existing `invalid-hr-calibration` fallback explanation; it does not infer a replacement threshold.
Historical affected scores require original-file reparse and a refresh of consuming applications' derived summaries.
With independent FTP and duration, complete eligible recorded zero-power windows now yield POWER TSS 0. A zero
summary or zeros inserted for missing FIT, TCX or GPX power fields cannot establish that evidence.
Positive computed NP also requires actual recorded coverage: padded gaps cannot complete a rolling window or block
an eligible HR/MET fallback. FIT timer events can supply active duration when a valid timer summary is missing.

Calculated HR TSS excludes explicit timer pauses and readings inside them across eligible sports, including recording
gaps spanning a pause. Without timer events, existing elapsed-time integration remains in use; no pause is guessed from
aggregate duration. Imported scores remain authoritative.

Running pace TSS uses the corrected Minetti cost ratio, full eligible active duration, recorded zeros and complete
30-second windows that restart at pauses and recording gaps. Pool FIT files preserve recorded HR, including gaps,
instead of replacing it with lap averages. Multisport initial pauses are retained when session timing unambiguously
corroborates the prior timer state.
Adjacent FIT sessions keep their own recorded samples, and session zone durations follow FIT message IDs. Suunto
JSON/SML retains explicit pause/resume positions, including pauses spanning a sport change.

Pool FIT imports also support single-lap length streams, retain final boundary/rest lengths, and repair invalid pool
summary end times using explicit file durations. Existing single-lap recorded streams retain priority. Generated rest
lengths add no distance, and ambiguous ownership cannot establish a complete generated distance total.
Single- and multi-lap pool imports retain session-owned recorded power, preserving zeros and gaps through JSON and
regeneration. Power timestamps do not extend length-derived streams; existing FTP and TSS eligibility still apply.
An original-file reparse recovers previously omitted observations without changing metric tokens or the JSON schema.
Length end dates and generated samples are bounded by their resolved activity and owning lap. Contradictory timers
cannot extend a swim into later legs, while paused lengths keep the existing active sampling limit. Original-file
reparse applies these corrections to saved swims. Shared later length timestamps use elapsed endpoints only with
consecutive-length and lap/session corroboration. Complete raw lap ranges can establish that omitted active lengths
make a generated distance counter incomplete; recorded distance remains the fallback, without inferring a complete
counter from the retained lengths.
For these boundary and distance corrections, source totals, individual distances and duration stats remain intact;
ambiguous source timing is not guessed.
See the [import guide](guides/importing-activities.md) for the guards and historical reparse requirements.
Separately, when independent workout evidence proves a pool lap or length duration impossible, that duration becomes
unavailable. The row and its usable measurements remain, with rejected source timing retained in optional native-JSON
`timingValidity` metadata. Elapsed time can include rests, so it must not replace a rejected active duration. The library
handles this in its swim calculations; applications doing their own timing calculations should use
`resolveSwimTimingSeconds` for lengths and preserve the marker in custom serializers. See the
[plain-language example and integration guidance](guides/importing-activities.md#contradicted-pool-timing).

Duration, timer, moving-time and pause getters now correctly declare `Data… | undefined`. Guard missing statistics
before reading them and retain valid zero. This typing correction changes no stored JSON and needs no reparse by itself;
see [optional duration statistics](guides/importing-activities.md#optional-duration-statistics).
Native JSON also omits non-finite scalar summaries and restores
legacy null summaries safely, preserving valid zero values and stream gaps; that repair needs only JSON restoration.

Swimming without an independent threshold now skips swim-pace TSS instead of assuming threshold effort. FIT files with
valid scoped HR/FTP calibration use it without being blocked by unrelated global sport defaults. Complementary
FIT sensor records at one timestamp retain their supplied fields before padding, and pool HR keeps explicit dropout
boundaries. TCX elapsed time spans all tracks in each lap while retaining its explicit start and active timer duration.
Imported TSS remains unchanged.
Apply these corrections to historical calculations through original-file reparse and refresh downstream Training
summaries; serialized metric names and units are unchanged. See the [TSS methods and migration guidance](guides/metrics-and-calculations.md).

Suunto EnergySense observations retain canonical `Stamina` percentages and add `Estimated Sustainable Distance`
plus its minimum. Source `Cur` endings and `Min` summaries remain distinct from sampled values. The distance source
unit is metres, as confirmed by the maintainer in [#158](https://github.com/sports-alliance/sports-lib/issues/158); no FIT field is inferred. See
[metric semantics and historical reparse](guides/metrics-and-calculations.md#endurance-estimates).

Native JSON preserves valid source lap identifiers (including zero), and event regeneration restores complete
multisport timer/elapsed totals without substituting other clocks. See [JSON compatibility](guides/exporting.md#native-json-round-trips)
and [regenerated multisport timing](guides/metrics-and-calculations.md#regenerated-multisport-timing).
