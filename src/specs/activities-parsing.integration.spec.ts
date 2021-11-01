import * as fs from 'fs';
import { SportsLib } from '../index';
import { EventInterface } from '../events/event.interface';
import { DataHeartRate } from '../data/data.heart-rate';
import { DataLongitudeDegrees } from '../data/data.longitude-degrees';
import { DataLatitudeDegrees } from '../data/data.latitude-degrees';
import { DataDistance } from '../data/data.distance';
import { DataSpeed } from '../data/data.speed';
import { DataCadence } from '../data/data.cadence';
import { DataPower } from '../data/data.power';
import { DataAltitude } from '../data/data.altitude';
import { ActivityTypes } from '../activities/activity.types';
import { DataAscent } from '../data/data.ascent';
import { SpecUtils } from './spec-utils';
import { DataTimerTime } from '../data/data.timer-time';
import { DataPause } from '../data/data.pause';
import { DataEnergy } from '../data/data.energy';
import { DataNumber } from '../data/data.number';
import { DataHeartRateAvg } from '../data/data.heart-rate-avg';
import { DataCadenceMax } from '../data/data.cadence-max';
import { DataPowerAvg } from '../data/data.power-avg';
import { DataCadenceAvg } from '../data/data.cadence-avg';
import { DataSpeedAvg } from '../data/data.speed-avg';
import { DataPowerMax } from '../data/data.power-max';
import { DataDescent } from '../data/data.descent';
import { DataHeartRateMax } from '../data/data.heart-rate-max';
import { DataPoolLength } from '../data/data.pool-length';
import { DataTotalCycles } from '../data/data-total-cycles';
import { DataActiveLengths } from '../data/data-active-lengths';
import { DataPaceAvg } from '../data/data.pace-avg';
import { DataTemperatureAvg } from '../data/data.temperature-avg';
import { DataMovingTime } from '../data/data.moving-time';
import xmldom from '@xmldom/xmldom';
import { DataGradeAdjustedPaceAvg } from '../data/data.grade-adjusted-pace-avg';
import { DataActiveLap } from '../data/data-active-lap';
import { DataSWOLF25m } from '../data/data.swolf-25m';
import { DataSWOLF50m } from '../data/data.swolf-50m';
import { DataLeftBalance } from '../data/data.left-balance';
import { DataRightBalance } from '../data/data.right-balance';
import { DataPowerTorqueEffectivenessLeft } from '../data/data.power-torque-effectiveness-left';
import { DataPowerTorqueEffectivenessRight } from '../data/data.power-torque-effectiveness-right';
import { DataPowerPedalSmoothnessRight } from '../data/data.power-pedal-smoothness-right';
import { DataPowerPedalSmoothnessLeft } from '../data/data.power-pedal-smoothness-left';
import { DataPowerNormalized } from '../data/data.power-normalized';
import { DataPowerIntensityFactor } from '../data/data.power-intensity-factor';
import { DataPowerTrainingStressScore } from '../data/data.power-training-stress-score';
import { DataPowerWork } from '../data/data.power-work';
import { DataCyclingStandingTime } from '../data/data.cycling-standing-time';
import { DataCyclingSeatedTime } from '../data/data.cycling-seated-time';
import { DataVerticalOscillation } from '../data/data.vertical-oscillation';
import { DataVerticalRatio } from '../data/data.vertical-ratio';
import { DataStanceTime } from '../data/data.stance-time';
import { DataStanceTimeBalanceRight } from '../data/data-stance-time-balance-right';
import { DataStanceTimeBalanceLeft } from '../data/data-stance-time-balance-left';
import { DataAvgStrideLength } from '../data/data.avg-stride-length';
import { DataAerobicTrainingEffect } from '../data/data-aerobic-training-effect';
import { DataAnaerobicTrainingEffect } from '../data/data-anaerobic-training-effect';

