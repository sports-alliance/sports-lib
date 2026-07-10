import { DataPercent } from './data.percent';

export abstract class DataRunningDynamicsBalance extends DataPercent {}

export class DataVerticalOscillationBalanceLeft extends DataRunningDynamicsBalance {
  static type = 'Vertical Oscillation Balance Left';
}

export class DataVerticalOscillationBalanceRight extends DataRunningDynamicsBalance {
  static type = 'Vertical Oscillation Balance Right';
}

export class DataLegSpringStiffnessBalanceLeft extends DataRunningDynamicsBalance {
  static type = 'Leg Spring Stiffness Balance Left';
}

export class DataLegSpringStiffnessBalanceRight extends DataRunningDynamicsBalance {
  static type = 'Leg Spring Stiffness Balance Right';
}

export class DataImpactLoadingRateBalanceLeft extends DataRunningDynamicsBalance {
  static type = 'Impact Loading Rate Balance Left';
}

export class DataImpactLoadingRateBalanceRight extends DataRunningDynamicsBalance {
  static type = 'Impact Loading Rate Balance Right';
}
