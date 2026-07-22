# Sports Lib

Sports Lib normalizes GPX, TCX, FIT, and service-specific JSON into shared activity and route models.

## Documentation

The hosted documentation contains the supported API and all consumer guidance:

- [API reference](https://sports-alliance.github.io/sports-lib/)
- [Import activities](https://sports-alliance.github.io/sports-lib/documents/Import_activities.html)
- [Work with routes](https://sports-alliance.github.io/sports-lib/documents/Work_with_routes.html)
- [Configure parsing](https://sports-alliance.github.io/sports-lib/documents/Configure_parsing.html)
- [Export and persist data](https://sports-alliance.github.io/sports-lib/documents/Export_and_persist_data.html)
- [Metrics and calculations](https://sports-alliance.github.io/sports-lib/documents/Metrics_and_calculations.html)

## Install

```sh
npm install @sports-alliance/sports-lib
```

For GPX parsing in Node.js, also install a DOM parser:

```sh
npm install @xmldom/xmldom
```

## Quick start

```ts
import { SportsLib } from '@sports-alliance/sports-lib';
import { DOMParser } from '@xmldom/xmldom';

const event = await SportsLib.importFromGPX(gpxText, DOMParser);
const activity = event.getFirstActivity();
const distanceMetres = activity.getDistance().getValue();
```

See [Import activities](https://sports-alliance.github.io/sports-lib/documents/Import_activities.html) for the other supported formats and parsing options.
