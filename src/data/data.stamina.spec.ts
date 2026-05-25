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

  it('should round stamina display values without changing raw values', () => {
    const stamina = new DataStaminaAvg(68.23456789);
    const potentialStamina = new DataPotentialStaminaAvg(79.87654321);

    expect(stamina.getValue()).toBe(68.23456789);
    expect(stamina.getDisplayValue()).toBe(68.2);
    expect(potentialStamina.getValue()).toBe(79.87654321);
    expect(potentialStamina.getDisplayValue()).toBe(79.9);
  });
});
