import { DataDistance } from './data.distance';
import { UnitSystem } from './data.interface';

/**
 * Recorded estimate of distance sustainable at the current effort, in metres.
 * A scalar describes the end of its recorded scope; a stream describes each observation.
 * This is neither travelled distance nor distance remaining to a target. Do not sum scopes.
 */
export class DataEstimatedSustainableDistance extends DataDistance {
  static override type = 'Estimated Sustainable Distance';

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  }
}

/** Source minimum, or the sampled minimum only when the source minimum is absent. */
export class DataEstimatedSustainableDistanceMin extends DataEstimatedSustainableDistance {
  static override type = 'Minimum Estimated Sustainable Distance';
}

/** Display-only miles variant; retains an identity distinct from travelled distance. */
export class DataEstimatedSustainableDistanceMiles extends DataEstimatedSustainableDistance {
  static override type = 'Estimated Sustainable Distance in miles';
  static override displayType = DataEstimatedSustainableDistance.type;
  static override unit = 'mi';
  static override unitSystem = UnitSystem.Imperial;

  override getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }

  override getDisplayUnit(): string {
    return 'mi';
  }
}

/** Display-only miles variant of the source/sampled minimum. */
export class DataEstimatedSustainableDistanceMinMiles extends DataEstimatedSustainableDistanceMiles {
  static override type = 'Minimum Estimated Sustainable Distance in miles';
  static override displayType = DataEstimatedSustainableDistanceMin.type;
}
