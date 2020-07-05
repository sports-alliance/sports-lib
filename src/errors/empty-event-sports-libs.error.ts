import { EventLibError } from './event-lib.error';

export class EmptyEventLibError extends EventLibError {
  constructor(message: string) {
    super(message, <any>null);
    Object.setPrototypeOf(this, EmptyEventLibError.prototype); // Set the prototype explicitly.
  }
}

export class ParsingEventLibError extends EventLibError {
  constructor(message: string) {
    super(message, <any>null);
    Object.setPrototypeOf(this, EmptyEventLibError.prototype); // Set the prototype explicitly.
  }
}
