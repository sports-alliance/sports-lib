import { DataPercent } from './data.percent';

export abstract class DataStrydBalance extends DataPercent {}

export class DataVerticalOscillationBalanceLeft extends DataStrydBalance {
  static type = 'Vertical Oscillation Balance Left';
}

export class DataVerticalOscillationBalanceRight extends DataStrydBalance {
  static type = 'Vertical Oscillation Balance Right';
}

export class DataLegSpringStiffnessBalanceLeft extends DataStrydBalance {
  static type = 'Leg Spring Stiffness Balance Left';
}

export class DataLegSpringStiffnessBalanceRight extends DataStrydBalance {
  static type = 'Leg Spring Stiffness Balance Right';
}

export class DataImpactLoadingRateBalanceLeft extends DataStrydBalance {
  static type = 'Impact Loading Rate Balance Left';
}

export class DataImpactLoadingRateBalanceRight extends DataStrydBalance {
  static type = 'Impact Loading Rate Balance Right';
}
