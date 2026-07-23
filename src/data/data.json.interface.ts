import { DataPositionInterface } from './data.position.interface';
import type { DurabilityEvidenceValue } from './data.durability-evidence';
import type { ThreeDimensionalStrainEvidenceValue } from './data.three-dimensional-strain-evidence';

export type DataJSONPrimitive = number | boolean | string | null;
export type DataJSONValue =
  | DataJSONPrimitive
  | DataPositionInterface
  | DurabilityEvidenceValue
  | ThreeDimensionalStrainEvidenceValue
  | DataJSONValue[]
  | { [key: string]: DataJSONValue };

export interface DataJSONInterface {
  [type: string]: DataJSONValue;
}
