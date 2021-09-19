import { DataCyclingDynamics } from './data.cycling-dynamics';

/**
 * Rider position "events" as described in FIT SDK "typedef FIT_ENUM FIT_RIDER_POSITION_TYPE;":
 */
export enum RiderPosition {
  SEATED = 0,
  STANDING = 1,
  TRANSITION_TO_SEATED = 2,
  TRANSITION_TO_STANDING = 3
}

export abstract class DataCyclingPosition extends DataCyclingDynamics {}

// The below stats could be implemented based on RiderPosition events
/*
export class DataCyclingAvgStandingPower extends DataCyclingPosition {
  static type = 'Cycling Avg Standing Power';
  static unit = 'watt';
}

export class DataCyclingMaxStandingPower extends DataCyclingPosition {
  static type = 'Cycling Max Standing Power';
  static unit = 'watt';
}

// field: max_power_position
export class DataCyclingMaxSeatedPower extends DataCyclingPosition {
  static type = 'Cycling Max Seated Power';
  static unit = 'watt';
}

// field: avg_power_position
export class DataCyclingAvgSeatedPower extends DataCyclingPosition {
  static type = 'Cycling Avg Seated Power';
  static unit = 'watt';
}
*/
