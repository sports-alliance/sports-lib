import * as fs from 'fs';
import * as path from 'path';
import { FITSampleMapper } from './importer.fit.mapper';
import { DataGroundTime } from '../../../../data/data.ground-time';
import { DataGroundContactTime } from '../../../../data/data.ground-contact-time';
import { DataGroundContactTimeBalanceLeft } from '../../../../data/data-ground-contact-time-balance-left';
import { DataGroundContactTimeBalanceRight } from '../../../../data/data-ground-contact-time-balance-right';
import { DataGroundContactTimePercentage } from '../../../../data/data.running-dynamics';
import { DataEffortPace } from '../../../../data/data.effort-pace';
import { DataPowerBalanceLeft } from '../../../../data/data.power-balance-left';
import { DataPowerBalanceRight } from '../../../../data/data.power-balance-right';
import { DataPotentialStamina, DataStamina } from '../../../../data/data.stamina';
import { DataDepth } from '../../../../data/data.depth';
import {
  DataAirTimeRemaining,
  DataCNSLoad,
  DataDiveAscentRate,
  DataN2Load,
  DataNextStopDepth,
  DataNextStopTime,
  DataNoDecompressionLimit,
  DataPO2,
  DataPressureSAC,
  DataRMV,
  DataTimeToSurface,
  DataVolumeSAC
} from '../../../../data/data.dive';
import { EventImporterFIT } from './importer.fit';
import { convertSpeedToPace } from '../../../utilities/helpers';
import {
  DataImpactLoadingRateBalanceLeft,
  DataImpactLoadingRateBalanceRight,
  DataLegSpringStiffnessBalanceLeft,
  DataLegSpringStiffnessBalanceRight,
  DataVerticalOscillationBalanceLeft,
  DataVerticalOscillationBalanceRight
} from '../../../../data/data.running-dynamics-balance';

