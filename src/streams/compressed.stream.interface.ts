import { StreamJSONInterface } from './stream';

export interface CompressedJSONStreamInterface extends StreamJSONInterface {
  type: string
  data: any
  compressionMethod: CompressionMethods
  encoding: CompressionEncodings
}

export enum CompressionEncodings {
  None = 'None',
  Binary = 'Binary',
  base64 = 'base64',
  UInt8 = 'Uint8',
}

export enum CompressionMethods {
  None = 'None',
  Pako = 'Pako',
}
