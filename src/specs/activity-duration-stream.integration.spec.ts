import { Activity } from '../activities/activity';
import { Creator } from '../creators/creator';
import { DataDistance } from '../data/data.distance';
import { ActivityTypes } from '../activities/activity.types';
import { DataDuration } from '../data/data.duration';

describe('Activity Duration Stream', () => {
    let activity: Activity;

    beforeEach(() => {
        // Create a 10-second activity
        const startDate = new Date('2023-01-01T10:00:00Z');
        const endDate = new Date('2023-01-01T10:00:10Z');
        const creator = new Creator('Test Creator');
        activity = new Activity(startDate, endDate, ActivityTypes.Running, creator);
    });

    it('should generate a duration stream based on time stream logic', () => {
        // Add a distance stream with some data
        const distanceStream = activity.createStream(DataDistance.type);
        // Data at 0s, 5s, 10s
        distanceStream.getData()[0] = 0;
        distanceStream.getData()[5] = 50;
        distanceStream.getData()[10] = 100;
        activity.addStream(distanceStream);

        const durationStream = activity.generateDurationStream();

        expect(durationStream.type).toBe(DataDuration.type);

        const data = durationStream.getData();
        // Assuming generateTimeStream fills data where source stream has data
        expect(data[0]).toBe(0);
        expect(data[5]).toBe(5);
        expect(data[10]).toBe(10);

        // Other indices should be null/undefined as per generateTimeStream logic?
        // Let's verify what generateTimeStream does. 
        // It uses `getStreamDataByDuration` with filterNull=true.
        // So it only populates indices where source stream has data.
        expect(data[1]).toBeFalsy();
        expect(data[2]).toBeFalsy();
    });

    it('should allow specifying stream types to base duration on', () => {
        // Scenario where we want duration based on HeartRate, not Distance
        // Although logic reuses generateTimeStream which filters by streamTypes if provided.
        // But generateTimeStream implementation:
        /*
        if (streamTypes.length) {
          streams = streams.filter(stream => streamTypes.indexOf(stream.type) !== -1);
        }
        */
        // It unions all provided streams? 
        // "streams.forEach(stream => { ... })"
        // Yes, it iterates all matching streams and fills the time stream.

        // Let's create a custom stream
        const customStream = activity.createStream('Custom');
        customStream.getData()[2] = 123;
        activity.addStream(customStream);

        const durationStream = activity.generateDurationStream(['Custom']);

        expect(durationStream.getData()[2]).toBe(2);
        expect(durationStream.getData()[0]).toBeFalsy(); // Distance stream at 0 should be ignored if we only asked for Custom
    });
});
