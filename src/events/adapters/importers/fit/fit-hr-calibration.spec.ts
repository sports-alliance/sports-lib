import { ActivityTypes } from '../../../../activities/activity.types';
import { resolveFitHeartRateCalibration } from './fit-hr-calibration';

const session = { message_index: { value: 4 } };
const calibration = { reference_mesg: 'session', reference_index: { value: 4 },
  max_heart_rate: 190, resting_heart_rate: 55, threshold_heart_rate: 165 };
const expected = { maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 };
const resolve = (extra: object = {}, row: object = calibration, type = ActivityTypes.Swimming) =>
  resolveFitHeartRateCalibration({ sessions: [session], time_in_zone: [row], ...extra }, session, 0, type);

describe('FIT session HR calibration precedence', () => {
  it.each([ActivityTypes.Swimming, ActivityTypes.OpenWaterSwimming, ActivityTypes.Walking, ActivityTypes.Cycling])(
    'keeps complete valid session calibration despite a zero global threshold for %s', type => {
      expect(resolve({ zones_target: { threshold_heart_rate: 0 } }, calibration, type)).toEqual(expected);
    });

  it('ignores zero profile placeholders only with complete valid session calibration', () => {
    expect(resolve({ user_profile: { default_max_heart_rate: 0, resting_heart_rate: 0 },
      zones_target: { max_heart_rate: 0, threshold_heart_rate: 0 } })).toEqual(expected);
  });

  it('ignores unused global defaults, including conflicting records', () => {
    expect(resolve({ messages: { zones_target: [{ threshold_heart_rate: 0 }, { threshold_heart_rate: 0 }] } }))
      .toEqual(expected);
    expect(resolve({ messages: { zones_target: [{ threshold_heart_rate: 0 }, { threshold_heart_rate: 165 }] } }))
      .toEqual(expected);
    expect(resolve({ messages: { zones_target: [{ threshold_heart_rate: 165 }, { threshold_heart_rate: 170 }] } }))
      .toEqual(expected);
  });

  it.each([undefined, 0, 190, 200])('does not relax validation for an incomplete/invalid session threshold %s', threshold => {
    expect(resolve({ zones_target: { threshold_heart_rate: 0 } }, { ...calibration, threshold_heart_rate: threshold }))
      .toEqual({ reason: 'invalid-hr-calibration' });
  });

  it.each([-1, '0', NaN, Infinity])('ignores unused malformed global calibration %s with a valid session', threshold => {
    expect(resolve({ zones_target: { threshold_heart_rate: threshold } })).toEqual(expected);
  });

  it('fills only missing session fields and rejects ambiguity in those fields', () => {
    const partial = { ...calibration, resting_heart_rate: undefined };
    const messages = {
      zones_target: [{ max_heart_rate: 180, threshold_heart_rate: 150 }, { max_heart_rate: 200, threshold_heart_rate: 175 }],
      user_profile: [{ resting_heart_rate: 55, default_max_heart_rate: 0 }]
    };
    expect(resolve({ messages }, partial)).toEqual(expected);
    expect(resolve({ messages: { ...messages, user_profile: [
      { resting_heart_rate: 55 }, { resting_heart_rate: 60 }
    ] } }, partial)).toEqual({ reason: 'ambiguous-hr-calibration' });
    expect(resolve({ messages: { ...messages, user_profile: [{ resting_heart_rate: 170 }] } }, partial))
      .toEqual({ reason: 'invalid-hr-calibration' });
    expect(resolve({ messages }, { ...calibration, threshold_heart_rate: undefined }))
      .toEqual({ reason: 'ambiguous-hr-calibration' });
  });

  it.each([0, -1, NaN, Infinity, '165'])('does not replace invalid scoped HR %s with a global default', threshold => {
    expect(resolve({ zones_target: { threshold_heart_rate: 165 } }, { ...calibration, threshold_heart_rate: threshold }))
      .toEqual({ reason: 'invalid-hr-calibration' });
  });

  it('uses the applicable profile maximum without validating unrelated general defaults', () => {
    expect(resolve({ time_in_zone: [], zones_target: { threshold_heart_rate: 165 }, messages: { user_profile: [
      { default_max_biking_heart_rate: 190, default_max_heart_rate: 180, resting_heart_rate: 55 },
      { default_max_biking_heart_rate: 190, default_max_heart_rate: 200, resting_heart_rate: 55 }
    ] } }, calibration, ActivityTypes.Cycling)).toEqual(expected);
  });

  it('still rejects ambiguous session references and duplicate session IDs', () => {
    expect(resolve({ time_in_zone: [calibration, calibration] })).toEqual({ reason: 'ambiguous-hr-calibration' });
    expect(resolve({ sessions: [session, session] })).toEqual({ reason: 'ambiguous-hr-calibration' });
  });

  it('cannot use a different session to excuse an invalid global field', () => {
    expect(resolve({ zones_target: { threshold_heart_rate: 0 } }, { ...calibration, reference_index: 3 }))
      .toEqual({ reason: 'invalid-hr-calibration' });
  });

  it('retains scoped session precedence over distinct global defaults', () => {
    expect(resolve({ zones_target: { max_heart_rate: 185, threshold_heart_rate: 160 },
      user_profile: { resting_heart_rate: 50 } })).toEqual(expected);
  });

  it('still uses unambiguous global/profile calibration when no session settings exist', () => {
    expect(resolve({ time_in_zone: [], zones_target: { threshold_heart_rate: 165 },
      user_profile: { default_max_heart_rate: 190, default_max_running_heart_rate: 120, resting_heart_rate: 55 } }))
      .toEqual(expected);
  });
});

describe('cycling calibration consistency', () => {
  it.each([ActivityTypes.Cycling, ActivityTypes.MountainBiking, ActivityTypes.DownhillCycling, ActivityTypes['Enduro MTB'], ActivityTypes.EBiking])(
    'uses the biking maximum for %s without session calibration', type => {
      expect(resolve({ time_in_zone: [], zones_target: { threshold_heart_rate: 165 }, user_profile: {
        resting_heart_rate: 55, default_max_heart_rate: 160, default_max_biking_heart_rate: 190
      } }, calibration, type)).toEqual(expected);
      expect(resolve({ time_in_zone: [], zones_target: { threshold_heart_rate: 165 }, user_profile: {
        resting_heart_rate: 55, default_max_heart_rate: 190
      } }, calibration, type)).toEqual(expected);
    });

  it.each(['percent_max_hr', 1])('rejects a threshold below valid percent-max boundaries (%s)', hr_calc_type => {
    expect(resolve({ zones_target: { threshold_heart_rate: 0 } }, { ...calibration,
      max_heart_rate: 242, resting_heart_rate: 30, threshold_heart_rate: 46,
      hr_calc_type, hr_zone_high_boundary: [121, 145, 169, 194, 218, 242]
    }, ActivityTypes.Cycling)).toEqual({ reason: 'invalid-hr-calibration' });
  });

  it('does not infer calibration from zones or impose percent-max semantics on custom zones', () => {
    expect(resolve({}, { ...calibration, threshold_heart_rate: undefined,
      hr_calc_type: 'percent_max_hr', hr_zone_high_boundary: [95, 114, 133, 152, 171, 190]
    }).lactateThresholdHR).toBeUndefined();
    expect(resolve({}, { ...calibration, hr_calc_type: 'custom', hr_zone_high_boundary: [170, 180, 190] })).toEqual(expected);
  });
});
