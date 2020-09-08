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
  UInt8Array = 'UInt8Array',
}

export enum CompressionMethods {
  None = 'None',
  Pako = 'Pako',
}
