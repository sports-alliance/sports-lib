import { DataNumber } from './data.number';
import { DataPercent } from './data.percent';

abstract class DataFiniteRunningDynamicsNumber extends DataNumber {
  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

abstract class DataFiniteRunningDynamicsPercent extends DataPercent {
  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

/** FIT running-dynamics ground-contact duration expressed as a percentage of the running cycle. */
export class DataGroundContactTimePercentage extends DataFiniteRunningDynamicsPercent {
  static type = 'Ground Contact Time Percentage';
}

/** Average ground-contact-time percentage. */
export class DataGroundContactTimePercentageAvg extends DataGroundContactTimePercentage {
  static override type = 'Average Ground Contact Time Percentage';
  static aliases = ['Ground Contact Time Percentage Avg'];
}

/** Minimum ground-contact-time percentage. */
export class DataGroundContactTimePercentageMin extends DataGroundContactTimePercentage {
  static override type = 'Minimum Ground Contact Time Percentage';
  static aliases = ['Ground Contact Time Percentage Min'];
}

/** Maximum ground-contact-time percentage. */
export class DataGroundContactTimePercentageMax extends DataGroundContactTimePercentage {
  static override type = 'Maximum Ground Contact Time Percentage';
  static aliases = ['Ground Contact Time Percentage Max'];
}

/** Running flight duration between ground-contact phases, normalized to milliseconds. */
export class DataRunningFlightTime extends DataFiniteRunningDynamicsNumber {
  static type = 'Running Flight Time';
  static unit = 'ms';

  override getDisplayValue(): number {
    return Math.round(this.getValue());
  }
}

/** Average running flight duration. */
export class DataRunningFlightTimeAvg extends DataRunningFlightTime {
  static override type = 'Average Running Flight Time';
  static aliases = ['Running Flight Time Avg'];
}

/** Minimum running flight duration. */
export class DataRunningFlightTimeMin extends DataRunningFlightTime {
  static override type = 'Minimum Running Flight Time';
  static aliases = ['Running Flight Time Min'];
}

/** Maximum running flight duration. */
export class DataRunningFlightTimeMax extends DataRunningFlightTime {
  static override type = 'Maximum Running Flight Time';
  static aliases = ['Running Flight Time Max'];
}

/** Suunto source-provided contact-time-to-flight-time ratio, expressed as a percentage. */
export class DataContactTimeToFlightTimeRatio extends DataFiniteRunningDynamicsPercent {
  static type = 'Contact Time to Flight Time Ratio';
}

/** Average contact-time-to-flight-time ratio. */
export class DataContactTimeToFlightTimeRatioAvg extends DataContactTimeToFlightTimeRatio {
  static override type = 'Average Contact Time to Flight Time Ratio';
  static aliases = ['Contact Time to Flight Time Ratio Avg'];
}

/** Minimum contact-time-to-flight-time ratio. */
export class DataContactTimeToFlightTimeRatioMin extends DataContactTimeToFlightTimeRatio {
  static override type = 'Minimum Contact Time to Flight Time Ratio';
  static aliases = ['Contact Time to Flight Time Ratio Min'];
}

/** Maximum contact-time-to-flight-time ratio. */
export class DataContactTimeToFlightTimeRatioMax extends DataContactTimeToFlightTimeRatio {
  static override type = 'Maximum Contact Time to Flight Time Ratio';
  static aliases = ['Contact Time to Flight Time Ratio Max'];
}
