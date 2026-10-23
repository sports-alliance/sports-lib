---
title: Read event summaries
summary: Restore dashboard and list metadata while constructing canonical metrics only when needed.
---

# Read event summaries

`EventSummary.fromJSON` reads native event JSON or a separately stored event summary whose `activities` field is
absent. It retains the event identity, dates, name, privacy, description, merge flag, activity types, location stats
and raw summary metrics. It does not restore activities, laps, streams, devices or intensity-zone objects.

```ts
import { EventSummary, DataDistance, DataStartPosition } from '@sports-alliance/sports-lib';
import type { EventSummaryJSONInterface } from '@sports-alliance/sports-lib';

const summary = EventSummary.fromJSON(storedSummary as EventSummaryJSONInterface);
const date = summary.startDate;
const sports = summary.getActivityTypesAsArray();
const distance = summary.getStat<number>(DataDistance.type);
const displayValue = distance?.getDisplayValue();
const displayUnit = distance?.getDisplayUnit();
const position = summary.getStat(DataStartPosition.type);
```

Browser charts and workers can also import `EventSummary` and its input type from
`@sports-alliance/sports-lib/metrics`, without file adapters. Input dates use native JSON millisecond timestamps.
Supply `id` in the JSON when the storage document's ID is separate from its payload.

## Lazy metrics and compatibility

Creating a summary copies raw JSON values and canonicalizes their keys without constructing metric objects.
The first `getStat` constructs and caches that metric; aliases return the same cached instance. Missing speed-derived
pace, swim-pace and grade-adjusted-pace metrics use the same rules as full JSON hydration, but only the requested
metric and its source dependencies are constructed. Explicit finite canonical values take precedence over aliases.
Null, undefined and non-finite scalar summaries are omitted; valid zero values and null gaps inside arrays survive.

Sport-specific cadence/stroke-rate and Diving terrain exclusions use embedded activity types when supplied,
otherwise the persisted `Activity Types` summary stat. This matches applications that normalize separately stored
summary projections after native JSON import. Mixed and unknown sports retain ambiguous metrics. The full importer
continues to infer activity semantics from hydrated children; its existing behavior is unchanged.

Unknown metric keys remain in the raw snapshot. Unknown-type and invalid-value constructor errors occur when the
affected metric is requested, including during full enumeration. Unrelated metadata and metric reads remain usable.
The summary reader does not replace a payload sanitizer for applications that need to report or remove unknown fields.

`getStats` and `getStatsAsArray` explicitly materialize all available metrics in canonical raw-stat order, followed
by missing speed-derived metrics in rule order. Earlier lazy reads do not change that order. Their containers are
copies; metric instances remain cached and mutable like other Sports Lib data instances. `getRawStats` returns a deep copy of the
canonical raw snapshot, after sport semantics and before additive pace derivation. It is not a native event export.
Metric mutations do not change that raw snapshot. Apply user-unit preferences through `DynamicDataLoader` before
reading display values and units, as with the full event model.

This reader is a separate projection, not an `EventInterface`: do not cast it into an editable event or persist it
as a complete workout. Use `SportsLib.importFromJSON` / `EventImporterJSON.getEventFromJSON` for activity details,
editing and exports. Installing this API does not change any application's chosen read path automatically.

## Indexed metric lookup

`DynamicDataLoader` builds one constructor/alias index for the built-in catalog on first lookup. It preserves
catalog order for collisions, explicit health-ID redirects, legacy Stance Time instance redirects, constructor
validation and unknown-type errors. `DataStore` remains publicly enumerable. Runtime mutation of built-in constructor
types, aliases or catalog entries after indexing is not supported; this is not a custom-metric registration API.

No canonical metric tokens, values, units, persisted schemas, MCP discovery or privacy rules change. No source-file
reparse, stored-data migration or summary regeneration is needed. Quantified Self can adopt this projection in a
separate change while retaining its existing consent, metric projection and sensitive-location exclusions.

## Repeatable benchmark

```sh
npm run bench:json -- --events 438 --stats 80 --rounds 9 --json /tmp/sportslib-json-benchmark.json
```

For a before/after comparison, pass `--baseline /absolute/path/to/previous/lib/cjs/index.js` from a built older
checkout, or a CommonJS bundle exporting `DataStore`, `DynamicDataLoader` and `EventImporterJSON`.
The script bundles current sources locally, verifies every eager/lazy metric JSON value before timing, warms each
case twice, rotates case order, and reports median and p95 from repeated samples. Explicit GC occurs between samples
when run through the npm command. It uses synthetic documents with the requested numeric stat count, plus activity
types and a synthetic position, and no embedded child activities or streams. These measurements exclude module
startup, network, JSON parsing, application sanitization and rendering; they do not predict whole-dashboard speedup.

### Local result, 23 October 2026

Compared with pre-change source revision `1bb70eb8`, bundled using the same esbuild settings: Node 20.19.3,
Apple M1 Pro, macOS arm64; 438 summaries with 80 numeric stats plus activity types and position; nine measured
rounds after two warmups per case. Every eager and lazy metric JSON value agreed before timing.

| Operation | Median | p95 |
| --- | ---: | ---: |
| Previous class lookup | 233.165 ms | 238.195 ms |
| Indexed class lookup | 2.275 ms | 2.472 ms |
| Previous eager hydration + six reads | 550.239 ms | 584.099 ms |
| Indexed eager hydration + six reads | 17.302 ms | 19.224 ms |
| Summary metadata only | 5.900 ms | 7.301 ms |
| Summary + six reads | 6.557 ms | 22.667 ms |
| Summary + all metrics | 17.559 ms | 19.975 ms |

Indexing reduced eager-hydration median by about 32 times in this synthetic workload. Six lazy reads were about
2.6 times faster than indexed eager hydration. Lazy all-metric enumeration had similar cost to indexed eager
hydration, as expected. The six-read p95 includes an outlier; these short local samples are not a production SLA.
