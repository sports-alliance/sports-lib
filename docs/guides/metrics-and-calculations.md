---
title: Metrics and calculations
summary: Canonical metric tokens, units, and derivation behavior.
---

`Effort Pace` uses pace semantics (`min/km`), not speed semantics (`m/s`). Its average, minimum, maximum, and unit-variant metric types follow `paceUnits`.

## Regenerated multisport timing

`EventUtilities.reGenerateStatsForEvent` independently sums `Timer time` and `Elapsed time` when every leg supplies a
finite nonnegative value for that clock. Zero is valid. A missing or invalid child value leaves that parent clock
unavailable; wall-clock dates and other clocks are not substitutes. Child timing and rests are unchanged. Regenerating
an existing event with complete child timing restores these totals without an original-file reparse. Generic event
regeneration still rebuilds summaries from children; source-only parent observations must be retained separately by
an original-file import workflow, never distributed among legs or treated as current values after edits or merges.

## Endurance estimates

`Stamina` and its `Average`, `Minimum`, and `Maximum` keys remain unchanged. Suunto JSON/SML `Endurance`
continues to use this percentage family; Garmin Stamina and Potential Stamina retain their existing mappings.
Consumers may label verified Suunto observations **EnergySense Endurance** without changing serialized keys.
The Suunto importer now records `creator.manufacturer = 'Suunto'` from the source format. Friendly device names
alone do not establish that provenance.

`DataEstimatedSustainableDistance` adds canonical `Estimated Sustainable Distance` and
`DataEstimatedSustainableDistanceMin` adds `Minimum Estimated Sustainable Distance`. Values are finite,
nonnegative metres, with separate miles display variants registered in `DynamicDataLoader`; zero is valid.
They represent estimates, never travelled distance or distance remaining to a target, and are not summed across
activities. A sole activity's stats can appear unchanged on its parent event. No multi-activity estimate is derived.

Suunto JSON/SML `EnduranceDistance` samples map directly to the distance stream. Object/array summaries map `Cur`
to the end-of-scope scalar and `Min` to the provider minimum. Both take precedence over sampled observations;
only a missing minimum is derived from the canonical one-second samples. The normal timestamp collision policy
can make that sampled minimum differ from the minimum of all raw readings. Samples alone do not fabricate an ending scalar. Gaps and increases
are preserved, while missing, null, nonnumeric, nonfinite and negative distances are omitted. There are no derived
average/maximum variants. The undocumented `EnduranceValid` flag does not suppress populated observations or assert
provider validation. Both Suunto formats now honor `streams.includeTypes`, including derivation dependencies.

