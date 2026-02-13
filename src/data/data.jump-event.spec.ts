import { DataJumpEvent, DataJumpScore, DataScore, DataRotations, JumpEventInterface } from './data.jump-event';
import { DataJumpDistance } from './data.jump-distance';
import { DataDistance } from './data.distance';
import { DataSpeed } from './data.speed';
import { DataDuration } from './data.duration';
import { DataLatitudeDegrees } from './data.latitude-degrees';
import { DataLongitudeDegrees } from './data.longitude-degrees';

describe('DataJumpEvent', () => {
  const timestamp = 1234567890;
  // Manual creation requires Data objects
  const jumpData: JumpEventInterface = {
    distance: new DataJumpDistance(5.5),
    height: new DataDistance(1.2),
    score: new DataJumpScore(85),
    hang_time: new DataDuration(0.8),
    position_lat: new DataLatitudeDegrees(40.7128),
    position_long: new DataLongitudeDegrees(-74.006),
    speed: new DataSpeed(15.2),
    rotations: new DataRotations(0)
  };

  it('should be created using constructor with separate arguments (Manual)', () => {
    const jumpEvent = new DataJumpEvent(timestamp, jumpData);
    expect(jumpEvent.getType()).toBe('Jump Event');
    expect(jumpEvent.getValue()).toBe(timestamp);
    // Expect exact object match
    expect(jumpEvent.jumpData).toEqual(jumpData);
  });

  it('should be created using constructor with object argument (Manual Object)', () => {
    const jumpEvent = new DataJumpEvent({ timestamp, jumpData });
    expect(jumpEvent.getType()).toBe('Jump Event');
    expect(jumpEvent.getValue()).toBe(timestamp);
    expect(jumpEvent.jumpData).toEqual(jumpData);
  });

  it('should serialize to JSON correctly', () => {
    const jumpEvent = new DataJumpEvent(timestamp, jumpData);
    const json = jumpEvent.toJSON();
    // toJSON output should be simple values
    expect(json).toEqual({
      'Jump Event': {
        timestamp: timestamp,
        jumpData: {
          distance: 5.5,
          height: 1.2,
          score: 85,
          hang_time: 0.8,
          position_lat: 40.7128,
          position_long: -74.006,
          speed: 15.2,
          rotations: 0
        }
      }
    });
  });

  it('should hydrate from JSON object correctly (simulating generic importer)', () => {
    // Generic importer passes primitive values
    const jsonValue = {
      timestamp,
      jumpData: {
        distance: 5.5,
        height: 1.2,
        score: 85,
        hang_time: 0.8,
        position_lat: 40.7128,
        position_long: -74.006,
        speed: 15.2,
        rotations: 0
      }
    };

    // Constructor should hydrate primitives into Data objects
    const jumpEvent = new DataJumpEvent(jsonValue as any);

    expect(jumpEvent.getType()).toBe('Jump Event');
    expect(jumpEvent.getValue()).toBe(timestamp);

    // Assertions check if properties are converted to Data objects
    expect(jumpEvent.jumpData.distance).toBeInstanceOf(DataJumpDistance);
    expect(jumpEvent.jumpData.distance.getValue()).toBe(5.5);
    expect(jumpEvent.jumpData.score).toBeInstanceOf(DataJumpScore);
    expect(jumpEvent.jumpData.score.getValue()).toBe(85);
    expect(jumpEvent.jumpData.speed).toBeInstanceOf(DataSpeed);
    expect(jumpEvent.jumpData.speed!.getValue()).toBe(15.2);
  });

  it('should preserve optional zero values during hydration', () => {
    const jsonValue = {
      timestamp,
      jumpData: {
        distance: 1.5,
        height: 0,
        score: 0,
        hang_time: 0,
        position_lat: 0,
        position_long: 0,
        speed: 0,
        rotations: 0
      }
    };

    const jumpEvent = new DataJumpEvent(jsonValue as any);

    expect(jumpEvent.jumpData.height?.getValue()).toBe(0);
    expect(jumpEvent.jumpData.hang_time?.getValue()).toBe(0);
    expect(jumpEvent.jumpData.position_lat?.getValue()).toBe(0);
    expect(jumpEvent.jumpData.position_long?.getValue()).toBe(0);
    expect(jumpEvent.jumpData.speed?.getValue()).toBe(0);
    expect(jumpEvent.jumpData.rotations?.getValue()).toBe(0);
  });

  it('should format jump-event score with one decimal', () => {
    const jumpEvent = new DataJumpEvent(timestamp, jumpData);

    expect(jumpEvent.jumpData.score.getDisplayValue()).toBe('85.0');
  });

  it('should keep DataScore alias compatible with DataJumpScore', () => {
    const scoreFromAlias = new DataScore(6.28);

    expect(scoreFromAlias).toBeInstanceOf(DataJumpScore);
    expect(scoreFromAlias.getDisplayValue()).toBe('6.3');
    expect(DataScore).toBe(DataJumpScore);
    expect(DataJumpScore.type).toBe('Jump Score');
  });
});
