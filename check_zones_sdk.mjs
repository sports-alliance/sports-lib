import fs from 'fs';
import { Decoder, Stream } from '@garmin/fitsdk';

const filePath = '../fit-parser/examples/file-with-zones.fit';

try {
    const fileBuffer = fs.readFileSync(filePath);
    const stream = Stream.fromBuffer(fileBuffer);
    const decoder = new Decoder(stream);
    const { messages } = decoder.read();

    if (messages.eventMesgs && messages.eventMesgs.length > 0) {
        console.log('\n--- EVENT MESSAGES (FULL - Checking for keys) ---');
        messages.eventMesgs.forEach((msg, i) => {
            console.log(`Event ${i}:`, JSON.stringify(msg));
        });
    }

    // Also check for developer fields in ANY message
    console.log('\n--- Checking for Developer Fields ---');
    Object.keys(messages).forEach(group => {
        if (Array.isArray(messages[group])) {
            messages[group].forEach((msg, i) => {
                const devFields = Object.keys(msg).filter(k => k.startsWith('developer') || k.includes('dev') || k === 'unknown');
                if (devFields.length > 0) {
                    console.log(`Developer/Unknown fields in ${group}[${i}]:`, devFields, msg);
                }
            });
        }
    });

} catch (err) {
    console.error(err);
}