**Source unit:** `EnduranceDistance` is in metres, as confirmed by the maintainer in
[#158](https://github.com/sports-alliance/sports-lib/issues/158).
The raw numeric values are retained without scaling; this confirmation requires no conversion change or data migration.
[Suunto's EnergySense explanation](https://us.suunto.com/blogs/blog/what-is-energysense) describes sustainable distance and
remaining endurance but does not specify the export field's unit or validity flag.
No speculative FIT mapping is added: an export without these observations remains unavailable.

Label changes require no key migration. New persisted distance summaries and explicit Suunto manufacturer metadata
require original-file reparse for historical records; retained JSON/SML can hydrate charts without a persistence rewrite.
FIT-only records cannot recover omitted source fields. Downstream regeneration must preserve freshly parsed endurance
summary values before deriving missing stats, and numeric discovery must require actual persisted availability.

## Swim distance display

`DataSwimDistance` keeps the canonical `Distance` token, meter value and JSON representation. Its optional
`SwimDistanceUnits` constructor argument selects meters (the default) or yards for display only; long swims stay in
those units instead of switching to kilometers or miles. For example,
`new DataSwimDistance(91.44, SwimDistanceUnits.Yards)` displays `100 yd`, while `getValue()` remains `91.44` and
`toJSON()` remains `{ Distance: 91.44 }`. `DynamicDataLoader` preserves this explicit display choice. Consumers can
choose it from the first swim-pace preference without changing general distance preferences or stored values.
This display option requires no activity/route reparse, derived recalculation, or persisted-data migration. MCP numeric
discovery and canonical wire values remain unchanged; the display unit is not a new metric or persisted unit.

## Position error display

`EHPE` is estimated horizontal position error; `EVPE` is estimated vertical position error. Both are device estimates
in meters, not measured deviations from a known reference position. Their base, Average, Minimum and Maximum classes
return `m` from `getUnit()` and `getDisplayUnit()`, and format `getDisplayValue()` to one decimal place. For example,
`new DataEHPEAvg(3.87654)` displays `3.9 m`. Values remain in meters even above 1000; position error does not
use the general distance formatter's kilometer switching. Suunto sample import preserves its recorded numeric values.

Only display formatting and the formerly empty unit metadata change. `getValue()`, summary calculations, canonical
type tokens and JSON numeric values retain full precision. Existing persisted stats gain the corrected display when
loaded with this version, without activity/route reparsing, summary regeneration or a persisted-data migration.

Quantified Self MCP consumer review: all eight existing classes remain package-root exports, enumerable through
`DataStore` and loadable through `DynamicDataLoader` using their existing canonical tokens. The numeric catalog's unit
metadata changes from empty to `m`; numeric query values and persisted stat keys do not change. Quantified Self must
adopt the same package version in its frontend and Functions and verify catalog/persistence tests under its
MCP metric-surface workflow. This correction introduces no metric, tool, output field, scope, consent, provider action
or additional exposure; downstream package adoption and release remain separate work.

Data Coverage & Calculation Reference
---

Data Coverage Overview
---
Sports Lib currently exposes a broad metric surface from the public data barrel (`src/data/index.ts`) and concrete data classes (`static type` declarations).

- Exported data modules from `src/data/index.ts`
- Concrete canonical metric type strings (`Data*.type`) from exported `Data` classes
- Minimum/Maximum/Average family types
- Unit variant types (`... in ...`)
- Zone/target types

The library exposes these metrics through streams, stats, laps/events, and event summaries.
Canonical type strings are the same values used by `ActivityParsingOptions.streams.includeTypes`.
Some legacy metric types include intentional whitespace in their token (for example ` Steps`), so copy tokens exactly.

Time metric semantics:
- `Duration` (unit: `s`): active duration (timer time).
- `Timer time` (unit: `s`): explicit timer/active time.
- `Elapsed time` (unit: `s`): wall-clock elapsed time (includes pauses).
- `Pause Time` (unit: `s`): supported paused time; inconsistent source timing must not produce a negative value.
- `Moving time` (unit: `s`): movement-only time; separate from pause semantics.

For a sole FIT session whose complete timer timeline and ordered records corroborate longer chronology,
`Elapsed time` includes the full span and `Pause Time` its inactive portion; the recorded `Duration` and `Timer time`
stay active-only. See [recorded timing](importing-activities.md#recorded-timing-and-sensor-coverage) for evidence
requirements, precision tolerance, duration limits and original-file reparse requirements. No metric token,
unit or JSON schema changes; downstream numeric reads receive the corrected existing values after reparse.

Suunto JSON/SML windows keep active time separate from their interval's elapsed time. Contradictory active timing
requires independent header or timer-event evidence; otherwise active/timer/pause summaries and duration-dependent
TSS candidates and durability evidence remain unavailable. Multisport active/pause totals require every leg; ordinary native JSON retains
missing summaries without manufacturing zeros. See the [Suunto import contract](importing-activities.md) for scope,
source precision and original-file regeneration requirements. Imported TSS retains priority; calculated HR still requires
valid active timing as well as calibration and sample coverage.

High-level metric domains include:
- Core streams/stats: time, distance, speed, pace, swim pace, heart rate, cadence, stroke rate, power, altitude, depth, grade, vertical metrics
- Zones and targets: heart-rate/power/speed zone durations and zone targets
- Device/context: battery, pressure, satellites, sensor/pod flags, fused location flags, device metadata
- Performance analytics: normalized power, power curve, FTP, IF, TSS, critical power, W', power work, stamina, durability evidence, legacy three-dimensional strain evidence
- Running/cycling/swim dynamics: ground contact, flight time, ground-contact balance, oscillation, ratio, SWOLF, efficiency-related metrics
- Jump analytics: jump count/events and min/max/avg families for jump height, distance, speed, score, rotations, hang time
- Provider-neutral Health and sleep: daily movement and energy, cardiovascular samples, wellness, body composition,
  sleep stages, sleep scores, and sleep-qualified vital aggregates

Running-dynamics metric semantics
---

Ground Contact Time is the canonical Sports Lib terminology. FIT protocol names remain importer details:

| Source field | Canonical metric | Source unit | Stored unit |
| --- | --- | --- | --- |
| FIT `stance_time` / `avg_stance_time` | `Ground Contact Time` / `Average Ground Contact Time` | `ms` | `ms` |
| FIT `stance_time_percent` / `avg_stance_time_percent` | `Ground Contact Time Percentage` / `Average Ground Contact Time Percentage` | `%` | `%` |
| FIT `stance_time_balance` / `avg_stance_time_balance` | `Ground Contact Time Balance Left` and `Ground Contact Time Balance Right` | `%` | `%` |
| Suunto `GroundContactTime` | `Ground Contact Time` | `s` | `ms` |
| Suunto `LeftGroundContactBalance` / `RightGroundContactBalance` | `Ground Contact Time Balance Left` / `Ground Contact Time Balance Right` | `%` | `%` |
| Suunto `FlightTime` | `Running Flight Time` | `s` | `ms` |
| Suunto `ContactTimeRatio` | `Contact Time to Flight Time Ratio` | `%` | `%` |

FIT ground-contact-time percentage is the fraction of the running cycle spent in ground contact. Suunto contact time
to flight time ratio is a separate source measurement and may exceed 100%; Sports Lib neither aliases nor converts it
to FIT ground-contact-time percentage. Running flight time is also distinct from jump hang time and Stryd ground time.
Suunto non-positive flight-time and contact-time-ratio values are treated as missing provider sentinels; the corpus
contains running files with all-zero flight samples and null flight summaries.

Suunto running-dynamics summaries accept both header objects (`{ Avg, Min, Max }`) and window arrays containing that
object. Deprecated Stance Time classes remain loadable for historical native JSON, but FIT imports emit only the
canonical Ground Contact Time streams. Existing persisted activities must be reparsed from their FIT or Suunto source
files to gain metrics newly supported here; no existing canonical values require migration.

Health and sleep metric semantics
---

Sports Lib exposes provider-neutral scalar `Data*` classes for Health and sleep values. These classes define stable
canonical type tokens, units, display formatting, aliases, `DataStore` enumeration, dynamic loading, and native JSON
round trips. They do not add a provider transport, a Health record container, or a sleep-session container. A consumer
decides whether a value belongs in a stream, statistic, Health source record, or sleep session.

Numeric classes in the Health and sleep catalog accept finite numbers only, including reused activity primitives such
as steps, distance, altitude, heart rate, weight, VO₂ max, and fitness age. `NaN` and infinite values are rejected before
JSON serialization. Score, count, category, and duration units remain available through `getUnit()`, while count, score,
category, and duration display units intentionally omit a suffix. Duration display uses the standard Sports Lib
human-readable duration formatter.

Each Health and sleep scalar supports a storage-safe round trip through its canonical JSON object. `toJSON()` emits one
canonical type key, while the concrete class's `fromJSON()` validates that exact single-key shape before constructing the
metric. Alias keys and objects with additional properties are rejected instead of being persisted ambiguously.

```ts
const stored = JSON.stringify(new DataSleepDuration(28_800).toJSON());
const restored = DataSleepDuration.fromJSON(JSON.parse(stored));
```

The provider-neutral Health catalog is:

| Canonical type | Stored unit | Display behavior |
| --- | --- | --- |
| `Steps` | `count` | Rounded count, no suffix |
| `Wheelchair Pushes` | `count` | Rounded count, no suffix |
| `Distance` | `m` | Existing meter/kilometer distance display |
| `Wheelchair Push Distance` | `m` | Existing meter/kilometer distance display |
| `Floors Climbed` | `count` | Rounded count, no suffix |
| `Active Duration` | `s` | Human-readable duration |
| `Moderate Intensity Duration` | `s` | Human-readable duration |
| `Vigorous Intensity Duration` | `s` | Human-readable duration |
| `Altitude` | `m` | Existing rounded altitude display |
| `Active Energy` | `kcal` | Rounded kilocalories |
| `Basal Energy` | `kcal` | Rounded kilocalories |
| `Total Energy` | `kcal` | Rounded kilocalories |
| `Heart Rate` | `bpm` | Existing rounded heart-rate display |
| `Resting Heart Rate` | `bpm` | Rounded beats per minute |
| `Heart Rate Variability` | `ms` | One decimal; displayed as `HRV` |
| `Blood Oxygen Saturation` | `%` | One decimal; displayed as `SpO₂` |
| `Respiration Rate` | `br/min` | One decimal |
| `Stress Level` | `score` | One decimal, no suffix |
| `Stress State` | `category` | Source category, no suffix |
| `Stress Duration` | `s` | Human-readable duration |
| `Body Energy` | `%` | One decimal; `Body Battery` is an alias |
| `Body Energy Change` | `%` | Signed, one decimal |
| `Recovery Score` | `score` | One decimal, no suffix |
| `Weight` | `kg` | Canonical one-decimal display; `Body Weight` is an alias |
| `Body Mass Index` | `kg/m²` | One decimal; displayed as `BMI` |
| `Body Fat` | `%` | One decimal |
| `Body Water` | `%` | One decimal |
| `Muscle Mass` | `kg` | One decimal |
| `Bone Mass` | `kg` | Two decimals |
| `Systolic Blood Pressure` | `mmHg` | Rounded millimeters of mercury |
| `Diastolic Blood Pressure` | `mmHg` | Rounded millimeters of mercury |
| `Pulse Rate` | `bpm` | Rounded beats per minute |
| `Skin Temperature Deviation` | `°C` | Signed, one decimal |
| `VO2 Max` | `ml/kg/min` | Two decimals; displayed as `VO₂ Max` |
| `Fitness Age` | `years` | Numeric years |

Mass display for planned exercise loads uses the existing canonical `DataWeight` primitive in kilograms, not a new
planned-workout metric or event-stat field. `WeightUnits.Pounds` asks
`DynamicDataLoader.getUnitBasedDataFromDataInstance` for a display-only `DataWeight` instance; its visible value uses
the exact 0.45359237 kg/lb conversion and displays to one decimal place. `WeightUnits.Kilograms` and older settings
without `weightUnits` keep kilograms, independently of distance preference. The instance's `getValue()`, `getUnit()`,
`getType()` and `toJSON()` remain canonical kilograms. This additive display change needs no source
reparse, derived-summary regeneration, or persisted-data migration.
`DataWeight.fromDisplayValue(value, units)` converts a user-entered kg or lb number back to canonical kilograms; callers
still validate workout-specific load bounds before persistence. No consumer needs its own kg/lb conversion constant.

Other planned-workout scalars already use the existing duration (seconds), distance (metres), heart rate (bpm), power
(watts), speed (m/s), pace (seconds per distance), cadence (rpm), and power work (kJ) classes. A rowing 500 m split is
composed from duration and distance display; repetitions and relative percentages remain recipe semantics rather than
recorded `Data*` metrics. Sports Lib does not store schedules, exercise sets, provider delivery, or account state.

Sleep sessions use the following aggregate types:

| Canonical type | Stored unit | Source meaning |
| --- | --- | --- |
| `Sleep Duration` | `s` | Total sleep duration |
| `Sleep In-Bed Duration` | `s` | Total time in bed |
| `Deep Sleep Duration` | `s` | Deep-stage duration |
| `Light Sleep Duration` | `s` | Light-stage duration |
| `REM Sleep Duration` | `s` | Rapid-eye-movement-stage duration |
| `Awake Sleep Duration` | `s` | Awake duration within the session |
| `Unmeasurable Sleep Duration` | `s` | Provider-marked unmeasurable duration |
| `Unknown Sleep Duration` | `s` | Unknown-stage duration |
| `Sleep Score` | `score` | One-decimal provider-normalized score |
| `Average Sleep Heart Rate` | `bpm` | Average sleep heart rate |
| `Minimum Sleep Heart Rate` | `bpm` | Minimum sleep heart rate |
| `Sleep Resting Heart Rate` | `bpm` | Sleep-session resting heart rate |
| `Average Sleep HRV` | `ms` | Average sleep HRV |
| `Overnight HRV` | `ms` | Provider overnight HRV aggregate |
| `Sleep HRV Sample Count` | `count` | Rounded contributing-sample count |
| `Maximum Sleep Blood Oxygen Saturation` | `%` | Maximum sleep SpO₂; displayed as `Maximum Sleep SpO₂` |
| `Average Sleep Respiration Rate` | `br/min` | Average sleep respiration |

Sleep respiration, SpO₂, and HRV sample series use the generic `Respiration Rate`, `Blood Oxygen Saturation`, and
`Heart Rate Variability` classes. Sleep-qualified classes are reserved for aggregates so a sample is not confused with
a whole-session statistic. Canonical Health snake-case identifiers and the documented `sleep_*` identifiers are loader
aliases; sleep vital aggregates additionally accept their corresponding `vitals.*` field paths. Serialization always
writes the canonical type shown above. Adding the classes alone does not change previously stored activities, so no
activity reparse is required.

Source-native diving data
---
FIT imports attach each `dive_summary` to the session or lap identified by its native `reference_mesg` and
`reference_index`. Message order is irrelevant, lap summaries are never promoted to their activity, and missing summary
fields are not calculated from record streams. The parser applies FIT profile scaling to depth and bottom-time fields
before Sports Lib receives and stores those values without further conversion.

Native dive-summary statistics are:

- `Average Depth` (`m`), `Maximum Depth` (`m`), `Surface Interval` (`s`), `Bottom Time` (`s`), and `Dive Number`
- `Dive Descent Time` (`s`), `Dive Ascent Time` (`s`), and `Dive Hang Time` (`s`)
- `Average Dive Ascent Rate`, `Average Dive Descent Rate`, `Maximum Dive Ascent Rate`, and
  `Maximum Dive Descent Rate` (`m/s`)
- `Starting CNS Load`, `Ending CNS Load`, `Starting N2 Load`, and `Ending N2 Load` (`%`)
- `Oxygen Toxicity` (`OTUs`), `Average Pressure SAC` (`bar/min`), `Average Volume SAC` (`L/min`), and
  `Average RMV` (`L/min`)

Native record streams are `Depth` and `Next Stop Depth` (`m`), `Next Stop Time`, `Time to Surface`,
`No-Decompression Limit`, and `Air Time Remaining` (`s`), `CNS Load` and `N2 Load` (`%`), `Pressure SAC` (`bar/min`),
`Volume SAC` and `RMV` (`L/min`), `PO2` (`%`, displayed as `PO₂`), and `Dive Ascent Rate` (`m/s`). These streams retain
only samples present in the source file: Sports Lib does not fill, smooth, clamp, or derive them. In particular,
`Air Time Remaining` preserves every non-invalid unsigned FIT value exactly as decoded. Multi-gas and tank messages
are exposed as ordered `ActivityInterface.getDiveSourceRecords()` records: gases retain message-index flags, mixture
contents, status, and mode; tank summaries retain their timestamps, sensor IDs, pressures, and volume used; and tank
updates retain their timestamps, sensor IDs, and pressures. They are not flattened into scalar statistics, linked to
one another, or derived into consumption values. They round-trip as structured
`ActivityJSONInterface.diveSourceRecords` data rather than numeric metrics.

Presentation preserves the FIT profile precision: depth values and dive rates use three decimal places,
pressure/volume SAC and RMV use two, and PO₂ uses two rather than the generic one-decimal percentage format. The first
swim-pace preference selects a single coherent dive unit family: `/100m` keeps depth and rates in `m` and `m/s`, while
`/100yd` converts depth and rates to `ft` and `ft/s`. Canonical stored values and serialized JSON remain in the FIT
profile units above.

The presentation-only exported variants are `Average Depth in feet`, `Next Stop Depth in feet`, `Dive ascent rate in
feet per second`, `Average dive ascent rate in feet per second`, `Maximum dive ascent rate in feet per second`,
`Average dive descent rate in feet per second`, and `Maximum dive descent rate in feet per second`.

Calculations / Derivations
---
The following formulas describe how missing streams/stats are computed in:
- `src/events/utilities/activity.utilities.ts`
- `src/events/utilities/grade-calculator/grade-calculator.ts`
- `src/events/utilities/tss/tss-calculator.ts`
- `src/events/utilities/helpers.ts`

1) Distance, GNSS distance, speed, pace, swim pace

```text
Distance[t] = Distance[t-1] + geodesic(Position[t-1], Position[t])
Speed[t] = (Distance[t] - Distance[t-1]) / deltaTimeSeconds
Pace (sec/km) = 1000 / Speed(m/s)
Swim Pace (sec/100m) = 100 / Speed(m/s)
```

- Distance/GNSS distance are generated from latitude/longitude when missing.
- Speed is generated from distance deltas and time deltas.
- Unit stream variants are derived via helper conversion factors (km/h, mph, ft/s, m/min, knots, min/mi, min/100yd, miles).
- The FIT parser applies the profile's `1000` depth scale before import; Sports Lib stores record depth and next-stop
  depth directly in meters without another conversion. Canonical depth streams and maximum depth stats remain meters.
  The first `swimPaceUnits` preference selects display variants: `Swim Pace` keeps meters,
  while `Swim Pace in minutes per 100 yard` selects feet.
- Missing minimum, maximum, and average pace-family stats are hydrated from canonical speed stats for events, activities,
  and laps. Pace and swim pace invert the speed extrema (`maximum speed -> minimum pace`); grade-adjusted pace follows
  the same rule while retaining the existing raw-speed bounds. Explicit pace stats are never replaced. Native JSON
  applies this hydration after canonical and legacy stat keys have been resolved, so older speed-only summaries gain the
  same in-memory behavior without requiring a stored-data migration.

2) Altitude smoothing, grade, grade smoothing, grade-adjusted speed/pace

```text
AltitudeSmooth = medianFilter(11) -> lowPassFilter
Grade(%) = clamp((deltaAltitude / deltaDistance) * 100, -50, +50)
             with lookAheadDistance = 10 m, rounded to 0.1
GradeSmooth = KalmanFilter(R=0.01, Q=0.5) over Grade

GradeAdjustedSpeed = Speed * (kA + kB*g + kC*g^2 + kD*g^3 + kE*g^4 + kF*g^5)
  where:
    kA=1
    kB=0.029290920646623777
    kC=0.0018083953212790634
    kD=4.0662425671715924e-7
    kE=-3.686186584867523e-7
    kF=-2.6628107325930747e-9

GradeAdjustedPace = 1000 / GradeAdjustedSpeed
```

3) Left/right split and ground-contact balance

