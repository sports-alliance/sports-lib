import { DataNumber } from './data.number';
import {
  DataSpeed,
  DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour,
  DataSpeedKnots,
  DataSpeedMetersPerMinute,
  DataSpeedMilesPerHour
} from './data.speed';
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

export class DataJumpSpeedAvgKilometersPerHour extends DataSpeedKilometersPerHour {
  static type = 'Average jump speed in kilometers per hour';
  static aliases = ['Jump Speed Avg in kilometers per hour'];
  static displayType = DataJumpSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedAvgMilesPerHour extends DataSpeedMilesPerHour {
  static type = 'Average jump speed in miles per hour';
  static aliases = ['Jump Speed Avg in miles per hour'];
  static displayType = DataJumpSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedAvgFeetPerSecond extends DataSpeedFeetPerSecond {
  static type = 'Average jump speed in feet per second';
  static aliases = ['Jump Speed Avg in feet per second'];
  static displayType = DataJumpSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedAvgMetersPerMinute extends DataSpeedMetersPerMinute {
  static type = 'Average jump speed in meters per minute';
  static aliases = ['Jump Speed Avg in meters per minute'];
  static displayType = DataJumpSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedAvgFeetPerMinute extends DataSpeedFeetPerMinute {
  static type = 'Average jump speed in feet per minute';
  static aliases = ['Jump Speed Avg in feet per minute'];
  static displayType = DataJumpSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedAvgKnots extends DataSpeedKnots {
  static type = 'Average jump speed in knots';
  static aliases = ['Jump Speed Avg in knots'];
  static displayType = DataJumpSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMinKilometersPerHour extends DataSpeedKilometersPerHour {
  static type = 'Minimum jump speed in kilometers per hour';
  static aliases = ['Jump Speed Min in kilometers per hour'];
  static displayType = DataJumpSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMinMilesPerHour extends DataSpeedMilesPerHour {
  static type = 'Minimum jump speed in miles per hour';
  static aliases = ['Jump Speed Min in miles per hour'];
  static displayType = DataJumpSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMinFeetPerSecond extends DataSpeedFeetPerSecond {
  static type = 'Minimum jump speed in feet per second';
  static aliases = ['Jump Speed Min in feet per second'];
  static displayType = DataJumpSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMinMetersPerMinute extends DataSpeedMetersPerMinute {
  static type = 'Minimum jump speed in meters per minute';
  static aliases = ['Jump Speed Min in meters per minute'];
  static displayType = DataJumpSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMinFeetPerMinute extends DataSpeedFeetPerMinute {
  static type = 'Minimum jump speed in feet per minute';
  static aliases = ['Jump Speed Min in feet per minute'];
  static displayType = DataJumpSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMinKnots extends DataSpeedKnots {
  static type = 'Minimum jump speed in knots';
  static aliases = ['Jump Speed Min in knots'];
  static displayType = DataJumpSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMaxKilometersPerHour extends DataSpeedKilometersPerHour {
  static type = 'Maximum jump speed in kilometers per hour';
  static aliases = ['Jump Speed Max in kilometers per hour'];
  static displayType = DataJumpSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMaxMilesPerHour extends DataSpeedMilesPerHour {
  static type = 'Maximum jump speed in miles per hour';
  static aliases = ['Jump Speed Max in miles per hour'];
  static displayType = DataJumpSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMaxFeetPerSecond extends DataSpeedFeetPerSecond {
  static type = 'Maximum jump speed in feet per second';
  static aliases = ['Jump Speed Max in feet per second'];
  static displayType = DataJumpSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMaxMetersPerMinute extends DataSpeedMetersPerMinute {
  static type = 'Maximum jump speed in meters per minute';
  static aliases = ['Jump Speed Max in meters per minute'];
  static displayType = DataJumpSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMaxFeetPerMinute extends DataSpeedFeetPerMinute {
  static type = 'Maximum jump speed in feet per minute';
  static aliases = ['Jump Speed Max in feet per minute'];
  static displayType = DataJumpSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataJumpSpeedMaxKnots extends DataSpeedKnots {
  static type = 'Maximum jump speed in knots';
  static aliases = ['Jump Speed Max in knots'];
  static displayType = DataJumpSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
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
