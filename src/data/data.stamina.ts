import { DataPercent } from './data.percent';

export class DataStamina extends DataPercent {
  static type = 'Stamina';
}

export class DataStaminaMin extends DataStamina {
  static type = 'Minimum Stamina';
}

export class DataStaminaMax extends DataStamina {
  static type = 'Maximum Stamina';
}

export class DataStaminaAvg extends DataStamina {
  static type = 'Average Stamina';
}

export class DataPotentialStamina extends DataPercent {
  static type = 'Potential Stamina';
}

export class DataPotentialStaminaMin extends DataPotentialStamina {
  static type = 'Minimum Potential Stamina';
}

export class DataPotentialStaminaMax extends DataPotentialStamina {
  static type = 'Maximum Potential Stamina';
}

export class DataPotentialStaminaAvg extends DataPotentialStamina {
  static type = 'Average Potential Stamina';
}

export class DataBeginningPotentialStamina extends DataPotentialStamina {
  static type = 'Beginning Potential Stamina';
}

export class DataEndingPotentialStamina extends DataPotentialStamina {
  static type = 'Ending Potential Stamina';
}
