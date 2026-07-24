import fs from 'fs';
import { SportsLib } from '../index';
import { DataFTP } from '../data/data.ftp';
import { DataCriticalPower } from '../data/data.critical-power';
import { DataNumber } from '../data/data.number';
import { DataWPrime } from '../data/data.w-prime';
import { DataPowerCurve } from '../data/data.power-curve';

interface FitPowerExpectation {
  label: string;
  fixturePath: string;
  ftp: number;
}

describe('FTP and power-curve evidence on real FIT files', () => {
  const fixtureCases: FitPowerExpectation[] = [
    {
      label: 'Garmin Edge 1000 long ride',
      fixturePath: __dirname + '/fixtures/rides/fit/7432332116.fit',
      ftp: 180
    },
    {
      label: 'Garmin ride with high variability',
      fixturePath: __dirname + '/fixtures/rides/fit/7386755164.fit',
      ftp: 228
    },
    {
      label: 'Garmin ride with stable sustained effort',
      fixturePath: __dirname + '/fixtures/rides/fit/971150603.fit',
      ftp: 157
    },
    {
      label: 'Garmin ride with moderate variability',
      fixturePath: __dirname + '/fixtures/rides/fit/7445393868.fit',
      ftp: 201
    }
  ];

  const withPowerSampleCases: FitPowerExpectation[] = [
    {
      label: 'withpower sample 2025-11-02_10-30',
      fixturePath: __dirname + '/fixtures/rides/fit/withpower/2025-11-02_10-30.fit',
      ftp: 200
    },
    {
      label: 'withpower sample 2025-11-11_15-47',
      fixturePath: __dirname + '/fixtures/rides/fit/withpower/2025-11-11_15-47.fit',
      ftp: 210
    },
    {
      label: 'withpower sample 2025-12-29_14-12',
      fixturePath: __dirname + '/fixtures/rides/fit/withpower/2025-12-29_14-12.fit',
      ftp: 234
    },
    {
      label: 'withpower sample 2026-01-02_14-24',
      fixturePath: __dirname + '/fixtures/rides/fit/withpower/2026-01-02_14-24.fit',
      ftp: 234
    },
    {
      label: 'withpower sample 2026-01-05_14-41',
      fixturePath: __dirname + '/fixtures/rides/fit/withpower/2026-01-05_14-41.fit',
      ftp: 234
    },
    {
      label: 'withpower sample 2026-01-16_15-01',
      fixturePath: __dirname + '/fixtures/rides/fit/withpower/2026-01-16_15-01.fit',
      ftp: 234
    },
    {
      label: 'withpower sample 2026-01-19_14-57',
      fixturePath: __dirname + '/fixtures/rides/fit/withpower/2026-01-19_14-57.fit',
      ftp: 234
    },
    {
      label: 'withpower sample 2026-01-27_14-37',
      fixturePath: __dirname + '/fixtures/rides/fit/withpower/2026-01-27_14-37.fit',
      ftp: 234
    },
    {
      label: 'withpower sample 2026-02-02_14-32',
      fixturePath: __dirname + '/fixtures/rides/fit/withpower/2026-02-02_14-32.fit',
      ftp: 234
    }
  ];

  const assertPowerMetrics = (testCase: FitPowerExpectation) => {
    it(`should retain FTP and power curves without inferring CP/W′ for ${testCase.label}`, async () => {
      const buffer = fs.readFileSync(testCase.fixturePath);
      const event = await SportsLib.importFromFit(buffer);
      const activity = event.getFirstActivity();

      const ftp = activity.getStat(DataFTP.type);
      const cp = activity.getStat(DataCriticalPower.type);
      const wPrime = activity.getStat(DataWPrime.type);

      expect(ftp).toBeDefined();
      expect(cp).toBeUndefined();
      expect(wPrime).toBeUndefined();
      expect(activity.getStat(DataPowerCurve.type)).toBeDefined();

      expect((ftp as DataNumber).getValue()).toBe(testCase.ftp);
    });
  };

  fixtureCases.forEach(assertPowerMetrics);
  withPowerSampleCases.forEach(assertPowerMetrics);

  it('should not infer athlete capacity from either variable or steady rides', async () => {
    const variableRide = fs.readFileSync(__dirname + '/fixtures/rides/fit/7386755164.fit');
    const steadyRide = fs.readFileSync(__dirname + '/fixtures/rides/fit/971150603.fit');

    const [variableEvent, steadyEvent] = await Promise.all([
      SportsLib.importFromFit(variableRide),
      SportsLib.importFromFit(steadyRide)
    ]);

    const variableActivity = variableEvent.getFirstActivity();
    const steadyActivity = steadyEvent.getFirstActivity();

    expect(variableActivity.getStat(DataFTP.type)).toBeDefined();
    expect(steadyActivity.getStat(DataFTP.type)).toBeDefined();
    expect(variableActivity.getStat(DataCriticalPower.type)).toBeUndefined();
    expect(variableActivity.getStat(DataWPrime.type)).toBeUndefined();
    expect(steadyActivity.getStat(DataCriticalPower.type)).toBeUndefined();
    expect(steadyActivity.getStat(DataWPrime.type)).toBeUndefined();
  });

  it('should prefer imported Garmin FTP over computed 20-minute FTP when available', async () => {
    const buffer = fs.readFileSync(__dirname + '/fixtures/rides/fit/7432332116.fit');
    const event = await SportsLib.importFromFit(buffer);
    const activity = event.getFirstActivity();

    const importedFTP = (activity.getStat(DataFTP.type) as DataNumber).getValue();
    const curvePoints = activity.getStat(DataPowerCurve.type)?.getValue() as any[];
    const twentyMinutePoint = curvePoints.find(point => point.duration.getValue() === 1200);
    const computedFtpFromCurve = Math.round(twentyMinutePoint.power.getValue() * 0.95);

    expect(importedFTP).toBe(180);
    expect(computedFtpFromCurve).toBe(191);
    expect(importedFTP).not.toBe(computedFtpFromCurve);
  });
});
