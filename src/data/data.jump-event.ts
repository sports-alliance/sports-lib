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

    return {
      distance:
        data.distance instanceof DataJumpDistance ? data.distance : new DataJumpDistance(data.distance),
      height:
        data.height instanceof DataDistance
          ? data.height
          : isFiniteNumber(data.height)
            ? new DataDistance(data.height)
            : undefined,
      score:
        data.score instanceof DataJumpScore
          ? data.score
          : new DataJumpScore(data.score),
      hang_time:
        data.hang_time instanceof DataDuration
          ? data.hang_time
          : isFiniteNumber(data.hang_time)
            ? new DataDuration(data.hang_time)
            : undefined,
      position_lat:
        data.position_lat instanceof DataLatitudeDegrees
          ? data.position_lat
          : isFiniteNumber(data.position_lat)
            ? new DataLatitudeDegrees(data.position_lat)
            : undefined,
      position_long:
        data.position_long instanceof DataLongitudeDegrees
          ? data.position_long
          : isFiniteNumber(data.position_long)
            ? new DataLongitudeDegrees(data.position_long)
            : undefined,
      speed:
        data.speed instanceof DataSpeed
          ? data.speed
          : isFiniteNumber(data.speed)
            ? new DataSpeed(data.speed)
            : undefined,
      rotations:
        data.rotations instanceof DataRotations
          ? data.rotations
          : isFiniteNumber(data.rotations)
            ? new DataRotations(data.rotations)
            : undefined
    };
  }

  toJSON(): any {
    super.toJSON();
    return {
      [DataJumpEvent.type]: {
        timestamp: this.getValue(),
        jumpData: {
          distance: this.jumpData.distance.getValue(),
          height: this.jumpData.height?.getValue(),
          score: this.jumpData.score.getValue(),
          hang_time: this.jumpData.hang_time?.getValue(),
          position_lat: this.jumpData.position_lat?.getValue(),
          position_long: this.jumpData.position_long?.getValue(),
          speed: this.jumpData.speed?.getValue(),
          rotations: this.jumpData.rotations?.getValue()
        }
      }
    };
  }
}
