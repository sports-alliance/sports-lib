---
title: Validation and compatibility
summary: Compatibility with imperfect files, verified corpus coverage, route validation and known limitations.
---

# Validation and compatibility

Sports Lib combines automated tests with testing against real activity and route exports. This guide documents the
October 2026 corpus validation, alongside the project's earlier testing history.

## Compatibility with imperfect files

The corpus has driven fixes for exporter quirks, incomplete recordings and malformed values that previously caused
import failures, lost observations or incorrect summaries. Sports Lib includes tested recovery for supported file
irregularities as well as standard-format imports.

| File irregularity | Supported handling |
|---|---|
| Vendor-specific GPX and TCX layouts | Recover recorded speed, heart rate and altitude from supported alternate locations and namespaces, using established exporter units and preserving standard-field precedence. |
| Nonstandard FIT record headers | Recover the evidenced reserved-header-bit variation while retaining the other format and integrity checks. |
| Missing or conflicting session timing | Retain credible session bounds and recover later observations when independent timer, record and distance evidence establishes their ownership and timing. |
| Missing final multisport session | Recover a final `Unknown Sport` leg only when the file explicitly establishes a missing session and independently supports its boundaries. |
| Pool and multisport export quirks | Preserve supported length/rest records, canonical pool units and valid cross-sport laps; guard against incomplete generated distance and source-proven impossible length durations. |
| Invalid values in older native JSON | Restore activity and route data without promoting non-finite or null scalar summaries into valid measurements; preserve valid zeros and independently usable data. |

These are scoped compatibility rules backed by source evidence and regression tests. Recovery preserves meaningful
zeros, missing readings, pauses and sport boundaries. Unproven values are not invented to make a file pass, and
unsupported non-activity files remain rejected by the activity importer.

See [Import activities](importing-activities.md) and [Work with routes](routes.md) for the supported layouts, recovery
conditions and historical reparse requirements. The known limitations below remain separate from these completed fixes.

## Verified corpus

As of **16 October 2026**, the validation covers **191,548 distinct source files**, including activity and route
imports and file-type validation.

Files are deduplicated by their contents. Different exports of the same workout can remain distinct files, so this
count does not represent unique workouts or athletes.

The corpus includes FIT, GPX, TCX and provider JSON, with exports from Garmin, Suunto, COROS, Polar and other sources.

## What was checked

Validation included:

- Parsing and comparison with previous library behavior.
- Preservation of recorded values, zeros and missing data.
- Timing, distance, multisport ownership, swimming lengths and rests.
- Training-load calculations, eligibility and fallback behavior.
- Native JSON restoration and repeated summary regeneration.
- File-type rejection of explicitly non-activity FIT inputs.

Checks vary by format and scenario. Intentional changes were reviewed against source evidence; the completed
comparisons found no unexpected differences or newly introduced rejections.

## Route coverage

The route corpus contains **1,230 GPX files and one FIT file**.

Each was imported through the route APIs, compared with the published implementation and restored from native JSON.
Comparisons covered the complete serialized output, including geometry, metadata and statistics. No failures or
unexpected differences were found.

This provides substantially broader corpus coverage for GPX than FIT routes. Exporting every route through every
supported format and manually reviewing every map were outside this audit.

## Known limitations

### Strava reference comparisons

The Strava suites use saved reference streams already in the repository. They are repeatable comparisons with those
exports, not a claim of exact equivalence to today's Strava service. The larger regression corpus does not contain paired
Strava results for every source, so corpus replay and Strava agreement answer different questions.

Comparisons use the same elapsed timestamp, preserve missing observations, and validate the reference clock. They
check sample coverage separately from error: one matching point cannot make an otherwise missing stream pass.
Distance comparisons must not accept a value merely because it appears somewhere else in the stream. Grade errors
are **percentage points of slope**, not relative percentage errors. No time shift is chosen to improve agreement.

The October 2026 sparse-distance change retains the existing grade look-ahead and GAP formula. The eight active
legacy Grade comparisons remain within their existing error limits, with 97.6–99.99% reference-point coverage.
Separate checks now measure both `Grade` and `Grade Smooth` against Strava's `grade_smooth`, including these previously
excluded comparisons:

| Saved reference | Grade mean absolute difference | Grade Smooth mean absolute difference |
|---|---:|---:|
| Suunto uphill | 7.68 points | 5.68 points |
| COROS trail | 2.66 points | 3.03 points |

Both discrepancies predate the sparse-distance change. Their altitude and heart-rate observations match at the
reference timestamps. Suunto's reference distance also differs from recorded distance (mean absolute difference
0.68 m, maximum 11.7 m); COROS's distance differences beyond 0.051 m are limited to six startup observations.
Correcting the uphill test's unrelated flat-activity reference does not eliminate its grade discrepancy.
These observations locate remaining disagreement in derived terrain processing and reference-distance handling;
they do not establish which smoothing model is more accurate. Applying a blanket time shift would misalign sensors
that already agree.

The saved hilly-running reference also contains pace and GAP. Its new check compares the unitless adjustment
`GAP / pace` with `Speed / Grade Adjusted Speed`, requiring at least 4,811 matched observations out of 4,988.
It accounts separately for 176 zero-speed observations and the remaining unsupported observation. Mean absolute
adjustment-factor difference is about 0.0612, with a 95th-percentile difference of 0.2025; this is essentially unchanged
by the distance fix. This isolates the grade adjustment from different speed smoothing and does not establish absolute
GAP pace or whole-workout GAP equivalence. Coverage is one paired GAP reference, not all providers or sports.

The new smoothed-grade and known-discrepancy bounds record existing behavior and catch worsening agreement. They are
regression ceilings, not newly relaxed accuracy claims; the stricter legacy Grade expectations remain unchanged.
Strava describes its [GAP model](https://medium.com/strava-engineering/an-improved-gap-model-8b07ae8886c3) as fitted to
real-world running data. Sports Lib's polynomial approximation and terrain smoothing should be evaluated independently
before changing either to chase reference numbers.

Run the focused reference checks with:

```bash
npm test -- --runInBand src/specs/strava-streams-compliance.spec.ts src/specs/strava-derived-streams.spec.ts src/specs/helpers/stream-reference-comparison.spec.ts
```

### Other limitations

A successful regression test establishes expected software behavior. It does not independently establish sensor
accuracy or physiological validity.

Open investigations cover power-data quality, questionable MET inputs, conflicting FIT timing, missing multisport
ownership, remaining swimming chronology and vendor-specific TCX cadence units. These remain tracked in
[the issue tracker](https://github.com/sports-alliance/sports-lib/issues).

## Privacy

Original files and account-level evidence remain outside the public repository. Public documentation reports aggregate
results; regression fixtures derived from private findings use synthetic examples.
