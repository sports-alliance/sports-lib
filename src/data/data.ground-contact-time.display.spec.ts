import { DataGroundContactTime } from './data.ground-contact-time';
import { DataGroundContactTimeAvg } from './data.ground-contact-time-avg';
import { DataGroundContactTimeMin } from './data.ground-contact-time-min';
import { DataGroundContactTimeMax } from './data.ground-contact-time-max';
import { DataStanceTime } from './data.stance-time';

describe('Ground Contact Time display formatting', () => {
  it('displays all ground contact time variants as integer milliseconds', () => {
    expect(new DataGroundContactTime(255.8).getDisplayValue()).toBe(256);
    expect(new DataGroundContactTimeAvg(255.8).getDisplayValue()).toBe(256);
    expect(new DataGroundContactTimeMin(228.4).getDisplayValue()).toBe(228);
    expect(new DataGroundContactTimeMax(303.6).getDisplayValue()).toBe(304);
    expect(new DataStanceTime(255.8).getDisplayValue()).toBe(256);
  });
});
