import { EventLibError } from './event-lib.error';

export class ParsingEventLibError extends EventLibError {
  public static readonly CODE: string = 'PARSING_LIB_ERROR';
  readonly code: string = ParsingEventLibError.CODE;

  constructor(message: string) {
    super(message, null);
    Object.setPrototypeOf(this, ParsingEventLibError.prototype); // Set the prototype explicitly.
  }
}
