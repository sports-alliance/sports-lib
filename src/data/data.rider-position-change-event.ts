import { DataEvent } from './data.event';
import { RiderPosition } from './data.cycling-position';

export class DataRiderPositionChangeEvent extends DataEvent {
  static type = 'Rider Position Change Event';

  positionChange: RiderPosition;

  constructor(index: number, positionChange: RiderPosition) {
    super(index);
    this.positionChange = positionChange;
  }
}
