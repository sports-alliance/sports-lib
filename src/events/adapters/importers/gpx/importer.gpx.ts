import {Activity} from '../../../../activities/activity';
import {EventInterface} from '../../../event.interface';
import {Creator} from '../../../../creators/creator';
import {PointInterface} from '../../../../points/point.interface';
import {DataTemperature} from '../../../../data/data.temperature';
import {Point} from '../../../../points/point';
import {DataLatitudeDegrees} from '../../../../data/data.latitude-degrees';
import {DataLongitudeDegrees} from '../../../../data/data.longitude-degrees';
import {DataAltitude} from '../../../../data/data.altitude';
import {DataCadence} from '../../../../data/data.cadence';
import {DataSeaLevelPressure} from '../../../../data/data.sea-level-pressure';
import {DataSpeed} from '../../../../data/data.speed';
import {DataVerticalSpeed} from '../../../../data/data.vertical-speed';
import {DataPower} from '../../../../data/data.power';
import {DataHeartRate} from '../../../../data/data.heart-rate';
import {Event} from '../../../event';
import {ActivityTypes} from '../../../../activities/activity.types';
import {LapInterface} from '../../../../laps/lap.interface';
import {Lap} from '../../../../laps/lap';
import {LapTypes} from '../../../../laps/lap.types';
import {DataDistance} from '../../../../data/data.distance';
import {DataDuration} from '../../../../data/data.duration';
import {DataPause} from '../../../../data/data.pause';
import {EventUtilities} from '../../../utilities/event.utilities';

const GXParser = require('gxparser').GXParser;

export class EventImporterGPX {
  static getFromString(gpx: string, name = 'New Event'): EventInterface {

    const parsedGPX = GXParser(gpx);

    // Create an event
    const event = new Event(name);

    // Create a creator
    const creator = new Creator(parsedGPX.creator);
    creator.swInfo = parsedGPX.version;

    // Get the points
    const points = this.getPointsFromGPX(parsedGPX);

    // Get the laps
    const laps = this.getLaps(parsedGPX);

    // Find the activity type
    let activityType: ActivityTypes;
    if (parsedGPX.trk[0].type) {
      activityType = ActivityTypes[<keyof typeof ActivityTypes>parsedGPX.trk[0].type[0]];
    } else {
      activityType = ActivityTypes.unknown;
    }

    // Create an activity
    const activity = new Activity(
      points[0].getDate(),
      points[points.length - 1].getDate(),
      activityType,
      creator,
    );

    // Add the points to the activity
    points.forEach(point => activity.addPoint(point));

    // Add the laps to the activity
    laps.forEach(lap => activity.addLap(lap));

    // Add the activity to the event
    event.addActivity(activity);


    activity.sortPointsByDate();

    // Generate missing stats
    EventUtilities.generateStats(event);

    // @todo move this elsewhere and refactor
    event.setDuration(new DataDuration(activity.getDuration().getValue()));
    event.setPause(new DataPause(activity.getPause().getValue()));
    event.setDistance(new DataDistance(activity.getDistance().getValue()));

    debugger;

    return event;
  }

  private static getPointsFromGPX(parsedGPX: any): PointInterface[] {
    return parsedGPX.trk.reduce((pointsArray: PointInterface[], track: any) => {
      track.trkseg.forEach((trackSegment: any) => {
        trackSegment.trkpt.forEach((trackPoint: any) => {
          // Create a point
          const point = new Point(new Date(trackPoint.time[0]));
          // Add lat long
          point.addData(new DataLatitudeDegrees(trackPoint.lat));
          point.addData(new DataLongitudeDegrees(trackPoint.lon));
          // Check if elevation is available and add it
          if (trackPoint.ele) {
            point.addData(new DataAltitude(trackPoint.ele[0]));
          }
          // Go over the extensions
          if (trackPoint.extensions && trackPoint.extensions[0]) {
            this.addExtensionDataToPoint(point, trackPoint.extensions[0])
          }
          pointsArray.push(point);
        });
      });
      return pointsArray;
    }, [])
  }

  private static addExtensionDataToPoint(point: PointInterface, extensionData: any): void {
    // First check the keys for known
    for (const key of Object.keys(extensionData)) {
      // Special case. If the key is again an extension recall this
      if (key === 'TrackPointExtension') {
        this.addExtensionDataToPoint(point, extensionData[key][0]);
      }
      if (key === 'altitude') {
        point.addData(new DataAltitude(extensionData[key]));
      }
      if (key === 'heartrate' || key === 'hr') {
        point.addData(new DataHeartRate(extensionData[key]));
      }
      if (key === 'cadence' || key === 'cad') {
        point.addData(new DataCadence(extensionData[key]));
      }
      if (key === 'seaLevelPressure') {
        point.addData(new DataSeaLevelPressure(extensionData[key]));
      }
      if (key === 'speed') {
        point.addData(new DataSpeed(extensionData[key]));
      }
      if (key === 'verticalSpeed') {
        point.addData(new DataVerticalSpeed(extensionData[key]));
      }
      if (key === 'power') {
        point.addData(new DataPower(extensionData[key]));
      }
      if (key === 'temp' || key === 'atemp') {
        point.addData(new DataTemperature(extensionData[key]));
      }
    }
  }

  private static getLaps(parsedGPX: any): LapInterface[] {
    if (!parsedGPX.extensions) {
      return [];
    }
    return parsedGPX.extensions.reduce((lapsArray: LapInterface[], extension: any) => {
      extension.lap.forEach((lapExtension: any) => {
        // Skip 0 duration laps
        // @todo validate
        if (Number(lapExtension.elapsedTime) === 0) {
          return;
        }
        const lap = new Lap(
          new Date(lapExtension.startTime),
          new Date((new Date(lapExtension.startTime)).getTime() + (Number(lapExtension.elapsedTime) * 1000)),
          LapTypes.AutoLap,
        );
        lapsArray.push(lap);
      });
      return lapsArray;
    }, [])
  }
}
