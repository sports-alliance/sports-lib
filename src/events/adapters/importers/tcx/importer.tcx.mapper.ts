import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataCadence } from '../../../../data/data.cadence';
import { DataDistance } from '../../../../data/data.distance';
import { DataSpeed } from '../../../../data/data.speed';
import { DataPace } from '../../../../data/data.pace';
import { DataPower } from '../../../../data/data.power';
import { DataLongitudeDegrees } from '../../../../data/data.longitude-degrees';
import { convertSpeedToPace } from '../../../utilities/helpers';

const findChildNode = (fromNodeList: NodeListOf<ChildNode>, childNodeName: string | RegExp): ChildNode | null => {
  const childNodeFound = Array.from(fromNodeList).find((childNode: ChildNode) => {
    return childNode.nodeName === childNodeName || childNode.nodeName.match(childNodeName) !== null;
  });
  return childNodeFound ? childNodeFound : null;
};

const findChildNodeValue = (fromNodeList: NodeListOf<ChildNode>, childNodeName: string | RegExp): number | null => {
  const predicate = (childNode: ChildNode) =>
    childNode.nodeName === childNodeName || childNode.nodeName.match(childNodeName) !== null;
  let value = Array.from(fromNodeList).find(predicate)?.firstChild?.nodeValue;
  value = value !== undefined ? value : null;
  return value === null ? value : Number(value);
};

const findTrackPointExtensionValue = (childNodes: NodeListOf<ChildNode>, extensionName: string): number | null => {
  const trackPointsChild: ChildNode | null = findChildNode(childNodes, 'Extensions');
  if (!trackPointsChild) {
    return null;
  }
  const tpxChildNode = findChildNode(trackPointsChild.childNodes, new RegExp(/TPX$/));
  if (tpxChildNode) {
    const value = findChildNodeValue(tpxChildNode.childNodes, new RegExp(extensionName + '$'));
    return value !== null ? Number(value) : null;
  }
  return null;
};

export const TCXSampleMapper: { dataType: string; getSampleValue(trackPointsElement: Element): number | null }[] = [
  {
    dataType: DataLatitudeDegrees.type,
    getSampleValue: (trackPointsElement: Element) => {
      const positionChildNode: ChildNode | null = findChildNode(trackPointsElement.childNodes, 'Position');
      if (!positionChildNode) {
        return null;
      }
      return findChildNodeValue(positionChildNode.childNodes, 'LatitudeDegrees');
    }
  },
  {
    dataType: DataLongitudeDegrees.type,
    getSampleValue: (trackPointsElement: Element) => {
      const positionChildNode: ChildNode | null = findChildNode(trackPointsElement.childNodes, 'Position');
      if (!positionChildNode) {
        return null;
      }
      return findChildNodeValue(positionChildNode.childNodes, 'LongitudeDegrees');
    }
  },
  {
    dataType: DataDistance.type,
    getSampleValue: (trackPointsElement: Element) => {
      return findChildNodeValue(trackPointsElement.childNodes, 'DistanceMeters');
    }
  },
  {
    dataType: DataAltitude.type,
    getSampleValue: (trackPointsElement: Element) => {
      return findChildNodeValue(trackPointsElement.childNodes, 'AltitudeMeters');
    }
  },
  {
    dataType: DataCadence.type,
    getSampleValue: (trackPointsElement: Element) => {
      return findChildNodeValue(trackPointsElement.childNodes, 'Cadence');
    }
  },
  {
    dataType: DataHeartRate.type,
    getSampleValue: (trackPointsElement: Element) => {
      const heartRateChildNode: ChildNode | null = findChildNode(trackPointsElement.childNodes, 'HeartRateBpm');
      if (!heartRateChildNode) {
        return null;
      }
      return findChildNodeValue(heartRateChildNode.childNodes, 'Value');
    }
  },
  {
    dataType: DataCadence.type,
    getSampleValue: (trackPointsElement: Element) => {
      return findTrackPointExtensionValue(trackPointsElement.childNodes, 'RunCadence');
    }
  },
  {
    dataType: DataSpeed.type,
    getSampleValue: (trackPointsElement: Element) => {
      return findTrackPointExtensionValue(trackPointsElement.childNodes, 'Speed');
    }
  },
  {
    dataType: DataPace.type,
    getSampleValue: (trackPointsElement: Element) => {
      const speed = findTrackPointExtensionValue(trackPointsElement.childNodes, 'Speed');
      return speed !== null ? convertSpeedToPace(speed) : null;
    }
  },
  {
    dataType: DataPower.type,
    getSampleValue: (trackPointsElement: Element) => {
      return findTrackPointExtensionValue(trackPointsElement.childNodes, 'Watts');
    }
  }
];