describe('FITSampleMapper', () => {
  it('retains SDK-scaled FIT record depth in canonical meters', () => {
    const mapper = FITSampleMapper.find(m => m.dataType === DataDepth.type);

    expect(mapper).toBeDefined();
    expect(mapper!.getSampleValue({ depth: 3.86 })).toBe(3.86);
    expect(mapper!.getSampleValue({ depth: 0 })).toBe(0);
    expect(mapper!.getSampleValue({ depth: -1 })).toBe(-1);
    expect(mapper!.getSampleValue({ depth: Number.NaN })).toBeNull();
  });

  it('maps native FIT dive record fields without deriving or plausibility filtering', () => {
    const sample = {
      next_stop_depth: 3,
      next_stop_time: 60,
      time_to_surface: 300,
      ndl_time: 900,
      cns_load: 12,
      n2_load: 34,
      air_time_remaining: 4_294_961_197,
      pressure_sac: 12.34,
      volume_sac: 23.45,
      rmv: 34.56,
      po2: 0.21,
      ascent_rate: -0.287
    };
    const valueFor = (dataType: string) => {
      const mapper = FITSampleMapper.find(item => item.dataType === dataType);
      expect(mapper).toBeDefined();
      return mapper!.getSampleValue(sample);
    };

    expect(valueFor(DataNextStopDepth.type)).toBe(3);
    expect(valueFor(DataNextStopTime.type)).toBe(60);
    expect(valueFor(DataTimeToSurface.type)).toBe(300);
    expect(valueFor(DataNoDecompressionLimit.type)).toBe(900);
    expect(valueFor(DataCNSLoad.type)).toBe(12);
    expect(valueFor(DataN2Load.type)).toBe(34);
    expect(valueFor(DataAirTimeRemaining.type)).toBe(4_294_961_197);
    expect(valueFor(DataPressureSAC.type)).toBe(12.34);
    expect(valueFor(DataVolumeSAC.type)).toBe(23.45);
    expect(valueFor(DataRMV.type)).toBe(34.56);
    expect(valueFor(DataPO2.type)).toBe(0.21);
    expect(valueFor(DataDiveAscentRate.type)).toBe(-0.287);
  });

  it('imports the Garmin snorkeling fixture as a meter-based depth stream', async () => {
    const fixturePath = path.resolve(__dirname, '../../../../../samples/fit/2025-08-27_10-52.fit');
    const fileBuffer = fs.readFileSync(fixturePath);
    const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);

    const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer);
    const values = event
      .getFirstActivity()
      .getStreamData(DataDepth.type)
      .filter(value => Number.isFinite(value)) as number[];

    expect(values.length).toBeGreaterThan(700);
    expect(Math.max(...values)).toBeCloseTo(3.86, 2);
  });

  it('should map Ground Time as milliseconds without scaling', () => {
    const mapper = FITSampleMapper.find(m => m.dataType === DataGroundTime.type);
    expect(mapper).toBeDefined();

    const mapped = mapper!.getSampleValue({ 'Ground Time': 1216 });
    expect(mapped).toBe(1216);
  });

  it('should map Ground Contact Time from stance_time', () => {
    const mapper = FITSampleMapper.find(m => m.dataType === DataGroundContactTime.type);
    expect(mapper).toBeDefined();

    const mapped = mapper!.getSampleValue({ stance_time: 296 });
    expect(mapped).toBe(296);
  });

  it('should map Ground Contact Time from Ground Time as fallback when stance_time is missing', () => {
    const mapper = FITSampleMapper.find(m => m.dataType === DataGroundContactTime.type);
    expect(mapper).toBeDefined();

    const mapped = mapper!.getSampleValue({ 'Ground Time': 1216 });
    expect(mapped).toBe(1216);
  });

  it('should prefer stance_time over Ground Time when both are present', () => {
    const mapper = FITSampleMapper.find(m => m.dataType === DataGroundContactTime.type);
    expect(mapper).toBeDefined();

    const mapped = mapper!.getSampleValue({ stance_time: 296, 'Ground Time': 1216 });
    expect(mapped).toBe(296);
  });

  it('should map positive FIT stance_time_percent values to Ground Contact Time Percentage', () => {
    const mapper = FITSampleMapper.find(m => m.dataType === DataGroundContactTimePercentage.type);
    expect(mapper).toBeDefined();

    expect(mapper!.getSampleValue({ stance_time_percent: 37.11 })).toBe(37.11);
    expect(mapper!.getSampleValue({ stance_time_percent: 0 })).toBeNull();
    expect(mapper!.getSampleValue({ stance_time_percent: Number.NaN })).toBeNull();
    expect(mapper!.getSampleValue({ stance_time_percent: Number.POSITIVE_INFINITY })).toBeNull();
    expect(mapper!.getSampleValue({ stance_time_percent: 100.01 })).toBeNull();
  });

  it('should treat zero Ground Contact Time balance samples as missing', () => {
    const leftMapper = FITSampleMapper.find(m => m.dataType === DataGroundContactTimeBalanceLeft.type);
    const rightMapper = FITSampleMapper.find(m => m.dataType === DataGroundContactTimeBalanceRight.type);

    expect(leftMapper).toBeDefined();
    expect(rightMapper).toBeDefined();
    expect(leftMapper!.getSampleValue({ stance_time_balance: 51.25 })).toBe(51.25);
    expect(rightMapper!.getSampleValue({ stance_time_balance: 51.25 })).toBe(48.75);
    expect(leftMapper!.getSampleValue({ stance_time_balance: 0 })).toBeNull();
    expect(rightMapper!.getSampleValue({ stance_time_balance: 0 })).toBeNull();
    expect(leftMapper!.getSampleValue({ stance_time_balance: Number.POSITIVE_INFINITY })).toBeNull();
    expect(rightMapper!.getSampleValue({ stance_time_balance: 100.01 })).toBeNull();
  });

  it('should map FIT left_right_balance to canonical power balance fields', () => {
    const leftMapper = FITSampleMapper.find(m => m.dataType === DataPowerBalanceLeft.type);
    const rightMapper = FITSampleMapper.find(m => m.dataType === DataPowerBalanceRight.type);

    expect(leftMapper).toBeDefined();
    expect(rightMapper).toBeDefined();
    expect(leftMapper!.getSampleValue({ left_right_balance: { right: false, value: 51.25 } })).toBe(51.25);
    expect(rightMapper!.getSampleValue({ left_right_balance: { right: false, value: 51.25 } })).toBe(48.75);
    expect(leftMapper!.getSampleValue({ left_right_balance: { right: true, value: 48.75 } })).toBe(51.25);
    expect(rightMapper!.getSampleValue({ left_right_balance: { right: true, value: 48.75 } })).toBe(48.75);
  });

  it('should map Stryd Duo balance fields as left/right pairs', () => {
    const sample = {
      'Vertical Oscillation Balance': 48.75,
      'Leg Spring Stiffness Balance': 47.5,
      'Impact Loading Rate Balance': 50.25
    };

    expect(
      FITSampleMapper.find(m => m.dataType === DataVerticalOscillationBalanceLeft.type)!.getSampleValue(sample)
    ).toBe(48.75);
    expect(
      FITSampleMapper.find(m => m.dataType === DataVerticalOscillationBalanceRight.type)!.getSampleValue(sample)
    ).toBe(51.25);
    expect(
      FITSampleMapper.find(m => m.dataType === DataLegSpringStiffnessBalanceLeft.type)!.getSampleValue(sample)
    ).toBe(47.5);
    expect(
      FITSampleMapper.find(m => m.dataType === DataLegSpringStiffnessBalanceRight.type)!.getSampleValue(sample)
    ).toBe(52.5);
    expect(
      FITSampleMapper.find(m => m.dataType === DataImpactLoadingRateBalanceLeft.type)!.getSampleValue(sample)
    ).toBe(50.25);
    expect(
      FITSampleMapper.find(m => m.dataType === DataImpactLoadingRateBalanceRight.type)!.getSampleValue(sample)
    ).toBe(49.75);
  });

  it('should treat zero Stryd Duo balance samples as missing', () => {
    const sample = {
      'Vertical Oscillation Balance': 0,
      'Leg Spring Stiffness Balance': 0,
      'Impact Loading Rate Balance': 0
    };

    expect(
      FITSampleMapper.find(m => m.dataType === DataVerticalOscillationBalanceLeft.type)!.getSampleValue(sample)
    ).toBeNull();
    expect(
      FITSampleMapper.find(m => m.dataType === DataVerticalOscillationBalanceRight.type)!.getSampleValue(sample)
    ).toBeNull();
    expect(
      FITSampleMapper.find(m => m.dataType === DataLegSpringStiffnessBalanceLeft.type)!.getSampleValue(sample)
    ).toBeNull();
    expect(
      FITSampleMapper.find(m => m.dataType === DataLegSpringStiffnessBalanceRight.type)!.getSampleValue(sample)
    ).toBeNull();
    expect(
      FITSampleMapper.find(m => m.dataType === DataImpactLoadingRateBalanceLeft.type)!.getSampleValue(sample)
    ).toBeNull();
    expect(
      FITSampleMapper.find(m => m.dataType === DataImpactLoadingRateBalanceRight.type)!.getSampleValue(sample)
    ).toBeNull();
  });

  it('should keep Ground Time stream values in ms when importing a FIT file', async () => {
    const fixturePath = path.resolve(__dirname, '../../../../specs/fixtures/runs/fit/6782987395.fit');
    const fileBuffer = fs.readFileSync(fixturePath);
    const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);

    const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer);
    const activity = event.getFirstActivity();
    const values = activity.getStreamData(DataGroundTime.type).filter(value => Number.isFinite(value)) as number[];

    expect(values.length).toBeGreaterThan(0);
    expect(values[0]).toBe(1216);
    expect(values[0]).toBeGreaterThan(100);
  });

  it('should populate Ground Contact Time stream from Ground Time fallback when stance_time is absent', async () => {
    const fixturePath = path.resolve(__dirname, '../../../../specs/fixtures/runs/fit/6782987395.fit');
    const fileBuffer = fs.readFileSync(fixturePath);
    const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);

    const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer);
    const activity = event.getFirstActivity();
    const values = activity
      .getStreamData(DataGroundContactTime.type)
      .filter(value => Number.isFinite(value)) as number[];

    expect(values.length).toBeGreaterThan(0);
    expect(values[0]).toBe(1216);
    expect(values[0]).toBeGreaterThan(100);
  });

  it('should map Effort Pace from speed (m/s) to pace (min/km)', () => {
    const mapper = FITSampleMapper.find(m => m.dataType === DataEffortPace.type);
    expect(mapper).toBeDefined();

    const mapped = mapper!.getSampleValue({ 'Effort Pace': 3.412 });
    expect(mapped).toBeCloseTo(convertSpeedToPace(3.412), 6);
  });

  it('should map non-positive Effort Pace speed values to null', () => {
    const mapper = FITSampleMapper.find(m => m.dataType === DataEffortPace.type);
    expect(mapper).toBeDefined();

    expect(mapper!.getSampleValue({ 'Effort Pace': 0 })).toBeNull();
    expect(mapper!.getSampleValue({ 'Effort Pace': -1 })).toBeNull();
  });

  it('should map Garmin stamina streams from record fields', () => {
    const staminaMapper = FITSampleMapper.find(m => m.dataType === DataStamina.type);
    const potentialStaminaMapper = FITSampleMapper.find(m => m.dataType === DataPotentialStamina.type);

    expect(staminaMapper).toBeDefined();
    expect(potentialStaminaMapper).toBeDefined();
    expect(staminaMapper!.getSampleValue({ stamina: 34, potential_stamina: 83 })).toBe(34);
    expect(potentialStaminaMapper!.getSampleValue({ stamina: 34, potential_stamina: 83 })).toBe(83);
    expect(staminaMapper!.getSampleValue({ stamina: 0 })).toBe(0);
  });
});
