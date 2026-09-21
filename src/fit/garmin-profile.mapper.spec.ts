import { createHash } from 'node:crypto';
import { GarminManufacturers, GarminProducts, GarminSports, GarminSubSports } from './fit-profile.data';
import { GarminProfileMapper } from './garmin-profile.mapper';

const getMappingFingerprint = (mapping: Record<number, string>): string =>
  createHash('sha256')
    .update(JSON.stringify(Object.entries(mapping).sort(([left], [right]) => Number(left) - Number(right))))
    .digest('hex');

describe('GarminProfileMapper', () => {
  it('preserves the complete maintained mapping tables', () => {
    const mappings = {
      manufacturers: GarminManufacturers,
      products: GarminProducts,
      sports: GarminSports,
      subSports: GarminSubSports
    };

    expect(
      Object.fromEntries(Object.entries(mappings).map(([name, mapping]) => [name, Object.keys(mapping).length]))
    ).toEqual({
      manufacturers: 233,
      products: 474,
      sports: 69,
      subSports: 91
    });
    expect(
      Object.fromEntries(Object.entries(mappings).map(([name, mapping]) => [name, getMappingFingerprint(mapping)]))
    ).toEqual({
      manufacturers: '5abbd89f240c95003aba698111c19d306264ec2e8bd92777786e8f5cdeb869d1',
      products: '09dbb64f6fb130e2e47931b0fbf12910af30e4970f3f25af198dff11b4a163d1',
      sports: 'ae5373b9b35691d3c678efd0ba3b051c5cdc718c61c6bb04c99da741cd3cf33e',
      subSports: '66f429138f18eec8b4b61d7ce13a5fed5ef67c40bf520fd64bb4ab28a0d69928'
    });
  });

  describe('getDeviceName', () => {
    it('should preserve MTB acronym for Garmin Edge MTB', () => {
      expect(GarminProfileMapper.getDeviceName(4655)).toBe('Edge MTB');
    });
  });

  describe('getSportName', () => {
    it('should translate sport ID', () => {
      // Assuming ID 1 is Running
      expect(GarminProfileMapper.getSportName(1)).toBe('running');
    });

    it('should return null for unknown sport', () => {
      expect(GarminProfileMapper.getSportName(99999)).toBeNull();
    });

    it('should return names in snake_case (regression check for extraction logic)', () => {
      expect(GarminProfileMapper.getSportName(4)).toBe('fitness_equipment');
    });
  });

  describe('getSubSportName', () => {
    it('should translate sub sport ID', () => {
      // Assuming ID 1 is Treadmill
      expect(GarminProfileMapper.getSubSportName(1)).toBe('treadmill');
    });

    it('should return names in snake_case (regression check for extraction logic)', () => {
      expect(GarminProfileMapper.getSubSportName(6)).toBe('indoor_cycling');
    });

    it('should correctly map Enduro and Downhill MTB (IDs 153/154)', () => {
      // ID 153 = mountain_enduro
      expect(GarminProfileMapper.getSubSportName(153)).toBe('mountain_enduro');
      // ID 154 = mountain_downhill
      expect(GarminProfileMapper.getSubSportName(154)).toBe('mountain_downhill');
    });
  });
});
