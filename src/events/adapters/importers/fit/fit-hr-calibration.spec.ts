import { ActivityTypes } from '../../../../activities/activity.types';
import { resolveFitHeartRateCalibration } from './fit-hr-calibration';

const session = { message_index: { value: 4 } };
const calibration = {
  reference_mesg: 'session',
  reference_index: { value: 4 },
  max_heart_rate: 190,
  resting_heart_rate: 55,
  threshold_heart_rate: 165
};
const expected = { maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 };
const resolve = (extra: object = {}, row: object = calibration, type = ActivityTypes.Swimming) =>
  resolveFitHeartRateCalibration({ sessions: [session], time_in_zone: [row], ...extra }, session, 0, type);

describe('FIT session HR calibration precedence', () => {
  it.each([ActivityTypes.Swimming, ActivityTypes.OpenWaterSwimming, ActivityTypes.Walking, ActivityTypes.Cycling])(
    'keeps complete valid session calibration despite a zero global threshold for %s',
    type => {
      expect(resolve({ zones_target: { threshold_heart_rate: 0 } }, calibration, type)).toEqual(expected);
    }
  );

  it('ignores zero profile placeholders only with complete valid session calibration', () => {
    expect(
      resolve({
        user_profile: { default_max_heart_rate: 0, resting_heart_rate: 0 },
        zones_target: { max_heart_rate: 0, threshold_heart_rate: 0 }
      })
    ).toEqual(expected);
  });

  it('ignores unused global defaults, including conflicting records', () => {
    expect(resolve({ messages: { zones_target: [{ threshold_heart_rate: 0 }, { threshold_heart_rate: 0 }] } })).toEqual(
      expected
    );
    expect(
      resolve({ messages: { zones_target: [{ threshold_heart_rate: 0 }, { threshold_heart_rate: 165 }] } })
    ).toEqual(expected);
    expect(
      resolve({ messages: { zones_target: [{ threshold_heart_rate: 165 }, { threshold_heart_rate: 170 }] } })
    ).toEqual(expected);
  });

  it.each([undefined, 0, 190, 200])(
    'does not relax validation for an incomplete/invalid session threshold %s',
    threshold => {
      expect(
        resolve({ zones_target: { threshold_heart_rate: 0 } }, { ...calibration, threshold_heart_rate: threshold })
      ).toEqual({ reason: 'invalid-hr-calibration' });
    }
  );

  it.each([-1, '0', NaN, Infinity])(
    'ignores unused malformed global calibration %s with a valid session',
    threshold => {
      expect(resolve({ zones_target: { threshold_heart_rate: threshold } })).toEqual(expected);
    }
  );

  it('fills only missing session fields and rejects ambiguity in those fields', () => {
    const partial = { ...calibration, resting_heart_rate: undefined };
    const messages = {
      zones_target: [
        { max_heart_rate: 180, threshold_heart_rate: 150 },
        { max_heart_rate: 200, threshold_heart_rate: 175 }
      ],
      user_profile: [{ resting_heart_rate: 55, default_max_heart_rate: 0 }]
    };
    expect(resolve({ messages }, partial)).toEqual(expected);
    expect(
      resolve(
        { messages: { ...messages, user_profile: [{ resting_heart_rate: 55 }, { resting_heart_rate: 60 }] } },
        partial
      )
    ).toEqual({ reason: 'ambiguous-hr-calibration' });
    expect(resolve({ messages: { ...messages, user_profile: [{ resting_heart_rate: 170 }] } }, partial)).toEqual({
      reason: 'invalid-hr-calibration'
    });
    expect(resolve({ messages }, { ...calibration, threshold_heart_rate: undefined })).toEqual({
      reason: 'ambiguous-hr-calibration'
    });
  });

  it.each([0, -1, NaN, Infinity, '165'])('does not replace invalid scoped HR %s with a global default', threshold => {
    expect(
      resolve({ zones_target: { threshold_heart_rate: 165 } }, { ...calibration, threshold_heart_rate: threshold })
    ).toEqual({ reason: 'invalid-hr-calibration' });
  });

  it('uses the applicable profile maximum without validating unrelated general defaults', () => {
    expect(
      resolve(
        {
          time_in_zone: [],
          zones_target: { threshold_heart_rate: 165 },
          messages: {
            user_profile: [
              { default_max_biking_heart_rate: 190, default_max_heart_rate: 180, resting_heart_rate: 55 },
              { default_max_biking_heart_rate: 190, default_max_heart_rate: 200, resting_heart_rate: 55 }
            ]
          }
        },
        calibration,
        ActivityTypes.Cycling
      )
    ).toEqual(expected);
  });

  it('still rejects ambiguous session references and duplicate session IDs', () => {
    expect(resolve({ time_in_zone: [calibration, calibration] })).toEqual({ reason: 'ambiguous-hr-calibration' });
    expect(resolve({ sessions: [session, session] })).toEqual({ reason: 'ambiguous-hr-calibration' });
  });

  it('cannot use a different session to excuse an invalid global field', () => {
    expect(resolve({ zones_target: { threshold_heart_rate: 0 } }, { ...calibration, reference_index: 3 })).toEqual({
      reason: 'invalid-hr-calibration'
    });
  });

  it('retains scoped session precedence over distinct global defaults', () => {
    expect(
      resolve({
        zones_target: { max_heart_rate: 185, threshold_heart_rate: 160 },
        user_profile: { resting_heart_rate: 50 }
      })
    ).toEqual(expected);
  });

  it('still uses unambiguous global/profile calibration when no session settings exist', () => {
    expect(
      resolve({
        time_in_zone: [],
        zones_target: { threshold_heart_rate: 165 },
        user_profile: { default_max_heart_rate: 190, default_max_running_heart_rate: 120, resting_heart_rate: 55 }
      })
    ).toEqual(expected);
  });
});

