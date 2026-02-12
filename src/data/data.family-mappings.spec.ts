import { DynamicDataLoader } from './data.store';
import { DataFlow } from './data.flow';
import { DataAvgFlow } from './data.avg-flow';
import { DataGrit } from './data.grit';
import { DataAvgGrit } from './data.avg-grit';
import { DataVerticalOscillation } from './data.vertical-oscillation';
import { DataVerticalOscillationAvg } from './data.vertical-oscillation-avg';
import { DataVerticalOscillationMin } from './data.vertical-oscillation-min';
import { DataVerticalOscillationMax } from './data.vertical-oscillation-max';
import { DataJumpDistance } from './data.jump-distance';
import {
  DataJumpDistanceAvg,
  DataJumpDistanceMin,
  DataJumpDistanceMax,
  DataJumpHangTimeAvg,
  DataJumpHangTimeMin,
  DataJumpHangTimeMax,
  DataJumpHeightAvg,
  DataJumpHeightMin,
  DataJumpHeightMax,
  DataJumpSpeedAvg,
  DataJumpSpeedMin,
  DataJumpSpeedMax,
  DataJumpRotationsAvg,
  DataJumpRotationsMin,
  DataJumpRotationsMax,
  DataJumpScoreAvg,
  DataJumpScoreMin,
  DataJumpScoreMax
} from './data.jump-stats';

describe('DynamicDataLoader family mappings', () => {
  it('maps Flow and Grit to average families', () => {
    expect(DynamicDataLoader.dataTypeAvgDataType[DataFlow.type]).toBe(DataAvgFlow.type);
    expect(DynamicDataLoader.dataTypeAvgDataType[DataGrit.type]).toBe(DataAvgGrit.type);
  });

  it('maps Vertical Oscillation family to avg/min/max canonical names', () => {
    expect(DynamicDataLoader.dataTypeAvgDataType[DataVerticalOscillation.type]).toBe(DataVerticalOscillationAvg.type);
    expect(DynamicDataLoader.dataTypeMinDataType[DataVerticalOscillation.type]).toBe(DataVerticalOscillationMin.type);
    expect(DynamicDataLoader.dataTypeMaxDataType[DataVerticalOscillation.type]).toBe(DataVerticalOscillationMax.type);
  });

  it('maps Jump Distance family to avg/min/max canonical names', () => {
    expect(DynamicDataLoader.dataTypeAvgDataType[DataJumpDistance.type]).toBe(DataJumpDistanceAvg.type);
    expect(DynamicDataLoader.dataTypeMinDataType[DataJumpDistance.type]).toBe(DataJumpDistanceMin.type);
    expect(DynamicDataLoader.dataTypeMaxDataType[DataJumpDistance.type]).toBe(DataJumpDistanceMax.type);
  });

  it('maps all jump families to avg/min/max canonical names', () => {
    const jumpFamilyMappings = [
      {
        base: DataJumpDistance.type,
        avg: DataJumpDistanceAvg.type,
        min: DataJumpDistanceMin.type,
        max: DataJumpDistanceMax.type
      },
      {
        base: 'Jump Hang Time',
        avg: DataJumpHangTimeAvg.type,
        min: DataJumpHangTimeMin.type,
        max: DataJumpHangTimeMax.type
      },
      {
        base: 'Jump Height',
        avg: DataJumpHeightAvg.type,
        min: DataJumpHeightMin.type,
        max: DataJumpHeightMax.type
      },
      {
        base: 'Jump Speed',
        avg: DataJumpSpeedAvg.type,
        min: DataJumpSpeedMin.type,
        max: DataJumpSpeedMax.type
      },
      {
        base: 'Jump Rotations',
        avg: DataJumpRotationsAvg.type,
        min: DataJumpRotationsMin.type,
        max: DataJumpRotationsMax.type
      },
      {
        base: 'Jump Score',
        avg: DataJumpScoreAvg.type,
        min: DataJumpScoreMin.type,
        max: DataJumpScoreMax.type
      }
    ];

    jumpFamilyMappings.forEach(({ base, avg, min, max }) => {
      expect(DynamicDataLoader.dataTypeAvgDataType[base]).toBe(avg);
      expect(DynamicDataLoader.dataTypeMinDataType[base]).toBe(min);
      expect(DynamicDataLoader.dataTypeMaxDataType[base]).toBe(max);
    });
  });
});
