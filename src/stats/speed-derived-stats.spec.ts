import { DataGradeAdjustedPaceAvg } from '../data/data.grade-adjusted-pace-avg';
import { DataGradeAdjustedPaceMax } from '../data/data.grade-adjusted-pace-max';
import { DataGradeAdjustedPaceMin } from '../data/data.grade-adjusted-pace-min';
import { DataGradeAdjustedSpeedAvg } from '../data/data.grade-adjusted-speed-avg';
import { DataGradeAdjustedSpeedMax } from '../data/data.grade-adjusted-speed-max';
import { DataGradeAdjustedSpeedMin } from '../data/data.grade-adjusted-speed-min';
import { DataPaceAvg } from '../data/data.pace-avg';
import { DataPaceMax } from '../data/data.pace-max';
import { DataPaceMin } from '../data/data.pace-min';
import { DataSpeedAvg } from '../data/data.speed-avg';
import { DataSpeedMax } from '../data/data.speed-max';
import { DataSpeedMin } from '../data/data.speed-min';
import { DataSwimPaceAvg } from '../data/data.swim-pace-avg';
import { DataSwimPaceMax } from '../data/data.swim-pace-max';
import { DataSwimPaceMin } from '../data/data.swim-pace-min';
import { convertSpeedToPace, convertSpeedToSwimPace } from '../events/utilities/helpers';
import { Lap } from '../laps/lap';
import { LapTypes } from '../laps/lap.types';
import { hydrateMissingSpeedDerivedStats } from './speed-derived-stats';

describe('hydrateMissingSpeedDerivedStats', () => {
  it('fills every pace family from speed stats with inverse min/max semantics', () => {
    const target = new Lap(new Date(0), new Date(1000), 1, LapTypes.Manual);
    target.addStat(new DataSpeedMin(2));
    target.addStat(new DataSpeedMax(5));
    target.addStat(new DataSpeedAvg(3));
    target.addStat(new DataGradeAdjustedSpeedMin(1.5));
    target.addStat(new DataGradeAdjustedSpeedMax(6));
    target.addStat(new DataGradeAdjustedSpeedAvg(4));

    hydrateMissingSpeedDerivedStats(target);

    expect(target.getStat(DataPaceMax.type)?.getValue()).toBe(convertSpeedToPace(2));
    expect(target.getStat(DataPaceMin.type)?.getValue()).toBe(convertSpeedToPace(5));
    expect(target.getStat(DataPaceAvg.type)?.getValue()).toBe(convertSpeedToPace(3));
    expect(target.getStat(DataSwimPaceMax.type)?.getValue()).toBe(convertSpeedToSwimPace(2));
    expect(target.getStat(DataSwimPaceMin.type)?.getValue()).toBe(convertSpeedToSwimPace(5));
    expect(target.getStat(DataSwimPaceAvg.type)?.getValue()).toBe(convertSpeedToSwimPace(3));
    expect(target.getStat(DataGradeAdjustedPaceMax.type)?.getValue()).toBe(convertSpeedToPace(1.5));
    expect(target.getStat(DataGradeAdjustedPaceMin.type)?.getValue()).toBe(convertSpeedToPace(6));
    expect(target.getStat(DataGradeAdjustedPaceAvg.type)?.getValue()).toBe(convertSpeedToPace(4));
  });

  it('retains raw-speed bounds when grade-adjusted speed is less extreme', () => {
    const target = new Lap(new Date(0), new Date(1000), 1, LapTypes.Manual);
    target.addStat(new DataSpeedMin(1));
    target.addStat(new DataSpeedMax(7));
    target.addStat(new DataSpeedAvg(5));
    target.addStat(new DataGradeAdjustedSpeedMin(2));
    target.addStat(new DataGradeAdjustedSpeedMax(6));
    target.addStat(new DataGradeAdjustedSpeedAvg(4));

    hydrateMissingSpeedDerivedStats(target);

    expect(target.getStat(DataGradeAdjustedPaceMax.type)?.getValue()).toBe(convertSpeedToPace(1));
    expect(target.getStat(DataGradeAdjustedPaceMin.type)?.getValue()).toBe(convertSpeedToPace(7));
    expect(target.getStat(DataGradeAdjustedPaceAvg.type)?.getValue()).toBe(convertSpeedToPace(5));
  });

  it('preserves explicit targets, ignores non-finite sources, and is idempotent', () => {
    const target = new Lap(new Date(0), new Date(1000), 1, LapTypes.Manual);
    const explicitPace = new DataPaceAvg(321);
    target.addStat(explicitPace);
    target.addStat(new DataSpeedAvg(3));
    target.addStat(new DataSpeedMin(Number.NaN));
    target.addStat(new DataSpeedMax(Number.POSITIVE_INFINITY));

    hydrateMissingSpeedDerivedStats(target);
    const statCountAfterFirstHydration = target.getStats().size;
    hydrateMissingSpeedDerivedStats(target);

    expect(target.getStat(DataPaceAvg.type)).toBe(explicitPace);
    expect(target.getStat(DataSwimPaceAvg.type)?.getValue()).toBe(convertSpeedToSwimPace(3));
    expect(target.getStat(DataPaceMax.type)).toBeUndefined();
    expect(target.getStat(DataPaceMin.type)).toBeUndefined();
    expect(target.getStats().size).toBe(statCountAfterFirstHydration);
  });

  it('retains the existing zero-speed conversion behavior', () => {
    const target = new Lap(new Date(0), new Date(1000), 1, LapTypes.Manual);
    target.addStat(new DataSpeedMin(0));

    hydrateMissingSpeedDerivedStats(target);

    expect(target.getStat(DataPaceMax.type)?.getValue()).toBe(Infinity);
    expect(target.getStat(DataSwimPaceMax.type)?.getValue()).toBe(Infinity);
  });
});
