import { ActivityParsingOptions } from '../activities/activity-parsing-options';
import { DataAltitude } from '../data/data.altitude';
import { DataDistance } from '../data/data.distance';
import { DataGrade } from '../data/data.grade';
import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from '../data/data.grade-adjusted-pace';
import { DataGradeAdjustedSpeed } from '../data/data.grade-adjusted-speed';
import { DataPace } from '../data/data.pace';
import { DataSpeed } from '../data/data.speed';
import { getStreamSelectionFromOptions } from './stream.selection';

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

  it('should expand dependencies for pace requests', () => {
    const selection = getStreamSelectionFromOptions(
      new ActivityParsingOptions({ streams: { includeTypes: [DataPace.type] } })
    );

    expect(selection).not.toBeNull();
    expect(selection?.outputAllowSet.has(DataPace.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataPace.type)).toBe(true);
    expect(selection?.importAllowSet.has(DataSpeed.type)).toBe(true);
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
});
