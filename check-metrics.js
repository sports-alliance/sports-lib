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
        // Dump ALL Events raw
        if (data.events) {
            console.log('Events count:', data.events.length);
            data.events.forEach((e, i) => {
                // Log only if value is interesting to avoid huge spam?
                // No, I need to see them.
                // Format as one line
                if (e.data === 57 || e.data === 19 || e.data === 1164) {
                    console.log(`MATCH INDEX ${i}:`, e);
                }
                // Also logging first 20 and around typical spots
            });
            console.log("Done checking events.");
        }
    }
});
