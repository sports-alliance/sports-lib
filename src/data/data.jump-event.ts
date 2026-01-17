import { DataEvent } from './data.event';

export interface JumpEventInterface {
    distance: number;
    height: number;
    score: number;
}

export class DataJumpEvent extends DataEvent {
    static type = 'Jump Event';

    constructor(timestamp: number, public jumpData: JumpEventInterface) {
        super(timestamp);
    }

    toJSON(): any {
        const json = super.toJSON();
        return {
            ...json,
            jumpData: this.jumpData,
        };
    }
}
