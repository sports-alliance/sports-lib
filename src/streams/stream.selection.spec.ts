import { ActivityParsingOptions } from '../activities/activity-parsing-options';
import { Activity } from '../activities/activity';
import { ActivityTypes } from '../activities/activity.types';
import { Creator } from '../creators/creator';
import { DataAltitude } from '../data/data.altitude';
import { DataDistance } from '../data/data.distance';
import { DataGrade } from '../data/data.grade';
import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from '../data/data.grade-adjusted-pace';
import { DataGradeAdjustedSpeed, DataGradeAdjustedSpeedKilometersPerHour } from '../data/data.grade-adjusted-speed';
import { DataHeartRate } from '../data/data.heart-rate';
import { DataLatitudeDegrees } from '../data/data.latitude-degrees';
import { DataLongitudeDegrees } from '../data/data.longitude-degrees';
import { DataPace } from '../data/data.pace';
import { DataPowerBalanceLeft } from '../data/data.power-balance-left';
import { DataSpeed, DataSpeedKilometersPerHour } from '../data/data.speed';
import { DataCadence } from '../data/data.cadence';
import { DataStrokeRate } from '../data/data.stroke-rate';
import { Stream } from './stream';
import { getStreamSelectionFromOptions, isStreamTypeAllowedForImport, pruneActivityStreamsBySelection } from './stream.selection';

describe('stream.selection', () => {
  it('should return null when includeTypes is not provided', () => {
    const selection = getStreamSelectionFromOptions(new ActivityParsingOptions());
    expect(selection).toBeNull();
  });

  it('should return null when includeTypes is empty', () => {
    const selection = getStreamSelectionFromOptions(new ActivityParsingOptions({ streams: { includeTypes: [] } }));
    expect(selection).toBeNull();
  });

  it('should throw when includeTypes contains unknown types', () => {
    expect(() =>
      getStreamSelectionFromOptions(new ActivityParsingOptions({ streams: { includeTypes: ['Not A Stream'] } }))
    ).toThrow('Unknown stream includeTypes');
  });

  it('should normalize includeTypes by trimming and deduplicating', () => {
    const selection = getStreamSelectionFromOptions(
      new ActivityParsingOptions({
        streams: {
          includeTypes: [` ${DataDistance.type} `, DataDistance.type, DataPace.type, DataPace.type]
        }
      })
    );

    expect(selection).not.toBeNull();
    expect(selection?.outputAllowSet).toEqual(new Set([DataDistance.type, DataPace.type]));
    expect(selection?.importAllowSet.has(DataDistance.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataPace.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataSpeed.type)).toBe(true);
  });

  it('should normalize legacy includeType aliases to canonical stream types', () => {
    const selection = getStreamSelectionFromOptions(
      new ActivityParsingOptions({
        streams: { includeTypes: [' Left Balance ', DataPowerBalanceLeft.type] }
      })
    );

    expect(selection).not.toBeNull();
    expect(selection?.outputAllowSet).toEqual(new Set([DataPowerBalanceLeft.type]));
    expect(selection?.importAllowSet.has(DataPowerBalanceLeft.type)).toBe(true);
  });

  it('should expand dependencies for pace requests', () => {
    const selection = getStreamSelectionFromOptions(
      new ActivityParsingOptions({ streams: { includeTypes: [DataPace.type] } })
    );

    expect(selection).not.toBeNull();
    expect(selection?.outputAllowSet.has(DataPace.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataPace.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataSpeed.type)).toBe(true);
  });

  it('should import cadence-shaped source fields when Stroke Rate is requested', () => {
    const selection = getStreamSelectionFromOptions(
      new ActivityParsingOptions({ streams: { includeTypes: [DataStrokeRate.type] } })
    );

    expect(selection?.outputAllowSet).toEqual(new Set([DataStrokeRate.type]));
    expect(selection?.importAllowSet.has(DataStrokeRate.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataCadence.type)).toBe(true);
  });

  it('should expand deep dependencies for grade adjusted pace unit requests', () => {
    const selection = getStreamSelectionFromOptions(
      new ActivityParsingOptions({
        streams: { includeTypes: [DataGradeAdjustedPaceMinutesPerMile.type] }
      })
    );

    expect(selection).not.toBeNull();
    expect(selection?.outputAllowSet.has(DataGradeAdjustedPaceMinutesPerMile.type)).toBe(true);

    expect(selection?.importAllowSet.has(DataGradeAdjustedPace.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataGradeAdjustedSpeed.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataSpeed.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataGrade.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataDistance.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataAltitude.type)).toBe(true);
  });

  it('should expand unit-only speed requests to raw speed for import without widening output', () => {
    const selection = getStreamSelectionFromOptions(
      new ActivityParsingOptions({ streams: { includeTypes: [DataSpeedKilometersPerHour.type] } })
    );

    expect(selection?.outputAllowSet).toEqual(new Set([DataSpeedKilometersPerHour.type]));
    expect(selection?.importAllowSet.has(DataSpeedKilometersPerHour.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataSpeed.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataDistance.type)).toBe(false);
  });

  it('should expand grade-adjusted speed unit requests through the full dependency chain', () => {
    const selection = getStreamSelectionFromOptions(
      new ActivityParsingOptions({
        streams: { includeTypes: [DataGradeAdjustedSpeedKilometersPerHour.type] }
      })
    );

    expect(selection?.outputAllowSet).toEqual(new Set([DataGradeAdjustedSpeedKilometersPerHour.type]));
    expect(selection?.importAllowSet.has(DataGradeAdjustedSpeed.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataSpeed.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataGrade.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataDistance.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataAltitude.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataLatitudeDegrees.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataLongitudeDegrees.type)).toBe(true);
  });

  it('should distinguish allowed dependency types from unrelated stream types during import filtering', () => {
    const selection = getStreamSelectionFromOptions(
      new ActivityParsingOptions({ streams: { includeTypes: [DataSpeedKilometersPerHour.type] } })
    );

    expect(isStreamTypeAllowedForImport(DataSpeed.type, selection)).toBe(true);
    expect(isStreamTypeAllowedForImport(DataSpeedKilometersPerHour.type, selection)).toBe(true);
    expect(isStreamTypeAllowedForImport(DataHeartRate.type, selection)).toBe(false);
    expect(isStreamTypeAllowedForImport(DataHeartRate.type, null)).toBe(true);
  });

  it('should prune activities down to the requested output stream types only', () => {
    const activity = new Activity(new Date(0), new Date(3000), ActivityTypes.Running, new Creator('Test'));
    activity.addStream(new Stream(DataDistance.type, [0, 10, 20, 30]));
    activity.addStream(new Stream(DataHeartRate.type, [100, 101, 102, 103]));
    activity.addStream(new Stream(DataSpeedKilometersPerHour.type, [10, 11, 12, 13]));

    const selection = getStreamSelectionFromOptions(
      new ActivityParsingOptions({
        streams: { includeTypes: [DataDistance.type, DataSpeedKilometersPerHour.type] }
      })
    );

    pruneActivityStreamsBySelection(activity, selection);

    expect(activity.getAllStreams().map(stream => stream.type)).toEqual([DataDistance.type, DataSpeedKilometersPerHour.type]);
  });
});
