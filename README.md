# Sports Lib

*A Library for processing GPX, TCX, FIT and JSON files from services such as Strava, Movescount, Garmin, Polar etc*

About
-----
Sports Lib tries to achieve a common domain model and lib for sport activity formats
such as GPX, TCX, FIT and other popular formats. 

Currently the support is limited to the main formats: GPX, TCX, FIT and JSON*

*JSON is for specific services while GPX, TCX, FIT should be compatible with the most common services,
such as Strava, Movescount, Garmin, Polar and any other service that supports the above formats.

Release Notes
-------
- Breaking change (next major): `Effort Pace` now uses pace semantics (`min/km`) instead of speed semantics (`m/s`).
  `Effort Pace` also has `Average/Minimum/Maximum` stat types and pace unit variants following `paceUnits`.

Install
-------

- Install via npm 

  `npm install @sports-alliance/sports-lib --save`
  
Examples
=======


GPX
---
```typescript
import {SportsLib} from '@sports-alliance/sports-lib';
import {DOMParser} from 'xmldom'

// For GPX you need a string 
const gpxString = 'Some string from a file etc';
SportsLib.importFromGPX(gpxString, DOMParser).then((event)=>{
  // do Stuff with the file
  const distance = event.getDistance();
  const duration = event.getDuration();
});
```

TCX
---
```typescript
import {SportsLib} from '@sports-alliance/sports-lib';

// For TCX you need a string 
const tcxString = 'Some string from a file etc';
SportsLib.importFromTCX((new DOMParser()).parseFromString(tcxString, 'application/xml')).then((event)=>{
  // do Stuff with the file
  const distance = event.getDistance();
  const duration = event.getDuration();
});
```


FIT
---
```typescript
import {SportsLib} from '@sports-alliance/sports-lib';

// For FIT you need an ArrayBuffer (binary) 
SportsLib.importFromFit(arrayBuffer).then((event)=>{
  // do Stuff with the file
  const distance = event.getDistance();
  const duration = event.getDuration();
});
```

FIT device_info mode
---
Some FIT files emit `device_info` rows every second for the same device identity, which can significantly increase payload size.

`ActivityParsingOptions` exposes `deviceInfoMode`:
- `raw` (default): keep all `device_info` rows (backwards-compatible behavior).
- `changes`: collapse contiguous timestamp-only repeats and keep first + last item for each contiguous identical run.

```typescript
import { SportsLib, ActivityParsingOptions } from '@sports-alliance/sports-lib';

const options = new ActivityParsingOptions({
  deviceInfoMode: 'changes'
});

SportsLib.importFromFit(arrayBuffer, options).then(event => {
  // event.getFirstActivity().creator.devices is compacted by state changes
});
```

`summary` mode is intentionally not exposed in this version.

Export
---
```typescript
// Get an event as seen above
const gpxString = await new EventExporterGPX().getAsString(event);
// Send the blob
const blob = new Blob(
  [jsonString],
  {type: new EventExporterGPX().fileType},
);
```


Example converting a FIT file to GPX
---
Thanks to [@guikeller](https://github.com/guikeller)
```typescript 
import fs from 'fs';
import sportsLibPkg from '@sports-alliance/sports-lib';
import exporterPkg from '@sports-alliance/sports-lib/lib/events/adapters/exporters/exporter.gpx.js'

const { SportsLib } = sportsLibPkg;
const { EventExporterGPX } = exporterPkg;

// Input and output file path
const inputFilePath = '/tmp/test.fit';
const outputGpxFilePath = '/tmp/test.gpx';

// reads the FIT file into memory
const inputFile = fs.readFileSync(inputFilePath, null);
if (!inputFile || !inputFile.buffer) {
    console.error('Ooops, could not read the inputFile or it does not exists, see details below');
    console.error(JSON.stringify(inputFilePath));
    return;
}
const inputFileBuffer = inputFile.buffer;
// uses lib to read the FIT file
SportsLib.importFromFit(inputFileBuffer).then((event) => {
    // convert to gpx
    const gpxPromise = new EventExporterGPX().getAsString(event);
    gpxPromise.then((gpxString) => {
        // writes the gpx to file
        fs.writeFileSync(outputGpxFilePath, gpxString, (wError) => {
            if (wError) {
                console.error('Ooops, something went wrong while saving the GPX file, see details below.');
                console.error(JSON.stringify(wError));
            }
        });
        // all done, celebrate!
        console.log('Converted FIT file to GPX successfully!');
        console.log('GPX file saved here: ' + outputGpxFilePath);
    }).catch((cError) => {
        console.error('Ooops, something went wrong while converting the FIT file, see details below');
        console.error(JSON.stringify(cError));
    });
});
```
