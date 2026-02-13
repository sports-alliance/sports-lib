import {
  convertSpeedToSpeedInFeetPerSecond,
  convertSpeedToSpeedInKilometersPerHour,
  convertSpeedToSpeedInKnots,
  convertSpeedToSpeedInMilesPerHour
} from '../events/utilities/helpers';
import { DynamicDataLoader } from './data.store';
import {
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour,
  DataSpeedKnots,
  DataSpeedMilesPerHour
} from './data.speed';
import {
  DataJumpDistanceAvg,
  DataJumpDistanceMax,
  DataJumpDistanceMin,
  DataJumpHangTimeAvg,
  DataJumpHangTimeMax,
  DataJumpHangTimeMin,
  DataJumpScoreAvg,
  DataJumpScoreMax,
  DataJumpScoreMin,
  DataJumpSpeedAvg,
  DataJumpSpeedMax,
  DataJumpSpeedMin
} from './data.jump-stats';

describe('Jump stats display and unit behavior', () => {
  it('formats jump distance with jump distance precision', () => {
    const jumpDistanceAvg = new DataJumpDistanceAvg(2);
    const jumpDistanceMin = new DataJumpDistanceMin(1.2);
    const jumpDistanceMax = new DataJumpDistanceMax(3.456);

    expect(jumpDistanceAvg.getDisplayUnit()).toBe('m');
    expect(jumpDistanceAvg.getDisplayValue()).toBe('2.00');
    expect(jumpDistanceMin.getDisplayValue()).toBe('1.20');
    expect(jumpDistanceMax.getDisplayValue()).toBe('3.46');
  });

  it('formats jump speed with speed precision and converts to speed units', () => {
    const jumpSpeedAvg = new DataJumpSpeedAvg(6.2);
    const jumpSpeedMin = new DataJumpSpeedMin(5.4);
    const jumpSpeedMax = new DataJumpSpeedMax(7.9);

    expect(jumpSpeedAvg.getDisplayValue()).toBe('6.20');
    expect(jumpSpeedAvg.getDisplayUnit()).toBe('m/s');

    expect(jumpSpeedAvg.getValue(DataSpeedKilometersPerHour.type)).toBeCloseTo(
      convertSpeedToSpeedInKilometersPerHour(6.2),
      10
    );
    expect(jumpSpeedAvg.getValue(DataSpeedMilesPerHour.type)).toBeCloseTo(convertSpeedToSpeedInMilesPerHour(6.2), 10);
    expect(jumpSpeedAvg.getValue(DataSpeedFeetPerSecond.type)).toBeCloseTo(convertSpeedToSpeedInFeetPerSecond(6.2), 10);
    expect(jumpSpeedAvg.getValue(DataSpeedKnots.type)).toBeCloseTo(convertSpeedToSpeedInKnots(6.2), 10);

    expect(jumpSpeedMin.getValue(DataSpeedMilesPerHour.type)).toBeCloseTo(convertSpeedToSpeedInMilesPerHour(5.4), 10);
    expect(jumpSpeedMax.getValue(DataSpeedKilometersPerHour.type)).toBeCloseTo(
      convertSpeedToSpeedInKilometersPerHour(7.9),
      10
    );
  });

  it('displays jump hang time in milliseconds while keeping canonical storage unit in seconds', () => {
    const jumpHangTimeAvg = new DataJumpHangTimeAvg(0.456);
    const jumpHangTimeMin = new DataJumpHangTimeMin(0.333);
    const jumpHangTimeMax = new DataJumpHangTimeMax(0.9994);

    expect(jumpHangTimeAvg.getUnit()).toBe('s');
    expect(jumpHangTimeAvg.getDisplayUnit()).toBe('ms');
    expect(jumpHangTimeAvg.getDisplayValue()).toBe('456');
    expect(jumpHangTimeMin.getDisplayValue()).toBe('333');
    expect(jumpHangTimeMax.getDisplayValue()).toBe('999');
  });

  it('formats jump score with fixed 1-decimal precision', () => {
    expect(new DataJumpScoreAvg(12).getDisplayValue()).toBe('12.0');
    expect(new DataJumpScoreMin(8.04).getDisplayValue()).toBe('8.0');
    expect(new DataJumpScoreMax(8.06).getDisplayValue()).toBe('8.1');
  });

  it('keeps canonical jump type names and legacy aliases compatible', () => {
    expect(DataJumpSpeedAvg.type).toBe('Average Jump Speed');
    expect(DataJumpHangTimeAvg.type).toBe('Average Jump Hang Time');
    expect(DataJumpScoreAvg.type).toBe('Average Jump Score');

    expect(DynamicDataLoader.getDataInstanceFromDataType('Jump Speed Avg', 6.2)).toBeInstanceOf(DataJumpSpeedAvg);
    expect(DynamicDataLoader.getDataInstanceFromDataType('Jump Hang Time Avg', 0.5)).toBeInstanceOf(
      DataJumpHangTimeAvg
    );
    expect(DynamicDataLoader.getDataInstanceFromDataType('Jump Score Avg', 8.1)).toBeInstanceOf(DataJumpScoreAvg);
  });
});
