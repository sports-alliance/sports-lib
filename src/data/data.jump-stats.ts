import { DataNumber } from './data.number';

export class DataJumpHangTimeMin extends DataNumber {
  static type = 'Minimum Jump Hang Time';
  static aliases = ['Jump Hang Time Min'];
  static unit = 's';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpHangTimeMax extends DataNumber {
  static type = 'Maximum Jump Hang Time';
  static aliases = ['Jump Hang Time Max'];
  static unit = 's';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpHangTimeAvg extends DataNumber {
  static type = 'Average Jump Hang Time';
  static aliases = ['Jump Hang Time Avg'];
  static unit = 's';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpDistanceMin extends DataNumber {
  static type = 'Minimum Jump Distance';
  static aliases = ['Jump Distance Min'];
  static unit = 'm';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpDistanceMax extends DataNumber {
  static type = 'Maximum Jump Distance';
  static aliases = ['Jump Distance Max'];
  static unit = 'm';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpDistanceAvg extends DataNumber {
  static type = 'Average Jump Distance';
  static aliases = ['Jump Distance Avg'];
  static unit = 'm';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpSpeedMin extends DataNumber {
  static type = 'Minimum Jump Speed';
  static aliases = ['Jump Speed Min'];
  static unit = 'm/s';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpSpeedMax extends DataNumber {
  static type = 'Maximum Jump Speed';
  static aliases = ['Jump Speed Max'];
  static unit = 'm/s';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpSpeedAvg extends DataNumber {
  static type = 'Average Jump Speed';
  static aliases = ['Jump Speed Avg'];
  static unit = 'm/s';
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

export class DataJumpScoreMin extends DataNumber {
  static type = 'Minimum Jump Score';
  static aliases = ['Jump Score Min'];
  static unit = '';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpScoreMax extends DataNumber {
  static type = 'Maximum Jump Score';
  static aliases = ['Jump Score Max'];
  static unit = '';
  constructor(value: number) {
    super(value);
  }
}

export class DataJumpScoreAvg extends DataNumber {
  static type = 'Average Jump Score';
  static aliases = ['Jump Score Avg'];
  static unit = '';
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
