import fs from 'fs';

const file = '../fit-parser/examples/file-with-zones.fit';
const buffer = fs.readFileSync(file);

const expectedValue = 57.6579;

console.log(`Searching for ${expectedValue} in ${file}...`);

// Check float32 (Little Endian)
const f32le = Buffer.alloc(4);
f32le.writeFloatLE(expectedValue);
console.log('float32 (LE):', f32le.toString('hex'));
let idx = buffer.indexOf(f32le);
if (idx !== -1) console.log(`FOUND float32 (LE) at ${idx}`);

// Check float32 (Big Endian)
const f32be = Buffer.alloc(4);
f32be.writeFloatBE(expectedValue);
console.log('float32 (BE):', f32be.toString('hex'));
idx = buffer.indexOf(f32be);
if (idx !== -1) console.log(`FOUND float32 (BE) at ${idx}`);

// Check some scaled integers
for (const scale of [10, 100, 1000, 10000]) {
  const scaled = Math.round(expectedValue * scale);
  const u16le = Buffer.alloc(2);
  u16le.writeUInt16LE(scaled % 65536);
  console.log(`uint16 (scale ${scale}, LE):`, u16le.toString('hex'));
  idx = buffer.indexOf(u16le);
  if (idx !== -1) {
    // Check if it occurs multiple times
    let pos = idx;
    while (pos !== -1) {
      console.log(`  POSSIBLE uint16 (scale ${scale}) at ${pos}`);
      pos = buffer.indexOf(u16le, pos + 1);
    }
  }
}
