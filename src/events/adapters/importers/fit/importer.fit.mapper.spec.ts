import * as fs from 'fs';
import * as path from 'path';
import { FITSampleMapper } from './importer.fit.mapper';
import { DataGroundTime } from '../../../../data/data.ground-time';
import { DataGroundContactTime } from '../../../../data/data.ground-contact-time';
import { DataEffortPace } from '../../../../data/data.effort-pace';
import { DataPotentialStamina, DataStamina } from '../../../../data/data.stamina';
import { EventImporterFIT } from './importer.fit';
import { convertSpeedToPace } from '../../../utilities/helpers';

describe('FITSampleMapper', () => {
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
