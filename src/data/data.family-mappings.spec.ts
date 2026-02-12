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
import { DataJumpDistanceAvg, DataJumpDistanceMin, DataJumpDistanceMax } from './data.jump-stats';

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
});
