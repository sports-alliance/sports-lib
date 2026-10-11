import { resolveFitFunctionalThresholdPower as resolve } from './fit-power-calibration';
const session = { message_index: { value: 3 } };
const scoped = { reference_mesg: 'session', reference_index: { value: 3 }, functional_threshold_power: 250 };

describe('FIT FTP provenance', () => {
  it('accepts file FTP from the session, matching time_in_zone, or unique global settings', () => {
    expect(resolve({ sessions: [session] }, { ...session, threshold_power: 250 }, 0)).toBe(250);
    expect(resolve({ sessions: [session], time_in_zone: [scoped] }, session, 0)).toBe(250);
    expect(resolve({ sessions: [session], zones_target: { functional_threshold_power: 240 } }, session, 0)).toBe(240);
    expect(resolve({ sessions: [session], time_in_zone: [scoped], zones_target: { functional_threshold_power: 0 } }, session, 0)).toBe(250);
  });
  it.each([0, -1, NaN, Infinity, '250'])('rejects invalid explicit FTP %s instead of falling back', threshold_power => {
    expect(resolve({ sessions: [session], zones_target: { functional_threshold_power: 250 } }, { ...session, threshold_power }, 0)).toBeNull();
  });
  it('rejects conflicting settings and ambiguous session references', () => {
    expect(resolve({ sessions: [session, session] }, { ...session, threshold_power: 250 }, 0)).toBeNull();
    expect(resolve({ sessions: [session], time_in_zone: [scoped, scoped] }, session, 0)).toBeNull();
    expect(resolve({ sessions: [session], time_in_zone: [scoped] }, { ...session, threshold_power: 240 }, 0)).toBeNull();
    expect(resolve({ sessions: [session], messages: { zones_target: [
      { functional_threshold_power: 250 }, { functional_threshold_power: 240 }
    ] } }, session, 0)).toBeNull();
  });
  it('never borrows another leg or a lap FTP', () => {
    expect(resolve({ sessions: [session, {}], time_in_zone: [{ ...scoped, reference_index: 1 }] }, session, 0)).toBeNull();
    expect(resolve({ sessions: [session], time_in_zone: [{ ...scoped, reference_mesg: 'lap' }] }, session, 0)).toBeNull();
    expect(resolve({ sessions: [session, {}], time_in_zone: [{ ...scoped, reference_index: undefined }] }, session, 0)).toBeNull();
  });
});
