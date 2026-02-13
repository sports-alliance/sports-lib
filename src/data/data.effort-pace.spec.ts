import { convertPaceToPaceInMinutesPerMile } from '../events/utilities/helpers';
import { DataEffortPace, DataEffortPaceMinutesPerMile } from './data.effort-pace';

describe('DataEffortPace', () => {
  it('should display Effort Pace as pace in min/km', () => {
    const effortPace = new DataEffortPace(293.08);

    expect(effortPace.getDisplayValue()).toBe('04:53');
    expect(effortPace.getDisplayUnit()).toBe('min/km');
  });

  it('should convert Effort Pace to minutes per mile', () => {
    const effortPace = new DataEffortPace(300);

    expect(effortPace.getValue(DataEffortPaceMinutesPerMile.type)).toBeCloseTo(
      convertPaceToPaceInMinutesPerMile(300),
      10
    );
  });
});
