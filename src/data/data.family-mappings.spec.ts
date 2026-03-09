import { DynamicDataLoader } from './data.store';
import { DataFlow } from './data.flow';
import { DataAvgFlow } from './data.avg-flow';
import { DataGrit } from './data.grit';
import { DataAvgGrit } from './data.avg-grit';
import { DataVerticalOscillation } from './data.vertical-oscillation';
import { DataVerticalOscillationAvg } from './data.vertical-oscillation-avg';
import { DataVerticalOscillationMin } from './data.vertical-oscillation-min';
import { DataVerticalOscillationMax } from './data.vertical-oscillation-max';
import {
  DataVerticalSpeed,
  DataVerticalSpeedFeetPerSecond,
  DataVerticalSpeedMetersPerMinute,
  DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedFeetPerHour,
  DataVerticalSpeedKilometerPerHour,
  DataVerticalSpeedMilesPerHour
} from './data.vertical-speed';
import {
  DataVerticalSpeedAvg,
  DataVerticalSpeedAvgFeetPerSecond,
  DataVerticalSpeedAvgMetersPerMinute,
  DataVerticalSpeedAvgFeetPerMinute,
  DataVerticalSpeedAvgMetersPerHour,
  DataVerticalSpeedAvgFeetPerHour,
  DataVerticalSpeedAvgKilometerPerHour,
  DataVerticalSpeedAvgMilesPerHour
} from './data.vertical-speed-avg';
import {
  DataVerticalSpeedMin,
  DataVerticalSpeedMinFeetPerSecond,
  DataVerticalSpeedMinMetersPerMinute,
  DataVerticalSpeedMinFeetPerMinute,
  DataVerticalSpeedMinMetersPerHour,
  DataVerticalSpeedMinFeetPerHour,
  DataVerticalSpeedMinKilometerPerHour,
  DataVerticalSpeedMinMilesPerHour
} from './data.vertical-speed-min';
import {
  DataVerticalSpeedMax,
  DataVerticalSpeedMaxFeetPerSecond,
  DataVerticalSpeedMaxMetersPerMinute,
  DataVerticalSpeedMaxFeetPerMinute,
  DataVerticalSpeedMaxMetersPerHour,
  DataVerticalSpeedMaxFeetPerHour,
  DataVerticalSpeedMaxKilometerPerHour,
  DataVerticalSpeedMaxMilesPerHour
} from './data.vertical-speed-max';
import { DataJumpDistance } from './data.jump-distance';
import { DataDistance, DataDistanceMiles } from './data.distance';
import { DataGNSSDistance } from './data.gnss-distance';
import { DataGNSSDistanceMiles } from './data.gnss-distance-miles';
import { DataAutoLapDistance } from './data.auto-lap-distance';
import { DataAvgStrokeDistance } from './data.avg-stroke-distance';
import { DataAvgStrideLength } from './data.avg-stride-length';
import { DataStepLength } from './data.step-length';
import { DataTargetDistance } from './data.target-distance';
import { DataStrydDistance } from './data.stryd-distance';
import {
  DataJumpDistanceAvg,
  DataJumpDistanceMin,
  DataJumpDistanceMax,
  DataJumpHangTimeAvg,
  DataJumpHangTimeMin,
  DataJumpHangTimeMax,
  DataJumpHeightAvg,
  DataJumpHeightMin,
  DataJumpHeightMax,
  DataJumpSpeedAvg,
  DataJumpSpeedAvgFeetPerSecond,
  DataJumpSpeedAvgKilometersPerHour,
  DataJumpSpeedAvgKnots,
  DataJumpSpeedAvgMilesPerHour,
  DataJumpSpeedMin,
  DataJumpSpeedMinFeetPerSecond,
  DataJumpSpeedMinKilometersPerHour,
  DataJumpSpeedMinKnots,
  DataJumpSpeedMinMilesPerHour,
  DataJumpSpeedMax,
  DataJumpSpeedMaxFeetPerSecond,
  DataJumpSpeedMaxKilometersPerHour,
  DataJumpSpeedMaxKnots,
  DataJumpSpeedMaxMilesPerHour,
  DataJumpRotationsAvg,
  DataJumpRotationsMin,
  DataJumpRotationsMax,
  DataJumpScoreAvg,
  DataJumpScoreMin,
  DataJumpScoreMax
} from './data.jump-stats';