```text
PowerRight = Power * (RightBalance / 100)
PowerLeft  = Power * (LeftBalance / 100)
GroundContactTimeBalanceRight = 100 - GroundContactTimeBalanceLeft
```

4) Generic stat families and ascent/descent gain-loss

```text
Average = sum(filteredFiniteValues) / count
Maximum = max(filteredFiniteValues)
Minimum = min(filteredFiniteValues)

Ascent/Loss uses thresholded step accumulation (default minDiff = 2):
- Gain: accumulate positive deltas when previous + minDiff <= next
- Loss: accumulate negative deltas when previous - minDiff >= next
```

Activity and lap min/max/average derivation uses one explicit internal policy registry. It currently covers altitude,
heart rate, cadence, stroke rate, speed, effort pace, grade-adjusted speed, grade, vertical speed, power, air power,
absolute pressure, EVPE/EHPE, satellite SNR/count, temperature, ground contact time and its percentage, running flight
time, contact-time-to-flight-time ratio, leg stiffness, vertical oscillation/ratio, stamina, and potential stamina.
Registering a metric relationship in `DataStore` alone does not opt a new family into stream-summary generation.

- Every target is filled independently. An imported minimum, maximum, or average remains authoritative while missing
  siblings may still be derived.
- Only finite samples that pass the family policy contribute. No summary is added when no eligible samples exist.
- Heart-rate, cadence, and stroke-rate averages are rounded to whole values. Cadence and stroke-rate minimums and
  averages exclude zero. Ground-contact-time percentages must be greater than zero and at most 100; running flight
  time and contact-time-to-flight-time ratio accept non-negative values.
- Altitude and grade prefer their smoothed streams when present. Their summary families remain excluded for Diving
  activity types.
- Existing laps use their activity's normalized 1 Hz streams. Lap windows are half-open (`[start, end)`), assigning an
  exact shared boundary to the next lap; a lap ending at the activity endpoint includes that final endpoint. Overlapping
  laps are evaluated independently. A lap beginning before the containing activity keeps source summaries, but does
  not derive whole-lap averages from that leg's partial streams. Existing terminal clipping remains unchanged. Speed-derived pace can still use its own source speed.
- Generated lap summaries store canonical stats only. Unit variants are resolved by consumers from the canonical stat
  and current unit settings; activity unit-stat generation remains unchanged for compatibility.
- Native JSON restoration remains snapshot-based and does not regenerate these lap summaries from included streams.
  Newly imported source files, or callers that explicitly run activity stat generation, receive the additional lap
  summaries. Existing persisted activities therefore require source-file reparsing when their JSON has neither the
  summaries nor the source streams needed for explicit regeneration.

- Terrain ascent/descent, altitude min/max/avg, and grade min/max/avg are intentionally excluded for the Diving
  activity group (Diving, Scuba Diving, Free Diving, Snorkeling, and Mermaiding), whether present in a source summary,
  restored from native JSON, regenerated into an all-diving event summary, or otherwise derived from streams. Mixed
  event summaries aggregate these metrics only from non-diving activities. Their vertical movement is represented by
  depth, not terrain elevation.
- Cadence and stroke-rate minimum/average values exclude zero values.
- Grade max/min/avg prefers `Grade Smooth` when present.

Cadence and stroke-rate semantics are activity-aware:

- `Cadence` uses revolutions per minute (`rpm`) for activities such as running and cycling.
- `Stroke Rate` uses strokes or paddle cycles per minute (`spm`) for `Swimming`, `Open Water Swimming`, `Rowing`,
  `Indoor Rowing`, `Kayaking`, `Canoeing`, `Paddling`, and `Stand Up Paddling`.
- Source formats may call both concepts cadence. Importers retain those protocol field names, then one centralized
  activity-type resolver produces the canonical metric family. The canonical activity has one family, not duplicate
  cadence and stroke-rate streams or summaries.
- Native JSON hydration applies the same resolver to activity and lap streams/stats. Existing stored Sports Lib JSON
  therefore does not need source-file reparsing; serializing the hydrated model writes the canonical stroke-rate types.
  A lap beginning before its containing activity is not reinterpreted using only its containing leg's sport; the same exception
  applies to terrain exclusions. A homogeneous event summary is normalized as well. Ambiguous historical mixed-event summaries remain unchanged,
  while newly generated mixed events aggregate cadence and stroke rate separately.
- Summary-only native event JSON removes Diving-group terrain summaries when its `Activity Types` stat is present,
  while other summary semantics remain opt-in. Applications can call
  `normalizeActivityMetricSemanticsForStats(summary, contributingActivityTypes)` after hydration. This opt-in boundary
  canonicalizes unambiguous stroke-rate summaries and removes terrain summaries only for homogeneous Diving-group
  projections, keeping application persistence concerns outside Sports Lib while reusing its centralized sport-family
  policy.
- Pool-swim length JSON retains the `avgCadence` key for storage compatibility, but its in-memory value is
  `DataStrokeRate` and its unit is `spm`.

5) Power analytics (NP, power curve, FTP, IF, and capacity models)

```text
NormalizedPower (NP):
- Compute every complete rolling 30-second mean on the one-second power grid
- Raise each mean to the 4th power
NP = 4th_root(average(mean30s^4))

PowerCurve(duration d): max rolling mean power over window d
Estimated FTP stat = round(0.95 * best_20min_power)
IF = NP / independently supplied FTP
```

Normalized power retains recorded zeroes. Gaps, invalid/negative samples, nonconsecutive timestamps and explicit
start/stop timer boundaries restart the window; stopped samples do not contribute. FIT `stop_disable` and
`stop_disable_all` have the same stopped-state behavior as `stop` and `stop_all`. No interpolation, zero-fill or
carry-forward is applied to missing seconds. Sparse recordings without a complete window retain valid device NP on
normal import; a missing calculated NP remains unavailable instead of becoming NaN in serialized statistics.
The first complete 30-sample window contributes, and longer recordings contribute overlapping windows every second.

The legacy `FTP` statistic can still contain a same-activity 20-minute estimate. That estimate is not evidence of an
athlete threshold and cannot supply IF or power TSS. Only an explicit `functionalThresholdPower` override or original-file
calibration can do so. A restored `FTP` JSON stat is not promoted to calibration during recalculation. When IF is
calculated, the FTP stat reflects the calibration used even if an imported TSS is preserved.

`DataPowerCurve` preserves explicit zero `wattsPerKg` values through JSON restoration; missing W/kg stays absent.
Existing saved zeros are readable without reparsing. This keeps source statistics stable when consumers restore
activities for Training load validation; the structured curve remains outside the numeric event-metric catalog.

`samplePowerCurveAtDuration` samples exact points or interpolates in reciprocal-duration (`1/t`) space. Interpolation
requires neighboring durations within the default 1.25 ratio (configurable up to the hard maximum of 2), keeps the
strongest duplicate, and never extrapolates. `comparePowerCurveWindows` reports recent/reference retention percentage
and its percentage-point delta from 100 while normalizing each input curve only once.

