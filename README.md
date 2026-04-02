# Sports Lib

*A Library for processing GPX, TCX, FIT and JSON files from services such as Strava, Movescount, Garmin, Polar etc*

About
-----
Sports Lib tries to achieve a common domain model and lib for sport activity formats
such as GPX, TCX, FIT and other popular formats. 

Currently the support is limited to the main formats: GPX, TCX, FIT and JSON*

*JSON is for specific services while GPX, TCX, FIT should be compatible with the most common services,
such as Strava, Movescount, Garmin, Polar and any other service that supports the above formats.

Release Notes
-------
- Breaking change (next major): `Effort Pace` now uses pace semantics (`min/km`) instead of speed semantics (`m/s`).
  `Effort Pace` also has `Average/Minimum/Maximum` stat types and pace unit variants following `paceUnits`.

Install
-------

- Install via npm 

  `npm install @sports-alliance/sports-lib --save`
  
Examples
=======


GPX
---
```typescript
import {SportsLib} from '@sports-alliance/sports-lib';
import {DOMParser} from 'xmldom'

// For GPX you need a string 
const gpxString = 'Some string from a file etc';
SportsLib.importFromGPX(gpxString, DOMParser).then((event)=>{
  // do Stuff with the file
  const distance = event.getDistance();
  const duration = event.getDuration();
});
```

TCX
---
```typescript
import {SportsLib} from '@sports-alliance/sports-lib';

// For TCX you need a string 
const tcxString = 'Some string from a file etc';
SportsLib.importFromTCX((new DOMParser()).parseFromString(tcxString, 'application/xml')).then((event)=>{
  // do Stuff with the file
  const distance = event.getDistance();
  const duration = event.getDuration();
});
```


FIT
---
```typescript
import {SportsLib} from '@sports-alliance/sports-lib';

// For FIT you need an ArrayBuffer (binary) 
SportsLib.importFromFit(arrayBuffer).then((event)=>{
  // do Stuff with the file
  const distance = event.getDistance();
  const duration = event.getDuration();
});
```

FIT device_info mode
---
Some FIT files emit `device_info` rows every second for the same device identity, which can significantly increase payload size.

`ActivityParsingOptions` exposes `deviceInfoMode`:
- `raw` (default): keep all `device_info` rows (backwards-compatible behavior).
- `changes`: collapse contiguous timestamp-only repeats and keep first + last item for each contiguous identical run.

```typescript
import { SportsLib, ActivityParsingOptions } from '@sports-alliance/sports-lib';

const options = new ActivityParsingOptions({
  deviceInfoMode: 'changes'
});

SportsLib.importFromFit(arrayBuffer, options).then(event => {
  // event.getFirstActivity().creator.devices is compacted by state changes
});
```

`summary` mode is intentionally not exposed in this version.

Stream includeTypes filter (FIT/TCX/GPX)
---
`ActivityParsingOptions` also supports stream allowlisting under `streams.includeTypes`.

- `includeTypes` missing or `[]`: current behavior (no filtering).
- `includeTypes` provided: strict final stream output for FIT/TCX/GPX importers.
- Values must be canonical `Data*.type` strings (for example: `Distance`, `Heart Rate`, `Pace`).
- Unknown types throw a parsing error.
- Derived requests are supported: required internal dependencies are resolved automatically and then removed from final output unless explicitly requested.

```typescript
import { SportsLib, ActivityParsingOptions } from '@sports-alliance/sports-lib';

// Raw-only request
const rawOnlyOptions = new ActivityParsingOptions({
  streams: { includeTypes: ['Distance', 'Heart Rate'] }
});

// Derived request (Pace): dependencies (like Speed) are handled internally
const derivedOnlyOptions = new ActivityParsingOptions({
  streams: { includeTypes: ['Pace'] }
});

SportsLib.importFromFit(arrayBuffer, rawOnlyOptions).then(event => {
  // activity streams contain only Distance + Heart Rate
});

SportsLib.importFromFit(arrayBuffer, derivedOnlyOptions).then(event => {
  // activity streams contain only Pace
});
```

<!-- DATA_COVERAGE_START -->
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
- Core streams/stats: time, distance, speed, pace, swim pace, heart rate, cadence, power, altitude, grade, vertical metrics
- Zones and targets: heart-rate/power/speed zone durations and zone targets
- Device/context: battery, pressure, satellites, sensor/pod flags, fused location flags, device metadata
- Performance analytics: normalized power, power curve, FTP, IF, TSS, critical power, W', power work
- Running/cycling/swim dynamics: ground contact, stance balance, oscillation, ratio, SWOLF, efficiency-related metrics
- Jump analytics: jump count/events and min/max/avg families for jump height, distance, speed, score, rotations, hang time

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

- Cadence minimum/average exclude zero values.
- Grade max/min/avg prefers `Grade Smooth` when present.

5) Power analytics (NP, power curve, FTP, IF, CP/W')

```text
NormalizedPower (NP):
- Build ~30s buffered means from power-by-time samples
- Raise each mean to the 4th power
NP = 4th_root(average(mean30s^4))

PowerCurve(duration d): max rolling mean power over window d
FTP = round(0.95 * best_20min_power)
IF = NP / FTP

Critical Power model (Monod-Scherrer on duration 180..1200s):
  x = 1 / timeSeconds
  y = power
  slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX^2) = W'
  intercept = (sumY - slope*sumX) / n = CP
```

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

- Moving time fallback order: lap moving time -> speed-threshold integration -> timer time fallback.
- Jump families (height, distance, speed, rotations, score, hang time) compute min/max/avg from jump events when available.

8) Event-level aggregation behavior

