import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from '../../adapters/importers/fit/importer.fit';
import { SportsLib } from '../../../index';
import { Activity } from '../../../activities/activity';
import { ActivityParsingOptions, type ActivityParsingTssOverridesOptions } from '../../../activities/activity-parsing-options';
import { ActivityTypes } from '../../../activities/activity.types';
import { Creator } from '../../../creators/creator';
import { DataHeartRate } from '../../../data/data.heart-rate';
import { DataEnergy } from '../../../data/data.energy';
import { DataWeight } from '../../../data/data.weight';
import { DataPowerNormalized } from '../../../data/data.power-normalized';
import { DataSpeedAvg } from '../../../data/data.speed-avg';
import { DataTrainingStressScore } from '../../../data/data.training-stress-score';
import { DataTrainingStressScoreMethod } from '../../../data/data.training-stress-score-method';
import { ActivityUtilities } from '../activity.utilities';
import { TssCalculator } from './tss-calculator';
import { fileFunctionalThresholdPower, fileHeartRateCalibration } from './tss-evaluation';
import { resolveFitHeartRateCalibration } from '../../adapters/importers/fit/fit-hr-calibration';
import { DataStopEvent } from '../../../data/data.stop-event';
import { DataStartEvent } from '../../../data/data.start-event';

const evaluate = ActivityUtilities.evaluateTrainingStressScore.bind(ActivityUtilities);
const walkingAndHikingTypes = [ActivityTypes.Walking, ActivityTypes.NordicWalking, ActivityTypes.Hiking, ActivityTypes.Trekking];
const excludedTypes = new Set([
  ActivityTypes.CarRacing, ActivityTypes.MotorcycleEnduro, ActivityTypes.HardEnduro, ActivityTypes.Snocross,
  ActivityTypes.Boating, ActivityTypes.Driving, ActivityTypes.Motorcycling, ActivityTypes.ATV,
  ActivityTypes.Motocross, ActivityTypes.Motorsports, ActivityTypes.Overlanding, ActivityTypes.Rally,
  ActivityTypes.Snowmobiling, ActivityTypes.WheelchairRacing, ActivityTypes.Wheelchair,
  ActivityTypes.WheelchairPushWalk, ActivityTypes.WheelchairPushRun, ActivityTypes.IndoorWheelchairPushWalk,
  ActivityTypes.IndoorWheelchairPushRun, ActivityTypes.VideoGaming, ActivityTypes.Paramotoring, ActivityTypes.RCDroneFlying
]);
const generalProfileTypes = [...walkingAndHikingTypes, ActivityTypes.IndoorWalking, ActivityTypes.SpeedWalking,
  ActivityTypes.Rucking, ActivityTypes.Mountaineering, ActivityTypes.Geocaching, ActivityTypes.Swimming,
  ActivityTypes.OpenWaterSwimming, ActivityTypes.StrengthTraining, ActivityTypes.Rowing, ActivityTypes.Yoga,
  ActivityTypes.AlpineSkiing, ActivityTypes.UnknownSport];
const activity = (type = ActivityTypes.Running) => {
  const a = new Activity(new Date(0), new Date(3600000), type, new Creator('Synthetic'), new ActivityParsingOptions());
  const stream = a.createStream(DataHeartRate.type);
  stream.setData(Array(3601).fill(150));
  a.addStream(stream);
  a.addStat(new DataEnergy(210));
  a.addStat(new DataWeight(70));
  fileHeartRateCalibration.set(a, { lactateThresholdHR: 160 });
  return a;
};
const fit = (settings: Record<string, unknown>, type = ActivityTypes.Running) => {
  const session = { message_index: 0 };
  return resolveFitHeartRateCalibration(
    { sessions: [session], time_in_zone: [{ reference_mesg: 'session', reference_index: 0, ...settings }] },
    session,
    0,
    type
  );
};

