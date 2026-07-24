---
title: Three-dimensional power and training-response model
summary: Research provenance, implemented equations, capacity estimation, strain scoring, calibration, and limitations.
---

# Three-dimensional power and training-response model

This guide records the scientific sources, the exact Sports Lib implementation, and the engineering decisions around
the CP/W′/Pmax training model. It is the source of truth for deciding whether a behavior comes from published research,
the paper authors' reference material, or Sports Lib.

The implementation has three deliberately separate layers:

```text
dated power curves from one exact activity type
  -> capacity snapshot: CP, W′, Pmax
  -> continuous workout power + applicable snapshot
  -> workout strain: SSCP, SSW′, SSPmax
  -> UTC-day aggregation
  -> three independently calibrated fitness-fatigue responses
```

The primary research source is Kontro et al.'s
[three-dimensional impulse-response model](https://doi.org/10.1371/journal.pone.0341721), first circulated as
[arXiv:2503.14841](https://arxiv.org/abs/2503.14841). The paper proposes the strain and three-response layers. It
expects the athlete's CP, W′, and Pmax to be known from suitable maximal-effort evidence; it does not define a
production rolling estimator for ordinary historical activity files.

This model is additive to existing FTP, TSS, CTL/ATL, readiness, and durability calculations. CP and FTP are different
constructs even when an illustrative comparison assumes they are equal. Sports Lib never substitutes one for the other.

## What is published and what is ours

| Part | Origin | Sports Lib status |
| --- | --- | --- |
| Two-parameter CP relation | Monod–Scherrer and subsequent whole-body CP literature | Used by three challenger fits and retained in one deprecated helper |
| Three-parameter CP relation | Morton's model | Implemented as prediction and direct-fit utilities |
| MPA, power allocation, and strain score | Kontro et al. Equations 4 and 8–13 | Implemented, with the documented main and workbook variants |
| Three parallel fitness-fatigue responses | Kontro et al., extending the Banister/Morton response model | Implemented |
| Rolling field-data capacity estimator | Sports Lib engineering design informed by CP literature | Implemented as estimator contract version 1 |
| Capacity anchors and readiness thresholds | Sports Lib engineering policy | Implemented; not claimed as published physiological constants |
| Chronological response-calibration holdout | Sports Lib validation policy | Implemented; intentionally differs from the authors' example R fitter |
| Automatic parser CP/W′/Pmax or strain | Rejected design | Not generated during activity parsing |
| GoldenCheetah or Stryd compatibility | External alternatives | Not implemented and no numerical parity is claimed |

The model is not called “three-dimensional” because it measures a physical three-dimensional space. The axes are an
abstract performance space represented by CP, W′, and Pmax. Kontro et al. explicitly describe the energy-system
allocation as a simplifying estimate rather than a direct measurement of ATP flux.

## Scientific foundation

### Two- and three-parameter power-duration relations

The two-parameter critical-power relationship is:

```text
P(t) = CP + W′ / t
```

`CP` is the power asymptote and `W′` is the curvature constant in joules. The equation implies unlimited power as
duration approaches zero. Morton's three-parameter model adds a finite fatigue-free maximum, `Pmax`, through a time
offset:

```text
t0 = W′ / (Pmax - CP)
P(t) = CP + W′ / (t + t0)
```

Sports Lib implements this relation in `predictThreeParameterCriticalPower` and a bounded nonlinear fitter in
`fitThreeParameterCriticalPowerModel`. Morton introduced the model to address bias in the two-parameter relation, and
Vinetti et al. later experimentally evaluated its short-duration behavior in cycling.

CP-model parameters depend on the trials, durations, error domain, and fitting expression. Bull et al. obtained
different CP estimates from different linear, nonlinear, and exponential fits. Karsten et al. showed that maximal
3-, 7-, and 12-minute field or historical cycling efforts can estimate CP, while also reporting material measurement
error. These findings motivate retaining diagnostics and refusing weak fits; they do not validate Sports Lib's exact
rolling estimator.

### Interpretation of CP, W′, and Pmax

Kontro et al. associate the three parameters primarily with:

- `CP`: sustainable oxidative contribution;
- `W′`: finite work above CP, associated primarily with glycolytic capacity and substrate-level phosphorylation;
- `Pmax`: fatigue-free instantaneous power, associated primarily with the phosphocreatine/immediate contribution.

The associations overlap physiologically. A parameter is a functional performance index, not a pure measurement of one
isolated metabolic system.

The low-level strain API also accepts an independently established laboratory, field-test, or device model. The caller
owns source selection and must persist its provenance; Sports Lib does not reconcile competing model sources.

## Sports Lib capacity estimator

`buildPowerDurationEnvelope` and `fitThreeDimensionalCapacityModel` form the recommended longitudinal capacity API.
They are not an implementation of a capacity-fitting procedure specified by Kontro et al.

### Input and chronology contract

Each `DatedActivityPowerCurve` supplies:

- a stable caller-owned source ID;
- one exact canonical activity type;
- a UTC date in `YYYY-MM-DD` form;
- one activity's mean-max power curve.

All sources must precede `effectiveDate`. Aliases are canonicalized, but distinct canonical types are never pooled.
For example, `Cycling`, `Indoor Cycling`, `Running`, and `Rowing` require separate histories even when an application
displays them in a shared group. Rejecting evidence on or after the effective date prevents future-data leakage.

Source IDs must be unique. Input order does not affect the result. The source fingerprint covers the estimator version,
effective date, canonical activity type, normalized source IDs, dates, durations, and powers. It is a deterministic
change detector, not a cryptographic integrity or authentication mechanism.

### Curve normalization and envelope

For each source curve:

1. Durations and power must be finite and strictly positive.
2. When a duration is duplicated, the strongest power is retained.
3. An exact anchor point is preferred.
4. A missing anchor may be interpolated linearly in reciprocal-duration (`1/t`) space only when it is bracketed by
   recorded points whose duration ratio is no greater than `1.25`.
5. The estimator never extrapolates.
6. At each anchor, the strongest sampled value across the supplied history becomes the envelope point. Its source ID
   and date are retained.

Malformed individual points are counted in `rejectedPointCount` and ignored when the same curve still contains usable
positive finite evidence. A curve with no usable points makes the whole input invalid rather than silently disappearing
from provenance.

The fixed estimator-version-1 anchors are:

| Purpose | Durations |
| --- | --- |
| Pmax evidence | 1, 2, 3, 5, 8, 12, 20, and 30 seconds |
| CP/W′ evidence | 120, 180, 240, 300, 480, 720, 900, and 1,200 seconds |

These anchors are engineering choices intended to constrain both short and long portions of the model while operating
on common mean-max curves. They are not prescribed by Kontro et al. or a claim that these are universally optimal test
durations.

### CP and W′ challenger fits

The estimator requires at least three contributing activities spanning at least 14 calendar days. It then requires at
least five CP/W′ anchors, including:

- at least two anchors from 120–300 seconds; and
- at least two anchors from 720–1,200 seconds.

It fits the same two-parameter relation in three error domains:

| Diagnostic name | Regression or objective | CP | W′ |
| --- | --- | --- | --- |
| `power-reciprocal-time` | ordinary least squares of `P` against `1/t` | intercept | slope |
| `work-time` | ordinary least squares of `P*t` against `t` | slope | intercept |
| `duration-domain` | minimize squared error of `t = W′ / (P - CP)` | optimized positive value below all anchor powers | least-squares value at that CP |

The final CP is the median of the three CP estimates, and the final W′ is the median of the three W′ estimates. This
median consensus is a Sports Lib robustness policy. It is not a named published estimator, and its two medians need not
come from the same challenger.

All three challengers must produce positive finite values, and CP must remain below the lowest power among the fitted
anchors. The consensus then passes these version-1 gates:

| Gate | Maximum |
| --- | --- |
| Power-domain RMSE divided by mean anchor power | 5% |
| Range of challenger CP values divided by consensus CP | 5% |
| Range of challenger W′ values divided by consensus W′ | 20% |
| Maximum leave-one-anchor-out CP deviation from the full consensus | 5% |
| Maximum leave-one-anchor-out W′ deviation from the full consensus | 20% |

The wider W′ limit acknowledges that W′ is substantially less stable than CP in published field and test-retest work.
The exact percentages remain conservative engineering thresholds, not confidence intervals or published universal
cutoffs.

### Conditional Pmax fit

Pmax is fitted only after CP and W′ pass. At least four short anchors are required, with one at five seconds or shorter
and one at 15 seconds or longer.

For every short anchor, the Morton time offset implied by the already fitted CP and W′ is:

```text
t0_i = W′ / (P_i - CP) - t_i
```

Every offset must be positive and finite. The estimator takes their median and derives:

```text
Pmax = CP + W′ / median(t0_i)
```

The short-anchor fit must have power-domain normalized RMSE no greater than 5%, leave-one-anchor-out Pmax deviation no
greater than 10%, and a fitted Pmax greater than both CP and the highest observed short-anchor power.

When CP and W′ pass but Pmax does not, the result is `partial`. CP and W′ remain visible with their diagnostics, but
`model` remains `null`; a partial result cannot score three-dimensional strain.

### Result meanings

| Status | Meaning |
| --- | --- |
| `ready` | CP, W′, and Pmax passed every gate; `model` is present |
| `partial` | CP and W′ passed, but Pmax evidence, fit, or stability did not |
| `insufficient-evidence` | History or duration coverage was inadequate |
| `poor-fit` | The observed envelope did not adequately follow the model |
| `unstable` | Challenger or leave-one-out sensitivity exceeded a limit |
| `invalid-input` | Dates, sources, activity types, curves, or chronology violated the contract |

The estimator returns typed unavailable results and does not throw for malformed analytical input.

The reason codes identify the failed boundary:

| Reason | Meaning |
| --- | --- |
| `no-evidence` | No supplied curve could contribute an anchor |
| `invalid-effective-date` | `effectiveDate` is not a real `YYYY-MM-DD` UTC date key |
| `invalid-source` | A source or source ID cannot be interpreted |
| `duplicate-source` | A source ID occurs more than once |
| `invalid-date` | A source date is not a real `YYYY-MM-DD` date key |
| `future-evidence` | A source is dated on or after `effectiveDate` |
| `invalid-activity-type` | A source activity type cannot be canonicalized |
| `mixed-activity-types` | More than one exact canonical activity type is present |
| `invalid-power-curve` | A supplied curve has no usable positive finite points |
| `insufficient-history` | Fewer than three contributing sources or less than 14 days of history |
| `insufficient-critical-power-range` | CP/W′ anchor count or early/long coverage is inadequate |
| `insufficient-maximum-power-range` | Short-anchor count or early/later coverage is inadequate |
| `poor-critical-power-fit` | CP/W′ fitting failed or consensus normalized RMSE exceeds 5% |
| `unstable-critical-power-fit` | CP/W′ challenger or leave-one-out spread exceeds its limit |
| `poor-maximum-power-fit` | Conditional Pmax fitting failed or normalized RMSE exceeds 5% |
| `unstable-maximum-power-fit` | Pmax leave-one-out sensitivity or physical ordering is invalid |

### Direct three-parameter fitter

`fitThreeParameterCriticalPowerModel` remains a lower-level alternative. It fits all three Morton parameters together
by bounded deterministic multi-start Nelder–Mead and reports RMSE, normalized RMSE, R², iterations, and convergence. It
requires at least five distinct durations by default but does not apply the longitudinal estimator's chronology,
duration-range, multi-source, cross-method, or leave-one-out gates.

A mathematically converged direct fit is therefore not proof that the curve contains maximal, current, or
well-conditioned athlete evidence. It is not called automatically by parsers or by
`fitThreeDimensionalCapacityModel`.

### Why not an exact GoldenCheetah, Stryd, or authors' fitter

Ruiz-Alias et al. found that several CP forms and the evaluated Stryd and GoldenCheetah outputs could predict
long-duration running power when supplied with model-appropriate maximal trials. That result does not identify one
universal best method and does not validate a rolling envelope of ordinary workouts.

Sports Lib does not claim compatibility with either product. It also does not reproduce the paper authors'
`PD fit 3CP 3CPmod.R` procedure. At the pinned reference commit, that example script:

- groups pre-extracted mean-max values into caller-prepared rows;
- directly fits both the Morton relation and an exponent-two modified relation;
- uses caller-edited CP, W′, and Pmax bounds; and
- reports fit uncertainty without Sports Lib's chronological or longitudinal readiness contract.

The current Sports Lib estimator is consequently best described as a conservative, literature-informed engineering
implementation. Its comparative accuracy must be established against held-out independent maximal tests before it can
be called better than another estimator.

## Three-dimensional strain calculation

`calculateThreeDimensionalStrain` requires a complete externally selected CP/W′/Pmax model and continuous power
samples. Parsing an activity never creates the model or the score.

### W′ balance and maximum power available

For power above CP, W′ balance is reduced by `(P - CP) * dt`. Below CP, Sports Lib applies the differential recovery
form used by the paper's supporting calculation:

```text
W′exp_next = W′exp_previous * exp(-((CP - P) * dt) / W′)
W′bal_next = W′ - W′exp_next
```

The resulting balance is clamped to the physical interval from zero to the supplied W′.

This is related to the differential W′ balance model investigated by Skiba et al. The default initial state is fully
recovered W′. A caller with a justified preceding state may provide `initialWPrimeBalanceJoules`; Sports Lib does not
infer recovery between separate activities.

Maximum power available is:

```text
MPA = Pmax - (Pmax - CP) * (1 - W′bal / W′)^q
```

- `q = 1` is Kontro et al. Equation 4 and is the default.
- `q = 2`, together with `wPrimeBalanceTiming: 'after-sample'`, reproduces the modified MPA/timing convention used in
  the paper's Fig. 4/5 supporting workbook.

The paper states that the exponent-two and differential-recovery combination was supported by unpublished practical
experience. It should not be presented as independently published validation. Consumers must persist the exponent and
timing options alongside calculated scores.

These two options change MPA evaluation and strain scoring only. They do not change W′ recovery, the Morton prediction
utility, or the version-1 rolling capacity estimator. Sports Lib does not currently fit the authors' modified
exponent-two power-duration relation.

### Power allocation

For `P <= CP`, all power is assigned to the CP component. For `CP < P <= Pmax`, Sports Lib implements Kontro et al.
Equations 8–10:

```text
PCP    = CP
PPmax  = (P - CP)^2 / (Pmax - CP)
PW′    = (P - CP) - PPmax
P      = PCP + PW′ + PPmax
```

These are model allocations, not measured metabolic energy-system contributions.

### Strain coefficient and normalization

Kontro et al. Equation 11 is represented as:

```text
kstrain = (Pmax - MPA + CP) / (Pmax - P + CP)
```

Sports Lib floors the MPA used by this equation at observed power. This implementation safeguard prevents a transient
inconsistent state from producing a coefficient above one; it is not a new physiological claim.

For each sample, each component score increment is:

```text
component increment =
  component power
  * kstrain
  * ((100 / 3600) * Pmax / CP^2)
  * sample duration
```

The three increments sum to total strain. The normalization makes one hour at CP equal 100 total strain under the
model's normalization, matching the scale described for Equation 13.

### Strain readiness safeguards

The option defaults are:

| Option | Default | Meaning |
| --- | --- | --- |
| `sampleIntervalSeconds` | 1 | Duration of a direct numeric power sample |
| `minimumCoverageRatio` | 0.95 | Recorded duration divided by candidate duration |
| `minimumRecordedDurationSeconds` | 1 | Minimum total duration with valid power |
| `maximumPowerAvailableExponent` | 1 | Published main-model MPA exponent |
| `wPrimeBalanceTiming` | `before-sample` | Evaluate MPA from W′ state before the current sample update |
| `initialWPrimeBalanceJoules` | full W′ | Starting W′ balance |

Additional behavior is:

- missing samples are not interpolated, zero-filled, or silently scored;
- a recorded sample above supplied Pmax makes the score unavailable;
- invalid or numerically non-representable model states return `invalid-model`;
- scores are returned only for `ready`.

The 95% coverage limit and numerical guards are Sports Lib data-quality policy, not parameters from the paper.
Power above Pmax is intentionally not clamped into a score. It can indicate a stale/incorrect model, a device spike, or
a real effort that disproves the supplied Pmax; the caller must resolve that evidence explicitly.

| Reason | Meaning |
| --- | --- |
| `missing-power` | No valid power duration is available |
| `insufficient-coverage` | Valid power duration does not meet the configured duration or coverage gate |
| `power-exceeds-maximum` | At least one recorded sample exceeds the supplied Pmax |
| `invalid-model` | Model, options, duration arithmetic, W′ state, or score arithmetic is invalid |

## Three parallel impulse responses

`calculateThreeDimensionalImpulseResponse` applies the same daily response structure independently to CP, W′, and
Pmax strain:

```text
alpha_fitness = 1 - exp(-1 / tau_fitness)
fitness_t = fitness_(t-1) * (1 - alpha_fitness) + load_t * alpha_fitness

alpha_fatigue = 1 - exp(-1 / tau_fatigue)
fatigue_t = fatigue_(t-1) * (1 - alpha_fatigue) + load_t * alpha_fatigue

performance_t = baseline
  + fitness_gain * fitness_t
  - fatigue_gain * fatigue_t
```

This discrete EWMA form follows the fitness-fatigue systems-model family used by Kontro et al. The three components
must have independent parameter sets. The paper notes that published energy-system-specific gains and time constants
do not yet exist and recommends individual calibration and periodic recalibration.

The low-level calculator treats each array position as one day; it does not inspect dates or insert rest days. Its
fitness and fatigue states default to zero, although callers may provide nonnegative initial states. The public
calibrator described below constructs a zero-filled calendar and always fits from zero initial states.

The commonly seen “42 days fitness / 7 days fatigue” values are platform conventions discussed by the paper, not
Sports Lib defaults and not generic athlete truth.

When parameters have been calibrated against CP watts, W′ joules, and Pmax watts, each component's `performance`
output is in its corresponding observation unit. The internal fitness and fatigue states remain filtered strain-load
states and should not be presented as watts or joules.

## Sports Lib response calibrator

`fitThreeDimensionalImpulseResponseParameters` fits each output independently against dated performance observations.
Its goal is a predictive library contract, not numerical parity with the authors' illustrative R script.

### Required evidence

- Daily loads are pre-aggregated CP, W′, and Pmax strain for one exact activity type.
- Omitted dates inside the date range are treated as zero-load rest days.
- Missing or unprocessed activity data must not be represented as rest.
- Observations must be independent CP, W′, or Pmax measurements from a stable, versioned protocol.
- A value derived from the same activity history used to create the strain inputs is not independent validation.

The defaults are:

| Option | Default | Role |
| --- | --- | --- |
| `minimumObservationCount` | 16 | Total observations required for one output |
| `minimumTrainingObservationCount` | 12 | Earlier observations required for fitting |
| `validationObservationCount` | 4 | Latest observations held out |
| `minimumTrainingSpanDays` | 56 | Minimum span of fitting observations |
| `minimumTimeConstantDays` | 2 | Lower bound for either response time constant |
| `maximumTimeConstantDays` | 180 | Upper bound for either response time constant |
| `minimumFitnessToFatigueTimeConstantRatio` | 1 | Requires fitness time constant to be no shorter than fatigue |
| `maximumIterations` | 500 | Nelder–Mead iterations per deterministic start |
| `maximumValidationNormalizedRmse` | 0.10 | Held-out error gate |
| `maximumCalendarSpanDays` | 3,660 | Allocation guard for the zero-filled calendar |

### Fitting and gates

For each component, Sports Lib:

1. Searches fitness and fatigue time constants between 2 and 180 days.
2. Requires the fitness time constant to be at least the fatigue time constant.
3. For each time-constant pair, solves a linear intercept with fitness and fatigue gains constrained to be nonnegative.
4. Requires a positive baseline and positive predicted performance on every represented day.
5. Uses deterministic multi-start Nelder–Mead for the time-constant search.
6. Rejects a solution at a search boundary.
7. Rejects a solution with both gains equal to zero as having no training-response signal.
8. Requires held-out normalized RMSE no greater than 10%.

The 2–180-day bounds, observation counts, 56-day span, 10% held-out limit, positivity rules, and optimizer settings are
configurable safeguards. They are not population response parameters.

Only a component with status `ready` exposes predictive parameters. A top-level `partial` result may contain one or two
ready components. `poor-fit`, `insufficient-evidence`, and `invalid-input` are auditable outcomes, not zero responses.

Top-level invalid reasons are `invalid-options`, `invalid-daily-loads`, `invalid-observations`,
`observations-precede-load-history`, and `calendar-span-exceeds-limit`. Daily-load dates must be unique. Multiple
observation records may share a date only when they measure different components; duplicate component/date
measurements are invalid. When CP and Pmax are both observed on a date, Pmax must exceed CP.

Per-component unavailable reasons are:

| Reason | Meaning |
| --- | --- |
| `missing-observations` | The component has no independent performance observations |
| `insufficient-observations` | Total component observations are below the configured minimum |
| `insufficient-training-observations` | Too few observations remain after chronological holdout |
| `insufficient-training-span` | Fitting observations cover too little calendar time |
| `no-training-response-signal` | The best admissible model has zero fitness and fatigue gains |
| `optimizer-failed` | No finite physically admissible fit was found |
| `time-constant-at-bound` | Optimization depends on the configured search boundary |
| `validation-error-exceeds-limit` | Held-out normalized RMSE exceeds the configured maximum |

### Difference from the authors' R fitter

At reference commit
[`f8dc4c0158ce8b8ccb0907fb1ec22e7ce3a031dc`](https://github.com/HKont/3DIR-model-code/tree/f8dc4c0158ce8b8ccb0907fb1ec22e7ce3a031dc),
the authors' `Fitting 3D with SS.R` is an illustrative analysis with different assumptions:

| Concern | Authors' example R script | Sports Lib calibrator |
| --- | --- | --- |
| Baselines | Fixed example values for CP, W′, and Pmax | Fitted positive intercept per output |
| Initial response state | Fixed nonzero, outcome-specific example load states | Zero fitness and fatigue state |
| Bounds | Different hard bounds and starts per outcome | Shared configurable time-constant bounds and nonnegative gains |
| Observations | All observations participate in fitting | Latest observations are chronological holdouts |
| Acceptance | Reports fitted parameters and in-sample errors | Withholds parameters unless physical and held-out gates pass |

The local published-data fixture deliberately tests Sports Lib's held-out decision. It is not intended to reproduce the
authors' all-observation parameters.

## Parser, persistence, and application responsibilities

Activity parsing retains recorded power and generated mean-max power curves. It does not generate:

- `CriticalPower`;
- `WPrime`;
- a capacity snapshot; or
- `Three Dimensional Strain Evidence`.

The old `Three Dimensional Strain Evidence` data class remains readable only for historical native JSON compatibility.
Legacy records are excluded from event summaries and are not evidence for new longitudinal calculations.

A consuming application should:

1. Partition activities by exact canonical activity type.
2. Select only historical curves before a snapshot's effective date.
3. Choose and version a trailing-window and refresh policy.
4. Persist the source IDs, dates, estimator version, fingerprint, result, and diagnostics.
5. Score a workout with the most recent `ready` snapshot that was already effective on that workout's date.
6. Persist the strain algorithm options and model snapshot used for each score.
7. Aggregate the three components on UTC calendar days without combining activity types.
8. Zero-fill actual rest days for response calculation.
9. Retain independent observations and their protocol/version metadata.
10. Recalibrate after qualifying load or observation changes.

A 42-completed-day history refreshed weekly is an example application policy, not a Sports Lib default and not a
literature-derived optimum. It is unrelated to the paper's discussion of a conventional 42-day fitness time constant.
Applications should validate their own window and refresh policy.

Do not use a future snapshot to rewrite an earlier workout as if the later capacity had been known. If a product
intentionally recomputes a retrospective “current best interpretation,” persist that as a separate provenance concept
instead of overwriting the historical-as-known result.

## Sport and device scope

The library APIs accept any canonical activity type with valid power evidence. Scientific support is not equally strong
for every sport:

- the strain examples and supporting files from Kontro et al. are centered on cycling power;
- cycling field CP estimation has direct validation literature;
- running power-duration modeling has supportive studies, but outputs depend on device, trials, and fitted model;
- rowing, skiing, skating, and other power-bearing activities have not been validated by Sports Lib as interchangeable
  with cycling or with one another.

Supporting a type in software means the mathematics can be applied to its power stream. It does not establish
physiological validity. Exact-type isolation prevents an application from silently treating unlike device definitions
or modalities as one athlete capacity.

## Validation evidence and what it proves

Sports Lib keeps deterministic local coverage:

- the strain fixture records the Kontro et al. workbook citation, DOI, worksheet/cell provenance, SHA-256, and CC BY
  4.0 license and asserts numerical agreement for the documented workbook variant;
- the response fixture records the published 365-day data-file SHA-256, eight missing-load-to-zero conversions, authors'
  repository and pinned commit, and Sports Lib's expected chronological-gate result;
- real FIT integration fixtures verify complete, gapped, and absent power-stream behavior;
- a dated multi-activity cycling fixture verifies exact-type history, order invariance, and the conservative
  partial/unstable outcomes seen in real power curves;
- deterministic synthetic and malformed-input tests verify model recovery, status behavior, numerical safety,
  permutation invariance, and no-throw contracts.

These tests establish implementation conformance and robustness. They do not establish:

- population-level physiological validity of the strain score;
- superiority of the capacity estimator over GoldenCheetah, Stryd, direct Morton, or another model;
- accurate CP/W′/Pmax from non-maximal training history;
- cross-device or cross-sport equivalence; or
- prospective accuracy of the three-dimensional response model in an athlete population.

Those claims require external datasets with dated training power, repeated independent maximal performance outcomes,
and chronological evaluation.

## Known limitations

- A historical maximum envelope can combine efforts performed in different fatigue, environmental, calibration, or
  training states.
- Ordinary workouts may never contain a maximal effort at an important duration.
- Sensor spikes can dominate a mean-max curve, while aggressive cleaning can remove real sprint evidence.
- W′ is less stable than CP and can change with glycogen availability and prior exercise.
- Pmax is especially weak without true short maximal efforts.
- The CP model should not be extrapolated beyond the duration domain that constrained it.
- The paper's energy-system allocation assumes immediately available aerobic power, constant contributions at a given
  power, unchanged efficiency, and unchanged CP/W′/Pmax during a workout; the authors identify several of these as
  simplifications or inaccurate assumptions.
- The three-response model has not yet undergone broad prospective scientific validation, and the paper reports no
  published energy-system-specific response constants.
- A good numerical fit can still be physiologically wrong. Readiness means “passed this software contract,” not
  “laboratory validated.”

## References and provenance

- Kontro H, Mastracci A, Cheung SS, MacInnis MJ. “The three-dimensional impulse-response model: Modeling the training
  process in accordance with energy system-specific adaptation.” *PLOS One* 21(2), 2026.
  [doi:10.1371/journal.pone.0341721](https://doi.org/10.1371/journal.pone.0341721).
- Kontro et al. Supporting code, pinned for fixture provenance at
  [`f8dc4c0158ce8b8ccb0907fb1ec22e7ce3a031dc`](https://github.com/HKont/3DIR-model-code/tree/f8dc4c0158ce8b8ccb0907fb1ec22e7ce3a031dc).
- Monod H, Scherrer J. “The work capacity of a synergic muscular group.” *Ergonomics* 8(3), 1965.
  [doi:10.1080/00140136508930810](https://doi.org/10.1080/00140136508930810).
- Morton RH. “A 3-parameter critical power model.” *Ergonomics* 39(4), 1996.
  [doi:10.1080/00140139608964484](https://doi.org/10.1080/00140139608964484).
- Bull AJ, Housh TJ, Johnson GO, Perry SR. “Effect of mathematical modeling on the estimation of critical power.”
  *Medicine & Science in Sports & Exercise* 32(2), 2000.
  [doi:10.1097/00005768-200002000-00040](https://doi.org/10.1097/00005768-200002000-00040).
- Karsten B, Jobson SA, Hopker J, Stevens L, Beedie C. “Validity and reliability of critical power field testing.”
  *European Journal of Applied Physiology* 115(1), 2015.
  [doi:10.1007/s00421-014-3001-z](https://doi.org/10.1007/s00421-014-3001-z).
- Vinetti G et al. “Experimental validation of the 3-parameter critical power model in cycling.”
  *European Journal of Applied Physiology* 119(4), 2019.
  [doi:10.1007/s00421-019-04083-z](https://doi.org/10.1007/s00421-019-04083-z).
- Skiba PF, Fulford J, Clarke DC, Vanhatalo A, Jones AM. “Intramuscular determinants of the ability to recover work
  capacity above critical power.” *European Journal of Applied Physiology* 115(4), 2015.
  [doi:10.1007/s00421-014-3050-3](https://doi.org/10.1007/s00421-014-3050-3).
- Morton RH, Fitz-Clarke JR, Banister EW. “Modeling human performance in running.” *Journal of Applied Physiology*
  69(3), 1990. [doi:10.1152/jappl.1990.69.3.1171](https://doi.org/10.1152/jappl.1990.69.3.1171).
- Ruiz-Alias SA, Ñancupil-Andrade AA, Pérez-Castilla A, García-Pinillos F. “Can we predict long-duration running power
  output? A matter of selecting the appropriate predicting trials and empirical model.” *European Journal of Applied
  Physiology* 123(10), 2023.
  [doi:10.1007/s00421-023-05243-y](https://doi.org/10.1007/s00421-023-05243-y).