describe('FIT/TCX/GPX activity parsing compliance', () => {
  const domParser = new xmldom.DOMParser();

  /*  it('Template: should parse FIT activity file', done => {
    // Given FIT Source: https://connect.garmin.com/modern/activity/xxxxxxxx OR https://www.strava.com/activities/xxxxxxx (should be "public")
    const path = '/path/to/your/file.fit';
    const buffer = fs.readFileSync(path);

    // When
    const eventInterfacePromise = SportsLib.importFromFit(buffer);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      const activity = event.getFirstActivity();
      done();
    });
  });*/

  /*  it('Template: should parse TCX activity file', done => {
    // Given TCX Source: https://connect.garmin.com/modern/activity/xxxxxxxx OR https://www.strava.com/activities/xxxxxxx (should be "public")
    const path = '/path/to/your/file.tcx';
    const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

    // When
    const eventInterfacePromise = SportsLib.importFromTCX(doc);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      const activity = event.getFirstActivity();
      done();
    });
  });*/

  /*  it('Template: should parse GPX activity file', done => {
    // Given GPX Source: https://connect.garmin.com/modern/activity/xxxxxxxx OR https://www.strava.com/activities/xxxxxxx (should be "public")
    const path = '/path/to/your/file.gpx';
    const gpxString = fs.readFileSync(path).toString();

    // When
    const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      const activity = event.getFirstActivity();
      done();
    });
  });*/

  describe('Swimming', () => {
    describe('FIT', () => {
      it('should parse swimming pool FIT file (1)', done => {
        // Given FIT Source:  https://connect.garmin.com/modern/activity/6688025408 OR https://www.strava.com/activities/4232464474
        const path = __dirname + '/fixtures/swim/fit/6688025408.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Garmin Forerunner 935');
          expect(activity.creator.productId).toEqual(2691);
          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          expect(activity.type).toEqual(ActivityTypes.Swimming);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(2300);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(458);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(20);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(23);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(126);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(146);
          expect((activity.getStat(DataPoolLength.type) as DataNumber).getValue()).toEqual(50);
          expect((activity.getStat(DataActiveLengths.type) as DataNumber).getValue()).toEqual(46);
          expect((activity.getStat(DataSWOLF25m.type) as DataSWOLF25m).getValue()).toEqual(36.7);
          expect((activity.getStat(DataSWOLF50m.type) as DataSWOLF50m).getValue()).toEqual(73.4);
          expect((activity.getStat(DataTotalCycles.type) as DataNumber).getValue()).toEqual(806);

          const laps = activity.getLaps();
          expect(laps.length).toEqual(36);
          expect((laps[0].getStat(DataActiveLap.type) as DataActiveLap).getValue()).toBeTruthy();
          expect((laps[1].getStat(DataActiveLap.type) as DataActiveLap).getValue()).toBeFalsy();
          expect(laps[1].lapId).toEqual(2);

          expect(activity.hasStreamData(DataSpeed.type)).toBeTruthy();
          expect(activity.hasStreamData(DataHeartRate.type)).toBeTruthy();
          expect(activity.hasStreamData(DataCadence.type)).toBeTruthy();
          expect(activity.hasStreamData(DataDistance.type)).toBeTruthy();

          SpecUtils.assertNearEqualTime(
            <number>SpecUtils.speedToSwimPace((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()),
            '01:50'
          );

          SpecUtils.assertNearEqualTime(movingTime, '44:06');
          SpecUtils.assertNearEqualTime(timerTime, '01:06:03');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:06:23');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse swimming pool FIT file (2)', done => {
        // Given FIT Source:  https://connect.garmin.com/modern/activity/6021532030 OR https://www.strava.com/activities/5258304128
        const path = __dirname + '/fixtures/swim/fit/6021532030.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Swimming);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(780);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(235);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(26);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(28);
          expect((activity.getStat(DataPoolLength.type) as DataNumber).getValue()).toEqual(20);
          expect((activity.getStat(DataActiveLengths.type) as DataNumber).getValue()).toEqual(39);
          expect((activity.getStat(DataSWOLF25m.type) as DataSWOLF25m).getValue()).toEqual(63.9);
          expect((activity.getStat(DataSWOLF50m.type) as DataSWOLF50m).getValue()).toEqual(127.7);
          expect((activity.getStat(DataTotalCycles.type) as DataNumber).getValue()).toEqual(596);

          SpecUtils.assertNearEqualTime(
            <number>SpecUtils.speedToSwimPace((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()),
            '02:58'
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '23:09');
          SpecUtils.assertNearEqualTime(timerTime, '23:09');
          SpecUtils.assertNearEqualTime(elapsedTime, '23:31');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse swimming pool FIT file (3)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/6860712481 OR https://www.strava.com/activities/5376106733
        const path = __dirname + '/fixtures/swim/fit/6860712481.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Swimming);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(2000);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(401);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(28);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(131);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(157);
          expect((activity.getStat(DataPoolLength.type) as DataNumber).getValue()).toEqual(25);
          expect((activity.getStat(DataActiveLengths.type) as DataNumber).getValue()).toEqual(80);
          expect((activity.getStat(DataSWOLF25m.type) as DataSWOLF25m).getValue()).toEqual(46.1);
          expect((activity.getStat(DataSWOLF50m.type) as DataSWOLF50m).getValue()).toEqual(92.2);
          expect((activity.getStat(DataTotalCycles.type) as DataNumber).getValue()).toEqual(984);

          // TODO Check streams based on laps for swims performed in a pool

          SpecUtils.assertNearEqualTime(
            <number>SpecUtils.speedToSwimPace((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()),
            '02:06'
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '41:25');
          SpecUtils.assertNearEqualTime(timerTime, '47:27');
          SpecUtils.assertNearEqualTime(elapsedTime, '49:43');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse swimming pool FIT file (4)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/7617306288 OR https://www.strava.com/activities/6076695527
        const path = __dirname + '/fixtures/swim/fit/7617306288.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Swimming);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(150);

          SpecUtils.assertNearEqualTime(
            <number>SpecUtils.speedToSwimPace((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()),
            '01:54'
          );

          expect(activity.getLaps().length).toEqual(6);
          done();
        });
      });

      it('should parse swimming open water FIT file (1)', done => {
        // Given https://connect.garmin.com/modern/activity/6788312639/1 OR https://www.strava.com/activities/5305763421
        const path = __dirname + '/fixtures/swim/fit/6788312639-1.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.OpenWaterSwimming);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(1505.03);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(403);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(32);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(48);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(158);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(170);
          expect((activity.getStat(DataTotalCycles.type) as DataNumber).getValue()).toEqual(993);
          expect((activity.getStat(DataSWOLF25m.type) as DataSWOLF25m).getValue()).toEqual(47.5);
          expect((activity.getStat(DataSWOLF50m.type) as DataSWOLF50m).getValue()).toEqual(95);

          SpecUtils.assertNearEqualTime(
            <number>SpecUtils.speedToSwimPace((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()),
            '02:04'
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '24:28');
          SpecUtils.assertNearEqualTime(timerTime, '31:06');
          SpecUtils.assertNearEqualTime(elapsedTime, '31:06');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });
    });

    describe('TCX', () => {
      it('should parse swimming pool TCX file (1)', done => {
        // Given TCX Source: https://connect.garmin.com/modern/activity/6832570127 OR https://www.strava.com/activities/5347012220
        // Given FIT Source: https://connect.garmin.com/modern/activity/6688025408 OR https://www.strava.com/activities/4232464474
        const path = __dirname + '/fixtures/swim/tcx/6688025408.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          // expect(activity.type).toEqual(ActivityTypes.Swimming); // TODO To be auto-detected by sports-data-science library (work in progress)
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(2300);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(458);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(119);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(146);

          const laps = activity.getLaps();
          expect(laps.length).toEqual(36);
          expect((laps[0].getStat(DataActiveLap.type) as DataActiveLap).getValue()).toBeTruthy();
          expect((laps[1].getStat(DataActiveLap.type) as DataActiveLap).getValue()).toBeFalsy();
          expect(laps[1].lapId).toEqual(2);

          SpecUtils.assertNearEqualTime(
            <number>SpecUtils.speedToSwimPace((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()),
            '01:45'
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '44:06');
          SpecUtils.assertNearEqualTime(timerTime, '01:06:03');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:06:23');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime);

          done();
        });
      });

      it('should parse swimming pool TCX file (2)', done => {
        // Given TCX Source: https://connect.garmin.com/modern/activity/6861441616 or https://www.strava.com/activities/5378130384
        // Given FIT Source: https://connect.garmin.com/modern/activity/6860712481 OR https://www.strava.com/activities/5376106733
        const path = __dirname + '/fixtures/swim/tcx/6860712481.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          // expect(activity.type).toEqual(ActivityTypes.Swimming); // TODO To be auto-detected by sports-data-science library (work in progress)
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(2000);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(401);
          expect((activity.getStat(DataTotalCycles.type) as DataNumber).getValue()).toEqual(984);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(128);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(156);

          SpecUtils.assertNearEqualTime(
            <number>SpecUtils.speedToSwimPace((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()),
            '02:05'
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '41:25');
          SpecUtils.assertNearEqualTime(timerTime, '47:27');
          SpecUtils.assertNearEqualTime(elapsedTime, '47:27');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });
    });

    describe('GPX', () => {
      it('should parse swimming open water GPX file (1)', done => {
        // Given GPX Source: https://connect.garmin.com/modern/activity/6867388194 OR https://www.strava.com/activities/5382390985
        // Given FIT Source: https://connect.garmin.com/modern/activity/4623204522/1 OR https://www.strava.com/activities/5352030147
        const path = __dirname + '/fixtures/swim/gpx/4623204522-1.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          // Swim
          const swimActivity = event.getFirstActivity();
          // expect(swimActivity.type).toEqual(ActivityTypes.OpenWaterSwimming); // TODO To be auto-detected by sports-data-science library (work in progress)
          expect(swimActivity.getStreamData(DataSpeed.type).length).toEqual(3689);
          expect(swimActivity.startDate.toISOString()).toEqual('2018-10-13T17:05:01.000Z');
          expect(swimActivity.endDate.toISOString()).toEqual('2018-10-13T18:06:29.000Z');

          expect((swimActivity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(3869, 0);
          expect((swimActivity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(36);
          expect((swimActivity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(39);
          expect((swimActivity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(74);
          expect((swimActivity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(115);

          SpecUtils.assertNearEqualTime(
            <number>SpecUtils.speedToSwimPace((swimActivity.getStat(DataSpeedAvg.type) as DataNumber).getValue()),
            '01:31',
            2
          );

          // Verifying time data
          const movingTime = (<DataMovingTime>swimActivity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>swimActivity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>swimActivity.getStat(DataPause.type)).getValue();
          const elapsedTime = swimActivity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:00:35', 1);
          SpecUtils.assertNearEqualTime(timerTime, '01:01:29');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:01:29');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse swimming open water GPX file (2)', done => {
        // Given GPX Source: https://connect.garmin.com/modern/activity/6867446668 OR https://www.strava.com/activities/5382426315
        // Given FIT Source: https://connect.garmin.com/modern/activity/6090674952 OR https://www.strava.com/activities/5366783958
        const path = __dirname + '/fixtures/swim/gpx/6090674952.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const swimActivity = event.getFirstActivity();
          // expect(swimActivity.type).toEqual(ActivityTypes.OpenWaterSwimming);  // TODO To be auto-detected by sports-data-science library (work in progress)
          expect(swimActivity.startDate.toISOString()).toEqual('2021-01-04T16:22:18.000Z');
          expect(swimActivity.endDate.toISOString()).toEqual('2021-01-04T17:37:05.000Z');
          expect((swimActivity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(2537, 0);
          expect((swimActivity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(145);
          expect((swimActivity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(184);

          SpecUtils.assertNearEqualTime(
            <number>SpecUtils.speedToSwimPace((swimActivity.getStat(DataSpeedAvg.type) as DataNumber).getValue()),
            '02:29'
          );

          // Verifying time data
          const movingTime = (<DataMovingTime>swimActivity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>swimActivity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>swimActivity.getStat(DataPause.type)).getValue();
          const elapsedTime = swimActivity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '55:43', 1);
          SpecUtils.assertNearEqualTime(timerTime, '01:14:47');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:14:47');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });
    });
  });

  describe('Running', () => {
    describe('FIT', () => {
      it('should parse running FIT file (1)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/2067489619 OR https://www.strava.com/activities/1221143311
        const path = __dirname + '/fixtures/runs/fit/2067489619.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Garmin VivoActive HR');
          expect(activity.creator.manufacturer).toEqual('garmin');
          expect(activity.type).toEqual(ActivityTypes.Running);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(4489.39);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(58);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(88);
          expect((activity.getStat(DataTotalCycles.type) as DataNumber).getValue()).toEqual(2782);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(130);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(179);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '10:28', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '09:11',
            1
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '45:42');
          SpecUtils.assertNearEqualTime(timerTime, '47:00');
          SpecUtils.assertNearEqualTime(elapsedTime, '47:04');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse running FIT file (2)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/6782987395 OR https://www.strava.com/activities/2451375851
        const path = __dirname + '/fixtures/runs/fit/6782987395.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Running);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(14004.85);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(79);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(111);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(137);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(167);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '05:56', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '05:19',
            1
          );

          const laps = activity.getLaps();
          expect(laps.length).toEqual(2);
          expect((laps[0].getStat(DataActiveLap.type) as DataActiveLap).getValue()).toBeTruthy();
          expect((laps[1].getStat(DataActiveLap.type) as DataActiveLap).getValue()).toBeTruthy();

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:19:37');
          SpecUtils.assertNearEqualTime(timerTime, '01:23:09');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:23:09');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse running FIT file (Suunto export) (3)', done => {
        // Given FIT Source (Suunto export): https://connect.garmin.com/modern/activity/6909950168 OR https://www.strava.com/activities/5423646653
        const path = __dirname + '/fixtures/runs/fit/6909950168.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.TrailRunning);
          expect(activity.creator.name).toEqual('Suunto 9');
          expect(activity.creator.productId).toEqual(34);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(6458);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(487);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(90);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(94);
          expect((activity.getStat(DataPowerAvg.type) as DataNumber).getValue()).toEqual(227);
          expect((activity.getStat(DataPowerMax.type) as DataNumber).getValue()).toEqual(294);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(148);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(161);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '05:35', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '05:34',
            1
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '35:42');
          SpecUtils.assertNearEqualTime(timerTime, '36:01');
          SpecUtils.assertNearEqualTime(elapsedTime, '36:36');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse running FIT file (Suunto export) (4)', done => {
        // Given FIT Source (Suunto export): https://connect.garmin.com/modern/activity/6910052863 OR https://www.strava.com/activities/5423660493
        const path = __dirname + '/fixtures/runs/fit/6910052863.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.TrailRunning);
          expect(activity.creator.name).toEqual('Suunto 9');
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(8225);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toEqual(1817);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(2540);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(44);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(96);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(164);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(174);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '19:20', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '07:23',
            1
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '02:35:40');
          SpecUtils.assertNearEqualTime(timerTime, '02:39:03');
          SpecUtils.assertNearEqualTime(elapsedTime, '02:40:02');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse running FIT file (Suunto export) (5)', done => {
        // Given FIT Source (Suunto export): https://connect.garmin.com/modern/activity/6914448270 OR https://www.strava.com/activities/5427988571
        const path = __dirname + '/fixtures/runs/fit/6914448270.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Running);
          expect(activity.creator.name).toEqual('Suunto 9 Baroless');
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(49897);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toEqual(1063);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(4445);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(74);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(119);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '06:49', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '06:20',
            1
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue(); // TODO If moving time unknown or INVALID loop on all records in activity utils
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '05:28:14');
          SpecUtils.assertNearEqualTime(timerTime, '05:40:19');
          SpecUtils.assertNearEqualTime(elapsedTime, '05:40:19');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse running FIT file (Suunto export) (6)', done => {
        // Given FIT Source (Suunto export): https://connect.garmin.com/modern/activity/6914538454 OR https://www.strava.com/activities/5428064152
        const path = __dirname + '/fixtures/runs/fit/6914538454.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Running);
          expect(activity.creator.name).toEqual('Suunto 9 Baroless');
          expect(activity.creator.manufacturer).toEqual('suunto');
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(4330);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toEqual(0);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(354);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(87);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(109);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '04:52', 1);

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '18:51');
          SpecUtils.assertNearEqualTime(timerTime, '21:04');
          SpecUtils.assertNearEqualTime(elapsedTime, '21:04');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse running FIT file (Coros export) (7)', done => {
        // Given FIT Source (Coros export): https://connect.garmin.com/modern/activity/6916663933 OR https://www.strava.com/activities/5429996380
        const path = __dirname + '/fixtures/runs/fit/6916663933.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Running);
          expect(activity.creator.name).toEqual('Coros APEX Pro');
          expect(activity.creator.productId).toEqual(841);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(10743.64);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toEqual(142);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(685);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(92);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(106);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(160);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(173);
          expect((activity.getStat(DataPowerAvg.type) as DataNumber).getValue()).toEqual(332);
          expect((activity.getStat(DataPowerMax.type) as DataNumber).getValue()).toEqual(518);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '04:31', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '04:24',
            1
          );

          expect((activity.getStat(DataStanceTimeBalanceLeft.type) as DataNumber).getValue()).toEqual(49.14);
          expect((activity.getStat(DataStanceTimeBalanceRight.type) as DataNumber).getValue()).toEqual(50.86);
          expect((activity.getStat(DataStanceTime.type) as DataNumber).getValue()).toEqual(206);
          expect((activity.getStat(DataVerticalOscillation.type) as DataNumber).getValue()).toEqual(94);
          expect((activity.getStat(DataVerticalRatio.type) as DataNumber).getValue()).toEqual(7.9);
          expect((activity.getStat(DataAvgStrideLength.type) as DataNumber).getValue()).toEqual(1.2);

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '48:35');
          SpecUtils.assertNearEqualTime(timerTime, '48:42');
          SpecUtils.assertNearEqualTime(elapsedTime, '48:42');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse running FIT file (Coros export) (8)', done => {
        // Given FIT Source (Coros export): https://connect.garmin.com/modern/activity/6916728382 OR https://www.strava.com/activities/5430055225
        const path = __dirname + '/fixtures/runs/fit/6916728382.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Running);
          expect(activity.creator.name).toEqual('Coros APEX Pro');
          expect(activity.creator.manufacturer).toEqual('coros');
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(21524.3);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toEqual(539);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(1661);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(71);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(88);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(131);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(164);
          expect((activity.getStat(DataTemperatureAvg.type) as DataNumber).getValue()).toEqual(22);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '07:31', 1);

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '02:39:59');
          SpecUtils.assertNearEqualTime(timerTime, '02:41:39');
          SpecUtils.assertNearEqualTime(elapsedTime, '02:41:39');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse running treadmill FIT file (1)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/6860622783 or https://www.strava.com/activities/5375834427
        const path = __dirname + '/fixtures/runs/fit/6860622783.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Treadmill);

          expect(activity.hasPowerMeter()).toBeTruthy();
          expect(activity.isTrainer()).toBeTruthy();

          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(10630.37);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(82);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(128);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(145);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(177);

          expect((activity.getStat(DataStanceTimeBalanceLeft.type) as DataNumber).getValue()).toEqual(49.91);
          expect((activity.getStat(DataStanceTimeBalanceRight.type) as DataNumber).getValue()).toEqual(50.09);
          expect((activity.getStat(DataStanceTime.type) as DataNumber).getValue()).toEqual(271.3);
          expect((activity.getStat(DataVerticalOscillation.type) as DataNumber).getValue()).toEqual(97.2);
          expect((activity.getStat(DataVerticalRatio.type) as DataNumber).getValue()).toEqual(9.57);
          expect((activity.getStat(DataAvgStrideLength.type) as DataNumber).getValue()).toEqual(1.04);

          expect((activity.getStat(DataTotalCycles.type) as DataNumber).getValue()).toEqual(4242);
          expect((activity.getStat(DataAerobicTrainingEffect.type) as DataNumber).getValue()).toEqual(2.2);
          expect((activity.getStat(DataAnaerobicTrainingEffect.type) as DataNumber).getValue()).toEqual(1.8);
          expect((activity.getStat(DataPowerWork.type) as DataNumber).getValue()).toEqual(692);

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '04:51', 1);

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '48:43');
          SpecUtils.assertNearEqualTime(timerTime, '51:38');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:02:44');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });
    });

    describe('TCX', () => {
      it('should parse running TCX file (1)', done => {
        // Given Recorded with "Strava Android App" => https://connect.garmin.com/modern/activity/1604524853 OR https://www.strava.com/activities/708752345
        const path = __dirname + '/fixtures/runs/tcx/1604524853.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.run);

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '09:15', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '07:12',
            1
          );

          SpecUtils.assertEqual((event.getFirstActivity().getStat(DataAscent.type) as DataNumber).getValue(), 432);
          SpecUtils.assertEqual((event.getFirstActivity().getStat(DataDescent.type) as DataNumber).getValue(), 440);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(6106.6);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(69);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(99);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(158);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(191);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '58:59', 3);
          SpecUtils.assertNearEqualTime(timerTime, '01:07:47');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:07:47');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse running TCX file (2)', done => {
        // Given TCX Source: https://connect.garmin.com/modern/activity/6851149716 OR  https://www.strava.com/activities/5366592367
        // Given FIT Source: https://connect.garmin.com/modern/activity/6782987395 OR https://www.strava.com/activities/2451375851
        const path = __dirname + '/fixtures/runs/tcx/6782987395.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.run);
          expect(activity.creator.name).toEqual('Forerunner 945');

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '05:38');
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '05:19',
            1
          );

          SpecUtils.assertEqual((activity.getStat(DataAscent.type) as DataNumber).getValue(), 363);
          SpecUtils.assertEqual((activity.getStat(DataDescent.type) as DataNumber).getValue(), 386);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(14004.85);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(982);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(80);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(111);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(137);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(167);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:19:38');
          SpecUtils.assertNearEqualTime(timerTime, '01:23:09');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:23:09');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse running TCX file (3)', done => {
        // Given TCX Source: https://connect.garmin.com/modern/activity/6860622916 or https://www.strava.com/activities/5375754773
        const path = __dirname + '/fixtures/runs/tcx/6860622916.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.run);

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '04:27');
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '04:24'
          );

          SpecUtils.assertEqual((activity.getStat(DataAscent.type) as DataNumber).getValue(), 85);
          SpecUtils.assertEqual((activity.getStat(DataDescent.type) as DataNumber).getValue(), 74);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(13973.09);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(739);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(89);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(98);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(143);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(168);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:02:17');
          SpecUtils.assertNearEqualTime(timerTime, '01:02:17');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:02:17');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse running treadmill TCX file (3)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/6860622783 or https://www.strava.com/activities/5375834427
        const path = __dirname + '/fixtures/runs/tcx/6860622783.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.IndoorRunning);

          expect(activity.isTrainer()).toBeTruthy();

          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(10630.37);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(82);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(128);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(145);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(177);
          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '04:51', 1);

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '48:43');
          SpecUtils.assertNearEqualTime(timerTime, '51:38');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:02:44');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });
    });

    describe('GPX', () => {
      it('should parse running GPX file (1)', done => {
        // Given GPX Source: https://connect.garmin.com/modern/activity/6870534840 OR https://www.strava.com/activities/5385528846
        // Given FIT Source: https://connect.garmin.com/modern/activity/2067489619 OR https://www.strava.com/activities/1221143311
        const path = __dirname + '/fixtures/runs/gpx/2067489619.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          // Swim
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Running);

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '09:18', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '09:18',
            1
          );

          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(4400, 0);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(35, 0);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(67);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(88);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(134);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(178);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '44:48');
          SpecUtils.assertNearEqualTime(timerTime, '47:00');
          SpecUtils.assertNearEqualTime(elapsedTime, '47:04');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse running GPX file (2)', done => {
        // Given GPX Source: https://connect.garmin.com/modern/activity/6870566668 OR https://www.strava.com/activities/5385561485
        // Given FIT Source: https://connect.garmin.com/modern/activity/6782987395 OR https://www.strava.com/activities/2451375851
        const path = __dirname + '/fixtures/runs/gpx/6782987395.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Running);

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '05:53', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '05:18',
            1
          );

          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(14170, 0);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(363, 0);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(82);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(111);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(137);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(167);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:17:11');
          SpecUtils.assertNearEqualTime(timerTime, '01:23:09');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:23:09');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse running GPX file (3)', done => {
        // Given Recorded with "Strava Android App" => https://connect.garmin.com/modern/activity/1681613317 OR https://www.strava.com/activities/906581465
        const path = __dirname + '/fixtures/runs/gpx/1681613317.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.run);
          expect(activity.hasPowerMeter()).toBeFalsy();
          expect(activity.isTrainer()).toBeFalsy();

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '06:27', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '06:23',
            1
          );

          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(4593, 0);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(39, 0);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(79);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(96);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(146);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(176);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '32:09');
          SpecUtils.assertNearEqualTime(timerTime, '32:38');
          SpecUtils.assertNearEqualTime(elapsedTime, '32:38');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse running GPX file (4)', done => {
        // Given Recorded with "MyTracks" => https://connect.garmin.com/modern/activity/6909258631 OR https://www.strava.com/activities/5422847134
        const path = __dirname + '/fixtures/runs/gpx/6909258631.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          // expect(activity.type).toEqual(ActivityTypes.run); // TODO To be auto-detected by sports-data-science library (work in progress)
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(40878.5, 1);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(2780, 0);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(2780, 0);
          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '07:22', 1);

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '04:51:49');
          SpecUtils.assertNearEqualTime(timerTime, '06:30:22');
          SpecUtils.assertNearEqualTime(elapsedTime, '06:30:22');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse running GPX file (5)', done => {
        // Given https://connect.garmin.com/modern/activity/6048438275 OR https://www.strava.com/activities/3497177564
        const path = __dirname + '/fixtures/runs/gpx/6048438275.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.run);
          expect(activity.hasPowerMeter()).toBeFalsy();
          expect(activity.isTrainer()).toBeFalsy();

          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(16772, 0);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(579, 0);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(86);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(123);

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '04:48', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '04:17',
            1
          );

          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          expect(activity.getSquashedStreamData('Distance').length).toEqual(
            activity.getSquashedStreamData('Speed').length
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:04:19');
          SpecUtils.assertNearEqualTime(timerTime, '01:22:50');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:22:50');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse running GPX file (6)', done => {
        // Given https://www.strava.com/activities/3632493456 or https://connect.garmin.com/modern/activity/6037744996
        const path = __dirname + '/fixtures/runs/gpx/6037744996.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.run);
          expect(activity.hasPowerMeter()).toBeFalsy();
          expect(activity.isTrainer()).toBeFalsy();

          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(5113, 0);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(516, 0);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(68);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(124);
          expect((activity.getStat(DataPaceAvg.type) as DataNumber).getValue()).toBeGreaterThanOrEqual(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue()
          );

          SpecUtils.assertNearEqualTime((activity.getStat(DataPaceAvg.type) as DataNumber).getValue(), '13:10', 1);
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataGradeAdjustedPaceAvg.type) as DataNumber).getValue(),
            '08:58',
            1
          );

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '28:35');
          SpecUtils.assertNearEqualTime(timerTime, '01:07:19');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:07:19');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });
    });
  });

  describe('Cycling', () => {
    describe('FIT', () => {
      it('should parse cycling FIT file (1)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/3939576645 OR https://www.strava.com/activities/2610176355
        const path = __dirname + '/fixtures/rides/fit/3939576645.fit';
        const buffer = fs.readFileSync(path);
        const expectedSamplesLength = 2547;

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          // Verify streams consistency
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Garmin Edge 1000');
          expect(activity.generateTimeStream([DataDistance.type]).getData(true).length).toEqual(expectedSamplesLength);
          expect(activity.hasPowerMeter()).toBeFalsy();
          expect(activity.isTrainer()).toBeFalsy();
          expect(activity.getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);

          const missingStreamCall = () => {
            activity.getSquashedStreamData(DataPower.type);
          };
          expect(missingStreamCall).toThrow();

          // Verify global activity stats
          expect(activity.type).toEqual(ActivityTypes.Cycling);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(42220.87);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toEqual(668);
          expect((activity.getStat(DataDescent.type) as DataNumber).getValue()).toEqual(664);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(1497);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(68);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(109);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(155);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(186);
          expect((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toEqual(5.812); // Or 20.9 kph
          expect((activity.getStat(DataTotalCycles.type) as DataNumber).getValue()).toEqual(6550);

          // Verifying time data
          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '02:00:42', 1);
          SpecUtils.assertNearEqualTime(timerTime, '02:01:04');
          SpecUtils.assertNearEqualTime(elapsedTime, '02:04:36');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse cycling FIT file (2)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/828989227 OR https://www.strava.com/activities/343080886
        const path = __dirname + '/fixtures/rides/fit/828989227.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();

          expect(activity.type).toEqual(ActivityTypes.Cycling);
          expect(activity.creator.name).toEqual('Garmin Edge 810');
          expect(activity.hasPowerMeter()).toBeFalsy();
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(141944.2);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toEqual(2052);
          expect((activity.getStat(DataDescent.type) as DataNumber).getValue()).toEqual(2028);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(2629);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(79);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(118);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(148);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(174);
          expect((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toEqual(7.219); // Or 26 kph

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '05:26:49');
          SpecUtils.assertNearEqualTime(timerTime, '05:27:44');
          SpecUtils.assertNearEqualTime(elapsedTime, '06:07:08');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse cycling FIT file (3)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/614953343 OR https://www.strava.com/activities/208748758
        const path = __dirname + '/fixtures/rides/fit/614953343.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Garmin Edge 800');
          expect(activity.hasPowerMeter()).toBeFalsy();
          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '05:52:28', 1);
          SpecUtils.assertNearEqualTime(timerTime, '05:54:34');
          SpecUtils.assertNearEqualTime(elapsedTime, '07:04:31');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse cycling FIT file (4)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/6783622686 OR https://www.strava.com/activities/5300988022
        const path = __dirname + '/fixtures/rides/fit/6783622686.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Garmin Edge 1030');
          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '05:07:53');
          SpecUtils.assertNearEqualTime(timerTime, '05:08:22');
          SpecUtils.assertNearEqualTime(elapsedTime, '07:26:55');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse cycling FIT file (5)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/7386755164 OR https://www.strava.com/activities/5952147686
        const path = __dirname + '/fixtures/rides/fit/7386755164.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Garmin Edge 1030');

          // Power extended stats
          expect((activity.getStat(DataLeftBalance.type) as DataNumber).getValue()).toEqual(51.45);
          expect((activity.getStat(DataRightBalance.type) as DataNumber).getValue()).toEqual(48.55);
          expect((activity.getStat(DataPowerTorqueEffectivenessLeft.type) as DataNumber).getValue()).toEqual(80);
          expect((activity.getStat(DataPowerTorqueEffectivenessRight.type) as DataNumber).getValue()).toEqual(76.5);
          expect((activity.getStat(DataPowerPedalSmoothnessLeft.type) as DataNumber).getValue()).toEqual(22);
          expect((activity.getStat(DataPowerPedalSmoothnessRight.type) as DataNumber).getValue()).toEqual(20.5);
          expect((activity.getStat(DataPowerNormalized.type) as DataNumber).getValue()).toEqual(179);
          expect((activity.getStat(DataPowerIntensityFactor.type) as DataNumber).getValue()).toEqual(0.786);
          expect((activity.getStat(DataPowerTrainingStressScore.type) as DataNumber).getValue()).toEqual(105.4);
          expect((activity.getStat(DataPowerWork.type) as DataNumber).getValue()).toEqual(832);

          // Cycling dynamics: Power "position" stats
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataCyclingStandingTime.type) as DataNumber).getValue(),
            '17:53',
            0
          );
          SpecUtils.assertNearEqualTime(
            (activity.getStat(DataCyclingSeatedTime.type) as DataNumber).getValue(),
            '01:25:02',
            0
          );
          done();
        });
      });

      it('should parse cycling FIT file (6)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/7445393868 OR https://www.strava.com/activities/5921768617
        const path = __dirname + '/fixtures/rides/fit/7445393868.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Garmin Edge 1000');
          expect(activity.hasPowerMeter()).toBeTruthy();
          expect((activity.getStat(DataLeftBalance.type) as DataNumber).getValue()).toEqual(45.91);
          expect((activity.getStat(DataRightBalance.type) as DataNumber).getValue()).toEqual(54.09);
          expect((activity.getStat(DataPowerTorqueEffectivenessLeft.type) as DataNumber).getValue()).toEqual(71);
          expect((activity.getStat(DataPowerTorqueEffectivenessRight.type) as DataNumber).getValue()).toEqual(73);
          expect((activity.getStat(DataPowerPedalSmoothnessLeft.type) as DataNumber).getValue()).toEqual(20);
          expect((activity.getStat(DataPowerPedalSmoothnessRight.type) as DataNumber).getValue()).toEqual(21.5);
          expect((activity.getStat(DataPowerNormalized.type) as DataNumber).getValue()).toEqual(147);
          expect((activity.getStat(DataPowerIntensityFactor.type) as DataNumber).getValue()).toEqual(0.733);
          expect((activity.getStat(DataPowerTrainingStressScore.type) as DataNumber).getValue()).toEqual(48.3);
          expect((activity.getStat(DataPowerWork.type) as DataNumber).getValue()).toEqual(417);

          done();
        });
      });

      it('should parse cycling FIT file (7)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/7432332116 OR https://www.strava.com/activities/5910143591
        const path = __dirname + '/fixtures/rides/fit/7432332116.fit';
        const buffer = fs.readFileSync(path);
        const expectedSamplesLength = 10063;

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Garmin Edge 1000');
          expect(activity.hasPowerMeter()).toBeTruthy();

          expect((activity.getStat(DataPowerAvg.type) as DataNumber).getValue()).toEqual(152);
          expect((activity.getStat(DataPowerNormalized.type) as DataNumber).getValue()).toEqual(172);
          expect((activity.getStat(DataPowerMax.type) as DataNumber).getValue()).toEqual(564);

          expect(activity.getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataPower.type).length).toEqual(expectedSamplesLength);

          done();
        });
      });

      it('should parse cycling FIT file (8)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/7739869618 OR https://www.strava.com/activities/2380240532
        const path = __dirname + '/fixtures/rides/fit/7739869618.fit';
        const buffer = fs.readFileSync(path);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Wahoo ELEMNT BOLT');
          expect(activity.creator.manufacturer).toEqual('wahoo_fitness');
          expect(activity.creator.isRecognized).toBeTruthy();
          done();
        });
      });

      it('should parse virtual cycling FIT file (1)', done => {
        // Given FIT Source: https://connect.garmin.com/modern/activity/971150603 OR https://www.strava.com/activities/442080924
        const path = __dirname + '/fixtures/rides/fit/971150603.fit';
        const buffer = fs.readFileSync(path);
        const expectedSamplesLength = 3806;

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          // Verify streams consistency
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Unknown');
          expect(activity.creator.productId).toEqual(15706);
          expect(activity.creator.isRecognized).toBeFalsy();
          expect(activity.generateTimeStream([DataDistance.type]).getData(true).length).toEqual(expectedSamplesLength);
          expect(activity.hasPowerMeter()).toBeTruthy();
          expect(activity.isTrainer()).toBeFalsy();
          expect(activity.getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataPower.type).length).toEqual(expectedSamplesLength);

          // Verify global activity stats
          expect(activity.type).toEqual(ActivityTypes.Cycling);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(32227.5);

          SpecUtils.assertEqual((activity.getStat(DataAscent.type) as DataNumber).getValue(), 242, 0);

          expect(activity.getStat(DataEnergy.type) as DataNumber).toBeUndefined(); // Zwift didn't give the calories
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(76);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(114);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(148);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(180);
          expect((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toEqual(8.476); // Or 30.5 kph
          expect((activity.getStat(DataPowerAvg.type) as DataNumber).getValue()).toEqual(143);
          expect((activity.getStat(DataPowerMax.type) as DataNumber).getValue()).toEqual(381);

          // Verifying time data
          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:02:53', 1);
          SpecUtils.assertNearEqualTime(timerTime, '01:03:35');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:03:42');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });
    });

    describe('TCX', () => {
      it('should parse cycling TCX file (1)', done => {
        // Given TCX Source: https://connect.garmin.com/modern/activity/6791039036 OR https://www.strava.com/activities/5308417342
        // Given FIT Source: https://connect.garmin.com/modern/activity/3939576645 OR https://www.strava.com/activities/2610176355
        const path = __dirname + '/fixtures/rides/tcx/6791039036.tcx';

        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          // Verify global activity stats
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Cycling);
          expect(activity.creator.name).toEqual('Garmin Edge 1000');
          SpecUtils.assertEqual((activity.getStat(DataAscent.type) as DataNumber).getValue(), 672, 0);
          SpecUtils.assertEqual((activity.getStat(DataDescent.type) as DataNumber).getValue(), 664);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(42220.87);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(1497);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(69);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(108);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(153);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(186);
          expect((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toBeCloseTo(5.812); // Or 20.9 kph

          // Verifying time data
          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '02:01:59', 1);
          SpecUtils.assertNearEqualTime(timerTime, '02:01:04');
          SpecUtils.assertNearEqualTime(elapsedTime, '02:04:36');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse cycling TCX file (2)', done => {
        // Given TCX Source: https://connect.garmin.com/modern/activity/6838497277 or https://www.strava.com/activities/5354278524
        // Given FIT Source: https://connect.garmin.com/modern/activity/3953195468 or https://www.strava.com/activities/2621275265
        const path = __dirname + '/fixtures/rides/tcx/6838497277.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Cycling);
          expect(activity.hasPowerMeter()).toBeFalsy();
          expect(activity.isTrainer()).toBeFalsy();

          SpecUtils.assertEqual((activity.getStat(DataAscent.type) as DataNumber).getValue(), 685, 0);
          SpecUtils.assertEqual((activity.getStat(DataDescent.type) as DataNumber).getValue(), 670);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(59853.31);
          expect((activity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(2206);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(68);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(109);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(160);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(192);
          expect((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toBeCloseTo(6.0279); // 21.7 kph

          // Verifying time data
          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '02:52:10', 1.5);
          SpecUtils.assertNearEqualTime(timerTime, '02:55:15');
          SpecUtils.assertNearEqualTime(elapsedTime, '02:55:15');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });

      it('should parse cycling TCX file (3)', done => {
        // Given TCX Source: https://connect.garmin.com/modern/activity/7555170032 or https://www.strava.com/activities/6020442882
        // Given FIT Source: https://connect.garmin.com/modern/activity/7432332116 OR https://www.strava.com/activities/5910143591
        const path = __dirname + '/fixtures/rides/tcx/7555170032.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');
        const expectedSamplesLength = 10063;

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.creator.name).toEqual('Garmin Edge 1000');
          expect(activity.hasPowerMeter()).toBeTruthy();

          expect((activity.getStat(DataPowerAvg.type) as DataNumber).getValue()).toBeCloseTo(152, 0);
          expect((activity.getStat(DataPowerNormalized.type) as DataNumber).getValue()).toBeCloseTo(171, 0);
          expect((activity.getStat(DataPowerMax.type) as DataNumber).getValue()).toEqual(564);

          expect(activity.getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataPower.type).length).toEqual(expectedSamplesLength);

          done();
        });
      });

      it('should parse virtual cycling TCX file (1)', done => {
        // Given https://connect.garmin.com/modern/activity/6823905801 OR https://www.strava.com/activities/5340305665
        const path = __dirname + '/fixtures/rides/tcx/6823905801.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.hasPowerMeter()).toBeTruthy();
          expect(activity.isTrainer()).toBeFalsy();

          // Verify global activity stats
          expect(activity.type).toEqual(ActivityTypes.Cycling);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(32227.5);

          SpecUtils.assertEqual((activity.getStat(DataAscent.type) as DataNumber).getValue(), 242);

          expect(activity.getStat(DataEnergy.type) as DataNumber).toBeUndefined(); // Zwift didn't give the calories
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(76);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(114);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(148);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(180);
          expect((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toBeCloseTo(8.476, 3); // Or 30.5 kph

          SpecUtils.assertEqual((activity.getStat(DataPowerAvg.type) as DataNumber).getValue(), 143);
          expect((activity.getStat(DataPowerMax.type) as DataNumber).getValue()).toEqual(381);

          // Verifying time data
          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:03:10', 1);
          SpecUtils.assertNearEqualTime(timerTime, '01:03:35');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:03:42');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });
    });

    describe('GPX', () => {
      it('should parse cycling GPX file (1)', done => {
        // Given GPX Source: https://connect.garmin.com/modern/activity/6870609105 OR https://www.strava.com/activities/5385601807
        // Given FIT Source: https://connect.garmin.com/modern/activity/3939576645 OR https://www.strava.com/activities/2610176355
        const path = __dirname + '/fixtures/rides/gpx/3939576645.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Cycling);
          expect(activity.hasPowerMeter()).toBeFalsy();

          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(41829, 0);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(672, 0);
          expect((activity.getStat(DataDescent.type) as DataNumber).getValue()).toBeCloseTo(664, 0);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(69);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(108);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(153);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(186);
          expect((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toBeCloseTo(6.479); // Or 23.32 kph

          // Verifying time data
          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '02:00:42', 1.5);
          SpecUtils.assertNearEqualTime(timerTime, '02:04:35');
          SpecUtils.assertNearEqualTime(elapsedTime, '02:04:36');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse cycling GPX file (2)', done => {
        // Given GPX Source: https://connect.garmin.com/modern/activity/6870692308 OR https://www.strava.com/activities/5385683390
        // Given FIT Source: https://connect.garmin.com/modern/activity/828989227 OR https://www.strava.com/activities/343080886
        const path = __dirname + '/fixtures/rides/gpx/828989227.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.Cycling);
          expect(activity.hasPowerMeter()).toBeFalsy();

          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(141975, 0);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(2052, 0);
          expect((activity.getStat(DataDescent.type) as DataNumber).getValue()).toBeCloseTo(2034, 0);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(79);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(118);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(148);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(174);
          expect((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toBeCloseTo(7.329); // Or 26.3 kph

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '05:26:49', 2);
          SpecUtils.assertNearEqualTime(timerTime, '06:07:13');
          SpecUtils.assertNearEqualTime(elapsedTime, '06:07:13');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse cycling GPX file (3)', done => {
        // Given GPX Source: https://connect.garmin.com/modern/activity/6905455978 OR https://www.strava.com/activities/5419099678
        // Given FIT Source: https://connect.garmin.com/modern/activity/4108490848 OR https://www.strava.com/activities/2749884297
        const path = __dirname + '/fixtures/rides/gpx/4108490848.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();

          expect(activity.name).toEqual('Meylan Road Cycling');
          expect(activity.type).toEqual(ActivityTypes.Cycling);
          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(49909, 0);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(292, 0);
          expect((activity.getStat(DataDescent.type) as DataNumber).getValue()).toBeCloseTo(283, 0);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(76);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(117);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(165);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(186);
          expect((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toBeCloseTo(7.903); // Or 28.4 kph

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:47:13', 1);
          SpecUtils.assertNearEqualTime(timerTime, '01:49:20');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:49:20');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);
          done();
        });
      });

      it('should parse cycling GPX file (4)', done => {
        // Given GPX Source: https://connect.garmin.com/modern/activity/7555261629 or https://www.strava.com/activities/6020530554
        // Given FIT Source: https://connect.garmin.com/modern/activity/7432332116 OR https://www.strava.com/activities/5910143591
        const path = __dirname + '/fixtures/rides/gpx/7555261629.gpx';
        const gpxString = fs.readFileSync(path).toString();
        const expectedSamplesLength = 10063;

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.hasPowerMeter()).toBeTruthy();

          expect((activity.getStat(DataPowerAvg.type) as DataNumber).getValue()).toBeCloseTo(152, 0);
          expect((activity.getStat(DataPowerNormalized.type) as DataNumber).getValue()).toBeCloseTo(171, 0);
          expect((activity.getStat(DataPowerMax.type) as DataNumber).getValue()).toEqual(564);

          expect(activity.getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
          expect(activity.getSquashedStreamData(DataPower.type).length).toEqual(expectedSamplesLength);

          done();
        });
      });

      it('should parse virtual cycling GPX file (1)', done => {
        // Given GPX Source: https://connect.garmin.com/modern/activity/6909869014 OR https://www.strava.com/activities/5423473093
        // Given FIT Source: https://connect.garmin.com/modern/activity/1137672073 OR https://www.strava.com/activities/553573871
        const path = __dirname + '/fixtures/rides/gpx/6909869014.gpx';
        const gpxString = fs.readFileSync(path).toString();

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          const activity = event.getFirstActivity();
          expect(activity.type).toEqual(ActivityTypes.VirtualCycling);
          expect(activity.hasPowerMeter()).toBeTruthy();
          expect(activity.isTrainer()).toBeTruthy();

          expect((activity.getStat(DataDistance.type) as DataNumber).getValue()).toBeCloseTo(28620, 0);
          expect((activity.getStat(DataAscent.type) as DataNumber).getValue()).toBeCloseTo(271, 0);
          expect((activity.getStat(DataDescent.type) as DataNumber).getValue()).toBeCloseTo(257, 0);
          expect((activity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(75);
          expect((activity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(120);
          expect((activity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(161);
          expect((activity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(184);
          expect((activity.getStat(DataPowerAvg.type) as DataNumber).getValue()).toBeCloseTo(142, 0);
          expect((activity.getStat(DataPowerMax.type) as DataNumber).getValue()).toBeCloseTo(330);
          expect((activity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toBeCloseTo(7.55); // Or 27.2 kph

          const movingTime = (<DataMovingTime>activity.getStat(DataMovingTime.type)).getValue();
          const timerTime = (<DataTimerTime>activity.getStat(DataTimerTime.type)).getValue();
          const pauseTime = (<DataPause>activity.getStat(DataPause.type)).getValue();
          const elapsedTime = activity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:02:58', 1);
          SpecUtils.assertNearEqualTime(timerTime, '01:03:09');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:03:09');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });
    });
  });

  describe('Triathlon', () => {
    describe('FIT', () => {
      it('should parse a .FIT Triathlon IronMan w/ 3 activities (swim + ride + run) ', done => {
        // Given https://connect.garmin.com/modern/activity/4623204522 ; https://www.strava.com/activities/5352030147 + https://www.strava.com/activities/5352030778 + https://www.strava.com/activities/5352030764
        const path = __dirname + '/fixtures/triathlons/fit/4623204522.fit';
        const buffer = fs.readFileSync(path);
        const activitiesCount = 5;

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getActivities().length).toEqual(activitiesCount);

          // Swim
          const swimActivity = event.getFirstActivity();
          expect(swimActivity.type).toEqual(ActivityTypes.OpenWaterSwimming);
          expect(swimActivity.getStreamData(DataSpeed.type).length).toEqual(3689);
          expect(swimActivity.startDate.toISOString()).toEqual('2018-10-13T17:05:01.000Z');
          expect(swimActivity.endDate.toISOString()).toEqual('2018-10-13T18:06:29.000Z');

          expect((swimActivity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(3933.3);
          expect((swimActivity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(869);
          expect((swimActivity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(37);
          expect((swimActivity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(48);
          expect((swimActivity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(93);
          expect((swimActivity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(112);
          expect((swimActivity.getStat(DataTotalCycles.type) as DataNumber).getValue()).toEqual(2294);

          SpecUtils.assertNearEqualTime(
            <number>SpecUtils.speedToSwimPace((swimActivity.getStat(DataSpeedAvg.type) as DataNumber).getValue()),
            '01:34'
          );

          // Verifying time data
          let movingTime = (<DataMovingTime>swimActivity.getStat(DataMovingTime.type)).getValue();
          let timerTime = (<DataTimerTime>swimActivity.getStat(DataTimerTime.type)).getValue();
          let pauseTime = (<DataPause>swimActivity.getStat(DataPause.type)).getValue();
          let elapsedTime = swimActivity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '01:01:16', 1);
          SpecUtils.assertNearEqualTime(timerTime, '01:01:29');
          SpecUtils.assertNearEqualTime(elapsedTime, '01:01:29');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          // Transition
          let transition = event.getActivities()[1];
          expect(transition.type).toEqual(ActivityTypes.Transition);

          // Cycling
          const cyclingActivity = event.getActivities()[2];
          expect(cyclingActivity.type).toEqual(ActivityTypes.Cycling);
          expect(cyclingActivity.getStreamData(DataSpeed.type).length).toEqual(17250);
          expect(cyclingActivity.startDate.toISOString()).toEqual('2018-10-13T18:10:15.000Z');
          expect(cyclingActivity.endDate.toISOString()).toEqual('2018-10-13T22:57:44.000Z');

          expect((cyclingActivity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(180301.58);
          expect((cyclingActivity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(3804);
          expect((cyclingActivity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(89);
          expect((cyclingActivity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(117);
          expect((cyclingActivity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(140);
          expect((cyclingActivity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(153);
          expect((cyclingActivity.getStat(DataTotalCycles.type) as DataNumber).getValue()).toEqual(24373);
          expect((cyclingActivity.getStat(DataSpeedAvg.type) as DataNumber).getValue()).toBeCloseTo(10.453, 2); // Or 37.6 kph

          // Verifying time data
          movingTime = (<DataMovingTime>cyclingActivity.getStat(DataMovingTime.type)).getValue();
          timerTime = (<DataTimerTime>cyclingActivity.getStat(DataTimerTime.type)).getValue();
          pauseTime = (<DataPause>cyclingActivity.getStat(DataPause.type)).getValue();
          elapsedTime = cyclingActivity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '04:42:28', 1);
          SpecUtils.assertNearEqualTime(timerTime, '04:47:29');
          SpecUtils.assertNearEqualTime(elapsedTime, '04:47:29');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime);

          transition = event.getActivities()[3];
          expect(transition.type).toEqual(ActivityTypes.Transition);

          const runningActivity = event.getActivities()[4];
          expect(runningActivity.type).toEqual(ActivityTypes.Running);
          expect(runningActivity.startDate.toISOString()).toEqual('2018-10-13T22:57:45.000Z');
          expect(runningActivity.endDate.toISOString()).toEqual('2018-10-14T02:42:23.000Z');
          expect((runningActivity.getStat(DataDistance.type) as DataNumber).getValue()).toEqual(42563.91);
          expect((runningActivity.getStat(DataEnergy.type) as DataNumber).getValue()).toEqual(2056);
          expect((runningActivity.getStat(DataCadenceAvg.type) as DataNumber).getValue()).toEqual(84);
          expect((runningActivity.getStat(DataCadenceMax.type) as DataNumber).getValue()).toEqual(116);
          expect((runningActivity.getStat(DataHeartRateAvg.type) as DataNumber).getValue()).toEqual(142);
          expect((runningActivity.getStat(DataHeartRateMax.type) as DataNumber).getValue()).toEqual(151);
          SpecUtils.assertNearEqualTime(
            (runningActivity.getStat(DataPaceAvg.type) as DataNumber).getValue(),
            '05:08',
            1
          );

          // Verifying time data
          movingTime = (<DataMovingTime>runningActivity.getStat(DataMovingTime.type)).getValue();
          timerTime = (<DataTimerTime>runningActivity.getStat(DataTimerTime.type)).getValue();
          pauseTime = (<DataPause>runningActivity.getStat(DataPause.type)).getValue();
          elapsedTime = runningActivity.getDuration().getValue();

          SpecUtils.assertNearEqualTime(movingTime, '03:36:57', 1);
          SpecUtils.assertNearEqualTime(timerTime, '03:38:13');
          SpecUtils.assertNearEqualTime(elapsedTime, '03:39:01');
          SpecUtils.assertEqual(pauseTime, elapsedTime - movingTime, 1);

          done();
        });
      });
    });
  });

  describe('Others', () => {
    it('should reject parsing of broken fit file (empty activities)', done => {
      // Given
      const path = __dirname + '/fixtures/others/empty-activities.fit';
      const buffer = fs.readFileSync(path);
      const expectedErrorMessage = 'EMPTY_FIT_FILE';
      const expectedErrorClassName = 'EmptyEventLibError';

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then(
        () => {
          throw new Error('Should not be resolved...');
        },
        err => {
          expect(err.constructor.name).toEqual(expectedErrorClassName);
          expect(err.message).toEqual(expectedErrorMessage);
          expect(err.event).toBeNull();
          done();
        }
      );
    });

    it('should reject parsing of broken fit file (empty sessions)', done => {
      // Given
      const path = __dirname + '/fixtures/others/empty-sessions.fit';
      const buffer = fs.readFileSync(path);
      const expectedErrorMessage = 'EMPTY_FIT_FILE';
      const expectedErrorClassName = 'EmptyEventLibError';

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then(
        () => {
          throw new Error('Should not be resolved...');
        },
        err => {
          expect(err.constructor.name).toEqual(expectedErrorClassName);
          expect(err.message).toEqual(expectedErrorMessage);
          expect(err.event).toBeNull();
          done();
        }
      );
    });

    it('should parse fit file with broken start/end dates', done => {
      // Given
      const path = __dirname + '/fixtures/others/broken-dates.fit';
      const buffer = fs.readFileSync(path);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then(event => {
        expect(event.startDate.toISOString()).toEqual('2017-03-20T19:09:28.000Z');
        expect(event.endDate.toISOString()).toEqual('2017-03-20T19:20:24.000Z');
        done();
      });
    });

    it('should handle activity with broken start lat/lng', done => {
      // Given FIT Source: https://connect.garmin.com/modern/activity/7606651718 OR https://www.strava.com/activities/6066984530
      const path = __dirname + '/fixtures/others/broken-start-latlng.fit';
      const buffer = fs.readFileSync(path);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        const activity = event.getFirstActivity();
        const longStream = activity.getSquashedStreamData(DataLongitudeDegrees.type);
        const latStream = activity.getSquashedStreamData(DataLatitudeDegrees.type);
        expect(longStream[0]).not.toEqual(0);
        expect(latStream[0]).not.toEqual(0);
        done();
      });
    });
  });
});
