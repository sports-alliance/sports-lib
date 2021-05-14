import { DataNumber } from './data.number';

export class DataRPE extends DataNumber {
  static type = 'Rated Perceived Exertion';

  getDisplayValue(): number | string | string[] {
    return RPEBorgCR10SCale[Math.ceil(this.getValue())]
      ? RPEBorgCR10SCale[Math.ceil(this.getValue())]
      : `Other ${this.getValue()}`;
  }
}

export enum RPEBorgCR10SCale {
  'No exertion at all',
  'Very, very slight',
  'Very slight',
  'Slight',
  'Moderate',
  'Somewhat severe',
  'Severe',
  'More than severe',
  'Very severe',
  'Extreme',
  'Maximal'
}