Parsing does not infer `CriticalPower` or `WPrime` from one activity. The deprecated
`ActivityUtilities.calculateCriticalPowerAndWPrime` helper remains temporarily available as a low-level
Monod-Scherrer calculation for callers who deliberately supply a maximal test curve; its output is not evidence that an
arbitrary workout measured current athlete capacity. Existing `CriticalPower` and `WPrime` data classes and historical
JSON remain readable.

`Durability Evidence` is a compact, versioned activity stat. Running, cycling, standard mountain biking, and open-water
evidence compares output/heart-rate efficiency across fixed early and late time halves after warm-up/cool-down exclusion.
Enduro MTB and Downhill Cycling remain part of the mountain-biking activity family, but their whole-activity context is
not comparable through this steady aerobic protocol; they persist explicit `unsupported-context` evidence instead of a
durability result. Pool evidence compares the outer thirds of like-for-like active lengths using the dominant stroke and
pool length. Timelines and source streams are never stored in the stat; a deterministic protocol-input fingerprint
invalidates stale evidence, including earlier gravity-MTB evidence, and ineligible activities retain an explicit reason
and coverage instead of zero values. This policy remains protocol version 1 and does not change the persisted shape.

`Three Dimensional Strain Evidence` is a legacy, versioned activity stat retained only so historical native JSON remains
readable. FIT, TCX, GPX, and provider parsing no longer generates or regenerates it: one workout cannot establish a
current CP/W′/Pmax capacity model. Reprocessing an original source therefore retains its power evidence but produces no
new strain stat. Historic v1 and v2 records remain readable and excluded from event summaries.

### Rolling capacity estimation and scoring

For the literature provenance, complete equations, estimator gates, external-algorithm comparison, validation boundary,
and known limitations, read the
[three-dimensional power and training-response model guide](three-dimensional-training-model.md).

`buildPowerDurationEnvelope` accepts dated activity power curves and samples their maximum envelope at fixed
short-duration and CP/W′ anchors. `fitThreeDimensionalCapacityModel` then applies evidence, fit-quality, and
leave-one-anchor-out stability gates. The default contract requires at least three distinct activities spanning 14
days, sufficient 2–20-minute evidence, and sufficient 1–30-second evidence. It returns a complete model only for
`ready`; `partial` can expose a stable CP while withholding unstable W′ and dependent Pmax, or expose stable CP/W′
while withholding Pmax and the complete model.

Diagnostics distinguish usable input curves (`sourceCount`) from the distinct activities that actually supplied the
retained sustained and short-duration envelope points (`criticalPowerContributingSourceCount` and
`maximumPowerContributingSourceCount`). These contributor counts reveal when a component is concentrated in one
workout. Whole-source removal diagnostics also report how much CP and W′ change when each sustained-envelope
contributor is removed. These values do not impose an additional readiness threshold. Anchor and contributor coverage
is reported even when an earlier CP/W′ quality gate stops the fit.

The estimator also rejects the characteristic 1–3-second arithmetic-decay signature of one isolated power sample and
includes a 720-second point in newly generated default power curves. Rejected short points are reported separately
from malformed points.

Inputs must all belong to one exact canonical activity type. Activity groups are not a pooling boundary: `Cycling`,
`Indoor Cycling`, `Running`, rowing types, and every other power-bearing type maintain independent histories. Every
curve must also predate `effectiveDate`, so accidentally supplied future evidence returns `invalid-input` instead of
changing an older capacity snapshot.

The consuming application owns window selection and persistence. A practical policy is to fit each Monday from the
previous 42 completed UTC days, use that snapshot for workouts until the next Monday, and retain the input dates,
source IDs, source fingerprint, result, and diagnostics. Do not use a later snapshot to rescore an earlier workout as
though that capacity had been known at the time.

```ts
import {
  calculateThreeDimensionalStrain,
  fitThreeDimensionalCapacityModel,
  type DatedActivityPowerCurve,
  type ThreeDimensionalPowerSample
} from '@sports-alliance/sports-lib';

function scoreWorkout(
  history: readonly DatedActivityPowerCurve[],
  workoutPower: readonly ThreeDimensionalPowerSample[],
  snapshotEffectiveDate: string
) {
  const capacity = fitThreeDimensionalCapacityModel(history, {
    effectiveDate: snapshotEffectiveDate
  });
  if (capacity.status !== 'ready' || !capacity.model) {
    return { capacity, strain: null };
  }
  return {
    capacity,
    strain: calculateThreeDimensionalStrain(workoutPower, capacity.model)
  };
}
```

An activity's strain must be calculated with the ready snapshot effective on that activity's date. Aggregate only
ready workout results, keep the CP, W′, and Pmax components separate, and never substitute FTP, historic parser CP/W′,
another activity type, or a future model when capacity is unavailable.

Three-dimensional impulse-response utilities:

- `fitThreeParameterCriticalPowerModel` fits the Morton three-parameter power-duration model from a mean-max curve,
  returning CP, W′, Pmax, fit quality, and convergence state. It needs several distinct maximal-duration efforts; a
  mathematically successful fit is not proof those efforts represent current capacity.
- `calculateThreeDimensionalStrain` takes continuous power plus those externally chosen model parameters. It uses W′
  balance, maximum power available (MPA), and the CP/W′/Pmax power allocation to return total strain and the three
  components. It never fills missing power samples: insufficient coverage, missing power, and power above Pmax leave
  scores unavailable.
- The default MPA relation is the linear form in Equation 4 of Kontro et al., evaluated from the W′ state before the
  current sample. To reproduce the modified supporting-workbook Fig 4/5 calculation, use both the exponent-two option
  and `wPrimeBalanceTiming: 'after-sample'`; consumers must persist both choices. When observed power exceeds MPA, the
  strain calculation floors MPA at observed power so the strain coefficient remains at or below one.
- `calculateThreeDimensionalImpulseResponse` applies independent exponential fitness-fatigue responses to the three
  strain series using caller-supplied parameters.
### Calibration theory and limits

The [three-dimensional power and training-response model guide](three-dimensional-training-model.md) distinguishes the
published response model, the authors' illustrative R fitter, and Sports Lib's chronological validation contract.

`fitThreeDimensionalImpulseResponseParameters` calibrates three independent fitness-fatigue responses from
pre-aggregated, date-keyed CP, W′, and Pmax strain loads. The three outputs represent distinct energy-system-specific
responses; a strong CP fit does not validate W′ or Pmax. The model is a training-response model, not an FTP estimate
and not a source of generic fitness, fatigue, gains, or time constants.

Observations must be independent performance measurements from a stable, documented test protocol. Do not use a
power-curve self-fit, a device estimate, or another value derived from the same activities used to produce the strain
loads: that would let the model validate against its own input. Omitted dates within the supplied history are rest days
and are zero-filled, so do not omit a date to represent unknown or incomplete activity data. The latest observations for
each output are held out chronologically, so the fitter evaluates whether the learned response predicts later testing
instead of merely describing the history used to fit it.

The fitter returns `ready` only for outputs that pass this held-out quality gate. `partial`, `poor-fit`, and
`insufficient-evidence` do not supply predictive parameters for their unavailable outputs; `invalid-input` indicates
that the supplied data cannot be interpreted safely. It also withholds a model with no measurable training response,
time constants at the configured search boundary, or a nonpositive baseline or predicted daily performance. Defaults
are data-sufficiency, numerical-bound, physical-plausibility, and validation safeguards—not population parameters.

### Practical response-calibration recipe

Aggregate the three strain components from eligible activities of one canonical activity type into one
`ThreeDimensionalDailyStrainLoad` per calendar day. Include every date with an activity of that type; rest days may be
omitted because they are zero-filled. Record independent CP, W′, and Pmax test results on their actual date using the
same type-specific protocol. Do not represent an unparsed or unavailable activity as a rest day. The default policy
requires at least 16 observations per output, including 12 fitting observations, four latest held-out observations, and
a 56-day fitting span.

```ts
import {
  fitThreeDimensionalImpulseResponseParameters,
  type ThreeDimensionalDailyStrainLoad,
  type ThreeDimensionalPerformanceObservation
} from '@sports-alliance/sports-lib';

function calibrateFromRetainedHistory(
  dailyLoads: readonly ThreeDimensionalDailyStrainLoad[],
  observations: readonly ThreeDimensionalPerformanceObservation[]
) {
  // dailyLoads contains one summed strain record per activity date.
  // observations contains independently administered CP/W′/Pmax test results.
  const calibration = fitThreeDimensionalImpulseResponseParameters(dailyLoads, observations);
  return {
    calibration,
    criticalPowerParameters:
      calibration.criticalPower.status === 'ready' ? calibration.criticalPower.parameters : null
  };
}
```

Persist calibration data in the consuming application, not as a sports-lib storage contract: retain the raw daily
loads, independent observations, test-protocol and version metadata, result, and diagnostics. Retain all history from
the first test onward, inspect held-out error after every fit, and recalibrate when new independent test results arrive.
Persist a component's parameters as predictive parameters only when its individual status is `ready`; retain non-ready
results and diagnostics for audit. A top-level `partial` result may still contain valid parameters for one or two
components.

6) Training Stress Score (TSS) methods and priority

Priority order:

- Valid nonnegative imported TSS always wins, including zero.
  Imported scores skip unused calculations; running pace is evaluated only when Automatic needs that fallback.
- Walking, Nordic Walking, Hiking and Trekking: IMPORTED -> calibrated HR -> calorie-derived MET -> unavailable.
- Other eligible sports: IMPORTED -> POWER -> calibrated HR -> PACE/SWIM_PACE -> MET -> unavailable.

Walking-family activities never use calculated power or running pace. HR and MET preferences fall back through the
sport's eligible Automatic order. Known calculated scores are recomputed, and removed when no candidate is available;
they are never reinterpreted as imports. Unmarked legacy scores retain imported semantics. The legacy
`preserveImportedTss` option is deprecated: remove an imported stat explicitly for a calculation-only comparison.

