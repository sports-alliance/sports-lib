import { DataEvent } from './data.event';
import { DataDistance } from './data.distance';
import { DataSpeed } from './data.speed';
import { DataDuration } from './data.duration';
import { DataNumber } from './data.number';
import { DataLatitudeDegrees } from './data.latitude-degrees';
import { DataLongitudeDegrees } from './data.longitude-degrees';
import { DataJumpDistance } from './data.jump-distance';

export class DataJumpScore extends DataNumber {
  static type = 'Jump Score';
  static unit = '';
  static aliases = ['Score'];

  getDisplayValue(): string {
    return this.getValue().toFixed(1);
  }
}

/** @deprecated Use DataJumpScore instead. */
export const DataScore = DataJumpScore;

export class DataRotations extends DataNumber {
  static type = 'Rotations';
}

export interface JumpEventInterface {
  distance: DataJumpDistance;
  height?: DataDistance;
  score: DataJumpScore;
  hang_time?: DataDuration;
  position_lat?: DataLatitudeDegrees;
  position_long?: DataLongitudeDegrees;
  speed?: DataSpeed;
  rotations?: DataRotations;
}

export class DataJumpEvent extends DataEvent {
  static type = 'Jump Event';
  public jumpData!: JumpEventInterface;

  constructor(timestampOrObj: number | { timestamp: number; jumpData: any }, jumpData?: any) {
    if (typeof timestampOrObj === 'object') {
      super(timestampOrObj.timestamp);
      this.jumpData = this.hydrate(timestampOrObj.jumpData);
    } else {
      super(timestampOrObj);
      this.jumpData = this.hydrate(jumpData!);
    }
  }

  private hydrate(data: any): JumpEventInterface {
    const isFiniteNumber = (value: unknown): value is number => {
      return typeof value === 'number' && Number.isFinite(value);
    };

    const jumpData: JumpEventInterface = {
      distance:
        data.distance instanceof DataJumpDistance ? data.distance : new DataJumpDistance(data.distance),
      score:
        data.score instanceof DataJumpScore
          ? data.score
          : new DataJumpScore(data.score)
    };

    const height =
      data.height instanceof DataDistance
        ? data.height
        : isFiniteNumber(data.height)
          ? new DataDistance(data.height)
          : undefined;
    if (height !== undefined) {
      jumpData.height = height;
    }

    const hangTime =
      data.hang_time instanceof DataDuration
        ? data.hang_time
        : isFiniteNumber(data.hang_time)
          ? new DataDuration(data.hang_time)
          : undefined;
    if (hangTime !== undefined) {
      jumpData.hang_time = hangTime;
    }

    const positionLat =
      data.position_lat instanceof DataLatitudeDegrees
        ? data.position_lat
        : isFiniteNumber(data.position_lat)
          ? new DataLatitudeDegrees(data.position_lat)
          : undefined;
    if (positionLat !== undefined) {
      jumpData.position_lat = positionLat;
    }

    const positionLong =
      data.position_long instanceof DataLongitudeDegrees
        ? data.position_long
        : isFiniteNumber(data.position_long)
          ? new DataLongitudeDegrees(data.position_long)
          : undefined;
    if (positionLong !== undefined) {
      jumpData.position_long = positionLong;
    }

    const speed =
      data.speed instanceof DataSpeed
        ? data.speed
        : isFiniteNumber(data.speed)
          ? new DataSpeed(data.speed)
          : undefined;
    if (speed !== undefined) {
      jumpData.speed = speed;
    }

    const rotations =
      data.rotations instanceof DataRotations
        ? data.rotations
        : isFiniteNumber(data.rotations)
          ? new DataRotations(data.rotations)
          : undefined;
    if (rotations !== undefined) {
      jumpData.rotations = rotations;
    }

    return jumpData;
  }

  toJSON(): any {
    super.toJSON();
    const jumpData: any = {
      distance: this.jumpData.distance.getValue(),
      score: this.jumpData.score.getValue()
    };

    if (this.jumpData.height) {
      jumpData.height = this.jumpData.height.getValue();
    }
    if (this.jumpData.hang_time) {
      jumpData.hang_time = this.jumpData.hang_time.getValue();
    }
    if (this.jumpData.position_lat) {
      jumpData.position_lat = this.jumpData.position_lat.getValue();
    }
    if (this.jumpData.position_long) {
      jumpData.position_long = this.jumpData.position_long.getValue();
    }
    if (this.jumpData.speed) {
      jumpData.speed = this.jumpData.speed.getValue();
    }
    if (this.jumpData.rotations) {
      jumpData.rotations = this.jumpData.rotations.getValue();
    }

    return {
      [DataJumpEvent.type]: {
        timestamp: this.getValue(),
        jumpData
      }
    };
  }
}
