import * as RRData from './data.rr';
import { EventJSONInterface } from '../events/event.json.interface';
import * as PublicAPI from '../index';
import { DataStore, DynamicDataLoader } from './data.store';
import { EventImporterJSON } from '../events/adapters/importers/json/importer.json';

describe('R-R metric contract', () => {
  it.each(Object.values(RRData))('%s is numeric, discoverable and serializable', DataClass => {
    const instance = new DataClass(0);
    expect((PublicAPI as unknown as Record<string, unknown>)[DataClass.name]).toBe(DataClass);
    expect(DataStore[DataClass.name]).toBe(DataClass);
    expect(DynamicDataLoader.getDataClassFromDataType(DataClass.type)).toBe(DataClass);
    expect(DynamicDataLoader.getDataInstanceFromDataType(DataClass.type, 1).getValue()).toBe(1);
    expect(JSON.parse(JSON.stringify(instance.toJSON()))).toEqual({ [DataClass.type]: 0 });
    for (const invalid of [NaN, Infinity, -Infinity, null, '1'])
      expect(() => new DataClass(invalid as number)).toThrow();
  });
  it('validates percentages, counts and finite signed DFA values deliberately', () => {
    expect(() => new RRData.DataRRCoverage(101)).toThrow();
    expect(() => new RRData.DataRRIntervalCount(1.5)).toThrow();
    expect(() => new RRData.DataRRArtifactCount(-1)).toThrow();
    expect(new RRData.DataRRDFAAlpha1Median(-0.1).getValue()).toBe(-0.1);
    expect(new RRData.DataRRRMSSD(11.74).getDisplayValue()).toBe('11.7');
    expect(new RRData.DataRRRMSSD(11.74).getDisplayUnit()).toBe('ms');
    expect(new RRData.DataRRDFAAlpha1Median(0.625).getDisplayValue()).toBe('0.63');
  });
  it('retains canonical numeric stats in an event JSON round trip', () => {
    const stats = Object.fromEntries(Object.values(RRData).map(DataClass => [DataClass.type, 1]));
    const event = EventImporterJSON.getEventFromJSON({
      name: 'Synthetic',
      startDate: new Date(0).toISOString(),
      endDate: new Date(1000).toISOString(),
      stats,
      activities: []
    } as unknown as EventJSONInterface);
    for (const [type, value] of Object.entries(stats)) expect(event.getStat(type)!.getValue()).toBe(value);
    expect(event.toJSON().stats).toMatchObject(stats);
  });
});
