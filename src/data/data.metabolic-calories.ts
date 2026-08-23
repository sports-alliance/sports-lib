import { DataNumber } from './data.number';

/** Canonical FIT session field 196, in kilocalories. */
export class DataMetabolicCalories extends DataNumber {
  static type = 'Metabolic Calories';
  static unit = 'kcal';
}
