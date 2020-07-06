# Sports Lib

*A Library to for processing GPX, TCX, FIT and JSON files from services such as Strava, Movescount, Garmin, Polar etc*

Master

[![codebeat badge](https://codebeat.co/badges/e99f7c8a-3b7a-4d5b-9034-2dfd38c0e0a3)](https://codebeat.co/projects/github-com-jimmykane-sports-lib-develop)
[![Build Status](https://travis-ci.org/jimmykane/sports-lib.svg?branch=master)](https://travis-ci.org/jimmykane/sports-lib.svg?branch=master)
[![codecov](https://codecov.io/gh/jimmykane/sports-lib/branch/master/graph/badge.svg)](https://codecov.io/gh/jimmykane/sports-lib)

Develop

[![codebeat badge](https://codebeat.co/badges/f39e837c-2885-47bb-94b3-a8718ad561a6)](https://codebeat.co/projects/github-com-jimmykane-sports-lib-develop)
[![Build Status](https://travis-ci.org/jimmykane/sports-lib.svg?branch=develop)](https://travis-ci.org/jimmykane/sports-lib.svg?branch=develop)
[![codecov](https://codecov.io/gh/jimmykane/sports-lib/branch/develop/graph/badge.svg)](https://codecov.io/gh/jimmykane/sports-lib)

About
-----
Sports Lib tries to achieve a common domain model and lib for sport activity formats
such as GPX, TCX, FIT and other popular formats. 

Currently the support is limit to the main formats: GPX, TCX, FIT and JSON*

*JSON is for specific services while GPX, TCX, FIT should be compatible with the move common services,
such as Strava, Movescount, Garmin, Polar and any other service that supprots the above exports.

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

// For GPX you need a string 
const gpxString = 'Some string from a file etc';
SportsLib.importFromGPX(gpxString).then((event)=>{
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
