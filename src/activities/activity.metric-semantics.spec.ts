import { Creator } from '../creators/creator';
import { DataCadence } from '../data/data.cadence';
import { DataCadenceAvg } from '../data/data.cadence-avg';
import { DataCadenceMax } from '../data/data.cadence-max';
import { DataCadenceMin } from '../data/data.cadence-min';
import { DataHeartRate } from '../data/data.heart-rate';
import { DataPower } from '../data/data.power';
import { DataStrokeRate } from '../data/data.stroke-rate';
import { DataStrokeRateAvg } from '../data/data.stroke-rate-avg';
import { DataStrokeRateMax } from '../data/data.stroke-rate-max';
import { DataStrokeRateMin } from '../data/data.stroke-rate-min';
import { Event } from '../events/event';
import { FileType } from '../events/adapters/file-type.enum';
import { ActivityUtilities } from '../events/utilities/activity.utilities';
import { Lap } from '../laps/lap';
import { LapTypes } from '../laps/lap.types';
import { Privacy } from '../privacy/privacy.class.interface';
import { Stream } from '../streams/stream';
import { Activity } from './activity';
import {
  normalizeActivityMetricSemanticsForStats,
  normalizeStrokeRateSemanticsForActivity
} from './activity.metric-semantics';
import { ActivityTypes, ActivityTypesHelper } from './activity.types';

const strokeRateActivityTypes = [
  ActivityTypes.Swimming,
  ActivityTypes.OpenWaterSwimming,
  ActivityTypes.Rowing,
  ActivityTypes.IndoorRowing,
  ActivityTypes.Kayaking,
  ActivityTypes.Canoeing,
  ActivityTypes.Paddling,
  ActivityTypes.StandUpPaddling
];