const getBaseTypeFromStatType = (type: string): string => type.replace(/^(Average|Minimum|Maximum)\s+/i, '');

describe('DynamicDataLoader family mappings', () => {
  it('maps Flow and Grit to average families', () => {
    expect(DynamicDataLoader.dataTypeAvgDataType[DataFlow.type]).toBe(DataAvgFlow.type);
    expect(DynamicDataLoader.dataTypeAvgDataType[DataGrit.type]).toBe(DataAvgGrit.type);
  });

  it('maps Vertical Oscillation family to avg/min/max canonical names', () => {
    expect(DynamicDataLoader.dataTypeAvgDataType[DataVerticalOscillation.type]).toBe(DataVerticalOscillationAvg.type);
    expect(DynamicDataLoader.dataTypeMinDataType[DataVerticalOscillation.type]).toBe(DataVerticalOscillationMin.type);
    expect(DynamicDataLoader.dataTypeMaxDataType[DataVerticalOscillation.type]).toBe(DataVerticalOscillationMax.type);
  });

  it('maps Vertical Speed family and unit-derived variants to avg/min/max canonical names', () => {
    expect(DynamicDataLoader.dataTypeAvgDataType[DataVerticalSpeed.type]).toBe(DataVerticalSpeedAvg.type);
    expect(DynamicDataLoader.dataTypeMinDataType[DataVerticalSpeed.type]).toBe(DataVerticalSpeedMin.type);
    expect(DynamicDataLoader.dataTypeMaxDataType[DataVerticalSpeed.type]).toBe(DataVerticalSpeedMax.type);

    expect(DynamicDataLoader.dataTypeAvgDataType[DataVerticalSpeedFeetPerSecond.type]).toBe(
      DataVerticalSpeedAvgFeetPerSecond.type
    );
    expect(DynamicDataLoader.dataTypeMinDataType[DataVerticalSpeedFeetPerSecond.type]).toBe(
      DataVerticalSpeedMinFeetPerSecond.type
    );
    expect(DynamicDataLoader.dataTypeMaxDataType[DataVerticalSpeedFeetPerSecond.type]).toBe(
      DataVerticalSpeedMaxFeetPerSecond.type
    );

    expect(DynamicDataLoader.dataTypeAvgDataType[DataVerticalSpeedMetersPerMinute.type]).toBe(
      DataVerticalSpeedAvgMetersPerMinute.type
    );
    expect(DynamicDataLoader.dataTypeMinDataType[DataVerticalSpeedMetersPerMinute.type]).toBe(
      DataVerticalSpeedMinMetersPerMinute.type
    );
    expect(DynamicDataLoader.dataTypeMaxDataType[DataVerticalSpeedMetersPerMinute.type]).toBe(
      DataVerticalSpeedMaxMetersPerMinute.type
    );

    expect(DynamicDataLoader.dataTypeAvgDataType[DataVerticalSpeedFeetPerMinute.type]).toBe(
      DataVerticalSpeedAvgFeetPerMinute.type
    );
    expect(DynamicDataLoader.dataTypeMinDataType[DataVerticalSpeedFeetPerMinute.type]).toBe(
      DataVerticalSpeedMinFeetPerMinute.type
    );
    expect(DynamicDataLoader.dataTypeMaxDataType[DataVerticalSpeedFeetPerMinute.type]).toBe(
      DataVerticalSpeedMaxFeetPerMinute.type
    );

    expect(DynamicDataLoader.dataTypeAvgDataType[DataVerticalSpeedMetersPerHour.type]).toBe(
      DataVerticalSpeedAvgMetersPerHour.type
    );
    expect(DynamicDataLoader.dataTypeMinDataType[DataVerticalSpeedMetersPerHour.type]).toBe(
      DataVerticalSpeedMinMetersPerHour.type
    );
    expect(DynamicDataLoader.dataTypeMaxDataType[DataVerticalSpeedMetersPerHour.type]).toBe(
      DataVerticalSpeedMaxMetersPerHour.type
    );

    expect(DynamicDataLoader.dataTypeAvgDataType[DataVerticalSpeedFeetPerHour.type]).toBe(
      DataVerticalSpeedAvgFeetPerHour.type
    );
    expect(DynamicDataLoader.dataTypeMinDataType[DataVerticalSpeedFeetPerHour.type]).toBe(
      DataVerticalSpeedMinFeetPerHour.type
    );
    expect(DynamicDataLoader.dataTypeMaxDataType[DataVerticalSpeedFeetPerHour.type]).toBe(
      DataVerticalSpeedMaxFeetPerHour.type
    );

    expect(DynamicDataLoader.dataTypeAvgDataType[DataVerticalSpeedKilometerPerHour.type]).toBe(
      DataVerticalSpeedAvgKilometerPerHour.type
    );
    expect(DynamicDataLoader.dataTypeMinDataType[DataVerticalSpeedKilometerPerHour.type]).toBe(
      DataVerticalSpeedMinKilometerPerHour.type
    );
    expect(DynamicDataLoader.dataTypeMaxDataType[DataVerticalSpeedKilometerPerHour.type]).toBe(
      DataVerticalSpeedMaxKilometerPerHour.type
    );

    expect(DynamicDataLoader.dataTypeAvgDataType[DataVerticalSpeedMilesPerHour.type]).toBe(
      DataVerticalSpeedAvgMilesPerHour.type
    );
    expect(DynamicDataLoader.dataTypeMinDataType[DataVerticalSpeedMilesPerHour.type]).toBe(
      DataVerticalSpeedMinMilesPerHour.type
    );
    expect(DynamicDataLoader.dataTypeMaxDataType[DataVerticalSpeedMilesPerHour.type]).toBe(
      DataVerticalSpeedMaxMilesPerHour.type
    );
  });

  it('maps Jump Distance family to avg/min/max canonical names', () => {
    expect(DynamicDataLoader.dataTypeAvgDataType[DataJumpDistance.type]).toBe(DataJumpDistanceAvg.type);
    expect(DynamicDataLoader.dataTypeMinDataType[DataJumpDistance.type]).toBe(DataJumpDistanceMin.type);
    expect(DynamicDataLoader.dataTypeMaxDataType[DataJumpDistance.type]).toBe(DataJumpDistanceMax.type);
  });

  it('maps all jump families to avg/min/max canonical names', () => {
    const jumpFamilyMappings = [
      {
        base: DataJumpDistance.type,
        avg: DataJumpDistanceAvg.type,
        min: DataJumpDistanceMin.type,
        max: DataJumpDistanceMax.type
      },
      {
        base: 'Jump Hang Time',
        avg: DataJumpHangTimeAvg.type,
        min: DataJumpHangTimeMin.type,
        max: DataJumpHangTimeMax.type
      },
      {
        base: 'Jump Height',
        avg: DataJumpHeightAvg.type,
        min: DataJumpHeightMin.type,
        max: DataJumpHeightMax.type
      },
      {
        base: 'Jump Speed',
        avg: DataJumpSpeedAvg.type,
        min: DataJumpSpeedMin.type,
        max: DataJumpSpeedMax.type
      },
      {
        base: 'Jump Rotations',
        avg: DataJumpRotationsAvg.type,
        min: DataJumpRotationsMin.type,
        max: DataJumpRotationsMax.type
      },
      {
        base: 'Jump Score',
        avg: DataJumpScoreAvg.type,
        min: DataJumpScoreMin.type,
        max: DataJumpScoreMax.type
      }
    ];

    jumpFamilyMappings.forEach(({ base, avg, min, max }) => {
      expect(DynamicDataLoader.dataTypeAvgDataType[base]).toBe(avg);
      expect(DynamicDataLoader.dataTypeMinDataType[base]).toBe(min);
      expect(DynamicDataLoader.dataTypeMaxDataType[base]).toBe(max);
    });
  });

  it('maps jump speed families in unit groups to jump-specific unit targets', () => {
    expect(
      DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedAvg.type][DataJumpSpeedAvgKilometersPerHour.type]
    ).toBeDefined();
    expect(
      DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedAvg.type][DataJumpSpeedAvgMilesPerHour.type]
    ).toBeDefined();
    expect(
      DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedAvg.type][DataJumpSpeedAvgFeetPerSecond.type]
    ).toBeDefined();
    expect(DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedAvg.type][DataJumpSpeedAvgKnots.type]).toBeDefined();

    expect(
      DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedMin.type][DataJumpSpeedMinKilometersPerHour.type]
    ).toBeDefined();
    expect(
      DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedMin.type][DataJumpSpeedMinMilesPerHour.type]
    ).toBeDefined();
    expect(
      DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedMin.type][DataJumpSpeedMinFeetPerSecond.type]
    ).toBeDefined();
    expect(DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedMin.type][DataJumpSpeedMinKnots.type]).toBeDefined();

    expect(
      DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedMax.type][DataJumpSpeedMaxKilometersPerHour.type]
    ).toBeDefined();
    expect(
      DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedMax.type][DataJumpSpeedMaxMilesPerHour.type]
    ).toBeDefined();
    expect(
      DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedMax.type][DataJumpSpeedMaxFeetPerSecond.type]
    ).toBeDefined();
    expect(DynamicDataLoader.dataTypeUnitGroups[DataJumpSpeedMax.type][DataJumpSpeedMaxKnots.type]).toBeDefined();
  });

  it('maps jump speed unit-derived families to jump-specific avg/min/max variants', () => {
    const jumpSpeedMphBaseType = getBaseTypeFromStatType(DataJumpSpeedAvgMilesPerHour.type);
    const jumpSpeedKphBaseType = getBaseTypeFromStatType(DataJumpSpeedAvgKilometersPerHour.type);

    expect(DynamicDataLoader.dataTypeAvgDataType[jumpSpeedMphBaseType]).toBe(DataJumpSpeedAvgMilesPerHour.type);
    expect(DynamicDataLoader.dataTypeMinDataType[jumpSpeedMphBaseType]).toBe(DataJumpSpeedMinMilesPerHour.type);
    expect(DynamicDataLoader.dataTypeMaxDataType[jumpSpeedMphBaseType]).toBe(DataJumpSpeedMaxMilesPerHour.type);

    expect(DynamicDataLoader.dataTypeAvgDataType[jumpSpeedKphBaseType]).toBe(DataJumpSpeedAvgKilometersPerHour.type);
    expect(DynamicDataLoader.dataTypeMinDataType[jumpSpeedKphBaseType]).toBe(DataJumpSpeedMinKilometersPerHour.type);
    expect(DynamicDataLoader.dataTypeMaxDataType[jumpSpeedKphBaseType]).toBe(DataJumpSpeedMaxKilometersPerHour.type);
  });

  it('maps jump distance family in unit groups to distance conversion targets', () => {
    const jumpDistanceFamilyTypes = [
      DataJumpDistance.type,
      DataJumpDistanceMin.type,
      DataJumpDistanceMax.type,
      DataJumpDistanceAvg.type
    ];

    jumpDistanceFamilyTypes.forEach(jumpDistanceType => {
      expect(DynamicDataLoader.dataTypeUnitGroups[jumpDistanceType]).toBeDefined();
      expect(DynamicDataLoader.dataTypeUnitGroups[jumpDistanceType][DataDistanceMiles.type]).toBeDefined();
    });
  });

  it('maps all distance-derived families in unit groups to miles conversion targets', () => {
    const mappedDistanceTypes = [
      DataDistance.type,
      DataGNSSDistance.type,
      DataAutoLapDistance.type,
      DataAvgStrokeDistance.type,
      DataAvgStrideLength.type,
      DataStepLength.type,
      DataTargetDistance.type,
      DataStrydDistance.type
    ];

    mappedDistanceTypes.forEach(distanceType => {
      expect(DynamicDataLoader.dataTypeUnitGroups[distanceType]).toBeDefined();
      const expectedImperialDistanceType = distanceType === DataGNSSDistance.type
        ? DataGNSSDistanceMiles.type
        : DataDistanceMiles.type;
      expect(DynamicDataLoader.dataTypeUnitGroups[distanceType][expectedImperialDistanceType]).toBeDefined();
    });
  });
});
