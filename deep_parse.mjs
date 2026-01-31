import fs from 'fs';

const file = '../fit-parser/examples/file-with-zones.fit';
const buffer = fs.readFileSync(file);

const seenGids = new Set();

function parse() {
    let pos = 14;
    const defs = {};

    while (pos < buffer.length - 2) {
        const header = buffer[pos++];

        if ((header & 0x40) === 0x40) { // Definition
            const localId = header & 0x0F;
            pos++; // reserved
            const arch = buffer[pos++];
            const gid = arch === 0 ? buffer.readUInt16LE(pos) : buffer.readUInt16BE(pos);
            pos += 2;
            const numFields = buffer[pos++];
            const fields = [];
            for (let i = 0; i < numFields; i++) {
                fields.push({ id: buffer[pos++], size: buffer[pos++], type: buffer[pos++] });
            }
            if ((header & 0x20) === 0x20) {
                const numDev = buffer[pos++];
                pos += numDev * 3;
            }
            defs[localId] = { gid, fields };

            if (!seenGids.has(gid)) {
                console.log(`FOUND GID: ${gid}`);
                seenGids.add(gid);
            }

        } else { // Data
            const localId = header & 0x0F;
            const def = defs[localId];
            if (!def) break;

            let totalSize = 0;
            def.fields.forEach(f => totalSize += f.size);

            if (def.gid === 140 || def.gid === 142) {
                console.log(`\n--- GID ${def.gid} Data at ${pos - 1} ---`);
                let fieldPos = pos;
                def.fields.forEach(f => {
                    const valBytes = buffer.slice(fieldPos, fieldPos + f.size);
                    let displayVal = valBytes.toString('hex');
                    if (f.size === 1) displayVal += ` (${valBytes.readUInt8(0)})`;
                    else if (f.size === 2) displayVal += ` (${valBytes.readUInt16LE(0)})`;
                    else if (f.size === 4) displayVal += ` (${valBytes.readUInt32LE(0)} / ${valBytes.readFloatLE(0)})`;
                    console.log(`  ID: ${f.id.toString().padEnd(3)} Raw: ${displayVal}`);
                    fieldPos += f.size;
                });
            }
            pos += totalSize;

        }
    }
}

parse();
