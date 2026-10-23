import { EventSummary, EventSummaryJSONInterface } from './event-summary';
import { EventImporterJSON } from './adapters/importers/json/importer.json';
import { FileType } from './adapters/file-type.enum';
import { Privacy } from '../privacy/privacy.class.interface';
import { ActivityTypes } from '../activities/activity.types';
import { normalizeActivityMetricSemanticsForStats } from '../activities/activity.metric-semantics';
import { DataDistance } from '../data/data.distance';
import { DataSpeedAvg } from '../data/data.speed-avg';
import { DataPaceAvg } from '../data/data.pace-avg';
import { DataSwimPaceAvg } from '../data/data.swim-pace-avg';
import { DataGradeAdjustedSpeedAvg } from '../data/data.grade-adjusted-speed-avg';
import { DataGradeAdjustedPaceAvg } from '../data/data.grade-adjusted-pace-avg';
import { DataActivityTypes } from '../data/data.activity-types';
import { DataCadenceAvg } from '../data/data.cadence-avg';
import { DataStrokeRateAvg } from '../data/data.stroke-rate-avg';
import { DataAscent } from '../data/data.ascent';
import { DataStartPosition } from '../data/data.start-position';
import { DataPowerCurve } from '../data/data.power-curve';
import { DynamicDataLoader } from '../data/data.store';
import { DaysOfTheWeek, DistanceUnits } from '../users/settings/user.unit.settings.interface';

const fixture = (stats: EventSummaryJSONInterface['stats'] = {}): EventSummaryJSONInterface => ({
  id: 'summary-1',
  name: 'Example',
  startDate: 1800000000000,
  endDate: 1800003600000,
  srcFileType: FileType.FIT,
  description: null,
  privacy: Privacy.Private,
  isMerge: false,
  stats: { [DataActivityTypes.type]: [ActivityTypes.Running], ...stats }
});

