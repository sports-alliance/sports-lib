import {DataLatitudeDegrees} from '../../../../data/data.latitude-degrees';
import {DataAltitude} from '../../../../data/data.altitude';
import {DataHeartRate} from '../../../../data/data.heart-rate';
import {DataCadence} from '../../../../data/data.cadence';
import {DataDistance} from '../../../../data/data.distance';
import {DataSpeed} from '../../../../data/data.speed';
import {DataPace} from '../../../../data/data.pace';
import {DataPower} from '../../../../data/data.power';
import {DataLongitudeDegrees} from '../../../../data/data.longitude-degrees';
import {convertSpeedToPace} from "../../../utilities/helpers";

export const TCXSampleMapper: { dataType: string, getSampleValue(trackPointsElement: Element): number | null }[] = [
  {
    dataType: DataLatitudeDegrees.type,
    getSampleValue: (trackPointsElement: Element) => {
      const trackPointsElementChild = Array.from(trackPointsElement.children).find((trackPointsElementChild) => {
        return trackPointsElementChild.tagName === 'Position';
      });
      if (!trackPointsElementChild) {
        return null;
      }
      return Number(trackPointsElementChild.getElementsByTagName('LatitudeDegrees')[0].textContent);
    },
  },
  {
    dataType: DataLongitudeDegrees.type,
    getSampleValue: (trackPointsElement: Element) => {
      const trackPointsElementChild = Array.from(trackPointsElement.children).find((trackPointsElementChild) => {
        return trackPointsElementChild.tagName === 'Position';
      });
      if (!trackPointsElementChild) {
        return null;
      }
      return Number(trackPointsElementChild.getElementsByTagName('LongitudeDegrees')[0].textContent);
    },
  },
  {
    dataType: DataDistance.type,
    getSampleValue: (trackPointsElement: Element) => {
      const trackPointsElementChild = Array.from(trackPointsElement.children).find((trackPointsElementChild) => {
        return trackPointsElementChild.tagName === 'DistanceMeters';
      });
      if (!trackPointsElementChild) {
        return null;
      }
      return Number(trackPointsElementChild.textContent);
    },
  },
  {
    dataType: DataAltitude.type,
    getSampleValue: (trackPointsElement: Element) => {
      const trackPointsElementChild = Array.from(trackPointsElement.children).find((trackPointsElementChild) => {
        return trackPointsElementChild.tagName === 'AltitudeMeters';
      });
      if (!trackPointsElementChild) {
        return null;
      }
      return Number(trackPointsElementChild.textContent);
    },
  },
  {
    dataType: DataCadence.type,
    getSampleValue: (trackPointsElement: Element) => {
      const trackPointsElementChild = Array.from(trackPointsElement.children).find((trackPointsElementChild) => {
        return trackPointsElementChild.tagName === 'Cadence';
      });
      if (!trackPointsElementChild) {
        return null;
      }
      return Number(trackPointsElementChild.textContent);
    },
  },
  {
    dataType: DataHeartRate.type,
    getSampleValue: (trackPointsElement: Element) => {
      const trackPointsElementChild = Array.from(trackPointsElement.children).find((trackPointsElementChild) => {
        return trackPointsElementChild.tagName === 'HeartRateBpm';
      });
      if (!trackPointsElementChild) {
        return null;
      }
      return Number(trackPointsElementChild.textContent);
    },
  },
  {
    dataType: DataCadence.type,
    getSampleValue: (trackPointsElement: Element) => {
      const trackPointsElementChild = Array.from(trackPointsElement.children).find((trackPointsElementChild) => {
        return trackPointsElementChild.tagName === 'Extensions';
      });
      if (!trackPointsElementChild) {
        return null;
      }
      let returnValue = null;
      for (const dataExtensionElement of <any>trackPointsElementChild.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'TPX')[0].children) {
        if (dataExtensionElement.nodeName.replace(dataExtensionElement.prefix + ':', '') === 'RunCadence') {
          returnValue = Number(dataExtensionElement.textContent);
          break;
        }
      }
      return returnValue;
    },
  },
  {
    dataType: DataSpeed.type,
    getSampleValue: (trackPointsElement: Element) => {
      const trackPointsElementChild = Array.from(trackPointsElement.children).find((trackPointsElementChild) => {
        return trackPointsElementChild.tagName === 'Extensions';
      });
      if (!trackPointsElementChild) {
        return null;
      }
      let returnValue = null;
      for (const dataExtensionElement of <any>trackPointsElementChild.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'TPX')[0].children) {
        if (dataExtensionElement.nodeName.replace(dataExtensionElement.prefix + ':', '') === 'Speed') {
          returnValue = Number(dataExtensionElement.textContent);
          break;
        }
      }
      return returnValue;
    },
  },
  {
    dataType: DataPace.type,
    getSampleValue: (trackPointsElement: Element) => {
      const trackPointsElementChild = Array.from(trackPointsElement.children).find((trackPointsElementChild) => {
        return trackPointsElementChild.tagName === 'Extensions';
      });
      if (!trackPointsElementChild) {
        return null;
      }
      let returnValue = null;
      for (const dataExtensionElement of <any>trackPointsElementChild.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'TPX')[0].children) {
        if (dataExtensionElement.nodeName.replace(dataExtensionElement.prefix + ':', '') === 'Speed') {
          returnValue = convertSpeedToPace(Number(dataExtensionElement.textContent));
          break;
        }
      }
      return returnValue;
    },
  },
  {
    dataType: DataPower.type,
    getSampleValue: (trackPointsElement: Element) => {
      const trackPointsElementChild = Array.from(trackPointsElement.children).find((trackPointsElementChild) => {
        return trackPointsElementChild.tagName === 'Extensions';
      });
      if (!trackPointsElementChild) {
        return null;
      }
      let returnValue = null;
      for (const dataExtensionElement of <any>trackPointsElementChild.getElementsByTagNameNS('http://www.garmin.com/xmlschemas/ActivityExtension/v2', 'TPX')[0].children) {
        if (dataExtensionElement.nodeName.replace(dataExtensionElement.prefix + ':', '') === 'Watts') {
          returnValue = Number(dataExtensionElement.textContent);
          break;
        }
      }
      return returnValue;
    },
  },
];
