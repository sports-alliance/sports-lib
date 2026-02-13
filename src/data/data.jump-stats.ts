import { DataNumber } from './data.number';
import { DataSpeed } from './data.speed';
import { DataDuration } from './data.duration';
import { DataJumpDistance } from './data.jump-distance';

abstract class DataJumpHangTimeStat extends DataDuration {
  getDisplayValue(): string {
    return `${Math.round(this.getValue() * 1000)}`;
  }

  getDisplayUnit(): string {
    return 'ms';
  }
}

abstract class DataJumpScoreStat extends DataNumber {
  static unit = '';

  getDisplayValue(): string {
    return this.getValue().toFixed(1);
  }
}

export class DataJumpHangTimeMin extends DataJumpHangTimeStat {
  static type = 'Minimum Jump Hang Time';
  static aliases = ['Jump Hang Time Min'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpHangTimeMax extends DataJumpHangTimeStat {
  static type = 'Maximum Jump Hang Time';
  static aliases = ['Jump Hang Time Max'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpHangTimeAvg extends DataJumpHangTimeStat {
  static type = 'Average Jump Hang Time';
  static aliases = ['Jump Hang Time Avg'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpDistanceMin extends DataJumpDistance {
  static type = 'Minimum Jump Distance';
  static aliases = ['Jump Distance Min'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpDistanceMax extends DataJumpDistance {
  static type = 'Maximum Jump Distance';
  static aliases = ['Jump Distance Max'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpDistanceAvg extends DataJumpDistance {
  static type = 'Average Jump Distance';
  static aliases = ['Jump Distance Avg'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpSpeedMin extends DataSpeed {
  static type = 'Minimum Jump Speed';
  static aliases = ['Jump Speed Min'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpSpeedMax extends DataSpeed {
  static type = 'Maximum Jump Speed';
  static aliases = ['Jump Speed Max'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpSpeedAvg extends DataSpeed {
  static type = 'Average Jump Speed';
  static aliases = ['Jump Speed Avg'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpRotationsMin extends DataNumber {
  static type = 'Minimum Jump Rotations';
  static aliases = ['Jump Rotations Min'];
  static unit = '';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpRotationsMax extends DataNumber {
  static type = 'Maximum Jump Rotations';
  static aliases = ['Jump Rotations Max'];
  static unit = '';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpRotationsAvg extends DataNumber {
  static type = 'Average Jump Rotations';
  static aliases = ['Jump Rotations Avg'];
  static unit = '';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpScoreMin extends DataJumpScoreStat {
  static type = 'Minimum Jump Score';
  static aliases = ['Jump Score Min'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpScoreMax extends DataJumpScoreStat {
  static type = 'Maximum Jump Score';
  static aliases = ['Jump Score Max'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpScoreAvg extends DataJumpScoreStat {
  static type = 'Average Jump Score';
  static aliases = ['Jump Score Avg'];
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpHeightMin extends DataNumber {
  static type = 'Minimum Jump Height';
  static aliases = ['Jump Height Min'];
  static unit = 'm';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpHeightMax extends DataNumber {
  static type = 'Maximum Jump Height';
  static aliases = ['Jump Height Max'];
  static unit = 'm';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpHeightAvg extends DataNumber {
  static type = 'Average Jump Height';
  static aliases = ['Jump Height Avg'];
  static unit = 'm';
  constructor(value: number) {
    super(value);
  }
}
