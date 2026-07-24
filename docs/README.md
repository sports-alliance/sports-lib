# Sports Lib documentation

Sports Lib normalizes GPX, TCX, FIT, and service-specific JSON into shared activity and route models. The API reference documents the supported consumer API; implementation adapters and parsers remain available for compatibility but are intentionally outside this reference.

## Start here

Install the package:

```sh
npm install @sports-alliance/sports-lib
```

When parsing GPX in Node.js, also install a DOM parser implementation:

```sh
npm install @xmldom/xmldom
```

## Guides

- [Import activities](guides/importing-activities.md) — parse GPX, TCX, FIT, Suunto JSON, and native JSON.
- [Work with routes](guides/routes.md) — import, export, convert, and preview planned routes.
- [Configure parsing](guides/parsing-options.md) — control stream output and FIT device metadata.
- [Export and persist data](guides/exporting.md) — create GPX or native JSON and restore it later.
- [Metrics and calculations](guides/metrics-and-calculations.md) — canonical metric tokens, units, and derivation rules.

## API reference

Use the navigation to browse the curated API, including [SportsLib](https://sports-alliance.github.io/sports-lib/classes/API.SportsLib.html), [activity parsing options](https://sports-alliance.github.io/sports-lib/classes/API.ActivityParsingOptions.html), [route parsing options](https://sports-alliance.github.io/sports-lib/classes/API.RouteParsingOptions.html), [streams](https://sports-alliance.github.io/sports-lib/classes/API.Stream.html), and the [JSON contracts](https://sports-alliance.github.io/sports-lib/interfaces/API.EventJSONInterface.html).

## Analytics

`analyzeActivityDurability` produces deterministic durability evidence when an activity has enough eligible source data. `samplePowerCurveAtDuration` and `comparePowerCurveWindows` support power-curve comparisons without extrapolating beyond known samples. Parsing cycling/MTB and running/trail-running activities with recorded power can add `DataThreeDimensionalStrainEvidence`, a coverage-gated self-fit CP/W′/Pmax result with total and component strain scores. `calculateThreeDimensionalStrain` remains available for callers with their own model parameters, while `calculateThreeDimensionalImpulseResponse` applies independently calibrated fitness-fatigue responses to those three load series. `fitThreeDimensionalImpulseResponseParameters` adds bounded, chronologically validated calibration when callers provide dated daily strain loads and independent CP/W′/Pmax observations; it deliberately returns no generic athlete model when evidence or held-out fit quality is inadequate.
