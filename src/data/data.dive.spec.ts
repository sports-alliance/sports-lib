import {
  DataAirTimeRemaining,
  DataDepthAvg,
  DataDiveAscentRate,
  DataDiveAscentRateAvg,
  DataNextStopDepth,
  DataOxygenToxicity,
  DataPO2,
  DataPressureSACAvg,
  DataRMVAvg,
  DataSurfaceInterval
} from './data.dive';
import { DataStore, DynamicDataLoader } from './data.store';
import { EventImporterJSON } from '../events/adapters/importers/json/importer.json';
import { ActivityTypes } from '../activities/activity.types';

describe('native dive data types', () => {
  it('retains canonical types, units, display names, and JSON values', () => {
    expect(new DataDepthAvg(12.345).toJSON()).toEqual({ 'Average Depth': 12.345 });
    expect(new DataNextStopDepth(3).getUnit()).toBe('m');
    expect(new DataSurfaceInterval(600).getUnit()).toBe('s');
    expect(new DataDiveAscentRate(-0.287).getUnit()).toBe('m/s');
    expect(new DataDiveAscentRateAvg(0.044).getType()).toBe('Average Dive Ascent Rate');
    expect(new DataOxygenToxicity(3).getUnit()).toBe('OTUs');
    expect(new DataPressureSACAvg(1.67).getUnit()).toBe('bar/min');
    expect(new DataRMVAvg(21.5).getUnit()).toBe('L/min');
    expect(new DataPO2(0.21).getDisplayType()).toBe('PO₂');
    expect(new DataAirTimeRemaining(4_294_961_197).getValue()).toBe(4_294_961_197);
  });

  it('rejects non-finite values', () => {
    expect(() => new DataDiveAscentRate(Number.NaN)).toThrow();
    expect(() => new DataSurfaceInterval(Number.POSITIVE_INFINITY)).toThrow();
    expect(() => new DataPO2(Number.NEGATIVE_INFINITY)).toThrow();
  });

  it('is publicly enumerable, canonicalizable, and persistent in native activity JSON', () => {
    expect(DataStore.DataDepthAvg).toBe(DataDepthAvg);
    expect(DynamicDataLoader.getDataClassFromDataType(DataAirTimeRemaining.type)).toBe(DataAirTimeRemaining);
    expect(DynamicDataLoader.getDataInstanceFromDataType(DataDiveAscentRateAvg.type, 0.044)).toBeInstanceOf(
      DataDiveAscentRateAvg
    );

    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'stored-dive',
      startDate: 0,
      endDate: 1000,
      type: ActivityTypes.Diving,
      powerMeter: false,
      trainer: false,
      stats: { [DataDepthAvg.type]: 12.345 },
      streams: [{ type: DataAirTimeRemaining.type, data: [1200, null, 1100] }],
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });
    const serialized = activity.toJSON();

    expect(activity.getStat(DataDepthAvg.type)?.getValue()).toBe(12.345);
    expect(activity.getStreamData(DataAirTimeRemaining.type)).toEqual([1200, null, 1100]);
    expect(EventImporterJSON.getActivityFromJSON(serialized).toJSON()).toEqual(serialized);
  });
});
