import {
  DataFITTrainingFileReferences,
  DataFITWorkoutDefinitions,
  DataSuuntoPlusGuideReferences,
  parseFITWahooWorkoutReferences,
  readFITWorkoutReferences
} from '@sports-alliance/sports-lib';

const classes = [DataFITTrainingFileReferences, DataFITWorkoutDefinitions, DataSuuntoPlusGuideReferences];
const values = [
  { references: [{ type: 5, serialNumber: 4294967295 }] },
  { definitions: [{ name: 'Synthetic', sport: 2 }] },
  {
    references: [
      {
        sessionIndex: 0,
        developerDataIndex: 1,
        applicationId: 'SuuntoplusFitExt',
        ownerId: 'test-client',
        externalId: 'test-guide'
      }
    ]
  }
];
globalThis.workoutReferenceSmoke = classes.map((Class, i) => {
  const json = JSON.parse(JSON.stringify(new Class(values[i])));
  return (
    JSON.stringify(json) === JSON.stringify({ [Class.type]: values[i] }) &&
    JSON.stringify(Class.fromJSON(json).toJSON()) === JSON.stringify(json)
  );
});
// Valid, empty FIT file with a 12-byte header. No Buffer or Node globals are supplied by the browser test.
const bytes = new Uint8Array([12, 32, 0, 0, 0, 0, 0, 0, 46, 70, 73, 84, 0, 0]);
let crc = 0;
for (const byte of bytes.subarray(0, -2)) {
  crc ^= byte;
  for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? (crc >>> 1) ^ 0xa001 : crc >>> 1;
}
new DataView(bytes.buffer).setUint16(12, crc, true);
globalThis.workoutReferenceSmoke.push(readFITWorkoutReferences(bytes).status === 'ok');

const reference = {
  format: 'wahoo-app-plan-v1',
  planId: '12345678',
  workoutId: null,
  startTimeUnixMs: Date.UTC(1989, 11, 31) + 1_100_000_000 * 1000
};
globalThis.workoutReferenceSmoke.push(
  JSON.stringify(parseFITWahooWorkoutReferences(JSON.parse(JSON.stringify([reference])))) ===
    JSON.stringify([reference])
);
// Synthetic native file_id and manufacturer message: no production bytes or identifiers.
const time = new Uint8Array(4);
new DataView(time.buffer).setUint32(0, 1_100_000_000, true);
const payload = [
  0x35,
  0,
  5,
  ...new TextEncoder().encode(reference.planId),
  0,
  0,
  14,
  0,
  255,
  255,
  255,
  255,
  0,
  123,
  0,
  0,
  0
];
const data = [
  0x40,
  0,
  0,
  0,
  0,
  2,
  0,
  1,
  0,
  1,
  2,
  0x84,
  0,
  4,
  32,
  0,
  0x40,
  0,
  0,
  5,
  255,
  4,
  0,
  4,
  0x86,
  1,
  1,
  2,
  2,
  1,
  2,
  3,
  payload.length,
  13,
  0,
  ...time,
  255,
  payload.length,
  ...payload
];
const wahooFile = new Uint8Array(12 + data.length + 2);
wahooFile.set([12, 32, 0, 0]);
new DataView(wahooFile.buffer).setUint32(4, data.length, true);
wahooFile.set([46, 70, 73, 84], 8);
wahooFile.set(data, 12);
let wahooCrc = 0;
for (const byte of wahooFile.subarray(0, -2)) {
  wahooCrc ^= byte;
  for (let bit = 0; bit < 8; bit++) wahooCrc = wahooCrc & 1 ? (wahooCrc >>> 1) ^ 0xa001 : wahooCrc >>> 1;
}
new DataView(wahooFile.buffer).setUint16(wahooFile.length - 2, wahooCrc, true);
const wahooResult = readFITWorkoutReferences(wahooFile);
globalThis.workoutReferenceSmoke.push(
  wahooResult.status === 'ok' && JSON.stringify(wahooResult.wahooWorkouts) === JSON.stringify([reference])
);
wahooFile[wahooFile.length - 1] ^= 1;
globalThis.workoutReferenceSmoke.push(readFITWorkoutReferences(wahooFile).wahooWorkouts.length === 0);
