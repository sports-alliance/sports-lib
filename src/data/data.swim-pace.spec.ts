import { DataSpeed } from './data.speed';
import { DataSwimPace, DataSwimPaceMinutesPer100Yard } from './data.swim-pace';
import { convertSwimPaceToSwimPacePer100Yard } from '../events/utilities/helpers';

describe('DataSwimPace', () => {
  it('converts seconds per 100 meters to seconds per 100 yards', () => {
    expect(convertSwimPaceToSwimPacePer100Yard(100)).toBeCloseTo(91.44, 5);
    expect(new DataSwimPace(100).getValue(DataSwimPaceMinutesPer100Yard.type)).toBeCloseTo(91.44, 5);
    expect(new DataSpeed(1).getValue(DataSwimPaceMinutesPer100Yard.type)).toBeCloseTo(91.44, 5);
  });
});