`DataTrainingStressScore.getDisplayValue(1)` opts into one-decimal load-editor display. Calling it without arguments
retains the existing integer display; canonical values, JSON keys and numeric metric discovery are unchanged.

Motorized and Adaptive Mobility activities, and the Video Gaming activity type, do not receive library-calculated TSS,
even when calculation inputs or explicit overrides are available. A finite source-provided TSS remains available and is
labeled `IMPORTED`, including when `preserveImportedTss` is false. A legacy score without a method retains the existing
imported-score interpretation. Previously calculated TSS and its method are removed during summary generation for
these activities. Other Unspecified activities remain eligible for calculated TSS. Neither group nor Video Gaming has
a durability adapter. Existing canonical `Training Stress Score` and `Training Stress Score Method` tokens, numeric
units, JSON representation, and MCP metric discovery remain unchanged.

Walking, Indoor Walking, and Nordic Walking share `WalkingGroup` while preserving the existing walking pace/speed,
average pace/speed, vertical-speed, and default movement threshold. Only Indoor Walking has the indoor hint. Walking
has no grade-adjusted running derivation or durability adapter. Obstacle Racing and Ultra Running use Running's
existing grade-adjusted metrics, TSS selection, and durability protocol, with its usual eligibility checks. Enduro MTB
continues to emit unsupported-context gravity-MTB durability evidence and keeps its existing TSS eligibility. Rally
inherits the Motorized calculated-TSS exclusion and imported-score policy above. These classifications add no metric
token, unit, formula, or durability protocol; see [Import activities](importing-activities.md) for source and adoption requirements.

POWER TSS:

```text
IF = NP / FTP
TSS = 100 * (durationWithoutPauses / 3600) * IF^2
```

Power uses the full eligible duration, without subtracting the NP window warm-up. One hour with NP equal to FTP is
100 TSS. FIT FTP comes from explicit session `threshold_power`, uniquely matched session `time_in_zone` FTP, or
unambiguous `zones_target` FTP. Conflicting same-session values, duplicate session references and invalid scoped values
are rejected. Valid scoped FTP takes precedence over unrelated global settings, including conflicting sport defaults.
Global FTP must be valid and unambiguous when no scoped FTP exists.
Source provenance stays private on the parsed instance, survives clearing/regenerating its statistics, and is not
serialized into ordinary Activity JSON. Missing calibration reports `missing-power-inputs` and falls through to eligible
HR, pace or MET candidates; no threshold is inferred from the ride or its intensity factor.

Complete eligible recorded zero-power windows can establish NP 0 and POWER TSS 0 with valid independent FTP and
duration. A zero NP summary alone cannot establish this: missing, gappy, short or paused-only recordings still need
an eligible window. Zeros inserted for missing sensor fields by FIT, TCX or GPX importers are not recorded evidence.
All computed NP paths use actual recorded power coverage, including when positive readings occur among missing
fields. A single positive reading cannot create a complete window by padding the rest with zeros. If no complete
recorded window remains, power is unavailable and the normal eligible fallback applies. Genuine recorded coasting
zeros remain valid. FIT records at the same absolute timestamp are combined before padding: an HR-only record cannot
erase power from a complementary record. The last explicitly supplied value for each field wins, including zero and
invalid values; distinct timestamps remain separate. This private evidence survives regeneration on the
parsed instance and does not add fields to Activity JSON. Positive device NP keeps its existing precedence;
imported TSS, including zero, remains authoritative.
Explicit TSS reevaluation refreshes library-calculated NP and intensity factor from the current streams and timer
events. It preserves genuine device NP and an explicitly replaced NP statistic. The cached evaluation getter remains
unchanged; calculation provenance is private and is not serialized.

When a FIT session has a missing or zero timer summary, unambiguous recorded timer intervals can supply its active
duration instead of treating all elapsed time as active. Explicit all-paused timing retains zero active duration.
Valid independent timer summaries retain priority; conflicting or insufficient event evidence is not guessed.
The same recovery applies to sessionless FIT files: synthesized elapsed time is not treated as a recorded timer
summary. Only complete, contiguous lap timer coverage can supply a synthesized timer before recorded-event recovery.

HR TSS:

Continuous, threshold-normalized Banister TRIMP requires explicit `0 < resting HR < threshold HR < maximum HR`.
One hour at threshold is 100. There is no observed-peak maximum, assumed threshold ratio, or weighted-zone fallback.

HR integration uses a timer-active clock: explicit start/stop events remove paused time, including gaps spanning a
pause. HR readings inside a pause are excluded; a reading exactly at a stop may close the preceding active interval.
FIT `stop`, `stop_all`, `stop_disable` and `stop_disable_all` are supported. Forty active minutes at threshold plus
a twenty-minute pause produce 66.7 TSS, whether recording continues during the pause or resumes afterward. This applies
to HR calculations for every eligible sport. If every HR reading is inside a pause, HR is unavailable and the normal
fallback order applies. Imported scores remain authoritative.
HR also requires a positive-duration interval between usable observations. The first observation starts coverage;
it does not supply HR for the preceding portion of the workout. Explicit invalid/zero HR readings break integration,
and compatibility display backfill cannot extend the observed bounds. A single isolated reading is therefore unavailable
and allows the normal fallback, while fully observed resting-HR intervals can legitimately score zero. Ordinary interior
smart-recording gaps retain their existing treatment; no arbitrary sample-gap cutoff is introduced.

Suunto JSON and SML imports retain explicit boolean `Pause.State` pause/resume events, including events alongside
other entries in the same sample. Events use the activity's relative clock, and an explicitly paused state can span
a sport change. These positions control sample eligibility without replacing valid aggregate duration statistics.
Valid Suunto duration/pause summaries that prove zero active time also prevent elapsed-time TSS fallback, even without
individual pause events. Activity, lap, stop and altitude events are selected by kind regardless of their array position;
conflicting activity types within one sample retain an unknown-sport boundary instead of selecting one arbitrarily.
Multisport zone durations come only from each activity window. Shared header thresholds remain usable, but whole-workout
zone durations are used only for a single activity and are never distributed across legs.

Without explicit timer events, HR retains elapsed-time integration. Ordinary recording gaps and aggregate timer/moving
duration alone do not identify pause positions; they are not converted into guessed pauses or proportional rescaling.

FIT calibration comes from a uniquely referenced session `time_in_zone`, then unambiguous `zones_target` and applicable
profile fields. Cycling, MTB, downhill and enduro use the biking-specific profile maximum, falling back to the
general setting when absent. Walking uses the general profile maximum, never its running maximum. Ambiguous session
references, conflicting selected settings and inconsistent calibration are rejected. Existing explicit physiological overrides remain
supported; absent settings cannot be inferred from activity samples or zone boundaries.

A uniquely matched session supplies the authoritative calibration for its leg. Lower-priority global/profile fields
are read only to fill missing values, so unrelated sport defaults cannot invalidate a complete session calibration.
Any field needed from a lower-priority source must still be valid and unambiguous, and the completed HR tuple must
satisfy the ordering above. An invalid explicit session value is never replaced with a global default.

For a session using percent-maximum-HR zones, an explicit threshold below the lowest boundary of a valid, strictly
increasing zone set bounded by the calibrated maximum is rejected as `invalid-hr-calibration`. This is a consistency
check only: no zone weights, inferred threshold ratios, or replacement physiological values are introduced. Custom
zone sets do not imply this relationship. Valid independent candidates can still supply TSS, and imported scores always
retain priority.

For percent-heart-rate-reserve (`percent_hrr`) zones, a narrower consistency check applies only when one uniquely
matched session `time_in_zone` record explicitly supplies all three valid HR calibration values and exactly six
positive, strictly increasing boundaries. Every boundary must exactly equal
`round(restingHR + fraction * (maximumHR - restingHR))` for fractions `0.5, 0.6, 0.7, 0.8, 0.9, 1.0`.
If its threshold is strictly below the first boundary, HR is unavailable with `invalid-hr-calibration`, and Automatic
or preferred HR uses the existing sport-eligible fallback order. The MET fallback remains explicitly estimated;
without an eligible fallback the result is unavailable, not zero. Imported TSS, including zero, remains authoritative.

This is a conservative safeguard for questionable file calibration, not a universal physiological threshold minimum
or a measurement of the athlete's true threshold. Different modes, customized/incomplete patterns, and calibration
assembled from global/profile defaults do not trigger this HRR check. No boundary is rounded into a match, no missing
threshold is inferred, and no score is capped or replaced with an assumed physiological value. Complete explicit
physiological overrides retain their existing precedence. Recorded samples and calibration fields are not rewritten.
Existing persisted scores require an original-file reparse to apply the check, followed by refreshed derived Training
summaries. Ordinary JSON restoration cannot recover this private calibration evidence. Canonical metric tokens, units,
JSON schemas, evaluation fields and reason codes remain unchanged, so existing QS/MCP projections need no additional
fields, permissions or private calibration exposure.

PACE TSS (running/trail groups):

- Uses Minetti running-cost grade adjustment, then NP-like complete rolling 30-second/4th-power normalization.
- Uphill increases equivalent flat speed; moderate downhill lowers it, while steep downhill follows the model's
  increasing braking cost within the existing grade limits.
- Recorded zero speed remains valid. Invalid readings, recording gaps and explicit timer boundaries reset the window;
  paused readings and incomplete windows contribute no normalized-speed window. Without a complete window, pace is
  unavailable and the existing eligible fallback order applies. An all-zero complete window can produce valid zero TSS.
- The full eligible active duration supplies the duration factor; it is not the timestamp of the last positive-speed
  reading. Explicit timer events identify pauses; aggregate duration does not invent the location of a recording gap.

```text
Cost(g) = 155.4*g^5 - 30.4*g^4 - 43.3*g^3 + 46.3*g^2 + 19.5*g + 3.6
AdjustedSpeed = Speed * (Cost(g) / 3.6)
IF = NormalizedAdjustedSpeed / ThresholdSpeed
TSS = 100 * (durationWithoutPauses/3600) * IF^2
```

