
import { EventImporterFIT } from './src/events/adapters/importers/fit/importer.fit';
import * as fs from 'fs';

const filePath = '/Users/dimitrios/Projects/fit-parser/examples/downhill.fit';

async function run() {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        // const importer = new EventImporterFIT();
        const event = await EventImporterFIT.getFromArrayBuffer(fileBuffer);

        console.log('Event imported successfully.');

        // Iterate over activities and inspect stats
        const activities = event.getActivities();
        console.log(`Found ${activities.length} activities.`);

        activities.forEach((activity, index) => {
            console.log(`Activity ${index + 1}:`);
            console.log(`  Type: ${activity.type}`);
            // Inspect intensity zones stats
            const statsMap = activity.getStats();
            const statsArray = Array.from(statsMap.values());
            const powerZoneStats = statsArray.filter((stat: any) => stat.getType().toLowerCase().includes('power zone'));
            console.log(`  Power Zone Stats (${powerZoneStats.length}):`);
            powerZoneStats.forEach(stat => {
                console.log(`    ${stat.getType()}: ${stat.getValue()}`);
            });
        });

    } catch (e) {
        console.error(e);
    }
}

run();