describe('cycling calibration consistency', () => {
  it.each([
    ActivityTypes.Cycling,
    ActivityTypes.MountainBiking,
    ActivityTypes.DownhillCycling,
    ActivityTypes['Enduro MTB'],
    ActivityTypes.EBiking
  ])('uses the biking maximum for %s without session calibration', type => {
    expect(
      resolve(
        {
          time_in_zone: [],
          zones_target: { threshold_heart_rate: 165 },
          user_profile: {
            resting_heart_rate: 55,
            default_max_heart_rate: 160,
            default_max_biking_heart_rate: 190
          }
        },
        calibration,
        type
      )
    ).toEqual(expected);
    expect(
      resolve(
        {
          time_in_zone: [],
          zones_target: { threshold_heart_rate: 165 },
          user_profile: {
            resting_heart_rate: 55,
            default_max_heart_rate: 190
          }
        },
        calibration,
        type
      )
    ).toEqual(expected);
  });

  it.each(['percent_max_hr', 1])('rejects a threshold below valid percent-max boundaries (%s)', hr_calc_type => {
    expect(
      resolve(
        { zones_target: { threshold_heart_rate: 0 } },
        {
          ...calibration,
          max_heart_rate: 242,
          resting_heart_rate: 30,
          threshold_heart_rate: 46,
          hr_calc_type,
          hr_zone_high_boundary: [121, 145, 169, 194, 218, 242]
        },
        ActivityTypes.Cycling
      )
    ).toEqual({ reason: 'invalid-hr-calibration' });
  });

  it('does not infer calibration from zones or impose percent-max semantics on custom zones', () => {
    expect(
      resolve(
        {},
        {
          ...calibration,
          threshold_heart_rate: undefined,
          hr_calc_type: 'percent_max_hr',
          hr_zone_high_boundary: [95, 114, 133, 152, 171, 190]
        }
      ).lactateThresholdHR
    ).toBeUndefined();
    expect(resolve({}, { ...calibration, hr_calc_type: 'custom', hr_zone_high_boundary: [170, 180, 190] })).toEqual(
      expected
    );
  });
});

describe('FIT HRR calibration consistency', () => {
  const hrr = {
    ...calibration,
    max_heart_rate: 190,
    resting_heart_rate: 50,
    threshold_heart_rate: 60,
    hr_calc_type: 'percent_hrr',
    hr_zone_high_boundary: [120, 134, 148, 162, 176, 190]
  };
  const hrrExpected = { maxHeartRate: 190, restingHeartRate: 50, lactateThresholdHR: 60 };

  it.each(['percent_hrr', 2])('rejects a threshold below the exact scoped HRR pattern (%s)', hr_calc_type => {
    expect(resolve({}, { ...hrr, hr_calc_type })).toEqual({ reason: 'invalid-hr-calibration' });
  });

  it.each([120, 165])('keeps a threshold at or above the lowest boundary (%s)', threshold_heart_rate => {
    expect(resolve({}, { ...hrr, threshold_heart_rate })).toEqual({
      ...hrrExpected,
      lactateThresholdHR: threshold_heart_rate
    });
  });

  it('does not apply a universal threshold floor to customized HRR zones', () => {
    expect(
      resolve({}, { ...hrr, threshold_heart_rate: 154, hr_zone_high_boundary: [158, 162, 165, 167, 171, 190] })
    ).toEqual({ ...hrrExpected, lactateThresholdHR: 154 });
  });

  it.each(['custom', 'percent_lthr', undefined])(
    'does not infer the pattern mode from its values (%s)',
    hr_calc_type => {
      expect(resolve({}, { ...hrr, hr_calc_type })).toEqual(hrrExpected);
    }
  );

  it.each(
    [
      [119, 134, 148, 162, 176, 190], // A customized boundary one bpm away is not an exact match.
      [120.1, 134, 148, 162, 176, 190],
      [120, 134, 148, 162, 176],
      [120, undefined, 148, 162, 176, 190],
      [120, 134, 148, 162, 176, NaN],
      [120, 134, 148, 162, 176, 191]
    ].map(hr_zone_high_boundary => ({ hr_zone_high_boundary }))
  )('does not repair or guess $hr_zone_high_boundary', ({ hr_zone_high_boundary }) => {
    expect(resolve({}, { ...hrr, hr_zone_high_boundary })).toEqual(hrrExpected);
  });

  it('does not skip absent entries in a sparse boundary array', () => {
    const boundaries = [...hrr.hr_zone_high_boundary];
    delete boundaries[1];
    expect(resolve({}, { ...hrr, hr_zone_high_boundary: boundaries })).toEqual(hrrExpected);
  });

  it.each(['max_heart_rate', 'resting_heart_rate', 'threshold_heart_rate'])(
    'requires scoped %s despite matching defaults',
    key => {
      expect(
        resolve(
          { zones_target: { max_heart_rate: 190, threshold_heart_rate: 60 }, user_profile: { resting_heart_rate: 50 } },
          { ...hrr, [key]: undefined }
        )
      ).toEqual(hrrExpected);
    }
  );

  it('does not borrow another session or accept ambiguous references', () => {
    expect(
      resolve(
        { zones_target: { max_heart_rate: 190, threshold_heart_rate: 60 }, user_profile: { resting_heart_rate: 50 } },
        { ...hrr, reference_index: 9 }
      )
    ).toEqual(hrrExpected);
    expect(resolve({ time_in_zone: [hrr, hrr] })).toEqual({ reason: 'ambiguous-hr-calibration' });
    expect(resolve({ sessions: [session, session] }, hrr)).toEqual({ reason: 'ambiguous-hr-calibration' });
  });
});
