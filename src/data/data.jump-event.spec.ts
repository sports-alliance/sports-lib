import { DataJumpEvent, DataScore, DataRotations, JumpEventInterface } from './data.jump-event';
import { DataDistance } from './data.distance';
import { DataSpeed } from './data.speed';
import { DataDuration } from './data.duration';
import { DataLatitudeDegrees } from './data.latitude-degrees';
import { DataLongitudeDegrees } from './data.longitude-degrees';

describe('DataJumpEvent', () => {
    const timestamp = 1234567890;
    // Manual creation requires Data objects
    const jumpData: JumpEventInterface = {
        distance: new DataDistance(5.5),
        height: new DataDistance(1.2),
        score: new DataScore(85),
        hang_time: new DataDuration(0.8),
        position_lat: new DataLatitudeDegrees(40.7128),
        position_long: new DataLongitudeDegrees(-74.0060),
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
                    position_long: -74.0060,
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
                position_long: -74.0060,
                speed: 15.2,
                rotations: 0
            }
        };

        // Constructor should hydrate primitives into Data objects
        const jumpEvent = new DataJumpEvent(jsonValue as any);

        expect(jumpEvent.getType()).toBe('Jump Event');
        expect(jumpEvent.getValue()).toBe(timestamp);

        // Assertions check if properties are converted to Data objects
        expect(jumpEvent.jumpData.distance).toBeInstanceOf(DataDistance);
        expect(jumpEvent.jumpData.distance.getValue()).toBe(5.5);
        expect(jumpEvent.jumpData.score).toBeInstanceOf(DataScore);
        expect(jumpEvent.jumpData.score.getValue()).toBe(85);
        expect(jumpEvent.jumpData.speed).toBeInstanceOf(DataSpeed);
        expect(jumpEvent.jumpData.speed!.getValue()).toBe(15.2);
    });
});
