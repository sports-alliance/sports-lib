import {DataNumber} from './data.number';

export class DataRPE extends DataNumber {
  static type = 'Rated Perceived Exertion';
}

export enum RPEBorgCR10SCale {
  'No exertion at all',
  'Very, very slight (just noticeable)',
  'Very slight',
  'Slight',
  'Moderate',
  'Somewhat severe',
  'Severe',
  'More than severe',
  'Very severe',
  'Extreme',
  'Maximal',
}
