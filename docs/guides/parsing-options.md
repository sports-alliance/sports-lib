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

Power TSS and IF require independent file FTP or `tss.overrides.functionalThresholdPower`; the same-ride FTP
estimate and an ordinary JSON-restored FTP statistic are ineligible. HR calculations require explicit calibration; calorie-derived MET estimates require energy, body mass and duration.
Walking and hiking use imported TSS, then usable power with a valid threshold, calibrated HR, then MET in Automatic.
Explicit HR, MET and swimming SWIM_PACE preferences select their available method first. Other eligible sports retain power and pace methods
in their Automatic order. See [TSS methods](metrics-and-calculations.md) for sport eligibility, validation, fallback
reasons and existing optional physiological overrides.

HR integration excludes explicit timer pauses and readings inside them, including when recording gaps span the pause.
Without start/stop events it retains elapsed-time integration; aggregate timer duration alone does not locate pauses.
This correction applies across eligible sports and does not alter imported scores or the MET formula. Reparse original
files and refresh downstream Training summaries to update historical calculated HR scores.

Swimming never substitutes workout speed for a missing threshold, even with `tss.enableHeuristicFallbacks: true`.
That option continues to control running-grade fallbacks. Missing swim thresholds produce `missing-swim-threshold`
and allow the existing eligible HR/MET fallbacks; explicit `thresholdSwimSpeed` and legacy `refSwimSpeed` overrides
remain supported.

```ts
import { ActivityUtilities } from '@sports-alliance/sports-lib';
const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(event.getFirstActivity());
// evaluations.automatic / .hr / .met / .swimPace: score, actual method, provenance, estimated, reasons
```

Read the cached evaluations while retaining the parsed Activity instance. They survive stream disposal on that instance,
but are not serialized into ordinary activity JSON. Use `evaluateTrainingStressScore` only for an explicit recalculation.
For complete method comparisons, omit `streams.includeTypes`: a restrictive allowlist can prevent calculation inputs
from being imported, so evaluations reflect only the inputs that were loaded.

### Missing power

FIT/TCX/GPX imports keep absent power as `null` and genuine 0 W as zero. No cadence inference or filling option is
applied. Calculated power TSS needs independent FTP, a complete NP window and at least 80% observed active-time
coverage; partial eligible results are estimates. Supplied NP and imported TSS retain priority. Use `ActivityUtilities.getPowerCoverage(activity)`
to distinguish an observed-period average/work from a complete total. See [power coverage](metrics-and-calculations.md#power-coverage-and-observed-work)
and [JSON migration](exporting.md#missing-power).


### Independent CSS for modeled swimming load

`evaluations.swimPace` selects the independent swim-pace candidate ahead of calculated power/HR. Imported scores
(including zero) still win; unavailable swim pace falls back through Automatic with a reason. Non-swimming activities
report `unsupported-sport` for this preference. Automatic's power → HR → pace → MET order is unchanged.
The additive `swimPace` member is optional in the public type for compatibility with evaluations saved by older versions.

A consumer can apply separately stored CSS without changing recorded statistics or parse options:

```ts
const activity = event.getFirstActivity();
const recorded = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
const modeled = ActivityUtilities.evaluateTrainingStressScoreWithSwimThreshold(activity, 100 / 113);
// CSS = 1:53 / 100 m. modeled.swimPace selects pace; modeled.automatic still prefers power/HR.
// recorded and the activity's JSON/statistics remain unchanged.
```

Call the ordinary getter first to initialize its parse-time cache. The CSS API requires a swimming activity and a
positive finite speed in metres/second; invalid arguments or an absent cache throw. Call it while swim inputs remain
available. It uses the existing formula `100 × activeHours × (averageSwimSpeed / thresholdSwimSpeed)^3`, with the
same duration, availability and calculated-score guards. It does not infer CSS or modify cached file-only results.
Consumers own calibration dates and persistence; applying today's CSS to historical swims is an explicit consumer
policy decision, not an automatic library migration. No provider field is newly interpreted as CSS.
