export abstract class LibError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, LibError.prototype); // Set the prototype explicitly.
  }
}
