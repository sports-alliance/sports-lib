import { DataEvent } from './data.event';
import { RiderPosition } from './data.cycling-position';

export class DataRiderPositionChangeEvent extends DataEvent {
  static type = 'Rider Position Change Event';

  positionChange: RiderPosition;

  constructor(indexOrObj: number | { index: number, positionChange: RiderPosition }, positionChange?: RiderPosition) {
    if (typeof indexOrObj === 'object') {
      super(indexOrObj.index);
      this.positionChange = indexOrObj.positionChange;
    } else {
      super(indexOrObj);
      this.positionChange = positionChange!;
    }
  }
}
