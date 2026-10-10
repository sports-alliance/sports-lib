---
title: Import activities
summary: Parse supported activity formats into Sports Lib's shared event model.
---

# Import activities

Use `SportsLib` to import recorded activities. GPX accepts a DOM parser in Node.js, TCX accepts a parsed XML document, FIT accepts binary data, and native JSON restores a previous Sports Lib export.

Activity types are normalized through `ActivityTypesHelper.resolveActivityType()` before they are stored on
activities. For example, `snorkeling` resolves to `Snorkeling`; `Mermaiding` is a canonical diving activity
when a provider supplies that sport name. A provider-specific numeric FIT mapping is added only when the FIT
profile or a representative file establishes one.

Canonical activity types also receive a stable activity group. `Skating` and `Inline Skating` belong to the dedicated
Skating group, while `Ice Skating` remains in Winter Sports. Aerial activities retain altitude, ascent, and descent
while exposing vertical speed. Motorized and Adaptive Mobility activities retain movement data but do not receive
library-calculated Training Stress Score or durability evidence; a source-provided Training Stress Score remains intact.

`Meditation` belongs to `ActivityTypeGroups.IndoorSportsGroup` alongside Yoga, Pilates, and Stretching.
FIT `sport=generic` (`0`) with `sub_sport=breathing` (`62`) defaults to `Meditation`; an explicit Garmin Breathwork
profile preserves Breathwork separately, including `training/breathing` (`10/62`) and the French
profile `Ex. respiration`. The aliases `meditation`,
`breathing`, and `generic_breathing` resolve to that same canonical value. This preserves the activity name in
[Suunto's mapping](https://aspartnercontent.blob.core.windows.net/apizone/docs/Activities.pdf), where Meditation is
Suunto App activity ID `112`. Stretching remains `Flexibility Training` for FIT `training/flexibility_training`.

`Padel` belongs to `ActivityTypeGroups.TeamRacketGroup` alongside Tennis, Squash, and Racquet Ball.
FIT `sport=racket` (`64`) with `sub_sport=padel` (`85`) imports as `Padel`; `padel` and `racket_padel` resolve to
the same canonical value. Suunto documents this pair for App activity ID `75`. A racket session without a recognized
specific sub-sport or racket profile name imports as Racket Sport.

FIT `sport=dance` (`83`) resolves to the existing `ActivityTypes.Dancing` canonical stored value `Dancing` in
`ActivityTypeGroups.IndoorSportsGroup`. The explicit sport takes precedence over sub-sport or user-defined profile
fallbacks. `Dance` and `dance` are aliases of Dancing, not additional canonical types. Existing Dancing JSON remains
unchanged, and the `DANCING` and `dancing` aliases also restore that value.

`ActivityTypes.JumpRope` has canonical stored value `Jump Rope` in `ActivityTypeGroups.IndoorSportsGroup`. Explicit
FIT `sport=jump_rope` (`84`) retains this type before sub-sport or profile fallbacks. `JumpRope`, `jumpRope`,
`jump_rope`, and `JUMP_ROPE` resolve to Jump Rope, including native JSON. Plain `Rope` and `Jump` do not identify it.

`ActivityTypes.Pickleball` has canonical stored value `Pickleball` in `ActivityTypeGroups.TeamRacketGroup`, distinct
from Racquet Ball, Padel, and Tennis. FIT `sport=racket` (`64`) with `sub_sport=pickleball` (`84`) imports as Pickleball
before profile fallbacks. The composite requires the Racket parent; a generic or unrelated sport with sub-sport `84`
retains its previous classification unless an explicit recognized profile establishes the activity. An explicit
Pickleball sport name or recognized profile also resolves to Pickleball across providers. `pickleball`, `PICKLEBALL`,
and `racket_pickleball` aliases restore the same canonical type from native JSON. Racket sessions with Padel, Squash,
Badminton, Racquet Ball, or Table Tennis sub-sports retain their existing types.

These identifiers appear in [Garmin's official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js).
Sport and sub-sport IDs are separate namespaces: sport `84` means Jump Rope, while Racket's sub-sport `84` means
Pickleball. The mappings apply across manufacturers without adding provider transport or workout-delivery support.

Dancing and Jump Rope inherit Indoor Sports' existing speed metric family, movement threshold, indoor hint, and TSS
selection; Pickleball inherits the corresponding Team/Racket behavior and has a false indoor hint. These catalog hints
do not establish where an individual session was recorded. None has stroke-rate semantics or a durability adapter.
No numeric metric, Training formula, modeled Training family, or planning mutation is added. Quantified Self's existing
Training policy resolves all three to volume-only Other training; a formerly Generic activity belonged to Fitness &
Gym, while Racquet Ball already belongs to Other training. Usable power curves stay isolated by exact canonical type.

Stored Generic, Unknown Sport, and Racquet Ball labels cannot recover these distinctions on their own. Reparse retained
FIT `83`, `84`, and `64/84` sources, or restore specific source names/profiles when available, then regenerate separately
persisted event summaries, activity-type aggregates, and affected Training snapshots. Saved routes need no reparse.
Adopt the release in both the Quantified Self application and Functions before persisting Jump Rope or Pickleball.
The existing strict MCP activity-type catalog discovers the new canonical names, groups, and indoor hints; Dancing's
canonical entry is reused. No fields, scopes, tools, or mutations are added. Queue lifecycle, write paths, and monitoring
remain unchanged. Supported-activities Help links to the dynamic catalog and needs no enumerated entry before adoption.

`ActivityTypes.Rucking` has canonical stored value `Rucking` in `ActivityTypeGroups.OutdoorAdventuresGroup`. FIT
`hiking/rucking` (`17/124`) preserves the type separately from Hiking and Walking before profile fallbacks, across
manufacturers. Explicit Rucking sport/profile names also establish it. `rucking` and `hiking_rucking` restore the same
value from native JSON. A generic or unrelated parent with sub-sport `124` does not establish Rucking; a pack-weight
field alone does not change Hiking or Walking into Rucking. [Garmin's Rucking manual](https://www8.garmin.com/manuals/webhelp/GUID-708A8F4D-9A78-49CF-9528-DE109BBCC472/EN-US/GUID-2167E511-03AE-4E0C-A813-67BBCC047D7A.html)
lists Rucking under Outdoor. This classification adds no pack-weight metric or weight-dependent calculation.

`ActivityTypes.SailingExpedition` has canonical stored value `Sailing Expedition` in `ActivityTypeGroups.WaterSportsGroup`.
FIT `sailing/expedition` (`32/66`) preserves this type separately from Sailing and Sail Racing before profile fallbacks.
Explicit `Sailing Expedition` and `Sail Expedition` sport/profile names, and their camel-case/snake-case aliases, resolve
to the same type, including native JSON. Standalone Expedition does not establish sailing; `generic/expedition` stays
Generic, and `hiking/expedition` stays Hiking. Garmin documents
[Sail Expedition as a multiday sailing activity](https://www.garmin.com/en-GB/p/818345/). Classification alone does not
restore missing samples or alter the importer's existing duration and stream limits.

`ActivityTypes.CCRDiving` has canonical stored value `CCR Diving` in `ActivityTypeGroups.DivingGroup`. FIT
`diving/ccr_diving` (`53/63`) preserves this closed-circuit rebreather type before profile fallbacks, separately from
Diving, Scuba Diving, Free Diving, and Pool Apnea. `CCRDiving`, `ccrDiving`, `ccr_diving`, `diving_ccr_diving`, `CCR`, and
`ccr` resolve to it, including native JSON. A generic or unrelated parent with sub-sport `63` does not establish CCR
Diving; sport `63` still identifies Video Gaming. [Garmin's dive modes](https://www8.garmin.com/manuals/webhelp/GUID-120241CE-9583-49CD-A0BC-8839B887F7CA/EN-US/GUID-B0F7269A-8B02-48F3-AED2-CECB581B361F.html)
identify CCR as closed-circuit rebreather diving. These numeric identifiers appear in
[Garmin's official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js); broad `ruck` and `rebreather` activity aliases are not added. The separately recognized Expedition profile retains
its own Outdoor Adventures type, distinct from Sailing Expedition.

All three have the existing movement threshold, a false indoor hint, and no stroke-rate conversion or durability
adapter. Rucking inherits Outdoor Adventures' pace/speed and vertical-speed families and normal terrain summaries.
Sailing Expedition inherits Water Sports' speed/swim-pace families and Sailing's ascent/descent derivation exclusions,
while retaining raw altitude data, altitude summaries, and explicit source ascent/descent. CCR Diving inherits Diving's
speed family and excludes terrain summaries (altitude, grade, ascent, and descent) on activities and laps while
retaining source streams and dive data. All retain their groups' existing TSS selection. No numeric token, unit,
provider transport, delivery support, Training formula, or modeled family is added. Quantified Self's existing policy
resolves the new types to volume-only Other training. Usable power curves remain isolated by exact canonical type.

Stored Hiking, Sailing, Diving, Generic, or Unknown Sport labels cannot establish the more specific activities. Reparse
retained FIT `17/124`, `32/66`, or `53/63` sources, or restore specific source names/profiles, then regenerate separately
persisted event summaries, activity-type aggregates, and affected Training snapshots. Saved routes need no reparse.
Adopt the release in both the Quantified Self application and Functions before persisting these types. Existing strict
MCP catalog discovery exposes their names, groups, and indoor hints without new fields, scopes, tools, or planning
mutations. Queue lifecycle, write paths, and monitoring are unchanged because only normalized classifications change.
Supported-activities Help uses the dynamic catalog and needs no enumerated entry before adoption.

**Running, walking, Enduro MTB, and Rally.**

| Canonical type | FIT sport/sub-sport | Group |
| --- | --- | --- |
| `Obstacle Racing` | `running/obstacle` (`1/59`) | Running |
| `Ultra Running` | `running/ultra` (`1/67`) | Running |
| `Indoor Walking` | `walking/indoor_walking` (`11/27`), `fitness_equipment/indoor_walking` (`4/27`) | Walking |
| `Enduro MTB` (existing type) | `cycling/enduro` (`2/123`) | Mountain Biking |
| `Rally` | `motor_sports/rally` (`81/125`) | Motorized |

The identifiers are defined by [Garmin's official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js).
Garmin lists [Obstacle Racing](https://www8.garmin.com/manuals/webhelp/GUID-2CF5620C-E585-4E0A-9CC3-9565533EEE4D/EN-US/GUID-83C5E4C4-D316-48F6-B155-46109DA93928.html)
and [Ultra Run](https://www8.garmin.com/manuals/webhelp/GUID-25E3235D-44D2-4384-A591-DD1D71BEBCB1/EN-US/GUID-9F9A0CA5-6B98-4FD4-A483-45A6C2CD4C22.html)
as running activities. These classifications do not infer ultra running from distance or trail terrain, and add no
obstacle count, rest timer, or other new source fields.

`ActivityTypeGroups.WalkingGroup` has serialized value `walking_group` and includes Walking, Indoor Walking, and
Nordic Walking. Walking and Nordic Walking move from Outdoor Adventures; Hiking, Rucking, and Trekking remain there.
The indoor hint is independent of the family: only Indoor Walking is marked indoor among these three types. All
three retain walking pace/speed, average pace/speed, vertical-speed, and the default `0.3 m/s` movement threshold;
walking does not acquire running grade-adjusted calculations or a durability adapter. This group change applies to
existing stored Walking and Nordic Walking values without reparsing; their canonical type strings remain unchanged.

The FIT pairs take precedence over conflicting custom profile names, across manufacturers. Numeric IDs, numeric
strings, snake-case, camel-case, and uppercase protocol names behave consistently. Explicit Obstacle Racing/Obstacle
Run, Ultra Running/Ultra Run, Indoor Walking/Walk Indoor, Enduro MTB, and Rally/Rally Driving sport or profile names
also resolve to their canonical values. Every declared alias hydrates through native JSON. Existing `walking_indoor`
and `walking_indoor_walking` aliases now preserve Indoor Walking instead of collapsing to Walking; stored canonical
Walking alone cannot establish that a historical activity was indoors.

Sport and sub-sport namespaces remain separate: sport `59` is Grinding, sport `67` is Meditation, and sport `27` is
Horseback Riding. A generic, missing, or unrelated parent with obstacle, ultra, indoor walking, enduro, or rally
sub-sport alone cannot establish these types. Plain Enduro is ambiguous: Garmin's
[cycling Enduro activity](https://www8.garmin.com/manuals/webhelp/GUID-28E0106C-B05A-44E9-BF7C-9CB36A596B82/EN-US/GUID-C7B10489-A77F-454F-82D2-EB2DD309CFB2.html)
and [FIM's motorcycle Enduro](https://www.fim-moto.com/en/sports/enduro) describe different sports. A Cycling parent
with an explicit Enduro profile establishes Enduro MTB; a generic Enduro profile or motorcycle Enduro sub-sport
retains the existing broader classification. Rally requires the Motor Sports parent for its FIT sub-sport mapping.

Obstacle Racing and Ultra Running inherit the existing running metric and TSS selection and running durability
protocol, subject to its usual sample, duration, and context checks. Enduro MTB retains its existing gravity-MTB
unsupported-context durability evidence and existing TSS eligibility. Indoor Walking retains ordinary TSS eligibility.
Rally omits calculated power/HR/MET TSS and removes stale calculated scores while preserving finite imported TSS,
when preservation is true or omitted. Disabling preservation leaves Rally TSS unset. Rally has no durability adapter. No numeric metric token, unit,
formula, durability protocol, workout delivery capability, provider transport, or Training planning contract changes.

Historical Running, Walking, Fitness Equipment, Cycling, or Motorsports labels need specific retained FIT sources or
explicit names to recover the more specific activity type. After correction, regenerate separately persisted event
summaries, activity-type aggregates, affected durability evidence, and Training snapshots. Saved routes need no reparse.
Adopt the release in both Quantified Self packages before storing the four new canonical values. At adoption, add
WalkingGroup to exhaustive group label/alias, color, gradient, icon, and group-chart maps, and register Indoor Walking
with the Walking chart profile. Review the dynamic Supported activity types Help page against those group labels.
The application remains pinned to its current library until that coordinated upgrade.

Quantified Self's exact Training registry keeps existing Walking/Nordic Walking contexts and the existing cycling
Enduro context (`mixed-gravity`, volume-only load/intensity, recorded distance). The four new canonical types currently
fall back to volume-only Other training; group membership alone does not widen Training or provider delivery support.
The strict MCP activity catalog can discover the new values and Walking group using its existing fields and scopes.
No tools, schema fields, permissions, mutations, queue lifecycle, write paths, or monitoring change. The 121-pair Suunto
protocol audit remains unchanged; these mappings are covered separately with synthetic FIT files across manufacturers.

**Imported Training Stress Score preservation.**

Every canonical sport retains finite source-imported TSS exactly, including zero, when `preserveImportedTss` is
true or omitted (the default). This also applies after type or alias normalization, native JSON hydration, and
repeated summary generation. Calculation inputs, overrides, and calculated-TSS exclusions do not replace imported
scores while preservation is enabled. A finite legacy score without a method gains the `IMPORTED` method.

With `preserveImportedTss: false`, existing TSS and its method are discarded. A replacement is calculated where the
sport and inputs support it; otherwise both stay unset. This includes sports excluded from calculated TSS. Existing
library-calculated scores on eligible sports are retained when true and refreshed when false.

The mapping audit has added 65 canonical types since the Sports Lib 21.5.0 baseline. Both flag settings are tested
over the entire 242-type catalog so future additions inherit the same rule.
No numeric token, unit, formula, JSON field, or MCP contract changes. Consumers must adopt the library together
in the application and Functions. A score already overwritten historically can only be recovered from a retained
original source; native JSON containing the replacement cannot reconstruct the imported number. Correct only
specifically affected originals through the existing source-backed reparse and regenerate affected event summaries
and Training snapshots. No global reparse or deployment is required by this implementation change.

**Spin, E-bike Mountain, Adventure Race, flying variants, and broad sport categories.**

| Canonical type | FIT sport/sub-sport | Group |
| --- | --- | --- |
| `Indoor Cycling` (existing) | `cycling/spin` (`2/5`) | Cycling |
| `E-Mountain Biking` (existing) | `cycling/e_bike_mountain` (`2/47`), `e_biking/e_bike_mountain` (`21/47`) | Mountain Biking |
| `Adventure Racing` (existing) | `multisport/adventure_race` (`18/82`), `running/adventure_race` (`1/82`) | Performance |
| `Paragliding` (existing) | `flying/fly_paraglide` (`20/111`) | Aerial Sports |
| `Hockey` | `hockey` (`73`) | Team/Racket |
| `Winter Sport` | `winter_sport` (`58`) | Winter Sports |
| `Team Sport` | `team_sport` (`70`) | Team/Racket |
| `Water Sport` | `water_sport` (`78`) | Water Sports |
| `Paramotoring` | `flying/fly_paramotor` (`20/112`) | Aerial Sports |
| `RC Drone Flying` | `flying/rc_drone` (`20/39`) | Unspecified |

The [official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js) supplies the source
classifications. [Spinning](https://spinning.com/pages/getting-started) is indoor cycling, so Spin reuses that existing
type and its indoor hint. [FAI](https://www.fai.org/page/paramotors) identifies paramotoring as powered paragliding;
RC Drone Flying records remote-controlled aircraft or drone flight. Neither flying type establishes an indoor venue.
Broad Hockey preserves the source's lack of an ice/field distinction; explicit `hockey/field` (`73/90`) and
`hockey/ice` (`73/91`) still resolve to Field Hockey and Ice Hockey. Winter, Team, and Water Sport do not infer a
specific sport, venue, or stroke-rate semantics.

Numeric IDs, numeric strings, normalized parser names, and explicit sport/profile aliases work across manufacturers.
New native JSON aliases include `Spin`, `cycling_spin`, `cycling_e_bike_mountain`, `AdventureRace`,
`multisport_adventure_race`, `running_adventure_race`, `FlyParaglide`, `flying_fly_paraglide`, `WinterSport`,
`TeamSport`, `WaterSport`, `FlyParamotor`, `flying_fly_paramotor`, `RCDrone`, and `flying_rc_drone`.
Each sport-specific sub-sport requires its documented parent; an unknown or unrelated parent does not inherit the
standalone alias. Explicit FIT classifications take precedence over a conflicting user-defined profile.
Suunto's bare Generic Adventure Racing classification and Hang Gliding pair remain unchanged; their pairs do not
supply the more specific Adventure Race or Paraglide distinction.

Paramotoring and RC Drone Flying omit calculated POWER, HR, pace, and MET TSS, remove stale calculated scores and
methods, and preserve finite imported TSS when preservation is true or omitted, including legacy scores without a method.
With `preserveImportedTss: false`, both TSS and its method stay unset for these two sports.
This is a type-specific policy: other Aerial Sports and Unspecified types retain their existing TSS eligibility.
The other eight classifications retain their existing group calculations. Water Sport uses the Water Sports speed
and swim-pace display families without implying swimming or paddling. Indoor Cycling and E-Mountain Biking retain
the existing cycling durability protocol; the other eight types have no durability adapter. No numeric metric,
unit, formula, durability protocol, or stored field is added.

In Quantified Self's exact Training registry, Indoor Cycling reuses modeled indoor-cycling. E-Mountain Biking,
Adventure Racing, Paragliding, and the six new values currently resolve to volume-only Other training; groups do not
establish modeled contexts or provider delivery support. Adopt the library in the application and Functions together
and review the dynamic supported-activities catalog. Correct historical broad labels only from retained specific
sources or explicit aliases, then regenerate event summaries, activity-type aggregates, applicable durability evidence,
and Training snapshots through the existing source-backed reparse and derived ingress. Broad stored Generic, Cycling,
Running, or Flying values alone cannot recover missing distinctions. Queue lifecycle, monitoring, saved routes,
write paths, MCP fields/scopes/mutations, and Training planning capabilities are unchanged.

**Electric enduro, cycling variants, speed walking, whitewater, wingsuit, brick, and hunting with dogs.**

| Canonical type | FIT sport/sub-sport | Group |
| --- | --- | --- |
| `E-Enduro MTB` | `cycling/e_bike_enduro` (`2/127`) | Mountain Biking |
| `Track Cycling` | `cycling/track_cycling` (`2/13`) | Cycling |
| `Recumbent Cycling` | `cycling/recumbent` (`2/10`) | Cycling |
| `Speed Walking` | `walking/speed_walking` (`11/31`) | Walking |
| `Whitewater Kayaking` | `kayaking/whitewater` (`41/41`) | Water Sports |
| `Whitewater Rafting` | `rafting/whitewater` (`42/41`) | Water Sports |
| `Wingsuit Flying` | `flying/wingsuit` (`20/40`) | Aerial Sports |
| `Brick Training` | `multisport/brick` (`18/80`) | Performance |
| `Hunting with Dogs` | `hunting/hunting_with_dogs` (`28/72`) | Outdoor Adventures |

The [official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js) documents these
parent/sub-sport combinations. Numeric IDs, numeric strings, snake-case, camel-case, and uppercase names resolve
consistently across manufacturers. Explicit sport/profile names and native JSON aliases preserve each canonical type.
A sub-sport without its documented parent retains its broader classification. E-Enduro is electric mountain biking;
motorcycling/e_bike_enduro remains Motorcycling, and ambiguous plain Enduro still requires cycling context.
Whitewater alone does not identify kayaking or rafting. Speed Walking retains the FIT name without asserting
race-walking competition rules. Brick does not infer component sports or construct activities from multiple sessions.

`Indoor Track`, `IndoorTrack`, `Indoor Track Running`, and their snake-case aliases reuse the existing `Indoor Running`
type in Running, with its true indoor hint. On FIT running/track (`1/4`), a recognized `sport_profile_name` supplies
that distinction; without it, the pair retains Running and does not imply an indoor venue. Existing Track Running
and Track and Field profile distinctions remain supported. A specific unrelated FIT pair still takes precedence over
an Indoor Track profile. Garmin documents [indoor track running](https://www8.garmin.com/manuals/webhelp/forerunner945/EN-US/GUID-3A4C7C6C-1FE3-4EB5-B38E-3F744A5C1F00.html).
Track Cycling and Recumbent Cycling are not automatically marked indoor.

Each new type retains its parent sport's existing metric families, movement threshold, elevation policy, and TSS
selection. Whitewater Kayaking uses Kayaking's stroke-rate semantics; Whitewater Rafting retains Rafting's existing
cadence semantics. Track and Recumbent Cycling use the existing cycling durability protocol with its usual evidence
checks. E-Enduro MTB emits unsupported-context gravity-MTB durability evidence, like Enduro MTB, while retaining
ordinary TSS eligibility. The six other new types have no durability adapter. Indoor Track aliases inherit the
existing Indoor Running durability behavior. No numeric metric token, unit, formula, or durability protocol is added.

The nine new exact types currently resolve to volume-only Other training in Quantified Self's independent Training
registry; group membership does not create a modeled context or provider delivery capability. Indoor Track aliases
reuse its existing indoor-running context. Adopt the changes in the application and Functions together, review the
dynamic supported-activities catalog and exhaustive mappings, and correct historical labels only where a retained
source or explicit name provides the distinction. Then regenerate affected event summaries, activity-type aggregates,
durability evidence, and Training snapshots through the existing source-backed reparse and derived ingress.
Native JSON hydration can recover explicit aliases such as cycling_track_cycling, but cannot recover detail lost in
a stored broad Cycling or Running value. Saved routes, queue lifecycle, write paths, monitoring, and MCP wire fields,
scopes, and mutations are unchanged.

**BMX, Indoor Skiing, ATV, Motocross, and Pool Triathlon.**

| Canonical type | FIT sport/sub-sport | Group |
| --- | --- | --- |
| `BMX` | `cycling/bmx` (`2/29`) | Cycling |
| `Indoor Skiing` | `fitness_equipment/indoor_skiing` (`4/25`) | Indoor Sports |
| `ATV` | `motorcycling/atv` (`22/35`) | Motorized |
| `Motocross` | `motorcycling/motocross` (`22/36`) | Motorized |
| `Pool Triathlon` | `multisport/pool_triathlon` (`18/126`) | Performance |

The parent/sub-sport combinations come from [Garmin's official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js).
Its [activity list](https://www8.garmin.com/manuals/webhelp/GUID-025D75CF-3445-49E1-8D81-1AA74AB4E00F/EN-US/GUID-1AD90095-0C71-4E0C-A8F9-F24643235F14.html)
lists BMX under Cycling, XC Ski Indoor under Gym, ATV and Motocross under Motorsports, and Pool Triathlon under Multisport.
Sports Lib groups Pool Triathlon with its existing Triathlon and Multisport types in Performance. Indoor Skiing
returns a true indoor hint; BMX, ATV, Motocross, and Pool Triathlon return false. A pool-swimming classification does
not establish that every triathlon leg is indoors.

These explicit pairs take precedence over conflicting profile names across manufacturers. Numeric IDs, numeric
strings, snake-case, camel-case, and uppercase protocol names resolve consistently. Explicit BMX/BMX Cycling,
Indoor Skiing/XC Ski Indoor/Indoor Cross Country Skiing, ATV/All-Terrain Vehicle, Motocross, and Pool Triathlon
sport or profile names also resolve to the new canonical types. Every declared alias hydrates and round-trips through
native JSON. Bare Quad and MX are not introduced as aliases. A generic, missing, or unrelated parent with sub-sport
`29`, `25`, `35`, `36`, or `126` alone retains its broader classification. For example, Driving with sub-sport ATV
remains Driving. Separate sport IDs `25`, `29`, `35`, and `36` still identify Golf, Fishing, Snowshoeing, and Snowmobiling.

BMX inherits Cycling's existing speed/average-speed, vertical-speed, movement threshold, TSS selection, and
power/heart-rate durability protocol, subject to the usual duration, sample, and context checks. Group membership
does not prove that a BMX session provides suitable endurance evidence. Indoor Skiing uses its Indoor Sports group's
existing speed/average-speed, default movement threshold, and TSS selection. Pool Triathlon uses Performance's
existing speed/average-speed, vertical-speed, default movement threshold, and TSS selection; it does not acquire a
whole-triathlon durability adapter or swimming stroke-rate calculations. ATV and Motocross inherit Motorized's
calculated power/HR/MET TSS exclusion, remove stale calculated TSS, and preserve finite imported TSS with the default
or true preservation setting. Disabling preservation leaves TSS and its method unset. The four non-BMX types have no durability adapter. No numeric metric token, unit, formula,
new durability protocol, workout leg, provider transport, or delivery capability is introduced.

Historical Cycling, Fitness Equipment, Crosscountry Skiing, Motorcycling, or Multisport labels cannot establish these
more specific types by themselves. Correct them from specific retained FIT classifications or explicit source names,
then regenerate separately persisted event summaries, activity-type aggregates, applicable durability evidence, and
affected Training snapshots. Saved routes need no reparse. Adopt the release in both Quantified Self packages before
persisting the new values. Its exact Training registry currently resolves all five types to volume-only Other training;
a Cycling or Performance group alone does not grant a modeled Training context or provider delivery support. The
strict MCP activity catalog discovers their canonical names, groups, and indoor hints within its existing read schema
and scopes. No tool fields, permissions, mutations, queue lifecycle, persistence write path, or monitoring changes.
Supported-activities Help uses the dynamic catalog and needs no enumerated entry before adoption. All 121 existing
Suunto numeric and named protocol pairs remain unchanged; these new pairs have separate synthetic FIT coverage.

`ActivityTypes.IndoorHandCycle` has canonical stored value `Indoor Hand Cycle` in `ActivityTypeGroups.CyclingGroup`.
FIT `cycling/indoor_hand_cycling` (`2/88`) preserves it before custom profile fallback. Specific `Indoor Hand Cycle`,
`IndoorHandCycling`, `indoor_hand_cycle`, and `indoor_hand_cycling` names also resolve to it. This remains distinct
from Hand Cycle, Indoor Cycling, and general Cycling. FIT sport `88` still identifies Canoeing.

`ActivityTypes.IndoorWheelchairPushWalk` and `ActivityTypes.IndoorWheelchairPushRun` have stored values `Indoor
Wheelchair Push Walk` and `Indoor Wheelchair Push Run` in `ActivityTypeGroups.AdaptiveMobilityGroup`. FIT
`wheelchair_push_walk/indoor_wheelchair_walk` (`65/86`) and `wheelchair_push_run/indoor_wheelchair_run` (`66/87`)
preserve the indoor variants before profile fallback. Explicit Indoor Wheelchair Push Walk/Run and
`indoor_wheelchair_walk`/`indoor_wheelchair_run` names also resolve to them. A missing, generic, unrelated, or mismatched
indoor sub-sport keeps the parent's existing Wheelchair Push Walk/Run classification. Suunto's creator-qualified
`generic/hand_cycling` (`0/12`) still resolves to Wheel Chair, and `cycling/hand_cycling` (`2/12`) still resolves to
Hand Cycle. All three new indoor types return a true indoor hint. Garmin documents distinct
[indoor push and handcycling activities](https://www8.garmin.com/manuals/webhelp/GUID-8C2C402F-55AC-431F-9CF2-1442B89CE149/EN-US/GUID-44F436A5-EB13-40E3-AD91-8D7B0D8E0317.html).

`ActivityTypes.Overlanding` has canonical stored value `Overlanding` in `ActivityTypeGroups.MotorizedGroup`.
Garmin's [activity list](https://www8.garmin.com/manuals/webhelp/GUID-7AD1A592-9044-4D84-9688-7B5209F85BFF/EN-US/GUID-00B74ABF-7DB4-4DC2-9CA5-9D2F12B65A10.html)
uses the name Overland under Motorsports. Explicit Overland/Overlanding names and FIT `overland` sub-sport (`98`)
under `motor_sports` (`81`), `driving` (`24`), or `motorcycling` (`22`) resolve to it before profile fallback. These
are supported protocol combinations, verified with synthetic files; they do not establish a particular device's
encoding. Broad Driving, Motorcycling, and Motorsports sessions remain distinct. A generic or unrelated parent with
sub-sport `98` alone does not establish Overlanding. Its indoor hint remains false.

`ActivityTypes.TruckerWorkout` has canonical stored value `Trucker Workout` in `ActivityTypeGroups.IndoorSportsGroup`.
FIT `trucker_workout` sub-sport (`83`) under `generic` (`0`), `fitness_equipment` (`4`), or `training` (`10`) identifies
exercise during driving breaks. Explicit Trucker Workout, Trucker Workouts, and Trucker Health names also resolve to
it. [Garmin's workout guide](https://www8.garmin.com/manuals/webhelp/GUID-2DA54DF8-8084-40ED-954F-EDA09C13B47F/EN-US/GUID-886A3729-D275-4634-80F6-0615009A7EDA.html)
describes exercise during breaks. Driving or another unrelated parent with sub-sport `83` retains its parent type;
sport `83` still identifies Dancing. The Indoor Sports group provides its existing indoor presentation hint, which
does not prove the actual workout location. The specific FIT identifiers come from
[Garmin's official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js).

Numeric IDs, numeric strings, snake-case, camel-case, and uppercase FIT names resolve consistently across
manufacturers. Every declared alias for these five types hydrates to its canonical value through native JSON.
Unrelated parents cannot establish an indoor adaptive or handcycling type from a sub-sport alone; explicit specific
source names/profiles remain sufficient. Indoor Hand Cycle inherits Cycling's speed/average-speed and vertical-speed
families, `4/3.6` movement threshold, power TSS eligibility, and existing power/heart-rate durability protocol. The
other four use their existing groups' speed/average-speed families and default movement threshold, with no
vertical-speed, grade-adjusted, or stroke-rate derivation. Existing raw metrics and terrain summaries remain readable.
Overlanding and both indoor wheelchair types omit calculated power/HR/MET TSS and stale calculated scores while
preserving finite imported TSS when preservation is true or omitted. With false, TSS and its method stay unset.
Trucker Workout retains its group's
existing TSS selection. Those four have no durability adapter. No numeric metric token, unit, formula, durability
protocol, provider transport, workout delivery capability, or modeled Training family is added.

Correcting historical Cycling, Hand Cycle, Wheelchair Push Walk/Run, Driving, Motorcycling, Motorsports, Generic,
Fitness Equipment, or Training labels requires retained FIT sources with these specific pairs or explicit names;
stored broad labels alone cannot establish the more specific type. Regenerate separately persisted event summaries,
activity-type aggregates, durability evidence where applicable, and affected Training snapshots after reparsing.
Saved routes need no reparse. Adopt the release in both the Quantified Self application and Functions before persisting
these new values. Quantified Self's existing exact Training registry resolves them to volume-only Other training;
Cycling group membership alone does not add Indoor Hand Cycle to a modeled Training or delivery profile. Power curves
stay isolated by exact canonical type. The strict MCP activity catalog discovers their names, groups, and indoor hints
without new fields, scopes, tools, or planning mutations. Queue lifecycle, write paths, and monitoring are unchanged.
Supported-activities Help uses the dynamic catalog and needs no enumerated entry before adoption.

`ActivityTypes.Grinding` has canonical stored value `Grinding` in `ActivityTypeGroups.WaterSportsGroup`. Explicit FIT
sport `grinding` (`59`) identifies operating sailing winches and preserves this type before profile or unrelated
sub-sport fallbacks. `ActivityTypes.IndoorGrinding` has canonical stored value `Indoor Grinding` in
`ActivityTypeGroups.IndoorSportsGroup`. FIT `grinding/indoor_grinding` (`59/71`) preserves the separate indoor type before
profile fallbacks. Numeric IDs, numeric strings, snake-case names, and camel-case names resolve consistently across
manufacturers. A generic or unrelated parent sport with sub-sport `71` does not establish Indoor Grinding.

`ActivityTypes.SailRacing` has canonical stored value `Sail Racing` in `ActivityTypeGroups.WaterSportsGroup`. FIT
`sailing/sail_race` (`32/65`) preserves this type separately from Sailing before profile fallbacks. The sub-sport requires
the Sailing parent; a generic or unrelated parent with sub-sport `65` does not establish Sail Racing. Ordinary
`sailing/generic` (`32/0`) remains Sailing. Sport and sub-sport namespaces stay separate: sport `65` remains Wheelchair
Push Walk and sport `71` remains Cricket.

[Garmin's official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js) defines these IDs.
[Garmin's grinding manual](https://www8.garmin.com/manuals/webhelp/GUID-BC69665A-98C5-4953-BD19-F5EB5A26A4D0/EN-US/GUID-6DAD75FF-9AEA-49AC-ADBE-E7EC37B9A0B5.html)
distinguishes Grind Onshore and Grind Offshore; its [Sail Racing manual](https://www8.garmin.com/manuals/webhelp/GUID-EECCAC99-90D6-4AB1-9A3A-EC433D3365E2/EN-GB/GUID-73BD5ACF-0952-4FCE-9F09-EE12F1690563.html)
uses Sail Race. Those explicit sport/profile names resolve to Indoor Grinding, Grinding, and Sail Racing respectively.
`Offshore Sail Grinding` and `Onshore Sail Grinding`, documented in
[Garmin's activity guidance](https://support.garmin.com/en-US/?faq=rv4yk0Oki61O10g6w5Mms7), also resolve to Grinding and
Indoor Grinding. Canonical names, camel-case/snake-case aliases, `grinding_indoor_grinding`, and `sailing_sail_race` restore
the same values from native JSON. Broad `grind`, `onshore`, `offshore`, and `race` aliases are not added.

Grinding and Sail Racing inherit Water Sports' speed/swim-pace families and false indoor hint. Like Sailing, they do not
derive ascent or descent, but retain source altitude streams, altitude summaries, and explicit source ascent/descent.
Indoor Grinding inherits Indoor Sports' speed family, true indoor hint, and existing elevation behavior. Indoor status
is a catalog hint; Grind Onshore does not establish a recording's physical location. All three retain the standard
movement threshold and TSS selection, including power TSS when the required inputs exist. Cadence remains cadence;
there is no stroke-rate conversion or durability adapter. No numeric token, unit, provider transport, workout delivery,
Training formula, or modeled family is added. Quantified Self's existing policy resolves them to volume-only Other
training; formerly Generic activities belonged to Fitness & Gym, while Sailing already belonged to Other training.
Usable power curves remain isolated by exact canonical activity type.

Stored Generic, Unknown Sport, or Sailing labels cannot identify these activities on their own. Reparse retained FIT
`59`, `59/71`, or `32/65` sources, or restore specific source names/profiles, then regenerate separately persisted event
summaries, activity-type aggregates, and affected Training snapshots. Saved routes need no reparse. Adopt the release
in both the Quantified Self application and Functions before persisting the new types. Existing strict MCP catalog
discovery exposes their names, groups, and indoor hints without new fields, scopes, tools, or planning mutations.
Queue lifecycle, write paths, and monitoring are unchanged because only normalized classifications change.
Supported-activities Help uses the dynamic catalog and needs no enumerated entry before adoption.

`ActivityTypes.PoolApnea` has canonical stored value `Pool Apnea` in `ActivityTypeGroups.DivingGroup`. Explicit FIT
sport `pool_apnea` (`85`) preserves this type before sub-sport and profile fallbacks across manufacturers. `PoolApnea`,
`poolApnea`, and `pool_apnea` also restore it from native JSON. Diving-group terrain summaries (altitude, grade, ascent,
and descent) are excluded on activities and laps, while source streams remain available. FIT `diving/apnea_diving`
(`53/56`) and `diving/apnea_hunting` (`53/57`) still resolve to the separate Free Diving type. A broad `apnea` alias is
not added. Pool Apnea inherits the group's existing speed behavior and false indoor hint; the hint does not establish
whether the pool is indoors or outdoors.

`ActivityTypes.Mobility` has canonical stored value `Mobility` in `ActivityTypeGroups.IndoorSportsGroup`. Explicit FIT
sport `mobility` (`86`) preserves the type before sub-sport and profile fallbacks. Lowercase `mobility` restores it from
native JSON. It inherits Indoor Sports' speed behavior and true indoor hint. Flexibility Training, Stretching, and Yoga
remain separate; `training/flexibility_training` (`4/19`) retains Flexibility Training. Polar's finer `MOBILITY_DYNAMIC`
and `MOBILITY_STATIC` source names are not collapsed into this type without a separate mapping decision.

`ActivityTypes.VideoGaming` has canonical stored value `Video Gaming` in `ActivityTypeGroups.UnspecifiedGroup`.
Explicit FIT sport `video_gaming` (`63`) preserves the type before sub-sport and profile fallbacks. `VideoGaming`,
`videoGaming`, `video_gaming`, `Gaming`, and `gaming` also resolve to this type, including native JSON. Garmin calls the
activity Gaming. FIT sub-sport `esport` (`77`) is shared with physical sports and does not establish Video Gaming on its
own: `cycling/esport` (`2/77`) retains Cycling. Video Gaming uses Unspecified's speed behavior and false indoor hint.

These IDs appear in [Garmin's official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js).
[Garmin's activity profiles](https://support.garmin.com/en-ZA/?faq=g9VOolzNBr08b7mfclmxt7) list Pool Apnea under Diving
and Mobility under Gym. [Garmin's activities manual](https://www8.garmin.com/manuals/webhelp/GUID-EECCAC99-90D6-4AB1-9A3A-EC433D3365E2/EN-US/GUID-00B74ABF-7DB4-4DC2-9CA5-9D2F12B65A10.html)
lists Gaming under Other. Sport and sub-sport IDs are separate namespaces: `racket/padel` (`64/85`) remains Padel,
`wheelchair_push_walk/indoor_wheelchair_walk` (`65/86`) remains Wheelchair Push Walk, and Diving sub-sport `63` does not
identify Video Gaming.

Video Gaming receives no library-calculated POWER, HR, pace, or MET TSS even when inputs or overrides are available.
Previously calculated TSS and its method are removed during summary generation. A finite source-provided TSS remains
available and is labeled `IMPORTED` when `preserveImportedTss` is true or omitted. With false, TSS and its method
stay unset. A legacy score without a method
retains the existing imported-score interpretation; its provenance cannot be recovered from the number alone.
Pool Apnea and Mobility retain their groups' existing TSS eligibility. None of these types has stroke-rate semantics
or a durability adapter. No numeric metric token, unit, schema, provider transport, delivery support, or Training formula
is added. Quantified Self's existing discipline policy resolves all three to volume-only Other training; formerly
Generic activities belonged to Fitness & Gym. Usable power curves remain isolated by exact canonical activity type.

Stored Generic or Unknown Sport labels cannot identify these activities. Reparse retained FIT `85`, `86`, or `63`
sources, or restore specific source names/profiles, then regenerate separately persisted event summaries, activity-type
aggregates, and affected Training snapshots. Recalculation is needed to clear identified calculated Video Gaming TSS;
source-imported scores remain preserved with the default or true setting. Saved routes need no reparse. Adopt the release in both the Quantified
Self application and Functions before persisting these types. Existing strict MCP activity-type discovery exposes
their names, groups, and indoor hints without new fields, scopes, tools, or planning mutations. Queue lifecycle, write
paths, and monitoring remain unchanged. Supported-activities Help uses the dynamic catalog and needs no enumerated
entry before adoption.

`ActivityTypes.Shooting` has canonical stored value `Shooting`, and `ActivityTypes.Geocaching` has canonical stored value
`Geocaching`, both in `ActivityTypeGroups.OutdoorAdventuresGroup`. Explicit FIT sports `shooting` (`56`) and `geocaching`
(`87`) retain these types before sub-sport and profile fallbacks, across manufacturers. Shooting remains distinct from
Archery and Hunting; Geocaching remains distinct from Hiking and Walking. Lowercase `shooting` and `geocaching` aliases
also restore their canonical values from native JSON.

`ActivityTypes.PlatformTennis` has canonical stored value `Platform Tennis` in `ActivityTypeGroups.TeamRacketGroup`,
distinct from Tennis, Padel, Pickleball, and Racquet Ball. FIT `sport=racket` (`64`) with `sub_sport=platform` (`93`)
imports as Platform Tennis before profile fallbacks. These IDs appear in Garmin's official FIT profile linked above;
[Garmin's activity profiles](https://support.garmin.com/en-ZA/?faq=g9VOolzNBr08b7mfclmxt7) use the Platform Tennis name.
Standalone `platform`, a generic session with sub-sport `93`, or a custom profile does not establish Platform Tennis.
Explicit `Platform Tennis`, `PlatformTennis`, `platformTennis`, and `platform_tennis` sport/profile names do establish it
across providers. Those aliases and `racket_platform` restore the same canonical value from native JSON. Other racket
sub-sports retain their existing types.

Shooting and Geocaching inherit Outdoor Adventures' existing movement threshold, speed/pace and vertical-speed
families, terrain behavior, and TSS selection; Platform Tennis inherits the corresponding Team/Racket speed behavior
without vertical-speed or grade-adjusted derivation. All three have a false indoor hint, which is a catalog grouping
and does not establish where an individual session was recorded. None has stroke-rate semantics or a durability
adapter. This adds no numeric metric, provider transport, workout-delivery support, Training formula, or modeled
Training family. Quantified Self's existing policy resolves the types to volume-only Other training; formerly Generic
activities belonged to Fitness & Gym, while Racquet Ball already belongs to Other training. Usable power curves stay
isolated by exact canonical activity type.

Stored Generic, Unknown Sport, and Racquet Ball labels cannot identify these sports on their own. Reparse retained FIT
`56`, `87`, and `64/93` sources, or restore specific source names/profiles when available, then regenerate separately
persisted event summaries, activity-type aggregates, and affected Training snapshots. Saved routes need no reparse.
Adopt the release in both the Quantified Self application and Functions before persisting the new types. The existing
strict MCP activity-type catalog discovers their names, groups, and indoor hints without new fields, scopes, tools, or
planning mutations. Queue lifecycle, write paths, and monitoring remain unchanged. Supported-activities Help links to
the dynamic catalog and needs no enumerated entry before adoption.

`ActivityTypes.DiscGolf` has the canonical stored value `Disc Golf` in `ActivityTypeGroups.TeamRacketGroup`, alongside
the separate Golf and Frisbee types. FIT `sport=disc_golf` (`69`) imports as Disc Golf across manufacturers, using
[Garmin's activity reference](https://developer.garmin.com/connect-iq/api-docs/Toybox/Activity.html). The explicit sport
takes precedence over sub-sport and profile fallbacks, including profiles named Golf or Frisbee. The aliases `DiscGolf`
and `disc_golf` resolve to the same canonical value. Explicit Frisbee golf names also resolve to Disc Golf:
[Polar's detailed sport catalog](https://www.polar.com/accesslink-api/#detailed-sport-info-values-in-exercise-entity)
uses `FRISBEEGOLF`, and [Suunto's mapping](https://aspartnercontent.blob.core.windows.net/apizone/docs/Activities.pdf)
calls App activity ID `66` Frisbee golf. Both providers document generic FIT exports for this activity; a generic sport
without a specific name or recognized profile remains Generic. A supplied `Frisbee golf` name is sufficient, while
plain `Frisbee` and `Golf` retain their own types. Disc Golf inherits Team/Racket's existing speed, movement,
indoor-status, and TSS behavior; it adds no durability adapter, numeric metric, or provider transport.

Native JSON preserves the canonical Disc Golf type and its explicit aliases. Stored Generic, Unknown Sport, Golf, or
Frisbee labels cannot identify a historical Disc Golf activity on their own. Reparse retained FIT sport `69` or restore
a specific source name/profile when available, then regenerate separately persisted summaries or activity-type
aggregates. Saved routes need no reparse. Quantified Self must upgrade the application and Functions together before
persisting Disc Golf; its existing MCP catalog can discover the canonical name, group, and indoor hint without new
fields, scopes, or tools. Queue lifecycle, write paths, monitoring, and Training algorithms remain unchanged.

`ActivityTypes.Lacrosse` has the canonical stored value `Lacrosse` in `ActivityTypeGroups.TeamRacketGroup`, alongside
Field Hockey and Rugby. FIT `sport=lacrosse` (`74`) imports as Lacrosse across manufacturers, using Garmin's activity
reference linked above. The explicit sport takes precedence over generic, Match, or Field sub-sports and user-defined
profile fallbacks. The aliases `lacrosse` and `LACROSSE` resolve to the same canonical value, including native JSON.
[Polar's FIT mapping](https://www.polar.com/accesslink-api/#sport-type-mapping-in-fit-files) documents Lacrosse as
Generic; a generic session needs an explicit Lacrosse sport/profile name to establish that classification. Other
generic sessions, Field Hockey, Ice Hockey, and Volleyball retain their existing rules.

Lacrosse inherits Team/Racket's speed, movement, indoor-status, and TSS behavior without adding a numeric metric,
durability adapter, or provider transport. Stored Generic or Unknown Sport labels cannot identify Lacrosse on their
own. Reparse retained FIT sport `74` or restore an explicit source name/profile when available, then regenerate
separately persisted summaries or activity-type aggregates. Saved routes need no reparse. Adopt the release in both
the Quantified Self application and Functions before persisting Lacrosse. Existing MCP activity-type discovery can
expose its name, group, and indoor hint through the current output schema; no new fields, scopes, or tools are added.
Queue lifecycle, writes, monitoring, and Training algorithms remain unchanged.

`ActivityTypes.WaterTubing` has the canonical stored value `Water Tubing` in `ActivityTypeGroups.WaterSportsGroup`,
distinct from Water Skiing, Wakeboarding, and Rafting. FIT `sport=water_tubing` (`76`) imports as Water Tubing across
manufacturers, using Garmin's activity reference linked above. The explicit sport takes precedence over sub-sport and
user-defined profile fallbacks. `WaterTubing` and `water_tubing` resolve to the same canonical value, including native
JSON. A generic FIT session needs an explicit Water Tubing profile; standalone `Tubing` and `water_sport` remain
ambiguous and do not establish this classification.

Water Tubing inherits Water Sports' speed/swim-pace metric family, movement threshold, and TSS selection. Like Water
Skiing and Wakeboarding, it does not derive ascent or descent from altitude streams; explicit source totals and raw
altitude streams remain available. It has no stroke-rate semantics or durability adapter. This adds no numeric metric,
provider transport, or workout-delivery support. Quantified Self's existing Training policy will classify the specific
type as volume-only Other training when adopted; a formerly Generic activity belonged to Fitness & Gym. No Training
formula or modeled family is added, and any usable power curves remain isolated by the exact canonical activity type.

Stored Generic or Unknown Sport labels cannot identify historical Water Tubing on their own. Reparse retained FIT sport
`76` or restore an explicit source name/profile when available, then regenerate separately persisted event summaries,
activity-type aggregates, and affected Training snapshots. Saved routes need no reparse. Adopt the release in both the
Quantified Self application and Functions before persisting Water Tubing. Existing MCP activity-type discovery can
expose its name, group, and indoor hint through the current strict output schema; no new fields, scopes, tools, or
planning mutations are added. Queue lifecycle, write paths, and monitoring remain unchanged. The app's supported-
activities help links to the dynamic catalog and needs no enumerated entry before adoption.

The following explicit FIT sports also preserve separate canonical activity types across manufacturers. The protocol
identifiers appear in [Garmin's official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js).

| Public activity type | Canonical stored value | FIT sport | Activity group |
| --- | --- | --- | --- |
| `ActivityTypes.Wakesurfing` | `Wakesurfing` | `wakesurfing` (`77`) | `ActivityTypeGroups.WaterSportsGroup` |
| `ActivityTypes.Archery` | `Archery` | `archery` (`79`) | `ActivityTypeGroups.OutdoorAdventuresGroup` |
| `ActivityTypes.MixedMartialArts` | `Mixed Martial Arts` | `mixed_martial_arts` (`80`) | `ActivityTypeGroups.IndoorSportsGroup` |

The explicit sport takes precedence over sub-sport and user-defined profile fallbacks. Wakesurfing remains distinct
from Surfing and Wakeboarding, Archery from Hunting, and Mixed Martial Arts from Boxing and generic Combat. Explicit
`wakesurfing`, `archery`, `MixedMartialArts`, `mixedMartialArts`, `mixed_martial_arts`, `MMA`, and `mma` aliases also
restore their canonical types from native JSON. A generic FIT session needs a specific recognized sport profile;
`water_sport`, plain `Martial Arts`, Shooting, or a custom profile does not establish one of these classifications.

These types use their existing groups' movement thresholds, speed metric families, and TSS selection. Wakesurfing
uses the Water Sports speed/swim-pace family and does not derive ascent or descent from altitude; source-provided
totals and raw altitude remain available. Archery inherits Outdoor Adventures' speed/pace and vertical-speed families
and retains terrain summaries. Mixed Martial Arts inherits Indoor Sports' speed family and indoor hint; that hint is
a catalog classification, not evidence that a particular session was recorded indoors. All three have no stroke-rate
semantics or durability adapter. No numeric metric, provider transport, or workout-delivery support is added.

Existing Generic and Unknown Sport labels cannot identify these activities on their own. Reparse retained FIT sports
`77`, `79`, and `80`, or restore specific source names/profiles when available, then regenerate separately persisted
event summaries, activity-type aggregates, and affected Training snapshots. Saved routes need no reparse. Adopt the
release in both the Quantified Self application and Functions before persisting the new types. Quantified Self's
existing Training policy resolves them to volume-only Other training; a formerly Generic activity belonged to
Fitness & Gym. No Training formula or modeled family is added, and usable power curves remain isolated by exact
canonical activity type. Existing MCP catalog discovery exposes each name, group, and indoor hint through its current
strict schema, without adding fields, scopes, tools, or planning mutations. Queue lifecycle, write paths, and monitoring
remain unchanged. Supported-activities Help links to the dynamic catalog and needs no enumerated entry before adoption.

`Field Hockey` belongs to `ActivityTypeGroups.TeamRacketGroup`, distinct from Ice Hockey. Suunto App activity ID
`113` uses FIT `generic/match` (`0/22`); this pair imports as `ActivityTypes.FieldHockey` only when the recording's
creator manufacturer is Suunto (`suunto` or FIT ID `23`), using the same creator precedence described below for
Wheel Chair. Other manufacturers and missing creator identity retain `Match`; `generic_match` remains its legacy
alias. The explicit names `Field Hockey`, `FieldHockey`, and `field_hockey` resolve to the new canonical type across
providers. [Polar's detailed sport catalog](https://www.polar.com/accesslink-api/#detailed-sport-info-values-in-exercise-entity)
also identifies Field Hockey as `FIELD_HOCKEY`; this named alias does not infer a Polar FIT tuple or add provider transport.

FIT `sport=hockey` (`73`) with `sub_sport=field` (`90`) also imports as the existing `ActivityTypes.FieldHockey` across
manufacturers. These identifiers appear in [Garmin's activity reference](https://developer.garmin.com/connect-iq/api-docs/Toybox/Activity.html).
The composite alias `hockey_field` resolves to the same canonical value. Standalone `hockey` or `field` does not establish
Field Hockey, and unrelated sports with the Field sub-sport retain their previous fallback behavior. This correction
reuses the existing Team/Racket group and canonical stored value; it adds no provider transport, metrics, or MCP contract.
Previously stored `Unknown Sport` values remain unchanged when restoring native JSON; reparse retained FIT sources to
recover the specific activity type and regenerate any separately persisted event summaries or activity-type aggregates.

FIT `sport=hockey` (`73`) with `sub_sport=ice` (`91`) imports as the existing `ActivityTypes.IceHockey` across manufacturers,
using the identifiers in Garmin's reference linked above. `Ice Hockey` remains in `ActivityTypeGroups.TeamRacketGroup`,
distinct from Field Hockey and Ice Skating. The composite alias `hockey_ice` resolves to its existing canonical stored
value. Standalone `hockey` or `ice` does not establish Ice Hockey; unrelated sports with the Ice sub-sport retain their
previous fallback behavior. This correction adds no provider transport, metrics, or MCP contract. As with Field Hockey,
restoring native JSON does not reclassify historical `Unknown Sport` values; reparse retained FIT sources and regenerate
separately persisted summaries or activity-type aggregates to correct those imports.

`Hand Cycle` remains in `ActivityTypeGroups.CyclingGroup`. FIT `sport=cycling` (`2`) with `sub_sport=hand_cycling`
(`12`) imports as the existing `ActivityTypes.Handcycle`; the composite alias `cycling_hand_cycling` resolves to
the same canonical value. Suunto documents this pair for App activity ID `109`. This mapping requires the Cycling
sport; its classification remains Hand Cycle regardless of the recording's manufacturer.

Suunto's Wheelchair sport (App activity ID `108`) uses FIT `generic/hand_cycling` (`0/12`) and imports as the existing
`ActivityTypes.Wheelchair`, whose canonical stored value is `Wheel Chair` in `ActivityTypeGroups.AdaptiveMobilityGroup`.
This provider-specific interpretation requires a Suunto creator manufacturer (`suunto` or FIT ID `23`). The importer
uses its existing creator identification: `file_id` takes precedence, with compatible creator/local `device_info`
filling missing identity. An unrelated sensor or a Suunto-looking device name does not establish that context.
Without a known Suunto creator, the pair keeps its existing fallback behavior; no global `generic_hand_cycling`
alias is added. The classification reuses Adaptive Mobility's movement behavior, excludes calculated TSS and durability
evidence, and preserves any source-reported TSS.

FIT `sport=wheelchair_push_walk` (`65`) and `sport=wheelchair_push_run` (`66`), documented in Garmin's activity reference
linked above, import as `ActivityTypes.WheelchairPushWalk` and `ActivityTypes.WheelchairPushRun` across manufacturers.
Their canonical values are `Wheelchair Push Walk` and `Wheelchair Push Run`, with explicit `WheelchairPushWalk`,
`wheelchair_push_walk`, `WheelchairPushRun`, and `wheelchair_push_run` aliases. Both belong to
`ActivityTypeGroups.AdaptiveMobilityGroup` alongside the general `Wheel Chair` type. Garmin distinguishes pushes at
walking speed from pushes at running speed
in its [wheelchair-mode manual](https://www8.garmin.com/manuals/webhelp/GUID-8C2C402F-55AC-431F-9CF2-1442B89CE149/EN-US/GUID-44F436A5-EB13-40E3-AD91-8D7B0D8E0317.html).
Classification uses the explicit source sport rather than inferring a mode from recorded speed. FIT sports `65` and `66`
take precedence over sub-sport and profile fallbacks, including a generic sub-sport or profiles named Walking, Running,
or the other wheelchair push mode. Their indoor wheelchair sub-sports (`86` and `87`) preserve the respective sport's
canonical push mode. Both types retain Adaptive Mobility's speed display, moving-speed threshold, and indoor-status
behavior.
Calculated TSS and durability remain excluded while source-reported TSS is preserved. Ordinary Walking, Running,
Hand Cycle, and the creator-qualified Suunto mapping keep their existing classification rules. No new numeric metric,
provider transport, or MCP schema or scope is added.

Stored `Unknown Sport`, `Generic`, `Walking`, or general `Wheel Chair` labels cannot establish the specific push mode
by themselves. Canonical native JSON `Wheel Chair` and `Wheelchair` remain general; JSON retaining the explicit
`wheelchair_push_walk` or `wheelchair_push_run` alias restores the respective push mode. Reparse retained FIT sources to
recover sports `65` and `66` from older general imports, then regenerate separately persisted summaries or activity-type
aggregates. Saved routes need no reparse. Quantified Self must adopt the release in both the application and Functions
before persisting these new
canonical values; use its existing source-backed, version-checked reparse lifecycle for any separately authorized
historical correction. Queue scheduling, retry, monitoring coverage, writes, and Training/durability algorithms are
unchanged by this library classification correction.

`Chores` is an explicit member of `ActivityTypeGroups.UnspecifiedGroup` and does not establish an indoor context.
Suunto App activity ID `119` uses FIT `generic/exercise` (`0/23`); the importer resolves this to `ActivityTypes.Chores`
only with a Suunto creator manufacturer, using the same identity precedence as Wheel Chair and Field Hockey.
Other manufacturers or missing creator identity retain `Generic`; the existing `generic_exercise` alias remains Generic.
The explicit names `Chores` and `chores` resolve to the canonical type across providers. No standalone `exercise`
alias is added, and Chores retains the Unspecified group's existing moving-speed and summary behavior.

`Cyclocross` belongs to `ActivityTypeGroups.CyclingGroup` and is distinct from Mountain Biking. FIT `sport=cycling`
(`2`) with `sub_sport=cyclocross` (`11`) imports as `Cyclocross`; `cyclocross` and `cycling_cyclocross` resolve to the
same canonical value. Suunto documents this pair for App activity ID `114`. The FIT mapping applies across
manufacturers; ordinary cycling and mountain biking retain their existing classifications.

`Gravel Cycling` belongs to `ActivityTypeGroups.CyclingGroup`. FIT `sport=cycling` (`2`) with
`sub_sport=gravel_cycling` (`46`) imports as `Gravel Cycling`, matching Suunto App activity ID `99`.
The aliases `GravelCycling`, `gravel_cycling`, and `cycling_gravel_cycling` resolve to that canonical value, as does
`GravelRide`, the sport name in [Strava's SportType catalog](https://developers.strava.com/docs/reference/#api-models-SportType).
Consumers must supply Strava's specific `sport_type` value; the broader `Ride` activity type remains Cycling.
The FIT mapping applies across manufacturers and retains the Cycling group's movement behavior. Ordinary road,
track, and mixed-surface cycling keep their existing classifications.

`E-Mountain Biking` belongs to `ActivityTypeGroups.MountainBikingGroup` and is distinct from E-Biking and Mountain
Biking. FIT `sport=e_biking` (`21`) with `sub_sport=e_bike_mountain` (`47`) imports as `E-Mountain Biking`, matching
Suunto App activity ID `106`. The aliases `EMountainBiking`, `e_mountain_biking`, `e_biking_e_bike_mountain`, and
`E-MTB` resolve to that canonical value, as does Strava's `EMountainBikeRide` sport name in the catalog linked above.
The composite FIT mapping applies across manufacturers and uses the Mountain Biking group's movement behavior.
Ordinary electric cycling, including FIT `e_biking/e_bike_fitness` (`21/28`) and the `EBikeRide` alias, remains E-Biking.

`Splitboarding` belongs to `ActivityTypeGroups.WinterSportsGroup` alongside Snowboarding and Backcountry Skiing.
FIT `sport=snowboarding` (`14`) with `sub_sport=backcountry` (`37`) imports as `Splitboarding`; `splitboarding` and
`snowboarding_backcountry` resolve to the same canonical value. Suunto documents this pair for App activity ID `110`.
This composite preserves the Snowboarding context. Alpine and cross-country backcountry sessions
retain their existing Backcountry Skiing classification, and ordinary snowboarding sessions remain Snowboarding.

`Ski Mountaineering` belongs to `ActivityTypeGroups.WinterSportsGroup` and is distinct from Ski Touring and Backcountry
Skiing. FIT `sport=mountaineering` (`16`) with `sub_sport=backcountry` (`37`) imports as `Ski Mountaineering`, matching
Suunto App activity ID `116`. The aliases `ski_mountaineering` and `mountaineering_backcountry` resolve to that value.
These FIT composites apply across manufacturers; Suunto documents the specific pair, while other providers can encode
related activities differently.

`Skate Skiing` belongs to `ActivityTypeGroups.WinterSportsGroup`. FIT `sport=cross_country_skiing` (`12`) with
`sub_sport=skate_skiing` (`42`) imports as `Skate Skiing`, matching Suunto App activity ID `117`. The aliases
`SkateSkiing`, `skate_skiing`, and `cross_country_skiing_skate_skiing` resolve to that canonical value. This FIT mapping
applies across manufacturers and retains the Winter Sports group's movement behavior. Generic cross-country records,
including Suunto's Classic skiing (`12/0`, App activity ID `118`), default to Crosscountry Skiing; a recognized sport
profile name can still identify a more specific activity. The broader `NordicSki` activity alias remains Nordic Skiing.

`Track and Field` remains the existing `ActivityTypes.TrackAndField` in `ActivityTypeGroups.PerformanceGroup`.
[Suunto's activity table](https://aspartnercontent.blob.core.windows.net/apizone/docs/Activities.pdf) encodes both
Track and Field (App ID `59`) and Track Running (App ID `103`) as FIT `running/track` (`1/4`).
An explicit `sport_profile_name` resolving to Track and Field disambiguates that pair before the existing
`running_track` alias. Canonical `Track and Field` and normalized `TrackAndField`, `track_and_field`, and
`TRACK-AND-FIELD` profile names are recognized across manufacturers.

`Track Running` belongs to `ActivityTypeGroups.RunningGroup` and retains the group's pace and moving-speed behavior.
The explicit names `Track Run`, `TrackRun`, `track_run`, `Track Running`, `TrackRunning`, and `track_running` resolve to
`ActivityTypes.TrackRunning` across providers. FIT `running/track` uses that type only when its profile explicitly
identifies Track Running; a generic Running session can also use a recognized profile through the existing fallback.
The pair alone or an absent/unrecognized profile retains Running. The standalone `track` name and `running_track`
alias do not establish Track Running, and no numeric provider activity IDs are added. Other specific FIT sport composites
retain their existing precedence over profile names. [Garmin's Track Run activity](https://www8.garmin.com/manuals/webhelp/GUID-EA668398-46E4-42E4-8163-12F6CB299F0E/EN-GB/GUID-979BE240-7591-41A8-858D-04B557B9DD2E.html)
is a running activity; manufacturer identity alone cannot disambiguate the shared Suunto pair.
Historical Running imports can be corrected only when their retained source includes a recognized Track Running name
or Track and Field profile; native JSON `Running` and `running_track` keep their existing values.

FIT `backcountry` is terrain context, not a standalone sport classification. For example,
[Polar's FIT mappings](https://www.polar.com/accesslink-api/#sport-type-mapping-in-fit-files) reuse it for running,
cycling, swimming, and orienteering. Where no recognized composite exists, the importer uses a recognized sport profile
or the parent sport: `running/backcountry`, `cycling/backcountry`, and `swimming/backcountry` retain Running, Cycling,
and Swimming respectively; `generic/backcountry` remains Generic. Missing or unknown parent sports do not establish
skiing. The legacy standalone activity alias `backcountry` remains readable in native JSON, but FIT sub-sport fallback
does not use it. The ambiguous FIT pairs cannot recover every provider's finer activity distinction.

Existing native JSON remains readable. Stored `Unknown Sport`, `Generic`, `Match`, `Walking`, `Running`, `Racquet Ball`, `Cycling`, `E-Biking`, `Mountain Biking`,
`Crosscountry Skiing`, and `Backcountry Skiing` activities cannot establish whether their sources were Meditation,
Padel, Field Hockey, Ice Hockey, Chores, Hand Cycle, Wheel Chair, Cyclocross, Gravel Cycling, E-Mountain Biking, Splitboarding,
Ski Mountaineering, Skate Skiing, Track Running, or Track and Field,
or another sport incorrectly classified by the old FIT `backcountry` fallback. Re-import or reparse retained original
FIT files or restore the specific provider sport name to correct historical classifications, then regenerate any
separately persisted event summaries and activity-type
aggregates. Saved routes need no reparse, and no new fields, numeric metrics, Training planning capabilities, or
durability adapters are added.

Quantified Self consumers must upgrade the application and Functions together before persisting `Meditation`, `Padel`, `Field Hockey`, `Chores`,
`Cyclocross`, `Gravel Cycling`, `E-Mountain Biking`, `Splitboarding`, `Ski Mountaineering`, `Skate Skiing`, `Track Running`,
`Wheelchair Push Walk`, `Wheelchair Push Run`, `Disc Golf`, `Lacrosse`, `Water Tubing`, `Wakesurfing`, `Archery`,
`Mixed Martial Arts`, `Jump Rope`, `Pickleball`, `Shooting`, `Geocaching`, `Platform Tennis`, `Pool Apnea`, `Mobility`,
`Video Gaming`, `Grinding`, `Indoor Grinding`, `Sail Racing`, `Rucking`, `Sailing Expedition`, `CCR Diving`,
`Indoor Hand Cycle`, `Overlanding`, `Trucker Workout`, `Indoor Wheelchair Push Walk`, `Indoor Wheelchair Push Run`,
`Obstacle Racing`, `Ultra Running`, `Indoor Walking`, `Rally`, `BMX`, `Indoor Skiing`, `ATV`, `Motocross`, `Pool Triathlon`,
`E-Enduro MTB`, `Track Cycling`, `Recumbent Cycling`, `Speed Walking`, `Whitewater Kayaking`, `Whitewater Rafting`,
`Wingsuit Flying`, `Brick Training`, `Hunting with Dogs`, `Hockey`, `Winter Sport`, `Team Sport`, `Water Sport`,
`Paramotoring`, or `RC Drone Flying`.
Its existing MCP activity-type discovery derives names, groups, and indoor status from Sports Lib, so the new values
fit the current read schemas and scopes without adding tools, permissions, or mutations. Review exhaustive catalog
and provider-mapping expectations during that upgrade; classification alone does not establish provider delivery support.
The Hand Cycle, Wheel Chair, and explicit Track and Field corrections reuse existing canonical activity types and groups
in that catalog, with no new MCP schemas or scopes.

```sh
npm install @sports-alliance/sports-lib @xmldom/xmldom
```

## Racket, para, disc, and workout names

The following source names and native-JSON aliases normalize across manufacturers:

| Imported name | Canonical type | Activity group |
| --- | --- | --- |
| Racket Sport / Racket Sports / racket | Racket Sport (new) | Team/Racket |
| Para Sport | Para Sport (new) | Unspecified |
| Ultimate Disc / Ultimate Frisbee | Ultimate Disc (new) | Team/Racket |
| AMRAP | HIIT | Indoor Sports |
| EMOM | HIIT | Indoor Sports |
| Tabata | HIIT | Indoor Sports |
| Dynamic Apnea | Pool Apnea | Diving |
| E-Bike Fitness | E-Biking | Cycling |
| Casual Walking | Walking | Walking |
| Bike Commute / Bike Commuting | Cycling | Cycling |

Space-separated, concatenated, and snake-case aliases resolve to the same values. The canonical new enum members are
`ActivityTypes.RacketSport`, `ActivityTypes.ParaSport`, and `ActivityTypes.UltimateDisc`. Ultimate Disc remains distinct
from Frisbee and Disc Golf. Broad Para Sport does not identify a particular discipline or establish Adaptive Mobility.

[Garmin's official FIT profile](https://github.com/garmin/fit-javascript-sdk/blob/main/src/profile.js) defines Racket
sport `64`, Para Sport `68`, HIIT/AMRAP `62/73`, HIIT/EMOM `62/74`, HIIT/Tabata `62/75`, E-Biking/E-Bike Fitness
`21/28`, Walking/Casual Walking `11/30`, Cycling/Commuting `2/48`, and Diving/Dynamic Apnea `53/121`. These explicit
pairs preserve their types before conflicting profile names. A matching parent is required; the workout-specific
sub-sport alone does not relabel a Generic or unrelated activity. Dynamic Apnea also retains Pool Apnea under sport
`85`. Garmin describes [AMRAP, EMOM, and Tabata as HIIT timer formats](https://www8.garmin.com/manuals/webhelp/GUID-25E3235D-44D2-4384-A591-DD1D71BEBCB1/EN-US/GUID-130DBE4C-91D2-43D1-A6B4-1DEF7958903F.html)
and [dynamic apnea as a Pool Apnea mode](https://www8.garmin.com/manuals/webhelp/GUID-EA4C028F-6CC0-4957-9BB2-20B2E5DAE9CD/EN-US/GUID-9F0D57E8-05F8-4122-8D5D-93141ADE8CAF.html).

Racket sub-sports retain Pickleball (`84`), Padel (`85`), Platform Tennis (`93`), Squash (`94`), Badminton (`95`),
Racquet Ball (`96`), and Table Tennis (`97`). With no recognized subtype, a precise Tennis or one of those racket
profile names can identify the sport. A conflicting non-racket profile retains Racket Sport. A recognized specific
Para Sport profile can identify its discipline; otherwise it retains Para Sport. Ultimate Disc requires an explicit
Ultimate Disc or Ultimate Frisbee name/profile. Under Racket or Team Sport, sub-sport `ultimate` (`92`) plus such a
profile identifies Ultimate Disc; `92` alone does not establish it. Plain Ultimate, Para, Commute, and Dynamic remain
ambiguous. Existing explicit Disc Golf stays Disc Golf even with a conflicting Ultimate profile.

Suunto's documented Badminton (`36`), Table tennis (`40`), Racquet ball (`41`), and Squash (`42`) exports all use bare
Racket sport `64`. Without a precise name/profile they now import as Racket Sport. A source-backed correction cannot
recover their particular racket sport from that numeric pair alone. Suunto Padel (`75`, `64/85`) remains Padel.

The three new types retain the existing speed family, movement threshold, false indoor hint, and ordinary TSS
eligibility of their groups. They add no stroke-rate conversion or durability adapter. The seven reused types keep
their existing calculations and hints; Dynamic Apnea inherits Diving's terrain-summary exclusions. Every sport
preserves finite imported TSS, including zero, with `preserveImportedTss: true` or omission. False discards the score
and method, recalculates where supported with sufficient inputs, and leaves both unset otherwise.

Quantified Self's current Training registry resolves the three new types and Pool Apnea to volume-only Other training;
HIIT aliases reuse Fitness/Gym conditioning, E-Biking and Cycling reuse Cycling, and Casual Walking reuses Walking.
The latter aliases retain existing recorded-load policies and applicable library durability adapters. Adopt the
library in the application and Functions together. Correct historical Generic, Racquet Ball, or Diving labels only
from retained source classifications or explicit names, then regenerate event summaries, activity-type aggregates,
applicable durability evidence, and Training snapshots through the existing source-backed reparse ingress. Stored
canonical Racquet Ball remains Racquet Ball; only the broad `racket` alias changes to Racket Sport. Saved routes need
no reparse, and no global reparse follows from these mappings.

The existing strict MCP activity catalog accepts all 196 types without new fields, scopes, consent, or mutations.
No numeric metric, unit, Training formula, derived schema, planning or delivery capability, provider transport, write
path, queue lifecycle, or monitoring changes. Supported-activities Help continues to use the installed dynamic catalog.

## Garmin activity-profile names

[Garmin's activity list](https://www8.garmin.com/manuals/webhelp/GUID-C144B465-A0C8-4FE9-AFE6-41A3FE3F1D9A/EN-US/GUID-4906F77A-0B26-48F9-A4DB-72752E06532D.html)
uses short names that normalize to these existing canonical types:

| Source name | Canonical type | Existing activity group |
| --- | --- | --- |
| Bike Indoor | Indoor Cycling | Cycling |
| Bike Tour / Road Bike / Bike | Cycling | Cycling |
| Gravel Bike | Gravel Cycling | Cycling |
| MTB | Mountain Biking | Mountain Biking |
| Climb Indoor | Indoor Climbing | Outdoor Adventures |
| Row Indoor | Indoor Rowing | Indoor Sports |
| XC Classic Ski | Crosscountry Skiing | Winter Sports |
| XC Skate Ski | Skate Skiing | Winter Sports |
| Pool Swim | Swimming | Swimming |
| eBike | E-Biking | Cycling |
| Cardio | Cardio Training | Indoor Sports |
| Floor Climb | Floor Climbing | Outdoor Adventures |
| Strength | Strength Training | Indoor Sports |
| Fish | Fishing | Outdoor Adventures |
| Horseback | Horseback Riding | Outdoor Adventures |
| Hunt | Hunting | Outdoor Adventures |
| Kayak | Kayaking | Water Sports |
| Row | Rowing | Water Sports |

All twenty names resolve through `ActivityTypesHelper.resolveActivityType`, native JSON hydration, and existing FIT
sport/profile-name fallback. Lookup tolerates capitalization, spaces, hyphens, and underscores; multiword enum aliases
also expose concatenated and snake-case spellings. FIT's `sport_profile_name` must actually contain a recognized name
for profile fallback to apply. An arbitrary activity title is not that field. These aliases do not change numeric
FIT parent/sub-sport rules or override an existing specific classification before profile fallback. The shared `eBike`
alias also recognizes Polar's `E_BIKE` identifier without provider transport changes.

This twenty-alias batch kept the unique catalog at 196 types before the provider expansion below. Each alias inherits its canonical type's group, indoor hint, metric families,
stroke-rate semantics, terrain behavior, calculated-TSS eligibility, and applicable durability adapter. In particular,
Pool Swim, Kayak, Row, and Row Indoor use existing stroke-rate semantics. Every type retains imported TSS exactly,
including zero, with `preserveImportedTss: true` or omission; false discards it and calculates a replacement only when
the existing sport policy and available inputs support one.

Quantified Self retains the same exact Training contexts for the canonical types. Historical Generic classifications
can enter a different existing context after a source-backed correction, so regenerate separately persisted event
summaries, activity-type aggregates, applicable durability evidence, and Training snapshots. Native JSON can recover
an explicit alias but cannot identify a sport from an already collapsed Generic value. Adopt the library in application
and Functions together before persisting the corrections; a separately approved targeted reparse needs a retained
source name/profile. Saved routes need no reparse. No new canonical sport, numeric metric, unit, formula, derived
schema, MCP field/scope/consent/mutation, planning or delivery capability, provider transport, write path, queue
lifecycle, or monitoring change is introduced. The dynamic supported-activities Help remains accurate.

## Garmin, Polar and Strava provider names

The remaining provider-name batch maps 143 source entries (13 Garmin, 123 Polar, and 7 Strava) to 92 existing-type
entries and 51 entries introducing 46 distinct canonical types. The unique catalog grows from 196 to 242. These
classifications use [Garmin's activity list](https://www8.garmin.com/manuals/webhelp/GUID-C144B465-A0C8-4FE9-AFE6-41A3FE3F1D9A/EN-US/GUID-4906F77A-0B26-48F9-A4DB-72752E06532D.html),
[Polar's detailed sport identifiers](https://www.polar.com/accesslink-api/#detailed-sport-info-values-in-exercise-entity),
and [Strava's SportType values](https://developers.strava.com/docs/reference/#api-models-SportType).

Pass source context for names whose meaning depends on the provider:

```ts
import { ActivityTypesHelper, type ActivityTypeSource } from '@sports-alliance/sports-lib';

const source: ActivityTypeSource = 'polar';
ActivityTypesHelper.resolveActivityType('MOTORSPORTS_ENDURO', source); // Motorcycle Enduro
ActivityTypesHelper.resolveActivityType('Enduro', source); // Motorcycle Enduro
ActivityTypesHelper.resolveActivityType('Enduro MTB'); // Enduro MTB
ActivityTypesHelper.resolveActivityType('Ski', 'garmin'); // Alpine Skiing
ActivityTypesHelper.resolveActivityType('Skiing', 'polar'); // Crosscountry Skiing
```

Ambiguous bare names require source context: Ski, Skiing, Agility, Aquatics, Core, Esports, Jazz, Latin, Modern, Show,
Street, Enduro, Road racing, Riding, Gravel, Ultimate, and Roller skating. Distinct API identifiers and unambiguous
profile names also resolve without context. Native activity JSON obtains source context from the recorded
`creator.manufacturer`; an arbitrary creator/device name or activity title does not establish that context. FIT
obtains it from the recorded manufacturer enum/name, then uses the actual `sport_profile_name` field.

Polar's [FIT mapping appendix](https://www.polar.com/accesslink-api/#sport-type-mapping-in-fit-files) explains broad
exports such as Sled hockey as Hockey, Wheelchair tennis as Tennis, MTB orienteering as Cycling/Backcountry, and
Mobility as Generic/Flexibility training. A recognized Polar profile refines its documented parent/sub-sport pair;
an unspecified Generic/Generic pair can use the recognized profile too. Specific incompatible FIT pairs keep their
classification. Numeric identifiers are decoded exclusively through the maintained `fit-file-parser/profile` API.
Garmin and Strava name mappings do not claim undocumented device export codes.

Snorkel requires the explicit recorded profile name to establish Snorkeling. A broad Garmin Diving/Generic session
with that profile can resolve to Snorkeling; unnamed diving, single/multi-gas and gauge scuba, and apnea classifications
retain their existing behavior. Explicit Garmin `Breathwork` and the documented French `Ex. respiration` profile
resolve separately from Meditation for Generic/Breathing (`0/62`) and Training/Breathing (`10/62`).
[Garmin's French manual](https://www8.garmin.com/manuals/webhelp/GUID-EA4C028F-6CC0-4957-9BB2-20B2E5DAE9CD/FR-FR/GUID-4622151F-22ED-4580-A080-23534EFE0C43.html)
and a public Garmin recording establish that localization and Training parent. An unnamed breathing pair retains Meditation,
and unrelated parents retain their existing classification. Backcountry Snowboard preserves Backcountry Snowboarding
separately from the existing Splitboarding mapping. Polar Esports means Video Gaming; the FIT `esport` sub-sport alone
retains its existing sport-dependent behavior. Polar's [Road racing description](https://www.polar.com/blog/new-polar-sports-profiles/)
identifies race cars, so its MOTORSPORTS_ROADRACING identifier shares Car Racing. Polar Trotting remains its distinct
equine profile and does not infer human running or exertion.

Polar's FIT appendix also uses display names that differ from its detailed API names. Both spellings resolve to the
same approved canonical types:

| FIT profile spelling | Canonical type |
| --- | --- |
| `(Duathlon) Cycling`, `(Triathlon) Cycling` | Cycling |
| `(Duathlon) Running`, `(Triathlon) Running` | Running |
| `(Off-road duathlon) Mountain biking`, `(Off-road triathlon) Mountain biking` | Mountain Biking |
| `(Off-road duathlon) Trail running`, `(Off-road triathlon) Trail running` | Trail Running |
| `(Off-road triathlon) Open water swimming`, `(Triathlon) Open water swimming` | Open Water Swimming |
| `LES MILLS CORE` | Core Training |
| `LES MILLS THE TRIP` | Indoor Cycling |
| `Shooting sport (indoor)` | Indoor Shooting |
| `Shooting sport (outdoor)` | Shooting |

[Les Mills documents the CXWORX-to-CORE rename](https://www.lesmills.com/nl/articles/cxworx-is-now-les-mills-core).
Explicit Polar `CROSS_TRAINER`/`Cross-trainer` profiles refine Training/Indoor Running (`10/45`) to Crosstrainer;
`STRETCHING`/`Stretching` profiles refine Generic/Flexibility Training (`0/19`) to Stretching. Without those names,
existing broad classifications remain. Suunto Training/Flexibility Training remains Flexibility Training.
These refinements require Polar manufacturer identity and a compatible parent/sub-sport pair.

`Australian Football`, `Korfball`, and `Netball` are separate canonical types in `ActivityTypeGroups.TeamRacketGroup`.
Polar's FIT appendix lists these display names with Generic/Generic exports; no native FIT sport ID or undocumented
AccessLink API identifier is assigned. An unnamed Generic recording retains Generic. Australian Football remains
distinct from American Football and Soccer; Korfball and Netball remain distinct from Basketball. Explicit names
also restore the same canonical types from native JSON. They retain the group's existing metric and TSS policies,
a false indoor hint, ordinary cadence semantics, and no durability adapter. Quantified Self's current Training registry
resolves each to volume-only Other training with omitted distance. The local catalog now contains 245 types.

The compatibility fixtures contain documented names and synthetic FIT bytes. Temporary public FIT samples stay
outside the repository because redistribution rights were not established. The downloaded Polar and Suunto files
omit `sport_profile_name`, so they establish decoding and broad sport behavior; the documented profile refinements
are verified synthetically. Historical broad labels require retained explicit profiles/original files to recover
these distinctions, followed by the ordinary consumer summary and Training rebuild. Saved routes need no reparse.

| Provider | API identifier / profile name | Canonical type | Activity group |
| --- | --- | --- | --- |
| Garmin | Trail Run | Trail Running | Trail Running |
| Garmin | Mixed Session | Multisport | Performance |
| Garmin | Expedition | Expedition | Outdoor Adventures |
| Garmin | Backcountry Snowboard | Backcountry Snowboarding | Winter Sports |
| Garmin | Ski | Alpine Skiing | Winter Sports |
| Garmin | Snowmobile | Snowmobiling | Motorized Sports |
| Garmin | Sail | Sailing | Water Sports |
| Garmin | Snorkel | Snorkeling | Diving |
| Garmin | SUP | Stand Up Paddling | Water Sports |
| Garmin | Soccer/Football | Soccer | Team/Racket Sports |
| Garmin | Motorcycle | Motorcycling | Motorized Sports |
| Garmin | Breathwork | Breathwork | Indoor Sports |
| Garmin | Track Me | Generic | Unspecified |
| Polar | Australian football | Australian Football | Team/Racket |
| Polar | Korfball | Korfball | Team/Racket |
| Polar | Netball | Netball | Team/Racket |
| Polar | AGILITY / Dog agility | Dog Agility | Outdoor Adventures |
| Polar | AQUATICS / Aqua fitness | Aqua Fitness | Water Sports |
| Polar | BALLET_DANCING / Ballet | Dancing | Indoor Sports |
| Polar | BALLROOM_DANCING / Ballroom | Dancing | Indoor Sports |
| Polar | BEACH_TENNIS / Beach tennis | Beach Tennis | Team/Racket Sports |
| Polar | BEACH_VOLLEYBALL / Beach volley | Beach Volleyball | Team/Racket Sports |
| Polar | BIATHLON / Biathlon | Biathlon | Winter Sports |
| Polar | BODY_AND_MIND / Body&Mind | Mind-Body Training | Indoor Sports |
| Polar | BOOTCAMP / Bootcamp | Bootcamp | Indoor Sports |
| Polar | CALISTHENICS / Calisthenics | Calisthenics | Indoor Sports |
| Polar | CORE / Core | Core Training | Indoor Sports |
| Polar | CROSS_COUNTRY_RUNNING / Cross-country running | Crosscountry Running | Running |
| Polar | CROSS-COUNTRY_SKIING / Skiing | Crosscountry Skiing | Winter Sports |
| Polar | CURLING / Curling | Curling | Winter Sports |
| Polar | DUATHLON_CYCLING / Cycling | Cycling | Cycling |
| Polar | DUATHLON_RUNNING / Running | Running | Running |
| Polar | E_BIKE / Electric biking | E-Biking | Cycling |
| Polar | ESPORTS / Esports | Video Gaming | Unspecified |
| Polar | FINNISH_BASEBALL / Finnish baseball | Finnish Baseball | Team/Racket Sports |
| Polar | FITNESS_BOXING / Fitness boxing | Boxing | Indoor Sports |
| Polar | FITNESS_DANCING / Fitness dancing | Dancing | Indoor Sports |
| Polar | FITNESS_MARTIAL_ARTS / Fitness martial arts | Combat | Indoor Sports |
| Polar | FITNESS_RACING / Fitness Racing | Fitness Racing | Performance |
| Polar | FITNESS_STEP / Step workout | Step Training | Indoor Sports |
| Polar | FREE_MULTISPORT / Multisport | Multisport | Performance |
| Polar | FUNCTIONAL_TRAINING / Functional training | Functional Training | Indoor Sports |
| Polar | FUTSAL / Futsal | Futsal | Team/Racket Sports |
| Polar | GRAVEL / Gravel cycling | Gravel Cycling | Cycling |
| Polar | GROUP_EXERCISE / Group exercise | Indoor Training | Indoor Sports |
| Polar | GYMNASTICK / Gymnastics | Gymnastics | Indoor Sports |
| Polar | HIIT / High-intensity interval training | HIIT | Indoor Sports |
| Polar | JAZZ_DANCING / Jazz | Dancing | Indoor Sports |
| Polar | JOGGING / Jogging | Running | Running |
| Polar | JUDO_MARTIAL_ARTS / Judo | Judo | Indoor Sports |
| Polar | JUMP_ROPE / Rope skipping | Jump Rope | Indoor Sports |
| Polar | KICKBIKE / Kickbiking | Kickbiking | Cycling |
| Polar | KICKBOXING_MARTIAL_ARTS / Kickboxing | Kickboxing | Indoor Sports |
| Polar | LATIN_DANCING / Latin | Dancing | Indoor Sports |
| Polar | LES_MILLS_BARRE / LES MILLS BARRE | Barre | Indoor Sports |
| Polar | LES_MILLS_BODYATTACK / LES MILLS BODYATTACK | Cardio Training | Indoor Sports |
| Polar | LES_MILLS_BODYBALANCE / LES MILLS BODYBALANCE | Mind-Body Training | Indoor Sports |
| Polar | LES_MILLS_BODYCOMBAT / LES MILLS BODYCOMBAT | Combat | Indoor Sports |
| Polar | LES_MILLS_BODYJAM / LES MILLS BODYJAM | Dancing | Indoor Sports |
| Polar | LES_MILLS_BODYPUMP / LES MILLS BODYPUMP | Weight Training | Indoor Sports |
| Polar | LES_MILLS_BODYSTEP / LES MILLS BODYSTEP | Step Training | Indoor Sports |
| Polar | LES_MILLS_CXWORKS / LES MILLS CXWORX | Core Training | Indoor Sports |
| Polar | LES_MILLS_GRIT_ATHLETIC / LES MILLS GRIT Athletic | HIIT | Indoor Sports |
| Polar | LES_MILLS_GRIT_CARDIO / LES MILLS GRIT Cardio | HIIT | Indoor Sports |
| Polar | LES_MILLS_GRIT_STRENGTH / LES MILLS GRIT Strength | HIIT | Indoor Sports |
| Polar | LES_MILLS_RPM / LES MILLS RPM | Indoor Cycling | Cycling |
| Polar | LES_MILLS_SHBAM / LES MILLS SH'BAM | Dancing | Indoor Sports |
| Polar | LES_MILLS_SPRINT / LES MILLS SPRINT | Indoor Cycling | Cycling |
| Polar | LES_MILLS_TONE / LES MILLS TONE | Indoor Training | Indoor Sports |
| Polar | LES_MILLS_TRIP / LES MILLS TRIP | Indoor Cycling | Cycling |
| Polar | MOBILITY_DYNAMIC / Mobility (dynamic) | Mobility | Indoor Sports |
| Polar | MOBILITY_STATIC / Mobility (static) | Mobility | Indoor Sports |
| Polar | MODERN_DANCING / Modern | Dancing | Indoor Sports |
| Polar | MOTORSPORTS_CAR_RACING / Car racing | Car Racing | Motorized Sports |
| Polar | MOTORSPORTS_ENDURO / Enduro | Motorcycle Enduro | Motorized Sports |
| Polar | MOTORSPORTS_HARD_ENDURO / Hard Enduro | Hard Enduro | Motorized Sports |
| Polar | MOTORSPORTS_MOTOCROSS / Motocorss | Motocross | Motorized Sports |
| Polar | MOTORSPORTS_ROADRACING / Road racing | Car Racing | Motorized Sports |
| Polar | MOTORSPORTS_SNOCROSS / Snocross | Snocross | Motorized Sports |
| Polar | OBSTACLE_COURSE_RACING / Obstacle course racing | Obstacle Racing | Running |
| Polar | OFFROADDUATHLON / Off-road duathlon | Offroad Duathlon | Performance |
| Polar | OFFROADDUATHLON_CYCLING / Mountain biking | Mountain Biking | Mountain Biking |
| Polar | OFFROADDUATHLON_RUNNING / Trail running | Trail Running | Trail Running |
| Polar | OFFROADTRIATHLON / Off-road triathlon | Offroad Triathlon | Performance |
| Polar | OFFROADTRIATHLON_CYCLING / Mountain biking | Mountain Biking | Mountain Biking |
| Polar | OFFROADTRIATHLON_RUNNING / Trail running | Trail Running | Trail Running |
| Polar | OFFROADTRIATHLON_SWIMMING / Open water swimming | Open Water Swimming | Swimming |
| Polar | ORIENTEERING_MTB / Mountain bike orienteering | Mountain Bike Orienteering | Mountain Biking |
| Polar | ORIENTEERING_SKI / Ski orienteering | Ski Orienteering | Winter Sports |
| Polar | OTHER_INDOOR / Other indoor | Indoor Training | Indoor Sports |
| Polar | OTHER_OUTDOOR / Other outdoor | Other | Unspecified |
| Polar | PADEL / Padel racing | Padel | Team/Racket Sports |
| Polar | PARASPORTS_HAND_CYCLING / Handcycling | Hand Cycle | Cycling |
| Polar | PARASPORTS_SLED_HOCKEY / Sled hockey | Sled Hockey | Team/Racket Sports |
| Polar | PARASPORTS_WATER_SKIING / Adaptive water skiing | Adaptive Water Skiing | Water Sports |
| Polar | PARASPORTS_WHEELCHAIR / Wheelchair racing | Wheelchair Racing | Adaptive Mobility |
| Polar | PARASPORTS_WHEELCHAIR_BASKETBALL / Wheelchair basketball | Wheelchair Basketball | Team/Racket Sports |
| Polar | PARASPORTS_WHEELCHAIR_TENNIS / Wheelchair tennis | Wheelchair Tennis | Team/Racket Sports |
| Polar | POOL_SWIMMING / Pool swimming | Swimming | Swimming |
| Polar | RIDING / Riding | Horseback Riding | Outdoor Adventures |
| Polar | RINGETTE / Ringette | Ringette | Team/Racket Sports |
| Polar | ROAD_BIKING / Road cycling | Cycling | Cycling |
| Polar | ROAD_RUNNING / Road running | Running | Running |
| Polar | ROLLER_BLADING / Roller skating | Inline Skating | Skating |
| Polar | ROLLER_SKIING_CLASSIC / Classic roller skiing | Classic Roller Skiing | Performance |
| Polar | ROLLER_SKIING_FREESTYLE / Freestyle roller skiing | Skate Roller Skiing | Performance |
| Polar | SHOW_DANCING / Show | Dancing | Indoor Sports |
| Polar | SHOOTING_SPORT_INDOOR / Shooting (indoor) | Indoor Shooting | Indoor Sports |
| Polar | SHOOTING_SPORT_OUTDOOR / Shooting (outdoor) | Shooting | Outdoor Adventures |
| Polar | SKATEBOARDING / Skateboarding | Skateboarding | Skating |
| Polar | SKIERG / Ski machine | Indoor Skiing | Indoor Sports |
| Polar | SNOWSHOE_TREKKING / Snowshoe trekking | Snowshoeing | Winter Sports |
| Polar | SPINNING / Spinning | Indoor Cycling | Cycling |
| Polar | SUP | Stand Up Paddling | Water Sports |
| Polar | STAIR_WORKOUT / Stair workout | Floor Climbing | Outdoor Adventures |
| Polar | STREET_DANCING / Street | Dancing | Indoor Sports |
| Polar | TAEKWONDO_MARTIAL_ARTS / Taekwondo | Taekwondo | Indoor Sports |
| Polar | TRACK_AND_FIELD_RUNNING / Track&field running | Track Running | Running |
| Polar | TREADMILL_RUNNING / Treadmill running | Treadmill | Running |
| Polar | TRIATHLON_CYCLING / Cycling | Cycling | Cycling |
| Polar | TRIATHLON_RUNNING / Running | Running | Running |
| Polar | TRIATHLON_SWIMMING / Open water swimming | Open Water Swimming | Swimming |
| Polar | TROTTING / Trotting | Trotting | Outdoor Adventures |
| Polar | ULTIMATE / Ultimate | Ultimate Disc | Team/Racket Sports |
| Polar | ULTRARUNNING_RUNNING / Ultra running | Ultra Running | Running |
| Polar | VERTICALSPORTS_WALLCLIMBING / Climbing (indoor) | Indoor Climbing | Outdoor Adventures |
| Polar | VERTICALSPORTS_OUTCLIMBING / Climbing (outdoor) | Rock Climbing | Outdoor Adventures |
| Polar | WATER_EXERCISE / Water sports | Water Sport | Water Sports |
| Polar | WATER_RUNNING / Water running | Water Running | Water Sports |
| Polar | WATERSPORTS_CANOEING / Canoeing | Canoeing | Water Sports |
| Polar | WATERSPORTS_KAYAKING / Kayaking | Kayaking | Water Sports |
| Polar | WATERSPORTS_KITESURFING / Kitesurfing | Kitesurfing | Water Sports |
| Polar | WATERSPORTS_SAILING / Sailing | Sailing | Water Sports |
| Polar | WATERSPORTS_SURFING / Surfing | Surfing | Water Sports |
| Polar | WATERSPORTS_WAKEBOARDING / Wakeboarding | Wakeboarding | Water Sports |
| Polar | WATERSPORTS_WATERSKI / Water skiing | Water Skiing | Water Sports |
| Polar | WATERSPORTS_WINDSURFING / Windsurfing | Windsurfing | Water Sports |
| Polar | XC_SKIING_CLASSIC / Classic XC skiing | Crosscountry Skiing | Winter Sports |
| Polar | XC_SKIING_FREESTYLE / Freestyle XC skiing | Skate Skiing | Winter Sports |
| Strava | HighIntensityIntervalTraining | HIIT | Indoor Sports |
| Strava | MountainBikeRide | Mountain Biking | Mountain Biking |
| Strava | PhysicalTherapy | Physical Therapy | Indoor Sports |
| Strava | Sail | Sailing | Water Sports |
| Strava | Skateboard | Skateboarding | Skating |
| Strava | TrailRun | Trail Running | Trail Running |
| Strava | VirtualRow | Virtual Rowing | Indoor Sports |

Virtual Rowing belongs to Indoor Sports and shares rowing stroke-rate and trainer semantics. Aqua Fitness, Adaptive
Water Skiing, and Water Running follow the water-sport ascent/descent exclusions. New Motorized and Adaptive Mobility
types share their groups' existing calculated-TSS exclusions. Every sport keeps finite provider TSS, including zero
and legacy scores without a method, with `preserveImportedTss: true` or omission. With false, the score and method are
discarded, and the existing policy calculates a replacement only where supported with sufficient inputs. This batch
adds no MET coefficients, numeric metric tokens, units, or formulas.

Quantified Self's exact Training discipline registry remains independent of library groups. Existing targets retain
their canonical contexts and durability behavior. Newly introduced canonical types currently fall back to volume-only
Other training with omitted distance; library group membership does not add a modeled Training discipline, planning
capability, or provider delivery support. Within Sports Lib, Crosscountry Running inherits the running-speed durability
adapter, while Kickbiking and Mountain Bike Orienteering inherit cycling-power; the other 43 new types have no library
durability adapter. Training still requires its independent capability registry before using any of that evidence. Adoption of these types must review that behavior separately. The existing
strict MCP activity catalog accepts the new canonical values without new fields, scopes, consent, or mutations.

Adopt the package in the application and Functions together before persisting corrections. A separately approved
targeted source-backed reparse can correct historical broad/Generic classifications only where the original file or
explicit source identifier/profile retains enough detail. Regenerate affected event summaries, activity-type aggregates,
applicable durability evidence, and Training snapshots through the existing ingress. Saved routes need no reparse.
This classification batch does not add provider transport, persisted write paths, queue lifecycle, or monitoring changes.

## GPX

```ts
import { SportsLib } from '@sports-alliance/sports-lib';
import { DOMParser } from '@xmldom/xmldom';

const event = await SportsLib.importFromGPX(gpxText, DOMParser);
const activity = event.getFirstActivity();

const distanceMetres = activity.getDistance().getValue();
const heartRate = activity.getStreamData('Heart Rate');
```

## TCX and FIT

```ts
import { SportsLib } from '@sports-alliance/sports-lib';
import { DOMParser } from '@xmldom/xmldom';

const tcxDocument = new DOMParser().parseFromString(tcxText, 'application/xml');
const tcxEvent = await SportsLib.importFromTCX(tcxDocument);

const fitEvent = await SportsLib.importFromFit(fitArrayBuffer);
```

### FIT workout references

Read optional source references independently of activity imports:

```ts
import { readFITWorkoutReferences, DataSuuntoPlusGuideReferences } from '@sports-alliance/sports-lib';

const result = readFITWorkoutReferences(fitArrayBuffer); // also accepts Uint8Array / Node Buffer views
if (result.status !== 'invalid') {
  const pairs = result.suuntoGuides.getValue().references;
  const stored = JSON.parse(JSON.stringify(result.suuntoGuides.toJSON()));
  const restored = DataSuuntoPlusGuideReferences.fromJSON(stored);
}
```

`trainingFiles`, `workouts` and `suuntoGuides` are respectively `DataFITTrainingFileReferences`,
`DataFITWorkoutDefinitions` and `DataSuuntoPlusGuideReferences`. Every class has validated construction and `setValue`,
defensive-copy getters, canonical `toJSON()` and strict static `fromJSON(unknown)`. JSON envelopes use the canonical
type as their only key; values contain only an ordered `references` or `definitions` array, with no schema-version
field. Unknown fields, invalid numbers and malformed strings are rejected rather than silently normalized.
Validation snapshots array members without invoking caller-provided array methods, and stores the same scalar values
it validates. A rejected `setValue()` leaves the previous value intact.

Training-file references retain FIT message 72 fields: `type`, `manufacturer`, `product`, `serialNumber`,
`timeCreatedUnixMs` and `timestampUnixMs`. The serial is native uint32z: zero is missing, while 4294967295 is valid.
Workout definitions retain message 26 `name`, `sport`, `subSport` and `numValidSteps`, not full recipes. Native enums
remain numeric FIT codes; timestamps are UTC Unix milliseconds. Missing source fields are absent, not inferred.
Both lists remain file-scoped. `sessions` separately records zero-based source order, start/end timestamps and native
sport/sub-sport. Malformed optional fields are omitted individually with diagnostics, preserving other valid context
and independently valid Guide pairs in that session; an index-only entry is retained if no context is usable. Do not blindly equate a
session ordinal with a consumer activity ID or assign every file reference to every session.

Suunto Guide pairs preserve `sessionIndex`, `developerDataIndex`, `applicationId`, `ownerId` and `externalId`.
The owner is an OAuth client ID, not the Guide owner's display name. The reader resolves developer field descriptions
and preserves NUL-separated positional arrays, grouping strictly within one session and developer index. It accepts
`SuuntoFitExport1` and `SuuntoplusFitExt`, both identified in Suunto's decoder example. Developer indexes and field
numbers are resolved from each file, not hard-coded. Different indexes, field numbers, Guide identifiers or unrelated
SuuntoPlus apps do not require a library update. Changed Guide semantics or a new metadata exporter require reviewed
support; arbitrary field names or app IDs do not establish Guide usage.

`wahooWorkouts` is a plain, ordered `FITWahooWorkoutReference[]`, not a `Data*` class. It reads only the observed
`wahoo-app-plan-v1` layout from native manufacturer message 65285 in a file with exactly one `file_id` identifying a
Wahoo (manufacturer 32) recorded activity (type 4). Its field 3 byte payload must have the exact `35 00 05` header,
bounded positive-decimal Plan ID, terminators and fixed-length tail; envelope fields 0–2 must have the observed types
and lengths. The payload's scheduled Workout ID is little-endian independently of the FIT definition architecture.
The explicit `0xffffffff` sentinel becomes `workoutId: null`; a zero ID is invalid. `startTimeUnixMs` retains the
source metadata's recording start, not the planned date. The opaque final four bytes are deliberately not returned
or assigned a meaning. Other private messages are ignored; the reader never searches arbitrary bytes or titles for IDs.

This layout is an empirical compatibility contract, reproduced in synthetic tests from multiple authorized QA
recordings, **not a published Wahoo binary specification**. `invalid_wahoo_reference` identifies malformed recognized
records; `unsupported_wahoo_reference` identifies unknown reference-layout headers or an absent/conflicting Wahoo
activity-file identity. Either rejects the entire Wahoo reference group, including earlier apparently valid entries,
while preserving independent native and Suunto evidence. Duplicate and conflicting valid observations are returned,
not silently deduplicated or matched. All references are file-scoped: consumers must separately establish the recorded
session, trusted source provenance, exact owned provider delivery and ambiguity policy. A null scheduled Workout ID
does not justify title/date/duration matching or account-wide Plan ID matching.

Restore an explicitly authorized metadata snapshot with the strict codec; unknown fields, unsupported formats,
out-of-range values and incomplete/sparse arrays are rejected. Array bounds, object keys and scalar fields are
snapshotted once, so validation and copying use the same values even for inputs with accessors or proxies:

```ts
import { parseFITWahooWorkoutReferences, readFITWorkoutReferences } from '@sports-alliance/sports-lib';

const source = readFITWorkoutReferences(fitArrayBuffer);
const stored = JSON.parse(JSON.stringify(source.wahooWorkouts));
const restored = parseFITWahooWorkoutReferences(stored); // owned plain-object snapshot
```

The synchronous reader delegates FIT wire-format validation and selected-message extraction to the lightweight
`fit-file-parser/raw` entry point. That entry point does not load the full activity decoder or semantic profile.
Sports Lib interprets the retained native field bytes and base types, session-scoped developer fields, interior NUL
separators, endianness and compressed timestamps as workout-reference metadata. Source-native enums remain their
original numeric FIT codes rather than parser display labels.

Malformed or conflicting application identities invalidate references for that developer index, including earlier
observations. Malformed/conflicting field descriptions invalidate only references depending on those fields, not
unrelated fields sharing the exporter. Unresolvable malformed messages report diagnostics without invalidating other
identified groups. Unrelated developer IDs may omit an application ID. Strings are not trimmed, case-folded or
Unicode-normalized. All valid owners are returned; consumers filter their own identities.
Malformed extra Guide owner/external-ID fields make their session/index group ambiguous; they cannot be silently
dropped to accept a remaining apparent pair, even when their type metadata cannot be decoded.

The result is `ok`, `partial` (some optional metadata rejected or unsupported), or `invalid` (no evidence returned).
`unsupported_exporter` means Guide-named fields came from a well-formed but unrecognized application ID, not malformed
data. Missing application/field definitions report `unresolved_developer_field`; malformed definitions report
`invalid_metadata`, and contradictory definitions report `conflicting_developer_definition`. None of these diagnostics
establishes completion. Valid independent references can remain in a `partial` result. `diagnostics` contains only a
bounded set of codes, never IDs or raw bytes. The reader validates headers, CRC, record structure, relevant field
types, endianness and compressed timestamps while retaining only selected metadata messages. Safety bounds are 64 MiB per
file and 10,000 records per result collection; exceeding a bound is invalid, never silent truncation. Each Suunto
developer group allows up
to ten paired IDs of up to 64 Unicode characters, following the documented format. Invalid metadata does not throw
into or otherwise change the ordinary activity importer. No credentials or provider requests are involved.

These classes are registered for dynamic loading but are **not numeric metrics**. The reader never adds them to
Event/Activity stats or default JSON. Treat identifiers as private: validate source provenance and account ownership,
then persist only through an explicitly authorized metadata path. A standard FIT serial is not a universal Garmin
Training API workout ID or schedule ID; embedded names are not identity proof. References may show selected workout
or Guide usage but do not prove all prescribed targets or steps were completed.

No existing activity/route migration, derived-summary regeneration or global reparse is required. Consumers can read
selected retained originals for historical evidence without rewriting activity data. Quantified Self adoption and
completion matching are separate consumer work; its numeric MCP catalog must continue excluding these structured
classes (numeric construction with `0` is rejected) and plain Wahoo metadata. Existing consumers can ignore the
additive `wahooWorkouts` result field. No QS private source references are automatically exposed, and this library
change alone does not complete or relink a planned workout.

Regression fixtures reproduce the metadata topology of an inspected Guide-bearing Suunto export using synthetic
values: standard metrics on one developer index and Guide pairs on a separate `SuuntoplusFitExt` index. A renumbered
variant exercises dynamic resolution. Tests also cover unrelated application-less metadata in existing Garmin/Wahoo
samples. No private recordings or identifiers are embedded in these fixtures.

Sources: [Suunto FIT description](https://apizone.suunto.com/fit-description) and
[Suunto decoder example](https://aspartnercontent.blob.core.windows.net/apizone/docs/SuuntoDeveloperFieldsDecodingExample.java).
The description documents positional owner/external-ID pairing; the example identifies both metadata exporters and
distinguishes them from the variable IDs of individual SuuntoPlus apps.

### Recorded FIT metrics

The FIT parser applies profile scaling to record-level `depth`, `next_stop_depth`, summary depth, and bottom-time
fields. Sports Lib stores those scaled values directly as canonical meters or seconds without another conversion.
The parser emits FIT `avg_vam` in meters per second; Sports Lib converts that present source value to its public
`Average VAM` metric unit of meters per hour.
Parser 4 exposed FIT session field 196 (`metabolic_calories`) a second time as `resting_calories`. Parser 5 retains
only the canonical name, which Sports Lib imports as `Metabolic Calories`; it does not substitute the value into
`Resting Calories`. Existing activities must be reparsed to gain `Metabolic Calories`; existing `Resting Calories`
values in native JSON remain readable.
Suunto depth values also remain canonical meters. Depth is available as an advanced chart metric; callers can request
`Depth` explicitly through `ActivityParsingOptions.streams.includeTypes`.

Garmin `single_gas_diving`, `multi_gas_diving`, and `gauge_diving` sub-sports resolve to `Scuba Diving`;
`apnea_diving` and `apnea_hunting` resolve to `Free Diving`. These are direct FIT profile mappings and all remain in the
Diving activity group.

FIT `dive_gas`, `tank_summary`, and `tank_update` messages are available through
`activity.getDiveSourceRecords()`. Gas messages are file-level source records and retain source order on each
Diving-group activity imported from that FIT file. Tank summaries and tank updates are retained only for the activity
whose session window contains their source timestamp. Oxygen and helium contents are percentages; pressures are bar;
and volume used is liters. Sports Lib does not infer a gas-to-tank relation, consumption, a gas name, or any missing
field. These records are deliberately not scalar metrics; they round-trip in the native
`ActivityJSONInterface.diveSourceRecords` field, with tank timestamps stored as UTC milliseconds.

Diving activities exclude terrain summaries—`Ascent`, `Descent`, altitude min/max/avg, and grade min/max/avg—whether
they were imported from a FIT summary, restored from native JSON, regenerated into an all-diving event summary, or
would otherwise be hydrated from streams. Mixed event summaries aggregate terrain values only from non-diving
activities. Depth represents dive vertical movement. Any source altitude or grade stream remains available when
explicitly requested.

FIT session and lap `intensity` enums are retained as the string-valued `Intensity` stat. Values follow the FIT profile,
such as `active`, `rest`, `warmup`, `cooldown`, `recovery`, `interval`, and `other`.

Cadence-shaped source fields are normalized by activity context. Swimming, open-water swimming, rowing, indoor rowing,
kayaking, canoeing, paddling, and stand-up paddling expose `Stroke Rate` in `spm`; other activities continue to expose
`Cadence` in `rpm`. The same rule covers streams plus activity and lap summaries, and prevents both semantic families
from being emitted for one activity.

Use `importFromSuunto(suuntoJson)` for Suunto JSON. Use `importFromJSON(eventJson)` only for Sports Lib's native `EventJSONInterface` representation.

Native JSON hydration preserves explicit stats, except terrain summaries excluded for the Diving activity group, and
fills missing pace, swim-pace, and grade-adjusted-pace summaries from compatible speed summaries on events, activities,
and laps. This keeps older speed-only exports readable with the same derived-stat behavior as newly parsed files;
serializing the hydrated model includes the additive derived stats.
It also converts cadence-shaped data to stroke rate for the supported activity types, so stored native JSON does not
require reparsing from FIT, TCX, or GPX. Pool-swim length JSON keeps its existing `avgCadence` property name while
hydrating that value as `DataStrokeRate`.

Complete native event JSON contains the activities that determine event-summary semantics. Summary-only native event
JSON removes Diving-group terrain summaries when its `Activity Types` stat is present, but preserves other summary
semantics. An application can opt in after hydration by calling
`normalizeActivityMetricSemanticsForStats(summary, contributingActivityTypes)`. The helper changes only unambiguous
homogeneous stroke-rate summaries and removes terrain summaries from homogeneous Diving-group summaries; empty,
unknown, and mixed activity-type inputs remain unchanged. Sports Lib does not infer relationships omitted by an
application-specific persistence layout.

### 20.0.2 native-JSON migration

Restoring existing Diving-group native JSON now removes terrain ascent/descent, altitude min/max/avg, and grade
min/max/avg summary values from events, activities, and laps. No source-file reparse is needed for the restored
in-memory model. Re-serializing that model intentionally omits those values; raw source streams remain untouched.

### 20.0.3 regenerated-event correction

Regenerating an event from Diving-group activities now omits those terrain summaries, and a mixed event takes them only
from its non-diving activities. No source-file reparse is needed; regenerate and reserialize the event summary when an
application persists regenerated summaries.

### 20.1.0 source-hydrated gas and tank records

FIT imports now expose the parser-provided gas and tank messages through `getDiveSourceRecords()`. Existing native JSON
does not gain a persisted field and needs no schema migration. An application that wants to show the records for an
already-stored activity must hydrate them again from its retained original FIT source; Sports Lib does not reconstruct
them from summary metrics or streams.

### 20.1.1 native-JSON gas and tank records

`diveSourceRecords` is now a native `ActivityJSONInterface` field. JSON export preserves the ordered gas, tank-summary,
and tank-update records, and JSON import restores tank timestamps as `Date` values. The records remain structured data,
not numeric metrics: no gas/tank relationship, mixture name, nitrogen value, or consumption is inferred.

Activities stored from 20.1.0 or earlier do not contain this new field. Reparse or import the retained original FIT
source to backfill it; native JSON cannot reconstruct the records from existing summaries or streams.

Activities expose one-second streams and typed stats. Read numeric values with `getValue()` and display-ready values with
`getDisplayValue()`. Depth presentation follows the first swim-pace preference: `/100m` selects meters and `/100yd`
selects feet, while serialized source values remain meters.

For stream filtering, generated streams, training-stress settings, and FIT device compaction, see [Configure parsing](parsing-options.md). Planned courses are separate models; see [Work with routes](routes.md).
