import { EventLibError } from './event-lib.error';

export class DurationExceededEventLibError extends EventLibError {
  public static readonly CODE: string = 'DURATION_EXCEEDED_EVENT_ERROR';
  readonly code: string = DurationExceededEventLibError.CODE;

  constructor(message: string) {
    super(message, null);
    Object.setPrototypeOf(this, DurationExceededEventLibError.prototype); // Set the prototype explicitly.
  }
}
