import { IDClassInterface } from './id.class.interface';

export abstract class IDClass implements IDClassInterface {
  private id?: string;

  getID(): string | null {
    return this.id || null;
  }

  setID(id: string) {
    this.id = id;
    return this;
  }
}
