---
title: Metrics and calculations
summary: Canonical metric tokens, units, and derivation behavior.
---

`Effort Pace` uses pace semantics (`min/km`), not speed semantics (`m/s`). Its average, minimum, maximum, and unit-variant metric types follow `paceUnits`.

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
- `Pause Time` (unit: `s`): explicit paused time, computed as `max(ElapsedTime - TimerTime, 0)`.
- `Moving time` (unit: `s`): movement-only time; separate from pause semantics.

High-level metric domains include:
- Core streams/stats: time, distance, speed, pace, swim pace, heart rate, cadence, stroke rate, power, altitude, depth, grade, vertical metrics
- Zones and targets: heart-rate/power/speed zone durations and zone targets
- Device/context: battery, pressure, satellites, sensor/pod flags, fused location flags, device metadata
- Performance analytics: normalized power, power curve, FTP, IF, TSS, critical power, W', power work, stamina, durability evidence, legacy three-dimensional strain evidence
- Running/cycling/swim dynamics: ground contact, stance balance, oscillation, ratio, SWOLF, efficiency-related metrics
- Jump analytics: jump count/events and min/max/avg families for jump height, distance, speed, score, rotations, hang time

Source-native diving data
---
FIT imports attach each `dive_summary` to the session or lap identified by its native `reference_mesg` and
`reference_index`. Message order is irrelevant, lap summaries are never promoted to their activity, and missing summary
fields are not calculated from record streams. The parser's compatibility-shaped depth and bottom-time fields receive
their Garmin FIT SDK scale before Sports Lib receives and stores those values without further conversion.

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
one another, derived into consumption values, or serialized in native JSON.

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

3) Left/right split and stance balance

```text
PowerRight = Power * (RightBalance / 100)
PowerLeft  = Power * (LeftBalance / 100)
StanceTimeBalanceRight = 100 - StanceTimeBalanceLeft
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
  A homogeneous event summary is normalized as well. Ambiguous historical mixed-event summaries remain unchanged,
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
- Build ~30s buffered means from power-by-time samples
- Raise each mean to the 4th power
NP = 4th_root(average(mean30s^4))

PowerCurve(duration d): max rolling mean power over window d
FTP = round(0.95 * best_20min_power)
IF = NP / FTP
```

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

- POWER -> HR -> PACE/SWIM_PACE -> MET

POWER TSS:

```text
IF = NP / FTP
EffectiveDuration = max(durationWithoutPauses - 29, 0)
TSS = (100 * EffectiveDuration * NP * IF) / (FTP * 3600)
```

HR TSS:

- Banister TRIMP when resting HR is available
- Edwards-zone fallback otherwise

PACE TSS (running/trail groups):

- Uses Minetti running-cost grade adjustment, then NP-like 30s/4th-power normalization

```text
Cost(g) = 155.4*g^5 - 30.4*g^4 - 43.3*g^3 + 46.3*g^2 + 19.5*g + 3.6
AdjustedSpeed = Speed * (3.6 / Cost(g))
TSS = 100 * (duration/3600) * IF^2
```

SWIM_PACE TSS:

```text
IF = SwimSpeed / ThresholdSwimSpeed
TSS = 100 * (duration/3600) * IF^3
```

MET TSS:

```text
METScore = (3600 * Energy) / (Weight * Duration)
IF = METScore / ThresholdMET
TSS = 100 * (duration/3600) * IF^2
```

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
- `Satellite 5 Best SNR`
- `Sea Level Pressure` (unit: `hpa`)
- `Speed` (unit: `m/s`)
- `Speed (Stryd)`
- `Sport Profile Name`
- `Stamina` (unit: `%`)
- `Stance Time` (unit: `ms`)
- `Stance Time Balance Left`
- `Stance Time Balance Right`
- `Start Event`
- `Start Position`
- `Starting Altitude`
- `Step Length`
- `Steps`
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
- `VO2 Max`
- `Weight` (unit: `kg`)
- `WPrime`

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
