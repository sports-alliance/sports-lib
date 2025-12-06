import { EventLibError } from './event-lib.error';

export class EmptyEventLibError extends EventLibError {
  public static readonly CODE: string = 'EVENT_EMPTY_ERROR';
  readonly code: string = EmptyEventLibError.CODE;

  constructor(message = 'No activities found') {
    super(message, null);
    Object.setPrototypeOf(this, EmptyEventLibError.prototype); // Set the prototype explicitly.
  }
}
