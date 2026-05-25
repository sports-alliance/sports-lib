import { DynamicDataLoader } from './data.store';
import {
  DataBeginningPotentialStamina,
  DataEndingPotentialStamina,
  DataPotentialStamina,
  DataPotentialStaminaAvg,
  DataPotentialStaminaMax,
  DataPotentialStaminaMin,
  DataStamina,
  DataStaminaAvg,
  DataStaminaMax,
  DataStaminaMin
} from './data.stamina';

describe('Garmin stamina data types', () => {
  it('should expose Garmin stamina metrics as percent values', () => {
    expect(DataStamina.type).toBe('Stamina');
    expect(DataPotentialStamina.type).toBe('Potential Stamina');
    expect(DataBeginningPotentialStamina.type).toBe('Beginning Potential Stamina');
    expect(DataEndingPotentialStamina.type).toBe('Ending Potential Stamina');
    expect(DataStamina.unit).toBe('%');
    expect(DataPotentialStamina.unit).toBe('%');
  });

  it('should register min/max/avg families for stamina streams', () => {
    expect(DynamicDataLoader.dataTypeMinDataType[DataStamina.type]).toBe(DataStaminaMin.type);
    expect(DynamicDataLoader.dataTypeMaxDataType[DataStamina.type]).toBe(DataStaminaMax.type);
    expect(DynamicDataLoader.dataTypeAvgDataType[DataStamina.type]).toBe(DataStaminaAvg.type);

    expect(DynamicDataLoader.dataTypeMinDataType[DataPotentialStamina.type]).toBe(DataPotentialStaminaMin.type);
    expect(DynamicDataLoader.dataTypeMaxDataType[DataPotentialStamina.type]).toBe(DataPotentialStaminaMax.type);
    expect(DynamicDataLoader.dataTypeAvgDataType[DataPotentialStamina.type]).toBe(DataPotentialStaminaAvg.type);
  });
});
