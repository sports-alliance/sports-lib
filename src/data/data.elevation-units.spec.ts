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
import {
  ElevationUnits,
  DistanceUnits,
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
});