describe('activity metric semantics', () => {
  it('classifies every supported stroke-rate activity through one resolver', () => {
    strokeRateActivityTypes.forEach(activityType => {
      expect(ActivityTypesHelper.usesStrokeRate(activityType)).toBe(true);
    });

    expect(ActivityTypesHelper.usesStrokeRate(ActivityTypes.Cycling)).toBe(false);
    expect(ActivityTypesHelper.usesStrokeRate(ActivityTypes.Running)).toBe(false);
    expect(ActivityTypesHelper.usesStrokeRate(ActivityTypes.Rafting)).toBe(false);
  });

  it('normalizes summary-only stats when every supplied activity type uses stroke rate', () => {
    const event = new Event('Summary projection', new Date(0), new Date(1000), FileType.FIT, Privacy.Private);
    event.addStat(new DataCadenceAvg(32));
    event.addStat(new DataCadenceMin(30));
    event.addStat(new DataCadenceMax(34));

    normalizeActivityMetricSemanticsForStats(event, ['open_water', ActivityTypes.Rowing]);

    expect(event.getStat(DataCadenceAvg.type)).toBeUndefined();
    expect(event.getStat(DataCadenceMin.type)).toBeUndefined();
    expect(event.getStat(DataCadenceMax.type)).toBeUndefined();
    expect(event.getStat(DataStrokeRateAvg.type)?.getValue()).toBe(32);
    expect(event.getStat(DataStrokeRateMin.type)?.getValue()).toBe(30);
    expect(event.getStat(DataStrokeRateMax.type)?.getValue()).toBe(34);
  });

  it.each([
    { label: 'empty', activityTypes: [] },
    { label: 'unknown', activityTypes: [ActivityTypes.Rowing, 'Unregistered Water Sport'] },
    { label: 'mixed', activityTypes: [ActivityTypes.Rowing, ActivityTypes.Cycling] }
  ])('preserves $label summary-only cadence because its semantics are ambiguous', ({ activityTypes }) => {
    const event = new Event('Summary projection', new Date(0), new Date(1000), FileType.FIT, Privacy.Private);
    event.addStat(new DataCadenceAvg(32));

    normalizeActivityMetricSemanticsForStats(event, activityTypes);

    expect(event.getStat(DataCadenceAvg.type)?.getValue()).toBe(32);
    expect(event.getStat(DataStrokeRateAvg.type)).toBeUndefined();
  });

  it.each(strokeRateActivityTypes)('normalizes cadence streams and summaries for %s', activityType => {
    const activity = new Activity(new Date(0), new Date(3000), activityType, new Creator('Test'));
    const lap = new Lap(new Date(0), new Date(3000), 1, LapTypes.Manual);
    activity.addStream(new Stream(DataCadence.type, [0, 30, null, 34]));
    activity.addStat(new DataCadenceAvg(32));
    activity.addStat(new DataCadenceMin(30));
    activity.addStat(new DataCadenceMax(34));
    lap.addStat(new DataCadenceAvg(31));
    activity.addLap(lap);

    normalizeStrokeRateSemanticsForActivity(activity);

    expect(activity.hasStreamData(DataCadence.type)).toBe(false);
    expect(activity.getStream(DataStrokeRate.type).getData()).toEqual([0, 30, null, 34]);
    expect(activity.getStat(DataCadenceAvg.type)).toBeUndefined();
    expect(activity.getStat(DataCadenceMin.type)).toBeUndefined();
    expect(activity.getStat(DataCadenceMax.type)).toBeUndefined();
    expect(activity.getStat(DataStrokeRateAvg.type)?.getValue()).toBe(32);
    expect(activity.getStat(DataStrokeRateMin.type)?.getValue()).toBe(30);
    expect(activity.getStat(DataStrokeRateMax.type)?.getValue()).toBe(34);
    expect(lap.getStat(DataCadenceAvg.type)).toBeUndefined();
    expect(lap.getStat(DataStrokeRateAvg.type)?.getValue()).toBe(31);
  });

  it('preserves an explicit stroke-rate value when duplicate cadence data is present', () => {
    const activity = new Activity(new Date(0), new Date(2000), ActivityTypes.OpenWaterSwimming, new Creator('Test'));
    activity.addStream(new Stream(DataCadence.type, [20, 21, 22]));
    activity.addStream(new Stream(DataStrokeRate.type, [30, 31, 32]));
    activity.addStat(new DataCadenceAvg(21));
    activity.addStat(new DataStrokeRateAvg(31));

    normalizeStrokeRateSemanticsForActivity(activity);

    expect(activity.getAllStreams().map(stream => stream.type)).toEqual([DataStrokeRate.type]);
    expect(activity.getStream(DataStrokeRate.type).getData()).toEqual([30, 31, 32]);
    expect(activity.getStat(DataStrokeRateAvg.type)?.getValue()).toBe(31);
  });

  it('preserves stream order when cadence is relabeled', () => {
    const activity = new Activity(new Date(0), new Date(2000), ActivityTypes.Rowing, new Creator('Test'));
    activity.addStream(new Stream(DataHeartRate.type, [120, 121, 122]));
    activity.addStream(new Stream(DataCadence.type, [28, 29, 30]));
    activity.addStream(new Stream(DataPower.type, [180, 190, 200]));

    normalizeStrokeRateSemanticsForActivity(activity);

    expect(activity.getAllStreams().map(stream => stream.type)).toEqual([
      DataHeartRate.type,
      DataStrokeRate.type,
      DataPower.type
    ]);
  });

  it('keeps cadence semantics for non-stroke-rate activities', () => {
    const activity = new Activity(new Date(0), new Date(2000), ActivityTypes.Cycling, new Creator('Test'));
    activity.addStream(new Stream(DataCadence.type, [80, 81, 82]));
    activity.addStat(new DataCadenceAvg(81));

    normalizeStrokeRateSemanticsForActivity(activity);

    expect(activity.getStream(DataCadence.type).getData()).toEqual([80, 81, 82]);
    expect(activity.getStat(DataCadenceAvg.type)?.getValue()).toBe(81);
    expect(activity.getStat(DataStrokeRateAvg.type)).toBeUndefined();
  });

  it('generates finite non-zero stroke-rate summaries after semantic normalization', () => {
    const activity = new Activity(new Date(0), new Date(4000), ActivityTypes.Rowing, new Creator('Test'));
    activity.addStream(new Stream(DataCadence.type, [0, 28, null, 30, 32]));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataStrokeRateMin.type)?.getValue()).toBe(28);
    expect(activity.getStat(DataStrokeRateAvg.type)?.getValue()).toBe(30);
    expect(activity.getStat(DataStrokeRateMax.type)?.getValue()).toBe(32);
    [DataStrokeRateMin.type, DataStrokeRateAvg.type, DataStrokeRateMax.type].forEach(type => {
      expect(Number.isFinite(activity.getStat(type)?.getValue())).toBe(true);
    });
  });
});
