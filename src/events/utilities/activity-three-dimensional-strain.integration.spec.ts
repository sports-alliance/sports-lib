import * as fs from 'fs';
import * as path from 'path';
import type { ActivityInterface } from '../../activities/activity.interface';
import { EventImporterFIT } from '../adapters/importers/fit/importer.fit';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { EventImporterSuuntoJSON } from '../adapters/importers/suunto/importer.suunto.json';
import { DataCriticalPower } from '../../data/data.critical-power';
import { DataFTP } from '../../data/data.ftp';
import { DataPower } from '../../data/data.power';
import { DataPowerCurve } from '../../data/data.power-curve';
import {
  DataThreeDimensionalStrainEvidence,
  type ThreeDimensionalStrainEvidenceValue
} from '../../data/data.three-dimensional-strain-evidence';
import { DataWPrime } from '../../data/data.w-prime';
import { ActivityUtilities } from './activity.utilities';
import { calculateThreeDimensionalStrain } from './three-dimensional-impulse-response';

describe('activity three dimensional strain fixture integration', () => {
  const fitSamplesDirectory = path.resolve(__dirname, '../../../samples/fit');
  const specFitSamplesDirectory = path.resolve(__dirname, '../../specs/fixtures/rides/fit');
  const fitPowerFixturesDirectory = path.resolve(__dirname, '../../specs/fixtures/rides/fit/withpower');
  const suuntoSamplesDirectory = path.resolve(__dirname, '../../../samples/suunto');

  async function importFitFixture(name: string) {
    const fixture = fs.readFileSync(path.join(fitSamplesDirectory, name));
    return EventImporterFIT.getFromArrayBuffer(
      fixture.buffer.slice(fixture.byteOffset, fixture.byteOffset + fixture.byteLength),
      undefined,
      name
    );
  }

  async function importFitPowerFixture(name: string) {
    const fixture = fs.readFileSync(path.join(fitPowerFixturesDirectory, name));
    return EventImporterFIT.getFromArrayBuffer(
      fixture.buffer.slice(fixture.byteOffset, fixture.byteOffset + fixture.byteLength),
      undefined,
      name
    );
  }

  async function importSpecFitFixture(name: string) {
    const fixture = fs.readFileSync(path.join(specFitSamplesDirectory, name));
    return EventImporterFIT.getFromArrayBuffer(
      fixture.buffer.slice(fixture.byteOffset, fixture.byteOffset + fixture.byteLength),
      undefined,
      name
    );
  }

  async function importSuuntoFixture(name: string) {
    return EventImporterSuuntoJSON.getFromJSONString(fs.readFileSync(path.join(suuntoSamplesDirectory, name), 'utf8'));
  }

  function getEvidence(activity: Pick<ActivityInterface, 'getStat'>): ThreeDimensionalStrainEvidenceValue {
    const evidence = activity
      .getStat<ThreeDimensionalStrainEvidenceValue>(DataThreeDimensionalStrainEvidence.type)
      ?.getValue();
    expect(evidence).toBeDefined();
    return evidence as ThreeDimensionalStrainEvidenceValue;
  }

  function expectPersistedEvidenceMatchesDirectCalculation(
    activity: Pick<ActivityInterface, 'getStat' | 'getStreamData'>
  ): void {
    const persisted = getEvidence(activity);
    expect(persisted.eligibility).toEqual({ eligible: true, reason: 'eligible' });
    expect(persisted.fit).not.toBeNull();
    const direct = calculateThreeDimensionalStrain(
      activity.getStreamData(DataPower.type),
      {
        criticalPowerWatts: persisted.fit!.criticalPowerWatts,
        wPrimeJoules: persisted.fit!.wPrimeJoules,
        maximumPowerWatts: persisted.fit!.maximumPowerWatts
      },
      { minimumCoverageRatio: 0.95, maximumPowerAvailableExponent: 1, wPrimeBalanceTiming: 'before-sample' }
    );

    expect(direct.status).toBe('ready');
    expect(persisted.evidence).not.toBeNull();
    expect(persisted.evidence).toMatchObject({
      total: expect.closeTo(direct.scores!.total, 10),
      criticalPower: expect.closeTo(direct.scores!.criticalPower, 10),
      wPrime: expect.closeTo(direct.scores!.wPrime, 10),
      maximumPower: expect.closeTo(direct.scores!.maximumPower, 10),
      endingWPrimeBalanceJoules: expect.closeTo(direct.endingWPrimeBalanceJoules!, 10),
      minimumWPrimeBalanceJoules: expect.closeTo(direct.minimumWPrimeBalanceJoules!, 10)
    });
  }

  it('persists a direct-calculation-equivalent result for a continuous cycling FIT activity', async () => {
    const event = await importSpecFitFixture('971150603.fit');
    const activity = event.getFirstActivity();

    expect(activity.getStreamData(DataPower.type)).toHaveLength(3_823);
    expect(getEvidence(activity)).toMatchObject({
      discipline: 'cycling',
      fit: {
        criticalPowerWatts: expect.closeTo(147.46469400213877, 6),
        wPrimeJoules: expect.closeTo(9_318.191991981243, 4),
        maximumPowerWatts: expect.closeTo(381.0000003814383, 6)
      },
      evidence: {
        total: expect.closeTo(213.39434199786072, 6),
        criticalPower: expect.closeTo(185.9297799947054, 6),
        wPrime: expect.closeTo(19.476678903678067, 6),
        maximumPower: expect.closeTo(7.9878830994744145, 6)
      }
    });
    expectPersistedEvidenceMatchesDirectCalculation(activity);
  });

  it('keeps missing and gapped FIT power unavailable without inventing load', async () => {
    const gappedActivity = (await importFitFixture('road-with-power.fit')).getFirstActivity();
    const missingActivity = (await importFitFixture('garmin.fit')).getFirstActivity();

    expect(getEvidence(gappedActivity).eligibility).toEqual({ eligible: false, reason: 'insufficient-coverage' });
    expect(getEvidence(gappedActivity).evidence).toBeNull();
    expect(getEvidence(missingActivity).eligibility).toEqual({ eligible: false, reason: 'missing-power' });
    expect(getEvidence(missingActivity).evidence).toBeNull();
  });

  it('supports real running-power Suunto activities, including zero-watt coasting samples', async () => {
    const continuousActivity = (await importSuuntoFixture('running-with-extra-data.json')).getFirstActivity();
    const zeroPowerActivity = (
      await importSuuntoFixture('ym780_Chengdu___3.27.4+2026-05-14_04.13.18-Running-2522C0000220.json')
    ).getFirstActivity();

    expect(continuousActivity.getStreamData(DataPower.type)).toHaveLength(4_900);
    expect(getEvidence(continuousActivity)).toMatchObject({
      discipline: 'running',
      input: { validPowerSampleCount: 4_882, coverageRatio: expect.closeTo(0.9963265306122449, 10) },
      fit: {
        criticalPowerWatts: expect.closeTo(210.58046538565867, 6),
        wPrimeJoules: expect.closeTo(188_597.2632162341, 3),
        maximumPowerWatts: expect.closeTo(337.0000003373877, 6)
      },
      evidence: {
        total: expect.closeTo(225.13970877968467, 6),
        criticalPower: expect.closeTo(192.40098826492198, 6),
        wPrime: expect.closeTo(15.79938935241343, 6),
        maximumPower: expect.closeTo(16.939331162346814, 6)
      }
    });
    expectPersistedEvidenceMatchesDirectCalculation(continuousActivity);
    expect(zeroPowerActivity.getStreamData(DataPower.type)).toContain(0);
    expectPersistedEvidenceMatchesDirectCalculation(zeroPowerActivity);
  });

  it('creates a deterministic compact record across the current power FIT fixture set', async () => {
    const fixtureNames = fs
      .readdirSync(fitPowerFixturesDirectory)
      .filter(name => name.endsWith('.fit'))
      .sort();

    expect(fixtureNames.length).toBeGreaterThanOrEqual(9);
    for (const name of fixtureNames) {
      const activity = (await importFitPowerFixture(name)).getFirstActivity();
      const evidence = getEvidence(activity);
      expect(evidence.sourceFingerprint).toMatch(/^three-dimensional-strain-v1:[0-9a-f]{16}$/);
      expect(evidence.discipline).toBe('cycling');
      expect(JSON.stringify(evidence)).not.toContain('timeline');
    }
  });

  it('round-trips compact evidence through native event JSON', async () => {
    const event = await importSpecFitFixture('971150603.fit');
    const original = getEvidence(event.getFirstActivity());

    const restoredEvent = EventImporterJSON.getEventFromJSON(event.toJSON());
    const restoredActivity = restoredEvent.getFirstActivity();
    const restoredStat = restoredActivity.getStat(DataThreeDimensionalStrainEvidence.type);

    expect(restoredStat).toBeInstanceOf(DataThreeDimensionalStrainEvidence);
    expect(getEvidence(restoredActivity)).toEqual(original);
    expect(JSON.stringify(restoredActivity.toJSON())).not.toContain('timeline');
  });

  it('does not alter existing power metrics when evidence is regenerated', async () => {
    const activity = (await importFitFixture('2025-12-24_13-50.fit')).getFirstActivity();
    const existingMetrics = [DataPowerCurve.type, DataFTP.type, DataCriticalPower.type, DataWPrime.type].map(type => [
      type,
      activity.getStat(type)
    ]);
    const originalEvidence = activity.getStat(DataThreeDimensionalStrainEvidence.type);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    existingMetrics.forEach(([type, stat]) => expect(activity.getStat(type as string)).toBe(stat));
    expect(activity.getStat(DataThreeDimensionalStrainEvidence.type)).toBe(originalEvidence);
  });
});
