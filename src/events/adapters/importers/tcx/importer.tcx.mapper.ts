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
import { findChildNode, findChildNodeValue, findTrackPointExtensionValue } from './utils.tcx';
import { SampleInfo } from '../sample-info.interface';
import { findTCXAltitude, findTCXSpeed } from './tcx.compatibility';

interface TCXSampleInfo extends SampleInfo {
  corosDirectSpeed?: boolean;
}

export const TCXSampleMapper: {
  dataType: string;
  getSampleValue(trackPointsElement: Element, sampleInfo?: TCXSampleInfo): number | null;
}[] = [
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
      // TODO(sports-lib): validate TCX distance-field unit assumptions for vendor extensions/exports
      // and keep one canonical base distance stream path.
      return findChildNodeValue(trackPointsElement.childNodes, 'DistanceMeters');
    }
  },
  {
    dataType: DataAltitude.type,
    getSampleValue: (trackPointsElement: Element) => {
      return findTCXAltitude(trackPointsElement);
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
    getSampleValue: (trackPointsElement: Element, sampleInfo?: TCXSampleInfo) => {
      return findTCXSpeed(trackPointsElement, sampleInfo?.corosDirectSpeed);
    }
  },
  {
    dataType: DataPace.type,
    getSampleValue: (trackPointsElement: Element, sampleInfo?: TCXSampleInfo) => {
      const speed = findTCXSpeed(trackPointsElement, sampleInfo?.corosDirectSpeed);
      return speed !== null ? convertSpeedToPace(speed) : null;
    }
  },
  {
    dataType: DataPower.type,
    getSampleValue: (trackPointsElement: Element, sampleInfo?: SampleInfo) => {
      const extensions = findChildNode(trackPointsElement.childNodes, 'Extensions');
      const tpx = extensions && findChildNode(extensions.childNodes, /TPX$/gi);
      const field = tpx && findChildNode(tpx.childNodes, /Watts$/);
      const text = field?.firstChild?.nodeValue;
      const watts = typeof text === 'string' && text.trim() !== '' ? Number(text) : null;
      return sampleInfo?.hasPowerMeter && typeof watts === 'number' && Number.isFinite(watts) && watts >= 0
        ? watts : null;
    }
  }
];
