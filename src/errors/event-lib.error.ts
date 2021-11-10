import { LibError } from './lib.error';
import { EventInterface } from '../events/event.interface';

export abstract class EventLibError extends LibError {
  public event: EventInterface | null;

  protected constructor(message: string, event: EventInterface | null) {
    super(message);
    Object.setPrototypeOf(this, EventLibError.prototype); // Set the prototype explicitly.
    this.event = event;
  }
}
