import { LibError } from './lib.error';
import { EventInterface } from '../events/event.interface';

export class EventLibError extends LibError {

  public event: EventInterface;

  constructor(message: string, event: EventInterface) {
    super(message);
    Object.setPrototypeOf(this, EventLibError.prototype); // Set the prototype explicitly.
    this.event = event;
  }
}
