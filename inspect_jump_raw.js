const fs = require('fs');
const FitParser = require('fit-file-parser').default;

const content = fs.readFileSync('./samples/fit/jumps-mtb.fit');
const fitParser = new FitParser({ force: true, mode: 'both' });

fitParser.parse(content, (error, data) => {
    if (error) {
        console.error(error);
        return;
    }
    console.log('=== ROOT KEYS ===');
    console.log(Object.keys(data).join('\n'));
    
    if (data.jumps) {
        console.log('\n=== FIRST JUMP ===');
        console.log(data.jumps[0]);
    }

    if (data.user_profiles) {
        console.log('\n=== USER PROFILES ===');
        console.log(data.user_profiles);
    }
});
