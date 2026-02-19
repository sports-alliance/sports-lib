import FitParser from '../fit-parser/src/binary.ts';
import fs from 'fs';

const content = fs.readFileSync('./samples/fit/road-with-power.fit');
const fitParser = new FitParser({
  force: true,
  speedUnit: 'km/h',
  lengthUnit: 'km',
  temperatureUnit: 'celsius',
  elapsedRecordField: true,
  mode: 'both'
});

fitParser.parse(content, (error, data) => {
  if (error) {
    console.error(error);
  } else {
    console.log('Device Infos:');
    console.log(JSON.stringify(data.device_infos, null, 2));
  }
});
