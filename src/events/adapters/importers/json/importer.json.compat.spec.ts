import { EventImporterJSON } from './importer.json';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataAvgVAM } from '../../../../data/data.avg-vam';
import { DataJumpHeightAvg } from '../../../../data/data.jump-stats';
import { DataMaxHRSetting } from '../../../../data/data.max-hr-setting';

describe('EventImporterJSON legacy type compatibility', () => {
  it('maps legacy stat keys to canonical types via DynamicDataLoader aliases', () => {
    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'legacy-json',
      startDate: 0,
      endDate: 1000,
      type: ActivityTypes.Running,
      powerMeter: false,
      trainer: false,
      stats: {
        'Avg VAM': 123,
        'Jump Height Avg': 1.5,
        'Max HR Setting': 190
      },
      streams: [],
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });

    expect(activity.getStat(DataAvgVAM.type)?.getValue()).toBe(123);
    expect(activity.getStat(DataJumpHeightAvg.type)?.getValue()).toBe(1.5);
    expect(activity.getStat(DataMaxHRSetting.type)?.getValue()).toBe(190);
  });
});
