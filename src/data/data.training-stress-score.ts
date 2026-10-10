import { DataPower } from './data.power';

export class DataTrainingStressScore extends DataPower {
  static type = 'Training Stress Score';
  static aliases = ['Power Training Stress Score'];
  static unit = '';

  /** Default recorded-stat display stays integral; load editors may request one decimal. */
  getDisplayValue(decimalPlaces: 0 | 1 = 0): number {
    const scale = 10 ** decimalPlaces;
    return Math.round(this.getValue() * scale) / scale;
  }
}
