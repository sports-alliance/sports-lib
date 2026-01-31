import fs from 'fs';

const file = '../fit-parser/examples/file-with-zones.fit';
const buffer = fs.readFileSync(file);

function findDefinitions(globalId) {
    console.log(`Searching for Definition Messages for Global ID ${globalId}...`);
    let pos = 14; // Skip header
    const localDefs = {};

    while (pos < buffer.length - 2) {
        const header = buffer[pos++];
        if ((header & 0x40) === 0x40) { // Definition Message
            const localId = header & 0x0F;
            pos++; // Reserved
            const architecture = buffer[pos++];
            const gid = architecture === 0 ? buffer.readUInt16LE(pos) : buffer.readUInt16BE(pos);
            pos += 2;
            const numFields = buffer[pos++];

            if (gid === globalId) {
                console.log(`FOUND Definition for Global ID ${globalId} (Local ID ${localId}) at ${pos - 5}`);
                console.log(`Number of fields: ${numFields}`);
                const fields = [];
                for (let i = 0; i < numFields; i++) {
                    fields.push({
                        id: buffer[pos++],
                        size: buffer[pos++],
                        type: buffer[pos++]
                    });
                }
                console.log('Fields:', fields);
                localDefs[localId] = fields;
            } else {
                pos += numFields * 3;
            }

            // Developer fields
            if ((header & 0x20) === 0x20) {
                const numDevFields = buffer[pos++];
                pos += numDevFields * 3;
            }
        } else { // Data Message
            const localId = header & 0x0F;
            const fields = localDefs[localId];
            if (!fields) {
                // Unknown local ID, we might be out of sync
                // console.log(`Data Message with unknown Local ID ${localId} at ${pos-1}`);
                // In a real parser we'd need to know the sizes. 
                // Since we don't, we can't easily skip Data Messages without full parsing.
                // But we can search for the NEXT Definition Message header.
            } else {
                let size = 0;
                fields.forEach(f => size += f.size);
                if (gidForLocal(localId, localDefs) === globalId) {
                    // console.log(`Data Message for Global ID ${globalId} at ${pos-1}, size ${size}`);
                }
                pos += size;
            }
        }
    }
}

function gidForLocal(localId, defs) {
    // This script won't work well without full sync, so let's just search for the definition header.
}

// Improved search: look for GID 18 in any definition
for (let i = 14; i < buffer.length - 10; i++) {
    if ((buffer[i] & 0x40) === 0x40) { // Definition
        const gid = buffer.readUInt16LE(i + 3);
        if (gid === 18) {
            console.log(`\n--- FOUND SESSION DEF at ${i} ---`);
            const numFields = buffer[i + 5];
            console.log(`Fields (${numFields}):`);
            for (let j = 0; j < numFields; j++) {
                const fid = buffer[i + 6 + j * 3];
                const size = buffer[i + 6 + j * 3 + 1];
                const type = buffer[i + 6 + j * 3 + 2];
                console.log(`  ID: ${fid.toString().padEnd(3)} Size: ${size.toString().padEnd(2)} Type: 0x${type.toString(16)}`);
            }
        }
    }
}
