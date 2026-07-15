import { DataPositionInterface } from './data.position.interface';
import type { DurabilityEvidenceValue } from './data.durability-evidence';

export type DataJSONPrimitive = number | boolean | string | null;
export type DataJSONValue =
  | DataJSONPrimitive
  | DataPositionInterface
  | DurabilityEvidenceValue
  | DataJSONValue[]
  | { [key: string]: DataJSONValue };

export interface DataJSONInterface {
  [type: string]: DataJSONValue;
}
