import * as fs from 'fs';
import * as path from 'path';
import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { DataCriticalPower } from '../../data/data.critical-power';
import { DataFTP } from '../../data/data.ftp';
import { DataPower } from '../../data/data.power';
import { DataPowerCurve, type DataPowerCurvePoint } from '../../data/data.power-curve';
import {
  DataThreeDimensionalStrainEvidence,
  type ThreeDimensionalStrainEvidenceValueV2
} from '../../data/data.three-dimensional-strain-evidence';
import { DataWPrime } from '../../data/data.w-prime';
import { SportsLib } from '../../index';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { ActivityUtilities } from './activity.utilities';
import { EventUtilities } from './event.utilities';
import { fitThreeDimensionalCapacityModel, type DatedActivityPowerCurve } from './three-dimensional-capacity';

describe('power-capacity parsing boundary', () => {
  const fitPowerFixturesDirectory = path.resolve(__dirname, '../../specs/fixtures/rides/fit/withpower');

  it('retains FIT power evidence without inventing activity-local capacity or 3D strain', async () => {
    const fixture = fs.readFileSync(path.resolve(__dirname, '../../specs/fixtures/rides/fit/971150603.fit'));
    const event = await SportsLib.importFromFit(fixture);
    const activity = event.getFirstActivity();

    expect(activity.getStreamData(DataPower.type)).toHaveLength(3_823);
    expect(activity.getStat(DataPowerCurve.type)).toBeDefined();
    expect(activity.getStat(DataFTP.type)).toBeDefined();
    expect(activity.getStat(DataCriticalPower.type)).toBeUndefined();
    expect(activity.getStat(DataWPrime.type)).toBeUndefined();
    expect(activity.getStat(DataThreeDimensionalStrainEvidence.type)).toBeUndefined();
  });

  it('applies the same boundary to non-cycling activities with power', () => {
    const activity = new Activity(new Date(0), new Date(3_600_000), ActivityTypes.Rowing, new Creator('Test'));
    activity.addStream(activity.createStream(DataPower.type).setData(Array(3_600).fill(200)));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataPowerCurve.type)).toBeDefined();
    expect(activity.getStat(DataCriticalPower.type)).toBeUndefined();
    expect(activity.getStat(DataWPrime.type)).toBeUndefined();
    expect(activity.getStat(DataThreeDimensionalStrainEvidence.type)).toBeUndefined();
  });

  it('keeps the real multi-activity FIT history behind the chronological quality gate', async () => {
    const fixtureNames = fs
      .readdirSync(fitPowerFixturesDirectory)
      .filter(name => name.endsWith('.fit'))
      .sort();
    const history: DatedActivityPowerCurve[] = [];

    expect(fixtureNames.length).toBeGreaterThanOrEqual(9);
    for (const name of fixtureNames) {
      const activity = (
        await SportsLib.importFromFit(fs.readFileSync(path.join(fitPowerFixturesDirectory, name)))
      ).getFirstActivity();
      expect(activity.getStat(DataPowerCurve.type)).toBeDefined();
      expect(activity.getStat(DataCriticalPower.type)).toBeUndefined();
      expect(activity.getStat(DataWPrime.type)).toBeUndefined();
      expect(activity.getStat(DataThreeDimensionalStrainEvidence.type)).toBeUndefined();
      history.push({
        sourceId: name,
        date: name.slice(0, 10),
        activityType: activity.type,
        powerCurve: activity.getStat<DataPowerCurvePoint[]>(DataPowerCurve.type)!.getValue()
      });
    }

    expect(fitThreeDimensionalCapacityModel(history, { effectiveDate: '2026-02-09' })).toMatchObject({
      status: 'partial',
      reason: 'unstable-w-prime-fit',
      model: null,
      activityType: ActivityTypes.Cycling,
      criticalPower: { status: 'ready', value: expect.any(Number) },
      wPrime: { status: 'unstable', value: null },
      maximumPower: { status: 'insufficient-evidence', value: null },
      diagnostics: {
        sourceCount: 9,
        historySpanDays: 92,
        criticalPowerAnchorCount: 8,
        criticalPowerContributingSourceCount: 2,
        maximumPowerAnchorCount: 8,
        maximumPowerContributingSourceCount: 2,
        criticalPowerNormalizedRmse: expect.any(Number),
        criticalPowerSourceRemovalFitCount: expect.any(Number),
        criticalPowerSourceRemovalFailureCount: expect.any(Number)
      }
    });

    const trailingHistory = history.filter(curve => curve.date >= '2025-12-29');
    const trailingFit = fitThreeDimensionalCapacityModel(trailingHistory, {
      effectiveDate: '2026-02-09'
    });
    expect(trailingFit).toEqual(
      fitThreeDimensionalCapacityModel([...trailingHistory].reverse(), {
        effectiveDate: '2026-02-09'
      })
    );
    expect(trailingFit).toMatchObject({
      status: 'partial',
      reason: 'poor-maximum-power-fit',
      model: null,
      activityType: ActivityTypes.Cycling,
      criticalPower: { status: 'ready', value: expect.any(Number) },
      wPrime: { status: 'ready', value: expect.any(Number) },
      maximumPower: { status: 'poor-fit', value: null },
      diagnostics: {
        sourceCount: 7,
        historySpanDays: 35,
        criticalPowerAnchorCount: 8,
        criticalPowerContributingSourceCount: 2,
        maximumPowerAnchorCount: 8,
        maximumPowerContributingSourceCount: 2,
        maximumPowerNormalizedRmse: expect.any(Number)
      }
    });
  });

  it('continues to hydrate and round-trip historical caller-supplied values', async () => {
    const fixture = fs.readFileSync(path.resolve(__dirname, '../../specs/fixtures/rides/fit/971150603.fit'));
    const event = await SportsLib.importFromFit(fixture);
    const activity = event.getFirstActivity();
    const legacyEvidence: ThreeDimensionalStrainEvidenceValueV2 = {
      protocolVersion: 2,
      sourceFingerprint: 'three-dimensional-strain-v2:0000000000000000',
      activityType: ActivityTypes.Cycling,
      activityGroup: 'cycling_group',
      eligibility: { eligible: false, reason: 'fit-failed' },
      input: {
        powerSampleCount: 3_823,
        validPowerSampleCount: 3_823,
        candidateDurationSeconds: 3_823,
        recordedDurationSeconds: 3_823,
        coverageRatio: 1,
        curvePointCount: 3_823,
        hasShortDuration: true,
        hasMediumDuration: true,
        hasLongDuration: true
      },
      fit: null,
      evidence: null
    };
    activity.addStat(new DataCriticalPower(280));
    activity.addStat(new DataWPrime(18_000));
    activity.addStat(new DataThreeDimensionalStrainEvidence(legacyEvidence));

    const restoredEvent = EventImporterJSON.getEventFromJSON(event.toJSON());
    const restored = restoredEvent.getFirstActivity();

    expect(restored.getStat(DataCriticalPower.type)?.getValue()).toBe(280);
    expect(restored.getStat(DataWPrime.type)?.getValue()).toBe(18_000);
    expect(restored.getStat(DataThreeDimensionalStrainEvidence.type)?.getValue()).toEqual(legacyEvidence);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(restored);
    expect(restored.getStat(DataCriticalPower.type)?.getValue()).toBe(280);
    expect(restored.getStat(DataWPrime.type)?.getValue()).toBe(18_000);
    expect(restored.getStat(DataThreeDimensionalStrainEvidence.type)?.getValue()).toEqual(legacyEvidence);

    EventUtilities.reGenerateStatsForEvent(restoredEvent);
    expect(restoredEvent.getStat(DataCriticalPower.type)?.getValue()).toBe(280);
    expect(restoredEvent.getStat(DataWPrime.type)?.getValue()).toBe(18_000);
    expect(restoredEvent.getStat(DataThreeDimensionalStrainEvidence.type)).toBeUndefined();
  });
});