describe('EventSummary', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reads metadata without constructing metrics, activities, laps or streams', () => {
    const construct = jest.spyOn(DynamicDataLoader, 'getDataInstanceFromDataType');
    const child = { type: ActivityTypes.Running, creator: { manufacturer: 'Garmin' } };
    Object.defineProperty(child, 'streams', {
      get: () => {
        throw new Error('streams must stay untouched');
      }
    });
    const json = { ...fixture({ [DataDistance.type]: 1000 }), activities: [child] } as EventSummaryJSONInterface;
    const summary = EventSummary.fromJSON(json);
    expect(summary.getID()).toBe('summary-1');
    expect(summary.name).toBe('Example');
    expect(summary.startDate.getTime()).toBe(json.startDate);
    expect(summary.endDate.getTime()).toBe(json.endDate);
    expect(summary.getActivityTypesAsArray()).toEqual([ActivityTypes.Running]);
    expect(construct).not.toHaveBeenCalled();
    expect(summary.getDistance()).toBeInstanceOf(DataDistance);
    expect(summary.getDistance()).toBe(summary.getStat(DataDistance.type));
    expect(construct).toHaveBeenCalledTimes(1);
  });

  it('isolates nested raw values from both input changes and cached metric changes', () => {
    const json = fixture({ [DataStartPosition.type]: { latitudeDegrees: 60, longitudeDegrees: 25 } });
    const summary = EventSummary.fromJSON(json);
    (json.stats[DataStartPosition.type] as { latitudeDegrees: number }).latitudeDegrees = 0;
    const position = summary.getStat<{ latitudeDegrees: number; longitudeDegrees: number }>(DataStartPosition.type)!;
    expect(position.getValue().latitudeDegrees).toBe(60);
    position.getValue().latitudeDegrees = 1;
    const raw = summary.getRawStats();
    expect(raw[DataStartPosition.type]).toEqual({ latitudeDegrees: 60, longitudeDegrees: 25 });
    (raw[DataStartPosition.type] as { latitudeDegrees: number }).latitudeDegrees = 2;
    expect(summary.getRawStats()[DataStartPosition.type]).toEqual({ latitudeDegrees: 60, longitudeDegrees: 25 });
    summary.getActivityTypesAsArray().push(ActivityTypes.Cycling);
    expect(summary.getActivityTypesAsArray()).toEqual([ActivityTypes.Running]);
  });

  it.each([false, true])('prefers a valid canonical stat over its alias, reversed=%s', reversed => {
    const entries: Array<[string, number]> = [
      ['Avg Respiration Rate', 12],
      ['Average Respiration Rate', 15]
    ];
    const summary = EventSummary.fromJSON(fixture(Object.fromEntries(reversed ? entries.reverse() : entries)));
    expect(summary.getStat('Avg Respiration Rate')).toBe(summary.getStat('Average Respiration Rate'));
    expect(summary.getStat('Average Respiration Rate')?.getValue()).toBe(15);
  });

  it('keeps valid aliases when canonical values are null and omits invalid scalar numbers', () => {
    const summary = EventSummary.fromJSON(
      fixture({
        'Average Respiration Rate': null,
        'Avg Respiration Rate': 12,
        [DataDistance.type]: 0,
        [DataSpeedAvg.type]: Infinity,
        Missing: NaN
      })
    );
    expect(summary.getStat('Average Respiration Rate')?.getValue()).toBe(12);
    expect(summary.getDistance()?.getValue()).toBe(0);
    expect(summary.getStat(DataSpeedAvg.type)).toBeUndefined();
    expect(summary.getStat('Missing')).toBeUndefined();
  });

  it('retains legacy instance redirection and lazy alias identity', () => {
    const summary = EventSummary.fromJSON(fixture({ 'Stance Time': 250, heart_rate: 140 }));
    expect(summary.getStat('Ground Contact Time')?.getValue()).toBe(250);
    expect(summary.getStat('Stance Time')).toBe(summary.getStat('Ground Contact Time'));
    expect(summary.getStat('heart_rate')).toBe(summary.getStat('Heart Rate'));
  });

  it('defers constructor errors and unknown-type errors until the affected stat is requested', () => {
    const summary = EventSummary.fromJSON(fixture({ [DataDistance.type]: {}, FutureMetric: 10 }));
    expect(summary.getID()).toBe('summary-1');
    expect(summary.getStat('not present')).toBeUndefined();
    expect(() => summary.getDistance()).toThrow('Value is not boolean or number or string or Date or position');
    expect(() => summary.getStat('FutureMetric')).toThrow("Class type of 'FutureMetric' is not in the store");
  });

  it('derives only requested pace metrics and preserves explicit pace and grade-adjusted semantics', () => {
    const construct = jest.spyOn(DynamicDataLoader, 'getDataInstanceFromDataType');
    const summary = EventSummary.fromJSON(
      fixture({
        [DataSpeedAvg.type]: 4,
        [DataGradeAdjustedSpeedAvg.type]: 3,
        [DataSwimPaceAvg.type]: 99
      })
    );
    const pace = summary.getStat(DataPaceAvg.type);
    expect(pace?.getValue()).toBe(250);
    expect(summary.getStat(DataPaceAvg.type)).toBe(pace);
    expect(construct).toHaveBeenCalledTimes(1);
    expect(summary.getStat(DataGradeAdjustedPaceAvg.type)?.getValue()).toBe(250);
    expect(summary.getStat(DataSwimPaceAvg.type)?.getValue()).toBe(99);
    expect(summary.getRawStats()).not.toHaveProperty(DataPaceAvg.type);
  });

  it.each([
    [ActivityTypes.Running],
    [ActivityTypes.Swimming],
    [ActivityTypes.Diving],
    [ActivityTypes.Swimming, ActivityTypes.Cycling],
    [ActivityTypes.unknown],
    ['unknown future sport']
  ])('matches eager summary semantics for %j', (...activityTypes) => {
    const json = fixture({
      [DataActivityTypes.type]: activityTypes,
      [DataDistance.type]: 1000,
      [DataSpeedAvg.type]: 4,
      [DataCadenceAvg.type]: 80,
      [DataStrokeRateAvg.type]: 30,
      [DataAscent.type]: 20
    });
    const eager = EventImporterJSON.getEventFromJSON({ ...json, activities: [] });
    normalizeActivityMetricSemanticsForStats(eager, activityTypes);
    const summary = EventSummary.fromJSON(json);
    const values = (stats: Map<string, { getValue(): unknown }>) =>
      Object.fromEntries(Array.from(stats, ([type, stat]) => [type, stat.getValue()]));
    expect(values(summary.getStats())).toEqual(values(eager.getStats()));
  });

  it('hydrates a power curve only when requested and retains zero W/kg', () => {
    const json = { ...fixture(), powerCurve: { [DataPowerCurve.type]: [{ duration: 60, power: 200, wattsPerKg: 0 }] } };
    const construct = jest.spyOn(DynamicDataLoader, 'getDataInstanceFromDataType');
    const summary = EventSummary.fromJSON(json);
    expect(construct).not.toHaveBeenCalled();
    expect(summary.getStat(DataPowerCurve.type)?.toJSON()).toEqual(json.powerCurve);
  });

  it('retains canonical metric formatting and user-unit conversion', () => {
    const summary = EventSummary.fromJSON(fixture({ [DataDistance.type]: 1609.344 }));
    const distance = summary.getDistance()!;
    const imperial = DynamicDataLoader.getUnitBasedDataFromDataInstance(distance, {
      distanceUnits: DistanceUnits.Miles,
      startOfTheWeek: DaysOfTheWeek.Monday,
      speedUnits: [],
      gradeAdjustedSpeedUnits: [],
      verticalSpeedUnits: [],
      paceUnits: [],
      gradeAdjustedPaceUnits: [],
      swimPaceUnits: []
    });
    expect(distance.getDisplayValue()).toBe('1.61');
    expect(imperial[0].getDisplayValue()).toBe('1.00');
    expect(imperial[0].getDisplayUnit()).toBe('mi');
    expect(distance.toJSON()).toEqual({ [DataDistance.type]: 1609.344 });
  });

  it('materializes all stats on explicit enumeration without exposing the internal cache map', () => {
    const summary = EventSummary.fromJSON(fixture({ [DataDistance.type]: 1000, [DataSpeedAvg.type]: 0 }));
    const all = summary.getStats();
    expect(all.get(DataPaceAvg.type)?.getValue()).toBe(Infinity);
    all.clear();
    expect(summary.getDistance()?.getValue()).toBe(1000);
    expect(summary.getStatsAsArray().length).toBeGreaterThan(1);
    expect(summary).not.toHaveProperty('toJSON');
    expect(summary).not.toHaveProperty('addStat');
  });

  it('keeps native running enumeration order after lazy reads of derived metrics and their dependencies', () => {
    const json = fixture({ [DataDistance.type]: 1000, [DataSpeedAvg.type]: 4 });
    const expectedTypes = [
      ...EventImporterJSON.getEventFromJSON({ ...json, activities: [] })
        .getStats()
        .keys()
    ];
    const summary = EventSummary.fromJSON(json);
    const pace = summary.getStat(DataPaceAvg.type);

    expect([...summary.getStats().keys()]).toEqual(expectedTypes);
    expect(summary.getStatsAsArray().map(stat => stat.getType())).toEqual(expectedTypes);
    expect(summary.getStat(DataPaceAvg.type)).toBe(pace);
  });

  it.each([ActivityTypes.Swimming, ActivityTypes.Diving])(
    'keeps %s enumeration stable after sport normalization and lazy reads',
    sport => {
      const json = fixture({
        [DataActivityTypes.type]: [sport],
        [DataDistance.type]: 1000,
        [DataSpeedAvg.type]: 4,
        [DataCadenceAvg.type]: 80,
        [DataAscent.type]: 20
      });
      const freshTypes = [...EventSummary.fromJSON(json).getStats().keys()];
      const summary = EventSummary.fromJSON(json);
      summary.getStat(DataPaceAvg.type);
      summary.getDistance();

      expect([...summary.getStats().keys()]).toEqual(freshTypes);
      expect(summary.getStatsAsArray().map(stat => stat.getType())).toEqual(freshTypes);
    }
  );
});
