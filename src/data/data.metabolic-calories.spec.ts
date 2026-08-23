import { ActivityTypes } from '../activities/activity.types';
import { EventImporterJSON } from '../events/adapters/importers/json/importer.json';
import { DataMetabolicCalories } from './data.metabolic-calories';
import { DataStore, DynamicDataLoader } from './data.store';

describe('DataMetabolicCalories', () => {
  it('is publicly enumerable, canonicalizable, numeric, and persistent', () => {
    const data = new DataMetabolicCalories(159);

    expect(data.getUnit()).toBe('kcal');
    expect(data.toJSON()).toEqual({ 'Metabolic Calories': 159 });
    expect(DataStore.DataMetabolicCalories).toBe(DataMetabolicCalories);
    expect(DynamicDataLoader.getDataClassFromDataType(DataMetabolicCalories.type)).toBe(DataMetabolicCalories);

    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'stored-activity',
      startDate: 0,
      endDate: 1000,
      type: ActivityTypes.Running,
      powerMeter: false,
      trainer: false,
      stats: data.toJSON(),
      streams: [],
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });

    expect(activity.getStat(DataMetabolicCalories.type)?.getValue()).toBe(159);
    expect(EventImporterJSON.getActivityFromJSON(activity.toJSON()).toJSON()).toEqual(activity.toJSON());
  });
});
