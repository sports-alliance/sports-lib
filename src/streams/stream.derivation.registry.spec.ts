import { DataAltitude } from '../data/data.altitude';
import { DataAltitudeSmooth } from '../data/data.altitude-smooth';
import { DataDistance } from '../data/data.distance';
import { DataGrade } from '../data/data.grade';
import { DataPace } from '../data/data.pace';
import { DataSpeed } from '../data/data.speed';
import {
  canDeriveStreamType,
  getDependencyTypesForResolution,
  getStreamDerivationRule,
  getStreamDerivationRules
} from './stream.derivation.registry';

describe('stream.derivation.registry', () => {
  it('should expose unique targets', () => {
    const rules = getStreamDerivationRules();
    const targets = new Set(rules.map(rule => rule.provides));
    expect(targets.size).toBe(rules.length);
  });

  it('should define Pace dependency on Speed', () => {
    const rule = getStreamDerivationRule(DataPace.type);
    expect(rule).not.toBeNull();
    expect(rule?.requiresAll).toEqual([DataSpeed.type]);
  });

  it('should resolve Grade dependencies including one-of candidates', () => {
    const dependencies = new Set(getDependencyTypesForResolution(DataGrade.type));
    expect(dependencies).toEqual(new Set([DataDistance.type, DataAltitude.type, DataAltitudeSmooth.type]));
  });

  it('should allow deriving Grade when one-of requirement is satisfied', () => {
    expect(
      canDeriveStreamType(DataGrade.type, streamType => {
        return streamType === DataDistance.type || streamType === DataAltitude.type;
      })
    ).toBe(true);

    expect(
      canDeriveStreamType(DataGrade.type, streamType => {
        return streamType === DataDistance.type;
      })
    ).toBe(false);
  });
});
