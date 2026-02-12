import { DynamicDataLoader } from './data.store';
import { DataGroundContactTime } from './data.ground-contact-time';
import { DataGroundContactTimeAvg } from './data.ground-contact-time-avg';
import { DataGroundContactTimeMin } from './data.ground-contact-time-min';
import { DataGroundContactTimeMax } from './data.ground-contact-time-max';
import { DataAvgRespirationRate } from './data.avg-respiration-rate';
import { DataMaxRespirationRate } from './data.max-respiration-rate';
import { DataMinRespirationRate } from './data.min-respiration-rate';
import { DataAvgVAM } from './data.avg-vam';
import { DataAvgFlow } from './data.avg-flow';
import { DataAvgGrit } from './data.avg-grit';
import { DataAvgStrokeDistance } from './data.avg-stroke-distance';
import { DataAvgStrokeCount } from './data.avg-stroke-count';
import { DataAvgStrideLength } from './data.avg-stride-length';
import { DataMaxHRSetting } from './data.max-hr-setting';
import {
  DataJumpDistanceAvg,
  DataJumpDistanceMax,
  DataJumpDistanceMin,
  DataJumpHangTimeAvg,
  DataJumpHangTimeMax,
  DataJumpHangTimeMin,
  DataJumpHeightAvg,
  DataJumpHeightMax,
  DataJumpHeightMin,
  DataJumpRotationsAvg,
  DataJumpRotationsMax,
  DataJumpRotationsMin,
  DataJumpScoreAvg,
  DataJumpScoreMax,
  DataJumpScoreMin,
  DataJumpSpeedAvg,
  DataJumpSpeedMax,
  DataJumpSpeedMin
} from './data.jump-stats';

describe('Data naming canonicalization compatibility', () => {
  const renamedTypes: Array<{ cls: any; canonical: string; legacy: string }> = [
    { cls: DataGroundContactTimeAvg, canonical: 'Average Ground Contact Time', legacy: 'Ground Contact Time Avg' },
    { cls: DataGroundContactTimeMin, canonical: 'Minimum Ground Contact Time', legacy: 'Ground Contact Time Min' },
    { cls: DataGroundContactTimeMax, canonical: 'Maximum Ground Contact Time', legacy: 'Ground Contact Time Max' },

    { cls: DataAvgRespirationRate, canonical: 'Average Respiration Rate', legacy: 'Avg Respiration Rate' },
    { cls: DataMinRespirationRate, canonical: 'Minimum Respiration Rate', legacy: 'Min Respiration Rate' },
    { cls: DataMaxRespirationRate, canonical: 'Maximum Respiration Rate', legacy: 'Max Respiration Rate' },

    { cls: DataAvgVAM, canonical: 'Average VAM', legacy: 'Avg VAM' },
    { cls: DataAvgFlow, canonical: 'Average Flow', legacy: 'Avg Flow' },
    { cls: DataAvgGrit, canonical: 'Average Grit', legacy: 'Avg Grit' },
    { cls: DataAvgStrokeDistance, canonical: 'Average Stroke Distance', legacy: 'Avg Stroke Distance' },
    { cls: DataAvgStrokeCount, canonical: 'Average Stroke Count', legacy: 'Avg Stroke Count' },
    { cls: DataAvgStrideLength, canonical: 'Average Stride Length', legacy: 'Avg Stride Length' },
    { cls: DataMaxHRSetting, canonical: 'Maximum HR Setting', legacy: 'Max HR Setting' },

    { cls: DataJumpHangTimeAvg, canonical: 'Average Jump Hang Time', legacy: 'Jump Hang Time Avg' },
    { cls: DataJumpHangTimeMin, canonical: 'Minimum Jump Hang Time', legacy: 'Jump Hang Time Min' },
    { cls: DataJumpHangTimeMax, canonical: 'Maximum Jump Hang Time', legacy: 'Jump Hang Time Max' },

    { cls: DataJumpDistanceAvg, canonical: 'Average Jump Distance', legacy: 'Jump Distance Avg' },
    { cls: DataJumpDistanceMin, canonical: 'Minimum Jump Distance', legacy: 'Jump Distance Min' },
    { cls: DataJumpDistanceMax, canonical: 'Maximum Jump Distance', legacy: 'Jump Distance Max' },

    { cls: DataJumpSpeedAvg, canonical: 'Average Jump Speed', legacy: 'Jump Speed Avg' },
    { cls: DataJumpSpeedMin, canonical: 'Minimum Jump Speed', legacy: 'Jump Speed Min' },
    { cls: DataJumpSpeedMax, canonical: 'Maximum Jump Speed', legacy: 'Jump Speed Max' },

    { cls: DataJumpRotationsAvg, canonical: 'Average Jump Rotations', legacy: 'Jump Rotations Avg' },
    { cls: DataJumpRotationsMin, canonical: 'Minimum Jump Rotations', legacy: 'Jump Rotations Min' },
    { cls: DataJumpRotationsMax, canonical: 'Maximum Jump Rotations', legacy: 'Jump Rotations Max' },

    { cls: DataJumpScoreAvg, canonical: 'Average Jump Score', legacy: 'Jump Score Avg' },
    { cls: DataJumpScoreMin, canonical: 'Minimum Jump Score', legacy: 'Jump Score Min' },
    { cls: DataJumpScoreMax, canonical: 'Maximum Jump Score', legacy: 'Jump Score Max' },

    { cls: DataJumpHeightAvg, canonical: 'Average Jump Height', legacy: 'Jump Height Avg' },
    { cls: DataJumpHeightMin, canonical: 'Minimum Jump Height', legacy: 'Jump Height Min' },
    { cls: DataJumpHeightMax, canonical: 'Maximum Jump Height', legacy: 'Jump Height Max' }
  ];

  it('keeps canonical names and legacy aliases for all renamed types', () => {
    renamedTypes.forEach(({ cls, canonical, legacy }) => {
      expect(cls.type).toBe(canonical);
      expect(Array.isArray(cls.aliases)).toBe(true);
      expect(cls.aliases).toContain(legacy);
    });
  });

  it('resolves both canonical and legacy names to the same classes', () => {
    renamedTypes.forEach(({ cls, canonical, legacy }) => {
      expect(DynamicDataLoader.getDataClassFromDataType(canonical)).toBe(cls);
      expect(DynamicDataLoader.getDataClassFromDataType(legacy)).toBe(cls);
    });
  });

  it('creates canonical instances from both canonical and legacy names', () => {
    renamedTypes.forEach(({ canonical, legacy }) => {
      expect(DynamicDataLoader.getDataInstanceFromDataType(canonical, 1).getType()).toBe(canonical);
      expect(DynamicDataLoader.getDataInstanceFromDataType(legacy, 1).getType()).toBe(canonical);
    });
  });

  it('maps Ground Contact Time family to canonical names', () => {
    expect(DynamicDataLoader.dataTypeAvgDataType[DataGroundContactTime.type]).toBe('Average Ground Contact Time');
    expect(DynamicDataLoader.dataTypeMinDataType[DataGroundContactTime.type]).toBe('Minimum Ground Contact Time');
    expect(DynamicDataLoader.dataTypeMaxDataType[DataGroundContactTime.type]).toBe('Maximum Ground Contact Time');
  });
});
