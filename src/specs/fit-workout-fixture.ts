import { FitEncoder } from 'fit-file-parser/encoder';

export interface FixtureField {
  number: number;
  type: number;
  bytes: number[];
}
export interface FixtureDeveloper {
  number: number;
  index: number;
  bytes: number[];
}

export const byte = (number: number, value: number, type = 2): FixtureField => ({ number, type, bytes: [value] });
export function numeric(number: number, value: number, size = 4, type = 0x86, little = true): FixtureField {
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  if (size === 4) view.setUint32(0, value, little);
  else view.setUint16(0, value, little);
  return { number, type, bytes: [...bytes] };
}
export const stringField = (number: number, value: string): FixtureField => ({
  number,
  type: 7,
  bytes: [...new TextEncoder().encode(value), 0]
});
export const developer = (number: number, index: number, value: string): FixtureDeveloper => ({
  number,
  index,
  bytes: [...new TextEncoder().encode(value), 0]
});

/** Synthetic files only; CRC is independently supplied by the dependency's encoder. */
export class FITWorkoutFixture {
  data: number[] = [];

  message(
    global: number,
    fields: FixtureField[],
    developers: FixtureDeveloper[] = [],
    options: { little?: boolean; local?: number; compressed?: number } = {}
  ): this {
    const little = options.little ?? true;
    const local = options.local ?? 0;
    this.data.push(
      0x40 | (developers.length ? 0x20 : 0) | local,
      0,
      little ? 0 : 1,
      little ? global & 255 : global >>> 8,
      little ? global >>> 8 : global & 255,
      fields.length
    );
    fields.forEach(field => this.data.push(field.number, field.bytes.length, field.type));
    if (developers.length) {
      this.data.push(developers.length);
      developers.forEach(field => this.data.push(field.number, field.bytes.length, field.index));
    }
    this.data.push(options.compressed === undefined ? local : 0x80 | (local << 5) | (options.compressed & 31));
    fields.forEach(field => {
      if (!(options.compressed !== undefined && field.number === 253)) this.data.push(...field.bytes);
    });
    developers.forEach(field => this.data.push(...field.bytes));
    return this;
  }

  application(index = 1, id = 'SuuntoplusFitExt'): this {
    return this.message(207, [byte(3, index), { number: 1, type: 13, bytes: [...new TextEncoder().encode(id)] }]);
  }

  descriptions(index = 1, ownerField = 2, externalField = 3): this {
    this.description(index, ownerField, 'suuntoplus_plugin_owner_id');
    return this.description(index, externalField, 'suuntoplus_plugin_external_id');
  }

  description(index: number, field: number, name: string, type = 7): this {
    return this.message(206, [byte(0, index), byte(1, field), byte(2, type), stringField(3, name)]);
  }

  finish(headerSize = 14): Uint8Array {
    const bytes = new Uint8Array(headerSize + this.data.length + 2);
    const view = new DataView(bytes.buffer);
    bytes.set([headerSize, 0x20, 0, 0]);
    view.setUint32(4, this.data.length, true);
    bytes.set([46, 70, 73, 84], 8); // .FIT
    if (headerSize === 14) view.setUint16(12, FitEncoder.calculateCRC(bytes.subarray(0, 12)), true);
    bytes.set(this.data, headerSize);
    view.setUint16(bytes.length - 2, FitEncoder.calculateCRC(bytes.subarray(0, -2)), true);
    return bytes;
  }
}
