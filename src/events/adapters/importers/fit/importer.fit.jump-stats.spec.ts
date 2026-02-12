import { EventImporterFIT } from './importer.fit';
import { Activity } from '../../../../activities/activity';
import { ActivityTypes } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { DataInterface } from '../../../../data/data.interface';
import {
  DataJumpDistanceAvg,
  DataJumpHangTimeAvg,
  DataJumpHeightAvg,
  DataJumpRotationsAvg,
  DataJumpScoreAvg,
  DataJumpSpeedAvg
} from '../../../../data/data.jump-stats';

describe('EventImporterFIT jump stats regression', () => {
  const getStatValue = (stats: DataInterface[], type: string): number => {
    const stat = stats.find(s => s.getType() === type);
    if (!stat) {
      throw new Error(`Expected stat '${type}'`);
    }
    return stat.getValue() as number;
  };

  it('uses per-property counts for averages and emits zero averages when data exists', () => {
    const activity = new Activity(new Date(0), new Date(2_000), ActivityTypes.MountainBiking, new Creator('test'));
    const sessionObject = {
      start_time: new Date(0),
      timestamp: new Date(2_000),
      total_elapsed_time: 2,
      total_timer_time: 2,
      total_distance: 100,
      jumps: [
        { distance: 2, score: 10, hang_time: 0.3, speed: 0, rotations: 0, height: 0 },
        { score: 20, hang_time: 0.7, speed: 4, rotations: 0, height: 0 }
      ]
    };

    const stats = EventImporterFIT.getStatsFromObject(sessionObject, activity, false);

    expect(getStatValue(stats, DataJumpDistanceAvg.type)).toBe(2);
    expect(getStatValue(stats, DataJumpScoreAvg.type)).toBe(15);
    expect(getStatValue(stats, DataJumpHangTimeAvg.type)).toBeCloseTo(0.5, 10);
    expect(getStatValue(stats, DataJumpSpeedAvg.type)).toBe(2);
    expect(getStatValue(stats, DataJumpRotationsAvg.type)).toBe(0);
    expect(getStatValue(stats, DataJumpHeightAvg.type)).toBe(0);
  });
});
