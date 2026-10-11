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

  it('accepts repeated identical zero placeholders without hiding conflicting records', () => {
    expect(resolve({ messages: { zones_target: [{ threshold_heart_rate: 0 }, { threshold_heart_rate: 0 }] } }))
      .toEqual(expected);
    expect(resolve({ messages: { zones_target: [{ threshold_heart_rate: 0 }, { threshold_heart_rate: 165 }] } }))
      .toEqual({ reason: 'ambiguous-hr-calibration' });
    expect(resolve({ messages: { zones_target: [{ threshold_heart_rate: 165 }, { threshold_heart_rate: 170 }] } }))
      .toEqual({ reason: 'ambiguous-hr-calibration' });
  });

  it.each([undefined, 0, 190, 200])('does not relax validation for an incomplete/invalid session threshold %s', threshold => {
    expect(resolve({ zones_target: { threshold_heart_rate: 0 } }, { ...calibration, threshold_heart_rate: threshold }))
      .toEqual({ reason: 'invalid-hr-calibration' });
  });

  it.each([-1, '0', NaN, Infinity])('rejects malformed global calibration %s even with a valid session', threshold => {
    expect(resolve({ zones_target: { threshold_heart_rate: threshold } })).toEqual({ reason: 'invalid-hr-calibration' });
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
