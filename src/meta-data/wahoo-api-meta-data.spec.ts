import { ServiceNames, WahooAPIEventMetaData } from '..';

describe('WahooAPIEventMetaData', () => {
  it('serializes stable Wahoo identifiers without a temporary FIT URL', () => {
    const metadata = new WahooAPIEventMetaData(
      'workout-1',
      'summary-2',
      'user-3',
      '2026-07-18T10:00:00.000Z',
      new Date('2026-07-18T10:01:00.000Z'),
      false,
      true,
      6
    );

    expect(metadata.toJSON()).toEqual({
      serviceWorkoutID: 'workout-1',
      serviceWorkoutSummaryID: 'summary-2',
      serviceUserID: 'user-3',
      serviceSummaryUpdatedAt: '2026-07-18T10:00:00.000Z',
      serviceManual: false,
      serviceEdited: true,
      serviceFitnessAppID: 6,
      serviceName: ServiceNames.WahooAPI,
      date: new Date('2026-07-18T10:01:00.000Z').getTime()
    });
    expect(metadata.toJSON()).not.toHaveProperty('serviceFITFileURI');
  });
});
