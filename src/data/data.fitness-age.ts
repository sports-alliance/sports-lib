import { DataNumber } from './data.number';

/** Provider-calculated fitness age in years. */
export class DataFitnessAge extends DataNumber {
  static type = 'Fitness Age';
  static unit = 'years';
  static aliases = ['fitness_age'];
}
