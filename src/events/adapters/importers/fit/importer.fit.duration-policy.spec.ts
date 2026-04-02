import { EventImporterFIT } from './importer.fit';
import { Activity } from '../../../../activities/activity';
import { ActivityTypes } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { DataDuration } from '../../../../data/data.duration';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataTimerTime } from '../../../../data/data.timer-time';

describe('EventImporterFIT duration policy', () => {
  let mockActivity: Activity;

  beforeEach(() => {
    mockActivity = new Activity(new Date(), new Date(Date.now() + 60_000), ActivityTypes.Cycling, new Creator('Test'));
  });

  const getStatValue = (stats: any[], type: string): number | undefined => {
    return stats.find(stat => stat.getType() === type)?.getValue();
  };

  it('uses timer time as Duration and keeps elapsed time as a dedicated stat', () => {
    const stats = EventImporterFIT.getStatsFromObject(
      {
        total_elapsed_time: 20436.242,
        total_timer_time: 13705.229
      },
      mockActivity,
      false
    );

    expect(getStatValue(stats, DataDuration.type)).toBe(13705.23);
    expect(getStatValue(stats, DataTimerTime.type)).toBe(13705.23);
    expect(getStatValue(stats, DataElapsedTime.type)).toBe(20436.24);
  });

  it('clamps tiny timer > elapsed discrepancies as rounding noise instead of swapping', () => {
    const stats = EventImporterFIT.getStatsFromObject(
      {
        total_elapsed_time: 4077.19,
        total_timer_time: 4077.392
      },
      mockActivity,
      false
    );

    expect(getStatValue(stats, DataDuration.type)).toBe(4077.19);
    expect(getStatValue(stats, DataTimerTime.type)).toBe(4077.19);
    expect(getStatValue(stats, DataElapsedTime.type)).toBe(4077.19);
  });

  it('swaps materially inverted elapsed/timer values from broken FIT files', () => {
    const stats = EventImporterFIT.getStatsFromObject(
      {
        total_elapsed_time: 100,
        total_timer_time: 120
      },
      mockActivity,
      false
    );

    expect(getStatValue(stats, DataDuration.type)).toBe(100);
    expect(getStatValue(stats, DataTimerTime.type)).toBe(100);
    expect(getStatValue(stats, DataElapsedTime.type)).toBe(120);
  });
});