describe('threshold-HR fallback', () => {
  it.each([ActivityTypes.Running, ActivityTypes.TrailRunning, ActivityTypes.Cycling, ActivityTypes.MountainBiking, ...walkingAndHikingTypes])(
    'uses the existing threshold bands for %s when Banister inputs are missing',
    type => {
      const result = evaluate(activity(type));
      expect(result.automatic).toMatchObject({ score: 70, method: 'HR', hrAlgorithm: 'THRESHOLD', estimated: true });
      expect(result.hr.reasons).toEqual(['threshold-hr-fallback']);
      expect(result.met).toMatchObject({ score: 9, method: 'MET' });
      expect(result.met.hrAlgorithm).toBeUndefined();
    }
  );
  it.each([...new Set(Object.values(ActivityTypes))])('shares calculated-load eligibility with FIT threshold calibration for %s', type => {
    const a = activity(type);
    const calibration = fit({ threshold_heart_rate: 160, max_heart_rate: 0, resting_heart_rate: 0 }, type);
    fileHeartRateCalibration.set(a, calibration);
    if (excludedTypes.has(type)) {
      expect(calibration.thresholdFallbackHR).toBeUndefined();
      expect(evaluate(a).automatic).toMatchObject({ score: null, method: null, reasons: ['unsupported-sport'] });
    } else {
      expect(calibration.thresholdFallbackHR).toBe(160);
      expect(evaluate(a).automatic).toMatchObject({ score: 70, method: 'HR', hrAlgorithm: 'THRESHOLD', estimated: true });
    }
    a.addStat(new DataTrainingStressScore(0));
    for (const candidate of Object.values(evaluate(a)).filter(value => typeof value === 'object')) {
      expect(candidate).toMatchObject({ score: 0, method: 'IMPORTED' });
    }
  });
  describe.each(generalProfileTypes)('%s threshold-HR safeguards', type => {
    it('uses the threshold estimate for one hour at 100 bpm with threshold 165', () => {
      const a = activity(type);
      a.getStream(DataHeartRate.type).setData(Array(3601).fill(100));
      fileHeartRateCalibration.set(a, { lactateThresholdHR: 165 });
      expect(evaluate(a).automatic).toMatchObject({ score: 40, method: 'HR', hrAlgorithm: 'THRESHOLD', estimated: true });
    });
    it('keeps sport-specific Automatic eligibility and explicit HR and MET candidates', () => {
      const a = activity(type);
      fileFunctionalThresholdPower.set(a, 200);
      a.addStat(new DataPowerNormalized(200));
      const result = evaluate(a);
      expect(result.automatic).toMatchObject([ActivityTypes.Swimming, ActivityTypes.OpenWaterSwimming].includes(type)
        ? { score: 70, method: 'HR', hrAlgorithm: 'THRESHOLD' } : { score: 100, method: 'POWER' });
      expect(result.hr).toMatchObject({ score: 70, method: 'HR', hrAlgorithm: 'THRESHOLD' });
      expect(result.met).toMatchObject({ score: 9, method: 'MET' });
    });
    it.each([0, 42.5])('preserves imported TSS %s for every preference', score => {
      const a = activity(type);
      a.addStat(new DataTrainingStressScore(score));
      for (const preference of ['automatic', 'hr', 'met'] as const) {
        expect(evaluate(a)[preference]).toMatchObject({ score, method: 'IMPORTED', reasons: ['imported-score'] });
      }
    });
    it('keeps complete Banister calibration and rejects a contradictory complete tuple', () => {
      const a = activity(type);
      fileHeartRateCalibration.set(a, fit({ threshold_heart_rate: 160, max_heart_rate: 190, resting_heart_rate: 55 }, type));
      expect(evaluate(a).hr).toMatchObject({ score: 78.5, method: 'HR', hrAlgorithm: 'BANISTER', estimated: false });
      fileHeartRateCalibration.set(a, fit({ threshold_heart_rate: 200, max_heart_rate: 190, resting_heart_rate: 55 }, type));
      expect(evaluate(a).hr).toMatchObject({ score: 9, method: 'MET' });
      expect(evaluate(a).hr.reasons).toContain('invalid-hr-calibration');
    });
    it('accepts unused zero rest/max fields only for the independent threshold candidate', () => {
      const a = activity(type);
      fileHeartRateCalibration.set(a, fit({ threshold_heart_rate: 160, max_heart_rate: 0, resting_heart_rate: 0 }, type));
      expect(evaluate(a).hr).toMatchObject({ score: 70, method: 'HR', hrAlgorithm: 'THRESHOLD' });
      a.parseOptions.tss!.overrides = { restingHeartRate: -1 };
      expect(evaluate(a).hr).toMatchObject({ score: 9, method: 'MET' });
    });
    it.each([
      { samples: [], reason: 'missing-hr-samples' },
      { samples: [150], reason: 'calculation-unavailable' }
    ])('retains MET with $reason when partial calibration has no observed HR interval', ({ samples, reason }) => {
      const a = activity(type);
      fileHeartRateCalibration.set(a, fit({ threshold_heart_rate: 160, max_heart_rate: 0, resting_heart_rate: 0 }, type));
      a.getStream(DataHeartRate.type).setData(samples);
      const result = evaluate(a);
      for (const candidate of [result.automatic, result.hr]) {
        expect(candidate).toMatchObject({ score: 9, method: 'MET', estimated: true });
        expect(candidate.reasons).toContain(reason);
        expect(candidate.reasons).not.toContain('invalid-hr-calibration');
        expect(candidate.hrAlgorithm).toBeUndefined();
      }
    });
    it('uses general maximum HR rather than running or cycling profile settings', () => {
      const a = activity(type), session = { message_index: 0 };
      for (const maximum of [190, 150]) {
        const calibration = resolveFitHeartRateCalibration({
          sessions: [session], zones_target: { threshold_heart_rate: 160 },
          user_profile: { default_max_heart_rate: maximum, default_max_running_heart_rate: 155, default_max_biking_heart_rate: 200 }
        }, session, 0, type);
        expect(calibration.maxHeartRate).toBe(maximum);
        fileHeartRateCalibration.set(a, calibration);
        expect(evaluate(a).hr).toMatchObject(maximum === 190
          ? { score: 70, method: 'HR', hrAlgorithm: 'THRESHOLD' } : { score: 9, method: 'MET' });
      }
    });
    it('rejects ambiguous selected FIT thresholds', () => {
      const a = activity(type), session = { message_index: 0 };
      fileHeartRateCalibration.set(a, resolveFitHeartRateCalibration({
        sessions: [session], messages: { zones_target: [{ threshold_heart_rate: 160 }, { threshold_heart_rate: 165 }] }
      }, session, 0, type));
      expect(evaluate(a).hr).toMatchObject({ method: 'MET', score: 9 });
      expect(evaluate(a).hr.reasons).toContain('ambiguous-hr-calibration');
    });
    it('excludes paused intervals and requires observed HR and an explicit threshold', () => {
      const a = activity(type);
      a.addEvent(new DataStopEvent(1200));
      a.addEvent(new DataStartEvent(2400));
      expect(evaluate(a).hr).toMatchObject({ score: 46.7, method: 'HR', hrAlgorithm: 'THRESHOLD' });
      a.getStream(DataHeartRate.type).setData([]);
      expect(evaluate(a).hr.method).toBe('MET');
      a.getStream(DataHeartRate.type).setData(Array(3601).fill(150));
      fileHeartRateCalibration.delete(a);
      expect(evaluate(a).hr.method).toBe('MET');
      a.removeStat(DataEnergy.type);
      expect(evaluate(a).hr.score).toBeNull();
    });
  });
  it.each([ActivityTypes.Swimming, ActivityTypes.OpenWaterSwimming])('prefers CSS while retaining threshold-HR fallback for %s', type => {
    const a = activity(type);
    a.addStat(new DataSpeedAvg(1));
    a.parseOptions.tss!.overrides = { thresholdSwimSpeed: 1.25 };
    expect(evaluate(a).automatic).toMatchObject({ score: 51.2, method: 'SWIM_PACE', reasons: [] });
    expect(evaluate(a).hr).toMatchObject({ score: 70, method: 'HR', hrAlgorithm: 'THRESHOLD' });
    expect(evaluate(a).met).toMatchObject({ score: 9, method: 'MET' });
    fileHeartRateCalibration.delete(a);
    expect(evaluate(a).automatic).toMatchObject({ score: 51.2, method: 'SWIM_PACE' });
    expect(evaluate(a).hr).toMatchObject({ score: 51.2, method: 'SWIM_PACE' });
  });
  it('preserves Banister, including observed zero, when calibration is complete', () => {
    const a = activity();
    fileHeartRateCalibration.set(a, { lactateThresholdHR: 160, maxHeartRate: 190, restingHeartRate: 55 });
    expect(evaluate(a).hr).toMatchObject({ method: 'HR', hrAlgorithm: 'BANISTER', estimated: false, reasons: [] });
    a.getStream(DataHeartRate.type).setData(Array(3601).fill(55));
    expect(evaluate(a).hr).toMatchObject({ score: 0, hrAlgorithm: 'BANISTER' });
  });
  it('does not replace an out-of-range Banister result with the threshold estimate', () => {
    const a = activity();
    fileHeartRateCalibration.set(a, { maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 56 });
    expect(evaluate(a).hr).toMatchObject({ method: 'MET', score: 9 });
    expect(evaluate(a).hr.reasons).toContain('calculation-unavailable');
  });
  it('retains valid session threshold precedence over unrelated defaults for partial calibration', () => {
    const session = { message_index: 4 };
    const a = activity();
    fileHeartRateCalibration.set(
      a,
      resolveFitHeartRateCalibration(
        {
          sessions: [session],
          time_in_zone: [
            { reference_mesg: 'session', reference_index: 4, threshold_heart_rate: 160, max_heart_rate: 190 }
          ],
          messages: { zones_target: [{ threshold_heart_rate: 0 }, { threshold_heart_rate: 170 }] }
        },
        session,
        0,
        a.type
      )
    );
    expect(evaluate(a).hr).toMatchObject({ method: 'HR', score: 70, hrAlgorithm: 'THRESHOLD' });
  });
  it('uses the same timer-active intervals without extrapolating through pauses', () => {
    const a = activity();
    a.addEvent(new DataStopEvent(1200));
    a.addEvent(new DataStartEvent(2400));
    expect(evaluate(a).hr.score).toBeCloseTo(46.7, 1);
  });
  it.each([
    {},
    { max_heart_rate: 190 },
    { resting_heart_rate: 55 },
    { max_heart_rate: 190, resting_heart_rate: 0 },
    { max_heart_rate: 0, resting_heart_rate: 55 }
  ])('accepts only the independently validated FIT threshold: %j', missing => {
    const a = activity();
    fileHeartRateCalibration.set(a, fit({ threshold_heart_rate: 160, ...missing }));
    expect(evaluate(a).hr).toMatchObject({ score: 70, hrAlgorithm: 'THRESHOLD' });
  });
  it.each([
    { threshold_heart_rate: 0 },
    { threshold_heart_rate: -1 },
    { threshold_heart_rate: NaN },
    { threshold_heart_rate: 200, max_heart_rate: 190 },
    { threshold_heart_rate: 50, resting_heart_rate: 55 },
    { threshold_heart_rate: 160, resting_heart_rate: -1 }
  ])('cannot rescue conflicting/invalid FIT settings: %j', settings => {
    const a = activity();
    fileHeartRateCalibration.set(a, fit(settings));
    expect(evaluate(a).hr.method).toBe('MET');
  });
  it('preserves imported zero and removes stale calculated scores on reevaluation', () => {
    const a = activity();
    a.addStat(new DataTrainingStressScore(0));
    expect(evaluate(a).hr).toMatchObject({ score: 0, method: 'IMPORTED' });
    expect(evaluate(a).hr.hrAlgorithm).toBeUndefined();
    a.addStat(new DataTrainingStressScore(500));
    a.addStat(new DataTrainingStressScoreMethod('HR'));
    expect(evaluate(a).hr).toMatchObject({ score: 70, hrAlgorithm: 'THRESHOLD' });
    fileHeartRateCalibration.delete(a);
    expect(evaluate(a).hr).toMatchObject({ score: 9, method: 'MET' });
  });
  it('rejects ambiguous sessions and selected calibration records without borrowing a threshold', () => {
    const session = { message_index: 4 };
    const row = { reference_mesg: 'session', reference_index: 4, threshold_heart_rate: 160 };
    for (const extra of [
      { sessions: [session, session] },
      { time_in_zone: [row, row] },
      { messages: { user_profile: [{ resting_heart_rate: 0 }, { resting_heart_rate: 55 }] } }
    ]) {
      const a = activity();
      fileHeartRateCalibration.set(
        a,
        resolveFitHeartRateCalibration({ sessions: [session], time_in_zone: [row], ...extra }, session, 0, a.type)
      );
      expect(evaluate(a).hr).toMatchObject({ method: 'MET' });
      expect(evaluate(a).hr.reasons).toContain('ambiguous-hr-calibration');
    }
  });
  it('does not rescue complete rejected calibration or override a supplied invalid setting', () => {
    const a = activity();
    fileHeartRateCalibration.set(
      a,
      fit({
        max_heart_rate: 187,
        resting_heart_rate: 54,
        threshold_heart_rate: 62,
        hr_calc_type: 'percent_max_hr',
        hr_zone_high_boundary: [94, 112, 131, 150, 168]
      })
    );
    expect(evaluate(a).hr).toMatchObject({ method: 'MET' });
    fileHeartRateCalibration.set(a, { lactateThresholdHR: 160 });
    a.parseOptions.tss!.overrides = { restingHeartRate: -1 };
    expect(evaluate(a).hr).toMatchObject({ method: 'MET' });
  });
  it.each(['maxHeartRate', 'restingHeartRate', 'lactateThresholdHR'] as const)(
    'rejects invalid explicit %s overrides for both HR algorithms instead of borrowing file values', key => {
      for (const completeFile of [false, true]) {
        for (const completeOverride of [false, true]) {
          for (const value of [0, -1, NaN, Infinity, null, '160']) {
            const a = activity();
            fileHeartRateCalibration.set(a, { lactateThresholdHR: 160, maxHeartRate: 190,
              ...(completeFile ? { restingHeartRate: 55 } : {}) });
            a.parseOptions.tss!.overrides = {
              ...(completeOverride ? { maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 160 } : {}),
              [key]: value
            } as ActivityParsingTssOverridesOptions;
            const result = evaluate(a).hr;
            expect(result).toMatchObject({ method: 'MET', score: 9 });
            expect(result.reasons).toContain('invalid-hr-calibration');
            expect(result.hrAlgorithm).toBeUndefined();
          }
        }
      }
    }
  );
  it('retains valid partial overrides and complete replacements of rejected file calibration', () => {
    const a = activity();
    a.parseOptions.tss!.overrides = { maxHeartRate: 190 };
    expect(evaluate(a).hr).toMatchObject({ score: 70, hrAlgorithm: 'THRESHOLD' });
    a.parseOptions.tss!.overrides.restingHeartRate = 55;
    expect(evaluate(a).hr).toMatchObject({ score: 78.5, hrAlgorithm: 'BANISTER' });
    fileHeartRateCalibration.set(a, { reason: 'ambiguous-hr-calibration' });
    a.parseOptions.tss!.overrides.lactateThresholdHR = 160;
    expect(evaluate(a).hr).toMatchObject({ score: 78.5, hrAlgorithm: 'BANISTER' });
  });
  it('decodes session-specific FIT thresholds and keeps evaluation metadata out of ordinary JSON', async () => {
    const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({
      number,
      value,
      baseType,
      size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1
    });
    const encoder = new FitEncoder(),
      start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
    encoder.writeMessage(0, [
      field(0, 4, FitBaseType.Enum),
      field(1, 1, FitBaseType.Uint16),
      field(4, start, FitBaseType.Uint32)
    ]);
    encoder.writeMessage(3, [field(4, 700, FitBaseType.Uint16)], 4);
    const sports = [2, 1, 11, 5, 10]; // Cycling, running, walking, swimming, training.
    const ids = [7, 2, 9, 4, 12];
    for (let second = 0; second <= sports.length * 3600; second += 60)
      encoder.writeMessage(20, [field(253, start + second, FitBaseType.Uint32), field(3, 150)], 1);
    sports.forEach((sport, index) =>
      encoder.writeMessage(
        18,
        [
          field(254, ids[index], FitBaseType.Uint16),
          field(253, start + (index + 1) * 3600, FitBaseType.Uint32),
          field(2, start + index * 3600, FitBaseType.Uint32),
          field(5, sport, FitBaseType.Enum),
          field(7, 3600000, FitBaseType.Uint32),
          field(8, 3600000, FitBaseType.Uint32),
          field(11, 210, FitBaseType.Uint16)
        ],
        2
      )
    );
    [4, 2, 3, 1, 0].forEach(index =>
      encoder.writeMessage(
        216,
        [
          field(0, 18, FitBaseType.Uint16),
          field(1, ids[index], FitBaseType.Uint16),
          field(11, 190),
          field(12, 0),
          field(13, index === 1 ? 170 : 160)
        ],
        3
      )
    );
    const bytes = encoder.close();
    const event = await EventImporterFIT.getFromArrayBuffer(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
    );
    const candidates = event.getActivities().map(a => ActivityUtilities.getTrainingStressScoreEvaluations(a));
    // Shared terminal records belong to the next leg; do not extrapolate the last minute.
    expect(candidates[0].hr).toMatchObject({ score: 68.8, hrAlgorithm: 'THRESHOLD' });
    expect(candidates[1].hr).toMatchObject({ score: 59, hrAlgorithm: 'THRESHOLD' });
    expect(candidates[2].hr).toMatchObject({ score: 68.8, method: 'HR', hrAlgorithm: 'THRESHOLD' });
    expect(candidates[3].hr).toMatchObject({ score: 68.8, method: 'HR', hrAlgorithm: 'THRESHOLD' });
    expect(candidates[4].hr).toMatchObject({ score: 70, method: 'HR', hrAlgorithm: 'THRESHOLD' });
    const serialized = JSON.stringify(event.toJSON());
    expect(serialized).not.toMatch(/hrAlgorithm|thresholdFallbackHR|threshold-hr-fallback/);
    expect(SportsLib.importFromJSON(JSON.parse(serialized)).getActivities()).toHaveLength(5);
  });
  it.each([
    [164, 80],
    [165, 100],
    [166, 100]
  ])('scores one hour of cycling at %i bpm with threshold 165 as %i TSS', (hr, expected) => {
    // Controlled constant-HR FIT uploads produced these TrainingPeaks hrTSS results.
    // This validates this threshold transition, not equivalence across all bands.
    expect(TssCalculator.calculateThresholdHrTss({
      totalDurationWithoutPauses: 3600,
      lactateThresholdHR: 165,
      samples: [{ duration: 0, hr }, { duration: 3600, hr }]
    })?.trainingStressScore).toBeCloseTo(expected, 8);

    const a = activity(ActivityTypes.Cycling);
    a.getStream(DataHeartRate.type).setData(Array(3601).fill(hr));
    fileHeartRateCalibration.set(a, { lactateThresholdHR: 165 });
    const result = evaluate(a);
    for (const candidate of [result.automatic, result.hr]) {
      expect(candidate).toMatchObject({ score: expected, method: 'HR', hrAlgorithm: 'THRESHOLD', estimated: true });
      expect(candidate.reasons).toContain('threshold-hr-fallback');
    }
    expect(result.met).toMatchObject({ score: 9, method: 'MET' });
  });
  it.each([
    [54, 20, 30],
    [108, 30, 40],
    [164, 40, 50],
    [171, 50, 60],
    [178, 60, 70],
    [188, 70, 80],
    [206, 100, 120],
    [212, 120, 140]
  ])('keeps equality in the lower band at the other boundary %i bpm with threshold 200', (boundary, lower, upper) => {
    const score = (hr: number) => TssCalculator.calculateThresholdHrTss({
      totalDurationWithoutPauses: 3600,
      lactateThresholdHR: 200,
      samples: [{ duration: 0, hr }, { duration: 3600, hr }]
    })?.trainingStressScore;
    expect(score(boundary - 0.01)).toBeCloseTo(lower, 8);
    expect(score(boundary)).toBeCloseTo(lower, 8);
    expect(score(boundary + 0.01)).toBeCloseTo(upper, 8);
  });
  it('includes exact threshold without rounding nearby HR or extrapolating first samples', () => {
    const score = (hr: number) =>
      TssCalculator.calculateThresholdHrTss({
        totalDurationWithoutPauses: 3600,
        lactateThresholdHR: 100,
        samples: [
          { duration: 600, hr },
          { duration: 3600, hr }
        ]
      })?.trainingStressScore;
    expect(score(99.99)).toBeCloseTo((80 * 5) / 6, 8);
    expect(score(100)).toBeCloseTo((100 * 5) / 6, 8);
    expect(score(100.01)).toBeCloseTo((100 * 5) / 6, 8);
  });
  it('keeps missing, invalid and isolated HR coverage unavailable', () => {
    for (const samples of [
      [],
      [{ duration: 3600, hr: 150 }],
      [
        { duration: 0, hr: 150 },
        { duration: 1800, hr: 0 },
        { duration: 3600, hr: 150 }
      ]
    ]) {
      expect(
        TssCalculator.calculateThresholdHrTss({ totalDurationWithoutPauses: 3600, lactateThresholdHR: 160, samples })
      ).toBeNull();
    }
  });
});