The cost ratio follows the equal-energy relation `Cost(g) * Speed = Cost(0) * AdjustedSpeed` from the
[Minetti running-cost model](https://journals.physiology.org/doi/full/10.1152/japplphysiol.01177.2001).
Forty active minutes at threshold pace with a twenty-minute explicit pause produce 66.7 TSS.

SWIM_PACE TSS:

Swimming requires an independent threshold from `thresholdSwimSpeed`, the compatible `refSwimSpeed` override, or the
existing swim-pace/speed zone threshold. The activity's observed average speed is never its own threshold, including
when `enableHeuristicFallbacks` is true. Without a threshold, swim pace is skipped and the evaluation reports
`missing-swim-threshold`; eligible HR/MET candidates can still provide a score. A supplied threshold with missing speed
or duration instead reports `missing-pace-inputs`. Imported scores, including zero, always retain priority.

Suunto header speed zones are shared only within a file containing one resolved sport type. Mixed-sport legs retain
applicable local boundaries and durations without copying unscoped header boundaries; a running threshold cannot serve
as a swim threshold. This scope also survives native JSON restoration. Existing affected Suunto imports require an
original-file reparse; no change to the pace formulas or generic fallback order is involved.

```text
IF = SwimSpeed / ThresholdSwimSpeed
TSS = 100 * (duration/3600) * IF^3
```

This correction does not change the existing duration or speed resolvers. Pool timer time can include rests, and length
records can be inconsistent; consumers supplying a threshold must ensure speed and duration represent the intended
swimming interval. The shared duration resolver and calorie-derived MET formula remain unchanged.

FIT pool-length generation preserves a valid recorded HR stream instead of replacing it with lap/length averages.
When valid recorded HR exists, explicit zero/invalid readings are retained as integration boundaries alongside it;
load cannot bridge those dropouts. Recorded gaps remain gaps through stream/statistic regeneration on the parsed activity instance; this private source
evidence is not serialized into Activity JSON. Length/lap HR is used only when valid recorded HR is
wholly absent. A single length-bearing lap can supply generated streams, while its existing recorded streams retain
priority. Pool summary end times that are missing or do not follow their start can be repaired from valid positive
file durations before assigning lengths, retaining same-session recorded samples within the next session and duration
bounds. Unambiguous start-time windows and compatible explicit length indexes keep
boundary lengths in their session/lap, including final rests; conflicting ownership is not guessed. Generated distance
is allocated to active lengths only, and idle lengths add no distance or speed. An incomplete/ambiguous length
assignment cannot establish a complete generated distance total. If lap timing leaves positive recorded lap distance
without an assigned active length, use the recorded distance stream when available instead of a partial generated total.
When earlier active laps omit distance and the final active lap carries the complete pool-length total, that final
value must not be added to the preceding lengths again. Recovery requires complete, uniquely owned active lengths:
prefer a monotonic recorded counter covering the full swim and agreeing with that geometry; otherwise generate from
the geometry only when the session total independently agrees. Partial, reset, late, or invalid counters cannot
establish complete recorded coverage. Consistent per-lap distance handling remains unchanged. Reparse affected originals
and regenerate derived summaries to replace previously inflated distance streams.
FIT `pool_length` is stored in meters regardless of its display-unit flag. A bounded compatibility correction remains
for Suunto statute exports only when independent recorded length/lap evidence consistently supports the yards conversion
and does not support the native meter value. Recorded total distance remains authoritative.

Length-based FIT imports retain session-owned recorded `Power` for both single- and multi-lap activities. Only finite,
nonnegative observations are retained, including recorded zeros; missing/invalid readings remain gaps instead of
being padded at other sensors' timestamps. Those gaps survive Activity JSON and regeneration. Power samples cannot
extend length-derived distance or other filled swim streams into rests or missing length intervals. Recorded power
can supply existing power summaries and calculations; NP still requires complete recorded windows and respects timer
stops, and power TSS still requires independent FTP. No swimming-specific eligibility or threshold is inferred.
Valid imported TSS and device-supplied summaries keep their existing precedence. Reparse original files to recover
previously omitted power, then regenerate consuming summaries as appropriate. Existing metric tokens, units, public
APIs and JSON structure remain compatible; an old saved JSON cannot recover omitted observations on its own.

FIT multisport imports retain a stopped initial timer state from before a leg when its session timer duration
unambiguously supports that state. This prevents paused HR/power from counting as active load across a sport change.
Conflicting/missing duration evidence does not invent a pause; a full-duration session can retain an implicit restart
when a device omits the corresponding start event.

Adjacent FIT sessions do not share the next leg's first recorded sample. A terminal record remains eligible for a
standalone or final session. This prevents heart rate and reset distance counters from leaking into the preceding
leg. Session `time_in_zone` durations match the session's FIT message index rather than its position in an array;
ambiguous references are rejected instead of assigning another leg's zone totals.
Complete, unique session-to-lap references likewise preserve lap ownership when session summaries appear out of order.
When explicit lap indexes are absent, unambiguous timing can retain ownership; conflicting explicit references do not
fall back to the parser's order-dependent cascade.

MET TSS:

```text
METScore = (3600 * Energy) / (Weight * Duration)
IF = METScore / ThresholdMET
TSS = 100 * (duration/3600) * IF^2
```

The default MET reference is 10. File calories, body mass and duration must be positive and finite; no default mass,
resting-calorie adjustment or sport MET table is supplied. This is explicitly an estimate: 210 kcal / (70 kg × 1 hour)
is MET 3 and 9 TSS. STT's compatible calorie-to-MET conversion does not imply its different linear scoring formula.

`ActivityUtilities.getTrainingStressScoreEvaluations(activity)` returns the cached parse-time Automatic/HR/MET results
with actual method, score (null when unavailable), provenance, estimate flag and stable fallback reason codes.
Missing or unusable required inputs retain their method-specific missing-input reasons. When an eligible calculation
receives its inputs but cannot return a valid result (including the existing calculated-score range guard), it reports
`calculation-unavailable` instead. This distinction changes diagnostics only: formulas, score limits, valid zero, imported
priority and fallback order remain unchanged. Reevaluation needs the parsed inputs; refresh saved evaluation metadata
through the consumer’s source-file lifecycle when those inputs are no longer available.
`evaluateTrainingStressScore(activity)` explicitly recomputes all candidates from the current inputs. Capture the cached
results before replacing the parsed activity object; the compact evaluations and raw calibration are intentionally absent
from ordinary Activity JSON and DataStore. Historical persisted calculated scores need an original-file reparse to gain
corrected eligibility and evaluation metadata; ordinary JSON restoration does not silently rewrite them.
Reparse original files to apply corrected running grade, zero-speed, window and pause handling, preserve recorded pool
HR, and recover unambiguous multisport initial timer states. Original-file reparse also applies FIT boundary ownership,
session zone matching, timer-summary fallback, Suunto pause events and recorded positive-power coverage.
It also applies Suunto event-kind selection, proven zero active duration and correctly scoped multisport zone durations.
Apply an original-file reparse for corrected HR observation coverage, FIT pool units, reordered lap ownership and
sessionless timer recovery. Explicit evaluation or activity regeneration refreshes calculated NP on an already parsed
instance; it cannot recover missing file calibration from restored JSON. Original-file reparse also applies scoped
calibration precedence, complementary FIT record merging, pool HR dropout boundaries, and whole-lap TCX track bounds.
TCX elapsed time spans all tracks from the explicit lap start (or earliest valid point when unavailable). A stated
start overlapping the previous lap is rejected when all of this lap’s points follow that previous lap, avoiding double
counting from inconsistent timer-clock start attributes. In either case,
`TotalTimeSeconds` remains the active duration and the minimum elapsed duration. A gap between tracks does not
contribute moving time. These bounds retain delayed first samples and do not depend on track ordering.
Reparse also applies explicit HR-pause exclusion,
independent-FTP eligibility, rolling NP, full-duration power TSS, cycling maximum-HR selection, HR calibration consistency
and independent swimming-threshold requirements to historical workouts,
then refresh consuming applications' derived Training summaries. No canonical metric token, unit, or Activity JSON
schema changes are required. Consumers displaying reason codes should handle the additive `missing-swim-threshold` code.

7) SWOLF, moving time fallback, power work, battery, jumps

```text
SWOLF(poolLength) = round((secondsPerMeter + strokesPerMeter) * poolLength, 1)
where:
  secondsPerMeter = (secondsPer100m / 100)
  strokesPerMeter = ((strokesPerMinute * (secondsPer100m / 60)) / 100)

PowerWork(kJ) = round((AveragePower * MovingTimeSeconds) / 1000)
BatteryConsumption = max(BatteryCharge) - min(BatteryCharge)
BatteryLifeEstimation = ((activityDurationSeconds * 100) / BatteryConsumption)
```

SWOLF uses `Average Stroke Rate`; the naming change does not alter the calculation.

- Moving time fallback order: lap moving time -> speed-threshold integration -> timer time fallback.
- Jump families (height, distance, speed, rotations, score, hang time) compute min/max/avg from jump events when available.

8) Event-level aggregation behavior

- Single-activity event: copies activity stats directly to event stats.
- Multi-activity event:
  - Sums duration, pause, distance, ascent, descent, energy.
  - Aggregates zone durations by summation.
  - Averages many average-like stats using iterative pairwise averaging.
  - Keeps cadence and stroke-rate min/avg/max families separate.
  - Copies a positive `Recovery Time` from the chronologically final activity. Recovery is a post-activity estimate,
    so it is not summed, averaged, maximized, or promoted from an earlier activity when the final activity omits it.
  - Aggregates power curves by duration-wise maxima (power and W/kg) without inferring event-level CP/W′.

Full Metric Catalog (Appendix)
---
<details>
<summary>Exhaustive canonical metric catalog (canonical Data*.type strings)</summary>

Generated from modules re-exported by `src/data/index.ts`, then resolved to each module's concrete `static type` declarations.

