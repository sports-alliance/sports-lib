import { SerializableClassInterface } from '../serializable/serializable.class.interface';

export interface CompressedStreamInterface extends SerializableClassInterface {
  compressionMethod: 'lz-string' | 'Pako' | 'Pako -> lz-string'
}
