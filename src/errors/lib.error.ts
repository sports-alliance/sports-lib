export class LibError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, LibError.prototype); // Set the prototype explicitly.
  }
}
