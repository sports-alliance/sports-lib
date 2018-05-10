import {DataBare} from './data.bare';

export abstract class DataBoolean extends DataBare {
  static className = 'DataBoolean';

  constructor(value: boolean) {
    super(value);
  }
}
