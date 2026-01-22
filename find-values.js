const fs = require('fs');
const FitParser = require('fit-file-parser').default;

const file = 'samples/fit/jumps-mtb.fit';
const content = fs.readFileSync(file);

const parser = new FitParser({
    force: true,
});

function searchNumber(obj, targetValue, path = '', tolerance = 0.001) {
    if (!obj) return;
    if (typeof obj === 'number') {
        if (Math.abs(obj - targetValue) < tolerance) {
            console.log(`FOUND VALUE ${targetValue} at ${path}:`, obj);
        }
    } else if (typeof obj === 'object') {
        for (const key in obj) {
            searchNumber(obj[key], targetValue, path + '.' + key);
        }
    }
}

parser.parse(content, (error, data) => {
    if (error) {
        console.error(error);
    } else {
        // Search for the first value in the HR zone array: 346.004
        console.log('Searching for 346.004 ...');
        searchNumber(data, 346.004, 'data');
        console.log('Search complete.');
    }
});
