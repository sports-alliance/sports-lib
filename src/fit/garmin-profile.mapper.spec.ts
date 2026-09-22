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
      manufacturers: 243,
      products: 479,
      sports: 82,
      subSports: 114
    });
    expect(
      Object.fromEntries(Object.entries(mappings).map(([name, mapping]) => [name, getMappingFingerprint(mapping)]))
    ).toEqual({
      manufacturers: 'a88a37d6b6b4502a3910628e8fab27a835711cbbf8ece0432dca157ca046f472',
      products: 'b19589016f09f72d8118554fe4a2469673f0d75bac828fc1e846949f1f29fb82',
      sports: 'c3afd60238fca4f98f6a6de44b4348530124680b9a1b5b8ec710c2d9cf95ed27',
      subSports: 'c0bf27dff0d313b8d490f61dff0c697d2cf4b9157dfe1ed38f4e148c9481f84d'
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
