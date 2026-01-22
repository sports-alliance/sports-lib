import { DataNumber } from './data.number';

export class DataJumpHangTimeMin extends DataNumber {
    static type = 'Jump Hang Time Min';
    static unit = 's';
    constructor(value: number) { super(value); }
}

export class DataJumpHangTimeMax extends DataNumber {
    static type = 'Jump Hang Time Max';
    static unit = 's';
    constructor(value: number) { super(value); }
}

export class DataJumpHangTimeAvg extends DataNumber {
    static type = 'Jump Hang Time Avg';
    static unit = 's';
    constructor(value: number) { super(value); }
}

export class DataJumpDistanceMin extends DataNumber {
    static type = 'Jump Distance Min';
    static unit = 'm';
    constructor(value: number) { super(value); }
}

export class DataJumpDistanceMax extends DataNumber {
    static type = 'Jump Distance Max';
    static unit = 'm';
    constructor(value: number) { super(value); }
}

export class DataJumpDistanceAvg extends DataNumber {
    static type = 'Jump Distance Avg';
    static unit = 'm';
    constructor(value: number) { super(value); }
}

export class DataJumpSpeedMin extends DataNumber {
    static type = 'Jump Speed Min';
    static unit = 'm/s';
    constructor(value: number) { super(value); }
}

export class DataJumpSpeedMax extends DataNumber {
    static type = 'Jump Speed Max';
    static unit = 'm/s';
    constructor(value: number) { super(value); }
}

export class DataJumpSpeedAvg extends DataNumber {
    static type = 'Jump Speed Avg';
    static unit = 'm/s';
    constructor(value: number) { super(value); }
}

export class DataJumpRotationsMin extends DataNumber {
    static type = 'Jump Rotations Min';
    static unit = '';
    constructor(value: number) { super(value); }
}

export class DataJumpRotationsMax extends DataNumber {
    static type = 'Jump Rotations Max';
    static unit = '';
    constructor(value: number) { super(value); }
}

export class DataJumpRotationsAvg extends DataNumber {
    static type = 'Jump Rotations Avg';
    static unit = '';
    constructor(value: number) { super(value); }
}

export class DataJumpScoreMin extends DataNumber {
    static type = 'Jump Score Min';
    static unit = '';
    constructor(value: number) { super(value); }
}

export class DataJumpScoreMax extends DataNumber {
    static type = 'Jump Score Max';
    static unit = '';
    constructor(value: number) { super(value); }
}

export class DataJumpScoreAvg extends DataNumber {
    static type = 'Jump Score Avg';
    static unit = '';
    constructor(value: number) { super(value); }
}

export class DataJumpHeightMin extends DataNumber {
    static type = 'Jump Height Min';
    static unit = 'm';
    constructor(value: number) { super(value); }
}

export class DataJumpHeightMax extends DataNumber {
    static type = 'Jump Height Max';
    static unit = 'm';
    constructor(value: number) { super(value); }
}

export class DataJumpHeightAvg extends DataNumber {
    static type = 'Jump Height Avg';
    static unit = 'm';
    constructor(value: number) { super(value); }
}
