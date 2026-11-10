import { DataAltitude } from './data.altitude';
import { DataAltitudeAvg } from './data.altitude-avg';
import { DataAltitudeMin } from './data.altitude-min';
import { DataAltitudeMax } from './data.altitude-max';
import { DataAltitudeSmooth } from './data.altitude-smooth';
import { DataGPSAltitude } from './data.altitude-gps';
import { DataStrydAltitude } from './data.stryd-altitude';
import { DataStartAltitude } from './data.start-altitude';
import { DataEndAltitude } from './data.end-altitude';
import { DataAscent } from './data.ascent';
import { DataDescent } from './data.descent';
import { DataEHPE } from './data.ehpe';
import { DataFusedAltitude } from './data.fused-altitude';
import { DataStore, DynamicDataLoader } from './data.store';
import { DataWeight } from './data.weight';
import { Event } from '../events/event';
import { Activity } from '../activities/activity';
import { ActivityTypes } from '../activities/activity.types';
import { Creator } from '../creators/creator';
import { Lap } from '../laps/lap';
import { LapTypes } from '../laps/lap.types';
import { Stream } from '../streams/stream';
import { FileType } from '../events/adapters/file-type.enum';
import { EventImporterJSON } from '../events/adapters/importers/json/importer.json';
import { EventExporterJSON } from '../events/adapters/exporters/exporter.json';
import {
  ElevationUnits,
  DistanceUnits,
  WeightUnits,
  type UserUnitSettingsInterface
} from '../users/settings/user.unit.settings.interface';

