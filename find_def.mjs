import fs from 'fs';

const file = '../fit-parser/examples/file-with-zones.fit';
const buffer = fs.readFileSync(file);

// Improved search: look for GID 18 in any definition
for (let i = 14; i < buffer.length - 10; i++) {
  if ((buffer[i] & 0x40) === 0x40) {
    // Definition
    const gid = buffer.readUInt16LE(i + 3);
    if (gid === 18) {
      console.log(`\n--- FOUND SESSION DEF at ${i} ---`);
      const numFields = buffer[i + 5];
      console.log(`Fields (${numFields}):`);
      for (let j = 0; j < numFields; j++) {
        const fid = buffer[i + 6 + j * 3];
        const size = buffer[i + 6 + j * 3 + 1];
        const type = buffer[i + 6 + j * 3 + 2];
        console.log(
          `  ID: ${fid.toString().padEnd(3)} Size: ${size.toString().padEnd(2)} Type: 0x${type.toString(16)}`
        );
      }
    }
  }
}
