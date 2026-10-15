import { EventImporterTCX } from './importer.tcx';
import { Activity } from '../../../../activities/activity';
import { ActivityTypes } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { Lap } from '../../../../laps/lap';
import { LapTypes } from '../../../../laps/lap.types';
import { DataDuration } from '../../../../data/data.duration';
import { DataTimerTime } from '../../../../data/data.timer-time';
import { DataMovingTime } from '../../../../data/data.moving-time';
import { DataPause } from '../../../../data/data.pause';
import { DataDistance } from '../../../../data/data.distance';

describe('TCX lap duration aggregation', () => {
  const activity = () => new Activity(new Date(0), new Date(60000), ActivityTypes.Running, new Creator('Synthetic'));
  const lap = () => new Lap(new Date(0), new Date(30000), 1, LapTypes.Manual);

  it('retains a lap and distance without crashing when its timing stats are missing', () => {
    const target = activity();
    const source = lap();
    source.setDistance(new DataDistance(25));
    EventImporterTCX['extractAndAssignActivityStatsFromLaps']([source], target);
    expect(target.getLaps()).toEqual([source]);
    expect(target.getDistance().getValue()).toBe(25);
    expect(target.getDuration()).toBeUndefined();
    expect(target.getTimer()).toBeUndefined();
    expect(target.getMovingTime()).toBeUndefined();
    expect(target.getPause()).toBeUndefined();
  });

  it('retains existing positive timing sums', () => {
    const target = activity();
    const laps = [lap(), lap()];
    laps.forEach(source => {
      source.setDuration(new DataDuration(30));
      source.setTimer(new DataTimerTime(25));
      source.setMovingTime(new DataMovingTime(20));
      source.setPause(new DataPause(5));
    });
    EventImporterTCX['extractAndAssignActivityStatsFromLaps'](laps, target);
    expect(target.getDuration()?.getValue()).toBe(60);
    expect(target.getTimer()?.getValue()).toBe(50);
    expect(target.getMovingTime()?.getValue()).toBe(40);
    expect(target.getPause()?.getValue()).toBe(10);
  });

  it('retains the existing explicit-zero lap exclusion', () => {
    const target = activity();
    const source = lap();
    source.setDuration(new DataDuration(0));
    source.setDistance(new DataDistance(25));
    EventImporterTCX['extractAndAssignActivityStatsFromLaps']([source], target);
    expect(target.getLaps()).toEqual([]);
    expect(target.getDuration()).toBeUndefined();
    expect(target.getDistance()).toBeUndefined();
  });
});