#### Core & Context Types
- ` Steps` (leading space intentionally preserved; legacy alias)
- `Absolute Pressure` (unit: `hpa`)
- `Accumulated Power` (unit: `watts`)
- `Active Lap`
- `Active Lengths`
- `Activity Types`
- `Aerobic Training Effect`
- `Age` (unit: `years`)
- `Air Power` (unit: `watt`)
- `Alti Baro Profile`
- `Altitude` (unit: `m`)
- `Altitude (Stryd)`
- `Altitude GPS` (unit: `m`)
- `Altitude Smooth`
- `Anaerobic Training Effect`
- `Ascent`
- `Ascent Time`
- `Auto Lap`
- `Auto Lap Distance` (unit: `m`)
- `Auto Lap Duration`
- `Auto Pause`
- `Battery Charge` (unit: `%`)
- `Battery Consumption` (unit: `%`)
- `Battery Current` (unit: `mA`)
- `Battery Life Est.`
- `Battery Voltage` (unit: `V`)
- `Beginning Potential Stamina` (unit: `%`)
- `Bike Pod`
- `Cadence` (unit: `rpm`)
- `Contact Time to Flight Time Ratio` (unit: `%`)
- `CriticalPower`
- `Cycling Avg Seated Power` (unit: `watt`)
- `Cycling Avg Standing Power` (unit: `watt`)
- `Cycling Max Seated Power` (unit: `watt`)
- `Cycling Max Standing Power` (unit: `watt`)
- `Cycling Seated Time` (unit: `s`)
- `Cycling Standing Time` (unit: `s`)
- `Depth` (unit: `m`)
- `Depth in feet` (unit: `ft`)
- `Descent`
- `Descent Time`
- `Description`
- `Device Location`
- `Device Names`
- `Distance` (unit: `m`)
- `Distance (Stryd)`
- `Durability Evidence`
- `FIT Training File References` (nonnumeric, explicit metadata reader only)
- `FIT Workout Definitions` (nonnumeric, explicit metadata reader only)
- `SuuntoPlus Guide References` (nonnumeric, explicit metadata reader only)
- `Duration` (unit: `s`)
- `Elapsed time` (unit: `s`)
- `Effort Pace`
- `EHPE`
- `Enabled Navigation Systems`
- `End Altitude`
- `End Position`
- `Ending Potential Stamina` (unit: `%`)
- `Energy` (unit: `KCal`)
- `EPOC` (unit: `ml/kg`)
- `Est Sweat Loss` (unit: `ml`)
- `EVPE`
- `Feeling`
- `Fitness Age` (unit: `years`)
- `Flow`
- `Foot Pod`
- `Form Power`
- `FTP`
- `Fused Altitude`
- `Fused Location`
- `Gender`
- `GNSS Distance`
- `Grade`
- `Grade Adjusted Pace` (unit: `min/km`)
- `Grade Adjusted Speed`
- `Grade Smooth`
- `Grit`
- `Ground Contact Time` (unit: `ms`)
- `Ground Contact Time Balance Left`
- `Ground Contact Time Balance Right`
- `Ground Contact Time Percentage` (unit: `%`)
- `Ground Time` (unit: `ms`)
- `Heart Rate` (unit: `bpm`)
- `Heart Rate Used`
- `Height` (unit: `m`)
- `IBI` (unit: `ms`)
- `Intensity`
- `Impact Loading Rate Balance Left`
- `Impact Loading Rate Balance Right`
- `Jump Count`
- `Jump Distance`
- `Jump Event`
- `Jump Score`
- `Latitude` (unit: `degrees`)
- `Left Pedal Smoothness` (unit: `%`)
- `Left Torque Effectiveness` (unit: `%`)
- `Leg Spring Stiffness` (unit: `"KN/m"`)
- `Leg Spring Stiffness Balance Left`
- `Leg Spring Stiffness Balance Right`
- `Leg Stiffness` (unit: `"KN/m"`)
- `Longitude` (unit: `degrees`)
- `Metabolic Calories` (unit: `kcal`)
- `Moving time`
- `Number of Samples`
- `Number of Satellites`
- `Pace` (unit: `min/km`)
- `Pause Time`
- `Peak EPOC`
- `Peak Training Effect`
- `Pool Length` (unit: `m`)
- `Position`
- `Power` (unit: `watt`)
- `Power Balance Left`
- `Power Balance Right`
- `Power Down Event`
- `Power Intensity Factor`
- `Power Left`
- `Power Normalized`
- `Power Pedal Smoothness Left`
- `Power Pedal Smoothness Right`
- `Power Pod`
- `Power Right`
- `Power Torque Effectiveness Left`
- `Power Torque Effectiveness Right`
- `Power Up Event`
- `Power Work` (unit: `kJ`)
- `PowerCurve`
- `PowerWattsPerKg`
- `Potential Stamina` (unit: `%`)
- `Primary Benefit`
- `Rated Perceived Exertion`
- `Recovery Time`
- `Resting Calories` (unit: `kcal`)
- `Rider Position Change Event`
- `Right Pedal Smoothness` (unit: `%`)
- `Right Torque Effectiveness` (unit: `%`)
- `Rotations`
- `Running Flight Time` (unit: `ms`)
- `Satellite 5 Best SNR`
- `Sea Level Pressure` (unit: `hpa`)
- `Speed` (unit: `m/s`)
- `Speed (Stryd)`
- `Sport Profile Name`
- `Stamina` (unit: `%`)
- `Stance Time` (deprecated historical compatibility token; unit: `ms`)
- `Stance Time Balance Left` (deprecated historical compatibility token)
- `Stance Time Balance Right` (deprecated historical compatibility token)
- `Start Event`
- `Start Position`
- `Starting Altitude`
- `Step Length`
- `Steps` (unit: `count`)
- `Stop ALL Event`
- `Stop Event`
- `Stroke Rate` (unit: `spm`)
- `Swim Pace` (unit: `min/100m`)
- `Temperature` (unit: `°C`)
- `Time`
- `Timer time`
- `Three Dimensional Strain Evidence`
- `Total Cycles`
- `Total Flow`
- `Total Grit`
- `Training Load Peak`
- `Training Stress Score`
- `Training Stress Score Method`
- `Vertical Oscillation` (unit: `mm`)
- `Vertical Oscillation Balance Left`
- `Vertical Oscillation Balance Right`
- `Vertical Ratio` (unit: `%`)
- `Vertical Speed` (unit: `m/s`)
- `VO2 Max` (unit: `ml/kg/min`)
- `Weight` (unit: `kg`)
- `WPrime`

#### Health & Sleep Types
- `Active Duration` (unit: `s`)
- `Active Energy` (unit: `kcal`)
- `Average Sleep Heart Rate` (unit: `bpm`)
- `Average Sleep HRV` (unit: `ms`)
- `Average Sleep Respiration Rate` (unit: `br/min`)
- `Awake Sleep Duration` (unit: `s`)
- `Basal Energy` (unit: `kcal`)
- `Blood Oxygen Saturation` (unit: `%`)
- `Body Energy` (unit: `%`)
- `Body Energy Change` (unit: `%`)
- `Body Fat` (unit: `%`)
- `Body Mass Index` (unit: `kg/m²`)
- `Body Water` (unit: `%`)
- `Bone Mass` (unit: `kg`)
- `Deep Sleep Duration` (unit: `s`)
- `Diastolic Blood Pressure` (unit: `mmHg`)
- `Floors Climbed` (unit: `count`)
- `Heart Rate Variability` (unit: `ms`)
- `Light Sleep Duration` (unit: `s`)
- `Maximum Sleep Blood Oxygen Saturation` (unit: `%`)
- `Minimum Sleep Heart Rate` (unit: `bpm`)
- `Moderate Intensity Duration` (unit: `s`)
- `Muscle Mass` (unit: `kg`)
- `Overnight HRV` (unit: `ms`)
- `Pulse Rate` (unit: `bpm`)
- `Recovery Score` (unit: `score`)
- `REM Sleep Duration` (unit: `s`)
- `Respiration Rate` (unit: `br/min`)
- `Resting Heart Rate` (unit: `bpm`)
- `Skin Temperature Deviation` (unit: `°C`)
- `Sleep Duration` (unit: `s`)
- `Sleep HRV Sample Count` (unit: `count`)
- `Sleep In-Bed Duration` (unit: `s`)
- `Sleep Resting Heart Rate` (unit: `bpm`)
- `Sleep Score` (unit: `score`)
- `Stress Duration` (unit: `s`)
- `Stress Level` (unit: `score`)
- `Stress State` (unit: `category`)
- `Systolic Blood Pressure` (unit: `mmHg`)
- `Total Energy` (unit: `kcal`)
- `Unknown Sleep Duration` (unit: `s`)
- `Unmeasurable Sleep Duration` (unit: `s`)
- `Vigorous Intensity Duration` (unit: `s`)
- `Wheelchair Push Distance` (unit: `m`)
- `Wheelchair Pushes` (unit: `count`)

#### Zone & Target Types
- `Distance Target`
- `Heart Rate Zone Five Duration`
- `Heart Rate Zone Four Duration`
- `Heart Rate Zone One Duration`
- `Heart Rate Zone Seven Duration`
- `Heart Rate Zone Six Duration`
- `Heart Rate Zone Target`
- `Heart Rate Zone Three Duration`
- `Heart Rate Zone Two Duration`
- `Power Zone Five Duration`
- `Power Zone Four Duration`
- `Power Zone One Duration`
- `Power Zone Seven Duration`
- `Power Zone Six Duration`
- `Power Zone Target`
- `Power Zone Three Duration`
- `Power Zone Two Duration`
- `Speed Zone Five Duration`
- `Speed Zone Four Duration`
- `Speed Zone One Duration`
- `Speed Zone Seven Duration`
- `Speed Zone Six Duration`
- `Speed Zone Target`
- `Speed Zone Three Duration`
- `Speed Zone Two Duration`
- `Time Target`

