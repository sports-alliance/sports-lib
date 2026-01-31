import { GarminProfileMapper } from './importer.fit.garmin.profile.mapper';

describe('GarminProfileMapper', () => {
  describe('getSportName', () => {
    it('should translate sport ID', () => {
      // Assuming ID 1 is Running
      expect(GarminProfileMapper.getSportName(1)).toBe('running');
    });

    it('should return null for unknown sport', () => {
      expect(GarminProfileMapper.getSportName(99999)).toBeNull();
    });

    it('should return names in snake_case (regression check for extraction logic)', () => {
      // Checking ID 4 which is 'fitness_equipment' (was 'fitnessEquipment' in raw SDK)
      expect(GarminProfileMapper.getSportName(4)).toBe('fitness_equipment');
    });
  });

  describe('getSubSportName', () => {
    it('should translate sub sport ID', () => {
      // Assuming ID 1 is Treadmill
      expect(GarminProfileMapper.getSubSportName(1)).toBe('treadmill');
    });

    it('should return names in snake_case (regression check for extraction logic)', () => {
      // Checking ID 6 which is 'indoor_cycling' (was 'indoorCycling' in raw SDK)
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
