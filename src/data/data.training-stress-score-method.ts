import { DataString } from './data.string';

export const TrainingStressScoreMethod = {
  POWER: 'POWER',
  HR: 'HR',
  PACE: 'PACE',
  SWIM_PACE: 'SWIM_PACE',
  MET: 'MET',
  IMPORTED: 'IMPORTED'
} as const;

export type TrainingStressScoreMethodType =
  (typeof TrainingStressScoreMethod)[keyof typeof TrainingStressScoreMethod];

export class DataTrainingStressScoreMethod extends DataString {
  static type = 'Training Stress Score Method';
  static unit = '';
}