#### Minimum/Maximum/Average Families
- `Average Absolute Pressure`
- `Average Air Power`
- `Average Altitude`
- `Average Cadence`
- `Average Contact Time to Flight Time Ratio` (unit: `%`)
- `Average Effort Pace`
- `Average Effort Pace in minutes per mile`
- `Average EHPE`
- `Average EVPE`
- `Average Flow`
- `Average Grade Adjusted Pace`
- `Average Grade Adjusted Pace in minutes per mile` (unit: `min/m`)
- `Average Grade Adjusted Speed`
- `Average Grade Adjusted Speed in feet per minute`
- `Average Grade Adjusted Speed in feet per second`
- `Average Grade Adjusted Speed in kilometers per hour`
- `Average Grade Adjusted Speed in knots`
- `Average Grade Adjusted Speed in meters per minute`
- `Average Grade Adjusted Speed in miles per hour`
- `Average Grit`
- `Average Ground Contact Time` (unit: `ms`)
- `Average Ground Contact Time Percentage` (unit: `%`)
- `Average Heart Rate`
- `Average Jump Distance`
- `Average Jump Hang Time`
- `Average Jump Height` (unit: `m`)
- `Average Jump Rotations`
- `Average Jump Score`
- `Average Jump Speed`
- `Average jump speed in feet per minute`
- `Average jump speed in feet per second`
- `Average jump speed in kilometers per hour`
- `Average jump speed in knots`
- `Average jump speed in meters per minute`
- `Average jump speed in miles per hour`
- `Average Number of Satellites`
- `Average Pace`
- `Average pace in minutes per mile`
- `Average Power`
- `Average Potential Stamina` (unit: `%`)
- `Average Respiration Rate` (unit: `br/min`)
- `Average Running Flight Time` (unit: `ms`)
- `Average Satellite 5 Best SNR`
- `Average Speed`
- `Average Stamina` (unit: `%`)
- `Average speed in feet per minute`
- `Average speed in feet per second`
- `Average speed in kilometers per hour`
- `Average speed in knots`
- `Average speed in meters per minute`
- `Average speed in miles per hour`
- `Average Stride Length`
- `Average Stroke Count`
- `Average Stroke Distance`
- `Average Stroke Rate` (unit: `spm`)
- `Average Swim Pace`
- `Average swim pace in minutes per 100 yard`
- `Average SWOLF 25m`
- `Average SWOLF 50m`
- `Average Temperature`
- `Average VAM` (unit: `m/h`; FIT `avg_vam` source values in `m/s` are converted to this public unit)
- `Average Vertical Oscillation` (unit: `mm`)
- `Average Vertical Speed`
- `Average vertical speed in feet per hour`
- `Average vertical speed in feet per minute`
- `Average vertical speed in feet per second`
- `Average vertical speed in kilometers per hour`
- `Average vertical speed in meters per hour`
- `Average vertical speed in meters per minute`
- `Average vertical speed in miles per hour`
- `Maximum Absolute Pressure`
- `Maximum Air Power`
- `Maximum Altitude`
- `Maximum Cadence`
- `Maximum Contact Time to Flight Time Ratio` (unit: `%`)
- `Maximum Depth` (unit: `m`)
- `Maximum Depth in feet` (unit: `ft`)
- `Maximum Effort Pace`
- `Maximum Effort Pace in minutes per mile`
- `Maximum EHPE`
- `Maximum EVPE`
- `Maximum Grade Adjusted Pace`
- `Maximum Grade Adjusted Pace in minutes per mile` (unit: `min/m`)
- `Maximum Grade Adjusted Speed`
- `Maximum Grade Adjusted Speed in feet per minute`
- `Maximum Grade Adjusted Speed in feet per second`
- `Maximum Grade Adjusted Speed in kilometers per hour`
- `Maximum Grade Adjusted Speed in knots`
- `Maximum Grade Adjusted Speed in meters per minute`
- `Maximum Grade Adjusted Speed in miles per hour`
- `Maximum Ground Contact Time` (unit: `ms`)
- `Maximum Ground Contact Time Percentage` (unit: `%`)
- `Maximum Heart Rate`
- `Maximum HR Setting` (unit: `bpm`)
- `Maximum Jump Distance`
- `Maximum Jump Hang Time`
- `Maximum Jump Height` (unit: `m`)
- `Maximum Jump Rotations`
- `Maximum Jump Score`
- `Maximum Jump Speed`
- `Maximum jump speed in feet per minute`
- `Maximum jump speed in feet per second`
- `Maximum jump speed in kilometers per hour`
- `Maximum jump speed in knots`
- `Maximum jump speed in meters per minute`
- `Maximum jump speed in miles per hour`
- `Maximum Number of Satellites`
- `Maximum Pace`
- `Maximum pace in minutes per mile`
- `Maximum Power`
- `Maximum Potential Stamina` (unit: `%`)
- `Maximum Respiration Rate` (unit: `br/min`)
- `Maximum Running Flight Time` (unit: `ms`)
- `Maximum Satellite 5 Best SNR`
- `Maximum Speed`
- `Maximum Stamina` (unit: `%`)
- `Maximum speed in feet per minute`
- `Maximum speed in feet per second`
- `Maximum speed in kilometers per hour`
- `Maximum speed in knots`
- `Maximum speed in meters per minute`
- `Maximum speed in miles per hour`
- `Maximum Stroke Rate` (unit: `spm`)
- `Maximum Swim Pace`
- `Maximum swim pace in minutes per 100 yard`
- `Maximum Temperature`
- `Maximum Vertical Oscillation` (unit: `mm`)
- `Maximum Vertical Speed`
- `Maximum vertical speed in feet per hour`
- `Maximum vertical speed in feet per minute`
- `Maximum vertical speed in feet per second`
- `Maximum vertical speed in kilometers per hour`
- `Maximum vertical speed in meters per hour`
- `Maximum vertical speed in meters per minute`
- `Maximum vertical speed in miles per hour`
- `Minimum Absolute Pressure`
- `Minimum Air Power`
- `Minimum Altitude`
- `Minimum Cadence`
- `Minimum Contact Time to Flight Time Ratio` (unit: `%`)
- `Minimum Effort Pace`
- `Minimum Effort Pace in minutes per mile`
- `Minimum EHPE`
- `Minimum EVPE`
- `Minimum Grade Adjusted Pace`
- `Minimum Grade Adjusted pace in minutes per mile` (unit: `min/m`)
- `Minimum Grade Adjusted Speed`
- `Minimum Grade Adjusted Speed in feet per minute`
- `Minimum Grade Adjusted Speed in feet per second`
- `Minimum Grade Adjusted Speed in kilometers per hour`
- `Minimum Grade Adjusted Speed in knots`
- `Minimum Grade Adjusted Speed in meters per minute`
- `Minimum Grade Adjusted Speed in miles per hour`
- `Minimum Ground Contact Time` (unit: `ms`)
- `Minimum Ground Contact Time Percentage` (unit: `%`)
- `Minimum Heart Rate`
- `Minimum Jump Distance`
- `Minimum Jump Hang Time`
- `Minimum Jump Height` (unit: `m`)
- `Minimum Jump Rotations`
- `Minimum Jump Score`
- `Minimum Jump Speed`
- `Minimum jump speed in feet per minute`
- `Minimum jump speed in feet per second`
- `Minimum jump speed in kilometers per hour`
- `Minimum jump speed in knots`
- `Minimum jump speed in meters per minute`
- `Minimum jump speed in miles per hour`
- `Minimum Number of Satellites`
- `Minimum Pace`
- `Minimum pace in minutes per mile`
- `Minimum Power`
- `Minimum Potential Stamina` (unit: `%`)
- `Minimum Respiration Rate` (unit: `br/min`)
- `Minimum Running Flight Time` (unit: `ms`)
- `Minimum Satellite 5 Best SNR`
- `Minimum Speed`
- `Minimum Stamina` (unit: `%`)
- `Minimum speed in feet per minute`
- `Minimum speed in feet per second`
- `Minimum speed in kilometers per hour`
- `Minimum speed in knot`
- `Minimum speed in meters per minute`
- `Minimum speed in miles per hour`
- `Minimum Stroke Rate` (unit: `spm`)
- `Minimum Swim Pace`
- `Minimum swim pace in minutes per 100 yard`
- `Minimum Temperature`
- `Minimum Vertical Oscillation` (unit: `mm`)
- `Minimum Vertical Speed`
- `Minimum vertical speed in feet per hour`
- `Minimum vertical speed in feet per minute`
- `Minimum vertical speed in feet per second`
- `Minimum vertical speed in kilometers per hour`
- `Minimum vertical speed in meters per hour`
- `Minimum vertical speed in meters per minute`
- `Minimum vertical speed in miles per hour`

#### Unit Variant Types
- `Distance in miles` (unit: `mi`)
- `Effort Pace in minutes per mile`
- `GNSS Distance in miles` (unit: `mi`)
- `Grade Adjusted Pace in minutes per mile` (unit: `min/m`)
- `Grade Adjusted Speed in feet per minute` (unit: `ft/min`)
- `Grade Adjusted Speed in feet per second` (unit: `ft/s`)
- `Grade Adjusted Speed in kilometers per hour` (unit: `km/h`)
- `Grade Adjusted Speed in knots` (unit: `kn`)
- `Grade Adjusted Speed in meters per minute` (unit: `m/min`)
- `Grade Adjusted Speed in miles per hour` (unit: `mph`)
- `Pace in minutes per mile` (unit: `min/m`)
- `Speed in feet per minute` (unit: `ft/min`)
- `Speed in feet per second` (unit: `ft/s`)
- `Speed in kilometers per hour` (unit: `km/h`)
- `Speed in knots` (unit: `kn`)
- `Speed in meters per minute` (unit: `m/min`)
- `Speed in miles per hour` (unit: `mph`)
- `Swim Pace in minutes per 100 yard` (unit: `min/100yrd`)
- `Vertical speed in feet per hour` (unit: `ft/h`)
- `Vertical speed in feet per minute` (unit: `ft/min`)
- `Vertical speed in feet per second` (unit: `ft/s`)
- `Vertical speed in kilometers per hour` (unit: `km/h`)
- `Vertical speed in meters per hour` (unit: `m/h`)
- `Vertical speed in meters per minute` (unit: `m/min`)
- `Vertical speed in miles per hour` (unit: `mph`)

</details>
