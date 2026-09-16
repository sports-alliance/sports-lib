import {
  DataFITTrainingFileReferences,
  DataFITWorkoutDefinitions,
  DataSuuntoPlusGuideReferences,
  readFITWorkoutReferences
} from '@sports-alliance/sports-lib';

const classes = [DataFITTrainingFileReferences, DataFITWorkoutDefinitions, DataSuuntoPlusGuideReferences];
const values = [
  { schemaVersion: 1, references: [{ type: 5, serialNumber: 4294967295 }] },
  { schemaVersion: 1, definitions: [{ name: 'Synthetic', sport: 2 }] },
  {
    schemaVersion: 1,
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
  return JSON.stringify(Class.fromJSON(json).toJSON()) === JSON.stringify(json);
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
