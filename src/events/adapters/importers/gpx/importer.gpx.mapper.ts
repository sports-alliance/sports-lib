import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataCadence } from '../../../../data/data.cadence';
import { DataTemperature } from '../../../../data/data.temperature';
import { DataDistance } from '../../../../data/data.distance';
import { DataSeaLevelPressure } from '../../../../data/data.sea-level-pressure';
import { DataSpeed } from '../../../../data/data.speed';
import { DataPace } from '../../../../data/data.pace';
import { DataVerticalSpeed } from '../../../../data/data.vertical-speed';
import { DataPower } from '../../../../data/data.power';
import { DataLongitudeDegrees } from '../../../../data/data.longitude-degrees';
import { convertSpeedToPace, isNumberOrString } from '../../../utilities/helpers';

export const GPXSampleMapper: { dataType: string, getSampleValue(sample: any): number | null }[] = [
  {
    dataType: DataLatitudeDegrees.type,
    getSampleValue: sample => Number(sample.lat),
  },
  {
    dataType: DataLongitudeDegrees.type,
    getSampleValue: sample => Number(sample.lon),
  },
  {
    dataType: DataAltitude.type,
    getSampleValue: sample => sample.ele ? Number(sample.ele[0]) : null,
  },
  {
    dataType: DataHeartRate.type,
    getSampleValue: (sample) => {
      // debugger;
      if (!sample.extensions || !sample.extensions.length) {
        return null;
      }
      if (sample.extensions[0].heartrate && isNumberOrString(sample.extensions[0].heartrate[0])) {
        return Number(sample.extensions[0].heartrate[0]);
      }
      if (sample.extensions[0].TrackPointExtension && sample.extensions[0].TrackPointExtension[0] && sample.extensions[0].TrackPointExtension[0].hr) {
        return Number(sample.extensions[0].TrackPointExtension[0].hr[0]);
      }
      return null;
    },
  },
  {
    dataType: DataCadence.type,
    getSampleValue: (sample) => {
      // debugger;
      if (!sample.extensions || !sample.extensions.length) {
        return null;
      }
      if (sample.extensions[0].cadence && isNumberOrString(sample.extensions[0].cadence[0])) {
        return Number(sample.extensions[0].cadence[0]);
      }
      if (sample.extensions[0].TrackPointExtension && sample.extensions[0].TrackPointExtension[0] && sample.extensions[0].TrackPointExtension[0].cad) {
        return Number(sample.extensions[0].TrackPointExtension[0].cad[0]);
      }
      return null;
    },
  },
  {
    dataType: DataTemperature.type,
    getSampleValue: (sample) => {
      // debugger;
      if (!sample.extensions || !sample.extensions.length) {
        return null;
      }
      if (sample.extensions[0].temp && isNumberOrString(sample.extensions[0].temp[0])) {
        return Number(sample.extensions[0].temp[0]);
      }
      if (sample.extensions[0].TrackPointExtension && sample.extensions[0].TrackPointExtension[0] && sample.extensions[0].TrackPointExtension[0].atemp) {
        return Number(sample.extensions[0].TrackPointExtension[0].atemp[0]);
      }
      return null;
    },
  },
  {
    dataType: DataDistance.type,
    getSampleValue: (sample) => {
      if (!sample.extensions || !sample.extensions.length) {
        return null;
      }
      if (sample.extensions[0].distance && isNumberOrString(sample.extensions[0].distance[0])) {
        return Number(sample.extensions[0].distance[0]);
      }
      return null;
    },
  },
  {
    dataType: DataSeaLevelPressure.type,
    getSampleValue: (sample) => {
      if (!sample.extensions || !sample.extensions.length) {
        return null;
      }
      if (sample.extensions[0].seaLevelPressure && isNumberOrString(sample.extensions[0].seaLevelPressure[0])) {
        return Number(sample.extensions[0].seaLevelPressure[0]);
      }
      return null;
    },
  },
  {
    dataType: DataSpeed.type,
    getSampleValue: (sample) => {
      if (!sample.extensions || !sample.extensions.length) {
        return null;
      }
      if (sample.extensions[0].speed && isNumberOrString(sample.extensions[0].speed[0])) {
        return Number(sample.extensions[0].speed[0]);
      }
      return null;
    },
  },
  {
    dataType: DataPace.type,
    getSampleValue: (sample) => {
      if (!sample.extensions || !sample.extensions.length) {
        return null;
      }
      if (sample.extensions[0].speed && isNumberOrString(sample.extensions[0].speed[0])) {
        return Number(convertSpeedToPace(sample.extensions[0].speed[0]));
      }
      return null;
    },
  },
  {
    dataType: DataVerticalSpeed.type,
    getSampleValue: (sample) => {
      if (!sample.extensions || !sample.extensions.length) {
        return null;
      }
      if (sample.extensions[0].verticalSpeed && isNumberOrString(sample.extensions[0].verticalSpeed[0])) {
        return Number(sample.extensions[0].verticalSpeed[0]);
      }
      return null;
    },
  },
  {
    dataType: DataPower.type,
    getSampleValue: (sample) => {
      if (!sample.extensions || !sample.extensions.length) {
        return null;
      }
      if (sample.extensions[0].power && isNumberOrString(sample.extensions[0].power[0])) {
        return Number(sample.extensions[0].power[0]);
      }
      return null;
    },
  },
];
