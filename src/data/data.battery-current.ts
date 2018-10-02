import {DataNumber} from './data.number';

export class DataBatteryCurrent extends DataNumber {
  static className = 'DataBatteryCurrent';

  static type = 'Battery Current';
  static unit = 'mA';
}
