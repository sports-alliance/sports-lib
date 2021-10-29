import { EventLibError } from './event-lib.error';

export class EmptyEventLibError extends EventLibError {
  constructor(message?: string) {
    super(`EMPTY_FIT_FILE_ERROR${message ? ': ' + message : ''}`, <any>null);
    Object.setPrototypeOf(this, EmptyEventLibError.prototype); // Set the prototype explicitly.
  }
}

export class ParsingEventLibError extends EventLibError {
  constructor(message?: string) {
    super(`PARSING_EVENT_ERROR${message ? ': ' + message : ''}`, <any>null);
    Object.setPrototypeOf(this, EmptyEventLibError.prototype); // Set the prototype explicitly.
  }
}
