import { DynamicDataLoader } from './data.store';
import { DataPowerTrainingStressScore } from './data.power-training-stress-score';
import { DataTrainingStressScore } from './data.training-stress-score';

describe('DataTrainingStressScore compatibility', () => {
  it('keeps the deprecated class alias mapped to the new stat type', () => {
    expect(DataPowerTrainingStressScore.type).toBe(DataTrainingStressScore.type);
  });

  it('resolves legacy stat label to DataTrainingStressScore', () => {
    const legacyType = 'Power Training Stress Score';
    const dataClass = DynamicDataLoader.getDataClassFromDataType(legacyType);
    const instance = DynamicDataLoader.getDataInstanceFromDataType(legacyType, 123.4);

    expect(dataClass).toBe(DataTrainingStressScore);
    expect(instance.getType()).toBe(DataTrainingStressScore.type);
    expect(instance.getValue()).toBe(123.4);
  });
});