- Single-activity event: copies activity stats directly to event stats.
- Multi-activity event:
  - Sums duration, pause, distance, ascent, descent, energy.
  - Aggregates zone durations by summation.
  - Averages many average-like stats using iterative pairwise averaging.
  - Aggregates power curves by duration-wise maxima (power and W/kg), then recomputes CP/W'.

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
- `Descent`
- `Descent Time`
- `Description`
- `Device Location`
- `Device Names`
- `Distance` (unit: `m`)
- `Distance (Stryd)`
- `Duration` (unit: `s`)
- `Elapsed time` (unit: `s`)
- `Effort Pace`
- `EHPE`
- `Enabled Navigation Systems`
- `End Altitude`
- `End Position`
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
- `Jump Count`
- `Jump Distance`
- `Jump Event`
- `Jump Score`
- `Latitude` (unit: `degrees`)
- `Left Balance`
- `Left Pedal Smoothness` (unit: `%`)
- `Left Torque Effectiveness` (unit: `%`)
- `Leg Spring Stiffness` (unit: `"KN/m"`)
- `Leg Stiffness` (unit: `"KN/m"`)
- `Longitude` (unit: `degrees`)
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
- `Primary Benefit`
- `Rated Perceived Exertion`
- `Recovery Time`
- `Resting Calories` (unit: `kcal`)
- `Rider Position Change Event`
- `Right Balance`
- `Right Pedal Smoothness` (unit: `%`)
- `Right Torque Effectiveness` (unit: `%`)
- `Rotations`
- `Satellite 5 Best SNR`
- `Sea Level Pressure` (unit: `hpa`)
- `Speed` (unit: `m/s`)
- `Speed (Stryd)`
- `Sport Profile Name`
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
- `Swim Pace` (unit: `min/100m`)
- `Temperature` (unit: `°C`)
- `Time`
- `Timer time`
- `Total Cycles`
- `Total Flow`
- `Total Grit`
- `Training Load Peak`
- `Training Stress Score`
- `Training Stress Score Method`
- `Vertical Oscillation` (unit: `mm`)
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
- `Average Respiration Rate` (unit: `br/min`)
- `Average Satellite 5 Best SNR`
- `Average Speed`
- `Average speed in feet per minute`
- `Average speed in feet per second`
- `Average speed in kilometers per hour`
- `Average speed in knots`
- `Average speed in meters per minute`
- `Average speed in miles per hour`
- `Average Stride Length`
- `Average Stroke Count`
- `Average Stroke Distance`
- `Average Swim Pace`
- `Average swim pace in minutes per 100 yard`
- `Average SWOLF 25m`
- `Average SWOLF 50m`
- `Average Temperature`
- `Average VAM` (unit: `m/h`)
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
- `Maximum Respiration Rate` (unit: `br/min`)
- `Maximum Satellite 5 Best SNR`
- `Maximum Speed`
- `Maximum speed in feet per minute`
- `Maximum speed in feet per second`
- `Maximum speed in kilometers per hour`
- `Maximum speed in knots`
- `Maximum speed in meters per minute`
- `Maximum speed in miles per hour`
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
- `Minimum Respiration Rate` (unit: `br/min`)
- `Minimum Satellite 5 Best SNR`
- `Minimum Speed`
- `Minimum speed in feet per minute`
- `Minimum speed in feet per second`
- `Minimum speed in kilometers per hour`
- `Minimum speed in knot`
- `Minimum speed in meters per minute`
- `Minimum speed in miles per hour`
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
<!-- DATA_COVERAGE_END -->

Export
---
```typescript
// Get an event as seen above
const gpxString = await new EventExporterGPX().getAsString(event);
// Send the blob
const blob = new Blob(
  [jsonString],
  {type: new EventExporterGPX().fileType},
);
```


Example converting a FIT file to GPX
---
Thanks to [@guikeller](https://github.com/guikeller)
```typescript 
import fs from 'fs';
import sportsLibPkg from '@sports-alliance/sports-lib';
import exporterPkg from '@sports-alliance/sports-lib/lib/events/adapters/exporters/exporter.gpx.js'

const { SportsLib } = sportsLibPkg;
const { EventExporterGPX } = exporterPkg;

// Input and output file path
const inputFilePath = '/tmp/test.fit';
const outputGpxFilePath = '/tmp/test.gpx';

// reads the FIT file into memory
const inputFile = fs.readFileSync(inputFilePath, null);
if (!inputFile || !inputFile.buffer) {
    console.error('Ooops, could not read the inputFile or it does not exists, see details below');
    console.error(JSON.stringify(inputFilePath));
    return;
}
const inputFileBuffer = inputFile.buffer;
// uses lib to read the FIT file
SportsLib.importFromFit(inputFileBuffer).then((event) => {
    // convert to gpx
    const gpxPromise = new EventExporterGPX().getAsString(event);
    gpxPromise.then((gpxString) => {
        // writes the gpx to file
        fs.writeFileSync(outputGpxFilePath, gpxString, (wError) => {
            if (wError) {
                console.error('Ooops, something went wrong while saving the GPX file, see details below.');
                console.error(JSON.stringify(wError));
            }
        });
        // all done, celebrate!
        console.log('Converted FIT file to GPX successfully!');
        console.log('GPX file saved here: ' + outputGpxFilePath);
    }).catch((cError) => {
        console.error('Ooops, something went wrong while converting the FIT file, see details below');
        console.error(JSON.stringify(cError));
    });
});
```
