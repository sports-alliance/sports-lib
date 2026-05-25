const mockParse = jest.fn();

jest.mock('fit-file-parser', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    parse: mockParse
  }))
}));

import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import {
  DataBeginningPotentialStamina,
  DataEndingPotentialStamina,
  DataPotentialStamina,
  DataPotentialStaminaAvg,
  DataPotentialStaminaMax,
  DataPotentialStaminaMin,
  DataStamina,
  DataStaminaAvg,
  DataStaminaMax,
  DataStaminaMin
} from '../../../../data/data.stamina';
import { EventImporterFIT } from './importer.fit';

const finiteNumbers = (values: unknown[]): number[] =>
  values.filter((value): value is number => Number.isFinite(value));

const getStatValue = (activity: any, type: string): unknown => activity.getStat(type)?.getValue();

const createGarminStaminaFitObject = () => {
  const startTime = new Date('2026-05-21T10:00:00.000Z');
  const at = (seconds: number) => new Date(startTime.getTime() + seconds * 1000);

  return {
    file_ids: [{ manufacturer: 'garmin' }],
    events: [],
    sessions: [
      {
        sport: 'running',
        start_time: at(0),
        timestamp: at(4),
        total_elapsed_time: 4,
        total_timer_time: 4,
        total_distance: 40,
        beginning_potential_stamina: 95,
        ending_potential_stamina: 66,
        min_stamina: 34,
        laps: [
          {
            start_time: at(0),
            timestamp: at(4),
            total_elapsed_time: 4,
            total_timer_time: 4,
            total_distance: 40,
            lap_trigger: 'manual',
            beginning_potential_stamina: 95,
            ending_potential_stamina: 66,
            min_stamina: 34
          }
        ]
      }
    ],
    records: [
      { timestamp: at(0), distance: 0, speed: 3, stamina: 95, potential_stamina: 95 },
      { timestamp: at(1), distance: 10, speed: 3, stamina: 80, potential_stamina: 92 },
      { timestamp: at(2), distance: 20, speed: 3, stamina: 34, potential_stamina: 80 },
      { timestamp: at(3), distance: 30, speed: 3, stamina: 66, potential_stamina: 66 },
      { timestamp: at(4), distance: 40, speed: 3, stamina: 66, potential_stamina: 66 }
    ]
  };
};

describe('EventImporterFIT Garmin stamina integration', () => {
  beforeEach(() => {
    mockParse.mockReset();
    mockParse.mockImplementation(
      (_arrayBuffer: ArrayBuffer, callback: (error: unknown, fitDataObject: any) => void) => {
        callback(null, createGarminStaminaFitObject());
      }
    );
  });

  it('should import Garmin stamina from parsed FIT records and session summaries', async () => {
    const event = await EventImporterFIT.getFromArrayBuffer(
      new ArrayBuffer(1),
      new ActivityParsingOptions({ generateUnitStreams: false }),
      'garmin-stamina.fit'
    );
    const activity = event.getFirstActivity();
    const lap = activity.getLaps()[0];

    expect(mockParse).toHaveBeenCalledTimes(1);
    expect(finiteNumbers(activity.getStreamData(DataStamina.type))).toEqual([95, 80, 34, 66, 66]);
    expect(finiteNumbers(activity.getStreamData(DataPotentialStamina.type))).toEqual([95, 92, 80, 66, 66]);

    expect(getStatValue(activity, DataBeginningPotentialStamina.type)).toBe(95);
    expect(getStatValue(activity, DataEndingPotentialStamina.type)).toBe(66);
    expect(getStatValue(activity, DataStaminaMin.type)).toBe(34);
    expect(getStatValue(activity, DataStaminaMax.type)).toBe(95);
    expect(getStatValue(activity, DataStaminaAvg.type)).toBeCloseTo(68.2, 10);

    expect(getStatValue(activity, DataPotentialStaminaMin.type)).toBe(66);
    expect(getStatValue(activity, DataPotentialStaminaMax.type)).toBe(95);
    expect(getStatValue(activity, DataPotentialStaminaAvg.type)).toBeCloseTo(79.8, 10);

    expect(lap.getStat(DataBeginningPotentialStamina.type)?.getValue()).toBe(95);
    expect(lap.getStat(DataEndingPotentialStamina.type)?.getValue()).toBe(66);
    expect(lap.getStat(DataStaminaMin.type)?.getValue()).toBe(34);
  });
});
