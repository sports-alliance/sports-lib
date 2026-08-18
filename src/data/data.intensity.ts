import { DataString } from './data.string';

/**
 * FIT-defined classification of a session's or lap's role, such as warmup, active, or cooldown.
 */
export class DataIntensity extends DataString {
  static type = 'Intensity';
}
