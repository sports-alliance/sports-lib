const fs = require('fs');
const FitParser = require('fit-file-parser').default;

const file = 'samples/fit/jumps-mtb.fit';
const content = fs.readFileSync(file);

const parser = new FitParser({
    force: true,
});

parser.parse(content, (error, data) => {
    if (error) {
        console.error(error);
    } else {
        if (data.laps && data.laps.length > 0) {
            console.log('Lap Object Keys:', Object.keys(data.laps[0]));
            console.log('Lap Object:', JSON.stringify(data.laps[0], null, 2));
        } else {
            console.log('No Laps found.');
        }

        // Also check session again just in case
        if (data.sessions && data.sessions.length > 0) {
            console.log('Session time_in_hr_zone:', data.sessions[0].time_in_hr_zone);
        }
    }
});
