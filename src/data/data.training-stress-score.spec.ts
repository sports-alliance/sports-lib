import { DynamicDataLoader } from './data.store';
import { DataPowerTrainingStressScore } from './data.power-training-stress-score';
import { DataTrainingStressScore } from './data.training-stress-score';

describe('DataTrainingStressScore compatibility', () => {
  it('offers one-decimal load display without changing default display or canonical persistence', () => {
    const score = new DataTrainingStressScore(87.34);
    expect(score.getDisplayValue()).toBe(87);
    expect(score.getDisplayValue(1)).toBe(87.3);
    expect(score.getDisplayUnit()).toBe('');
    expect(score.getValue()).toBe(87.34);
    expect(new DataTrainingStressScore(0).getDisplayValue(1)).toBe(0);
  });
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