describe('independent elevation display units', () => {
  const metrics = [
    DataAltitude,
    DataAltitudeAvg,
    DataAltitudeMin,
    DataAltitudeMax,
    DataAltitudeSmooth,
    DataGPSAltitude,
    DataStrydAltitude,
    DataStartAltitude,
    DataEndAltitude,
    DataAscent,
    DataDescent
  ];
  const feet = { elevationUnits: ElevationUnits.Feet } as UserUnitSettingsInterface;
  it.each(metrics)('%p displays feet while keeping its canonical metric, value and JSON', Metric => {
    const canonical = new Metric(30.48);
    const display = DynamicDataLoader.getUnitBasedDataFromDataInstance(canonical, feet)[0] as DataAltitude;
    expect(display).toBeInstanceOf(Metric);
    expect(display.getType()).toBe(Metric.type);
    expect(Number(display.getDisplayValue())).toBe(100);
    expect(display.getDisplayUnit()).toBe('ft');
    expect(display.getValue()).toBe(30.48);
    expect(display.getUnit()).toBe('m');
    expect(display.toJSON()).toEqual(canonical.toJSON());
    expect(canonical.getDisplayUnit()).toBe('m');
    expect(DynamicDataLoader.getDataClassFromDataType(Metric.type)).toBe(Metric);
    expect(Object.values(DataStore)).toContain(Metric);
    const hydrated = Metric.fromJSON(JSON.parse(JSON.stringify(display.toJSON())));
    expect(hydrated.getValue()).toBe(30.48);
    expect(hydrated.getDisplayUnit()).toBe('m');
    expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(Metric.type, feet)).toEqual([Metric.type]);
    expect(DynamicDataLoader.getUnitBasedDataTypesFromDataTypes([Metric.type], feet)).toEqual([]);
    expect(DynamicDataLoader.isUnitDerivedDataType(Metric.type)).toBe(false);
    expect(
      DynamicDataLoader.getUnitBasedDataFromDataInstance(display, {
        elevationUnits: ElevationUnits.Meters
      } as UserUnitSettingsInterface)[0].getDisplayUnit()
    ).toBe('m');
  });
  it('retains metre defaults independently of miles, and preserves negative altitude, zero and input precision', () => {
    expect(
      DynamicDataLoader.getUnitBasedDataFromDataInstance(new DataAltitude(100), {
        distanceUnits: DistanceUnits.Miles
      } as UserUnitSettingsInterface)[0].getDisplayUnit()
    ).toBe('m');
    expect(new DataAltitude(-30.48, ElevationUnits.Feet).getDisplayValue()).toBe(-100);
    expect(new DataAscent(0, ElevationUnits.Feet).getDisplayValue()).toBe('0');
    expect(new DataAltitude(1, ElevationUnits.Feet).getDisplayNumericValue()).toBeCloseTo(3.280839895, 8);
    expect(DataAscent.fromDisplayValue(50, ElevationUnits.Feet).toJSON()).toEqual({ Ascent: 15.24 });
    expect(DataAltitude.fromDisplayValue(-50, ElevationUnits.Feet).getValue()).toBe(-15.24);
    expect(() => DataAltitude.fromDisplayValue(1, 'yard' as ElevationUnits)).toThrow('Unsupported elevation');
    expect(() => new DataAltitude(Infinity, ElevationUnits.Feet)).toThrow();
  });
  it('leaves accuracy and the fused-altitude flag outside elevation conversion', () => {
    expect(DynamicDataLoader.getUnitBasedDataFromDataInstance(new DataEHPE(5), feet)[0].getDisplayUnit()).toBe('m');
    expect(
      DynamicDataLoader.getUnitBasedDataFromDataInstance(new DataFusedAltitude(true), feet)[0].getDisplayValue()
    ).toBe('Yes');
  });

  it.each(metrics)('%p retains exact canonical values through repeated preference and JSON round trips', Metric => {
    for (const value of [-123.456789, -30.48, 0, 0.3048, 1, 12.3456789, 123456.789]) {
      const original = new Metric(value);
      let current: DataAltitude = original;
      for (let cycle = 0; cycle < 5; cycle++) {
        for (const elevationUnits of [ElevationUnits.Feet, ElevationUnits.Meters, ElevationUnits.Feet]) {
          current = DynamicDataLoader.getUnitBasedDataFromDataInstance(current, {
            elevationUnits,
            distanceUnits: DistanceUnits.Miles
          } as UserUnitSettingsInterface)[0] as DataAltitude;
          expect(current.getType()).toBe(Metric.type);
          expect(current.getUnit()).toBe('m');
          expect(current.getUnitSystem()).toBe(original.getUnitSystem());
          expect(current.getValue()).toBe(value);
          expect(JSON.parse(JSON.stringify(current))).toEqual({ [Metric.type]: value });
        }
        current = Metric.fromJSON(JSON.parse(JSON.stringify(current)));
        expect(current).toBeInstanceOf(Metric);
        expect(current.getDisplayUnit()).toBe('m');
      }
      const feetDisplay = DynamicDataLoader.getUnitBasedDataFromDataInstance(current, feet)[0] as DataAltitude;
      const input = Metric.fromDisplayValue(feetDisplay.getDisplayNumericValue(), ElevationUnits.Feet);
      expect(input).toBeInstanceOf(Metric);
      expect(input.getDisplayUnit()).toBe('m');
      // Only input arithmetic can incur a floating-point ULP; preference changes and JSON above stay exact.
      expect(Math.abs(input.getValue() - value)).toBeLessThanOrEqual(Math.max(1, Math.abs(value)) * Number.EPSILON * 2);
      feetDisplay.setValue(value + 1);
      expect(original.getValue()).toBe(value);
    }
  });

  it.each([ElevationUnits.Meters, ElevationUnits.Feet])(
    'rejects nonnumeric and non-finite %s inputs before conversion',
    units => {
      for (const invalid of ['10', '', null, undefined, true, false, {}, [], NaN, Infinity, -Infinity]) {
        expect(() => DataAltitude.fromDisplayValue(invalid as number, units)).toThrow();
        expect(() => DataAscent.fromDisplayValue(invalid as number, units)).toThrow();
      }
    }
  );

  it('rejects unsupported explicit constructor units while legacy or malformed preferences retain metres', () => {
    for (const units of [null, '', 'yard']) {
      expect(() => new DataAltitude(1, units as ElevationUnits)).toThrow('Unsupported elevation');
      const display = DynamicDataLoader.getUnitBasedDataFromDataInstance(new DataAscent(30.48), {
        elevationUnits: units,
        distanceUnits: DistanceUnits.Miles
      } as UserUnitSettingsInterface)[0];
      expect(display.getDisplayUnit()).toBe('m');
      expect(display.getValue()).toBe(30.48);
    }
    expect(new DataAltitude(1, undefined).getDisplayUnit()).toBe('m');
  });

  it('keeps weight, distance and elevation preferences independent using the canonical weight display pattern', () => {
    const settings = {
      elevationUnits: ElevationUnits.Feet,
      weightUnits: WeightUnits.Pounds,
      distanceUnits: DistanceUnits.Kilometers
    } as UserUnitSettingsInterface;
    const mass = DynamicDataLoader.getUnitBasedDataFromDataInstance(new DataWeight(80), settings)[0];
    const altitude = DynamicDataLoader.getUnitBasedDataFromDataInstance(new DataAltitude(30.48), settings)[0];
    expect(mass.getDisplayUnit()).toBe('lb');
    expect(altitude.getDisplayUnit()).toBe('ft');
    expect(mass.toJSON()).toEqual({ Weight: 80 });
    expect(altitude.toJSON()).toEqual({ Altitude: 30.48 });
  });

  it('preserves event, activity, lap and raw stream JSON when display-configured stats are exported and reloaded', async () => {
    const event = new Event('Synthetic elevation round trip', new Date(0), new Date(5000), FileType.FIT);
    const activity = new Activity(new Date(0), new Date(5000), ActivityTypes.Hiking, new Creator('Synthetic'));
    const lap = new Lap(new Date(0), new Date(5000), 1, LapTypes.Manual);
    const samples = [-30.48, null, 0, 123.456789, 30.48];
    for (const Metric of metrics) {
      for (const owner of [event, activity, lap]) owner.addStat(new Metric(1234.56789123));
    }
    activity.addStream(new Stream(DataAltitude.type, samples));
    activity.addLap(lap);
    event.addActivity(activity);
    let restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event)));
    const expected = JSON.parse(JSON.stringify(restored));
    for (let cycle = 0; cycle < 5; cycle++) {
      const restoredActivity = restored.getActivities()[0];
      for (const owner of [restored, restoredActivity, restoredActivity.getLaps()[0]]) {
        for (const Metric of metrics) {
          const stat = owner.getStat(Metric.type)!;
          expect(stat.getDisplayUnit()).toBe('m');
          const display = DynamicDataLoader.getUnitBasedDataFromDataInstance(stat, feet)[0];
          expect(display.getDisplayUnit()).toBe('ft');
          owner.addStat(display);
        }
      }
      expect(restoredActivity.getStreamData(DataAltitude.type)).toEqual(samples);
      expect(EventExporterJSON.export(restored)).toEqual(expected);
      expect(JSON.parse(await EventExporterJSON.getAsString(restored))).toEqual(expected);
      restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(restored)));
    }
  });
});
