import { FitBaseType, FitEncoder, FitEncoderField } from 'fit-file-parser';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataAscent } from '../../../../data/data.ascent';
import { DataDescent } from '../../../../data/data.descent';
import { DataDepthMax } from '../../../../data/data.depth-max';
import { DataGradeAvg } from '../../../../data/data.grade-avg';
import { DataGradeMax } from '../../../../data/data.grade-max';
import { DataGradeMin } from '../../../../data/data.grade-min';
import { DataMetabolicCalories } from '../../../../data/data.metabolic-calories';
import {
  DataAirTimeRemaining,
  DataBottomTime,
  DataCNSLoad,
  DataDepthAvg,
  DataDiveAscentRate,
  DataDiveAscentRateAvg,
  DataDiveAscentRateMax,
  DataDiveAscentTime,
  DataDiveDescentRateAvg,
  DataDiveDescentRateMax,
  DataDiveDescentTime,
  DataDiveHangTime,
  DataDiveNumber,
  DataEndingCNSLoad,
  DataEndingN2Load,
  DataN2Load,
  DataNextStopDepth,
  DataNextStopTime,
  DataNoDecompressionLimit,
  DataOxygenToxicity,
  DataPO2,
  DataPressureSAC,
  DataPressureSACAvg,
  DataRMV,
  DataRMVAvg,
  DataStartingCNSLoad,
  DataStartingN2Load,
  DataSurfaceInterval,
  DataTimeToSurface,
  DataVolumeSAC,
  DataVolumeSACAvg
} from '../../../../data/data.dive';
import { EventImporterFIT } from './importer.fit';

const uint8 = (number: number, value: number): FitEncoderField => ({
  number,
  size: 1,
  baseType: FitBaseType.Uint8,
  value
});
const enum8 = (number: number, value: number): FitEncoderField => ({
  number,
  size: 1,
  baseType: FitBaseType.Enum,
  value
});
const uint16 = (number: number, value: number): FitEncoderField => ({
  number,
  size: 2,
  baseType: FitBaseType.Uint16,
  value
});
const uint32 = (number: number, value: number): FitEncoderField => ({
  number,
  size: 4,
  baseType: FitBaseType.Uint32,
  value
});
const uint32z = (number: number, value: number): FitEncoderField => ({
  number,
  size: 4,
  baseType: FitBaseType.Uint32z,
  value
});
const sint32 = (number: number, value: number): FitEncoderField => ({
  number,
  size: 4,
  baseType: FitBaseType.Sint32,
  value
});
const sint16 = (number: number, value: number): FitEncoderField => ({
  number,
  size: 2,
  baseType: FitBaseType.Sint16,
  value
});

const summaryFields = (referenceMessage: number, avgDepth: number, maxDepth: number): FitEncoderField[] => [
  uint16(0, referenceMessage),
  uint16(1, 0),
  uint32(2, avgDepth),
  uint32(3, maxDepth),
  uint32(4, 600),
  uint8(5, 1),
  uint8(6, 2),
  uint16(7, 3),
  uint16(8, 61),
  uint16(9, 3),
  uint32(10, 803),
  uint32(11, 900_000),
  uint16(12, 167),
  uint16(13, 2222),
  uint16(14, 2150),
  uint32(15, 691_000),
  uint32(16, 1_937_527),
  sint32(17, 44),
  uint32(22, 55),
  uint32(23, 66),
  uint32(24, 77),
  uint32(25, 8000)
];

describe('EventImporterFIT native diving messages', () => {
  it('imports source-native dive values and excludes terrain summaries', async () => {
    const encoder = new FitEncoder();
    const startTime = FitEncoder.toFitTimestamp(new Date('2026-08-22T10:00:00.000Z'));
    const endTime = startTime + 1000;

    encoder.writeMessage(0, [enum8(0, 4), uint16(1, 1), uint32(4, startTime)]);
    encoder.writeMessage(
      20,
      [
        uint32(253, startTime + 500),
        uint32(92, 12_345),
        uint32(93, 3000),
        uint32(94, 60),
        uint32(95, 300),
        uint32(96, 900),
        uint8(97, 12),
        uint16(98, 34),
        uint32(123, 4_294_961_197),
        uint16(124, 1234),
        uint16(125, 2345),
        uint16(126, 3456),
        sint32(127, -287),
        uint8(129, 21)
      ],
      1
    );
    encoder.writeMessage(
      19,
      [
        uint16(254, 0),
        uint32(253, endTime),
        uint32(2, startTime),
        uint32(7, 1_000_000),
        uint32(8, 1_000_000),
        enum8(25, 53),
        enum8(39, 54),
        uint16(21, 50),
        uint16(22, 40)
      ],
      2
    );
    encoder.writeMessage(
      18,
      [
        uint16(254, 0),
        uint32(253, endTime),
        uint32(2, startTime),
        enum8(5, 53),
        enum8(6, 54),
        uint32(7, 1_000_000),
        uint32(8, 1_000_000),
        uint16(196, 159),
        uint16(21, 100),
        uint16(22, 80),
        sint16(45, 150),
        sint16(48, 300),
        sint16(49, -200)
      ],
      3
    );
    encoder.writeMessage(268, summaryFields(18, 12_345, 20_000), 4);
    encoder.writeMessage(268, summaryFields(19, 10_000, 15_000), 4);

    const encoded = encoder.close();
    const event = await EventImporterFIT.getFromArrayBuffer(
      encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer
    );
    const activity = event.getFirstActivity();
    const streamValue = (type: string) => activity.getStreamData(type).find(value => Number.isFinite(value));

    expect(activity.type).toBe(ActivityTypes.ScubaDiving);
    expect(activity.getStat(DataDepthAvg.type)?.getValue()).toBe(12.345);
    expect(activity.getStat(DataDepthMax.type)?.getValue()).toBe(20);
    expect(activity.getStat(DataMetabolicCalories.type)?.getValue()).toBe(159);
    expect(activity.getStat(DataAscent.type)).toBeUndefined();
    expect(activity.getStat(DataDescent.type)).toBeUndefined();
    expect(activity.getStat(DataGradeAvg.type)).toBeUndefined();
    expect(activity.getStat(DataGradeMax.type)).toBeUndefined();
    expect(activity.getStat(DataGradeMin.type)).toBeUndefined();
    expect(activity.getLaps()[0].getStat(DataAscent.type)).toBeUndefined();
    expect(activity.getLaps()[0].getStat(DataDescent.type)).toBeUndefined();
    expect(activity.getStat(DataSurfaceInterval.type)?.getValue()).toBe(600);
    expect(activity.getStat(DataBottomTime.type)?.getValue()).toBe(900);
    expect(activity.getStat(DataDiveNumber.type)?.getValue()).toBe(803);
    expect(activity.getStat(DataDiveDescentTime.type)?.getValue()).toBe(691);
    expect(activity.getStat(DataDiveAscentTime.type)?.getValue()).toBe(1937.527);
    expect(activity.getStat(DataDiveAscentRateAvg.type)?.getValue()).toBe(0.044);
    expect(activity.getStat(DataDiveDescentRateAvg.type)?.getValue()).toBe(0.055);
    expect(activity.getStat(DataDiveAscentRateMax.type)?.getValue()).toBe(0.066);
    expect(activity.getStat(DataDiveDescentRateMax.type)?.getValue()).toBe(0.077);
    expect(activity.getStat(DataDiveHangTime.type)?.getValue()).toBe(8);
    expect(activity.getStat(DataStartingCNSLoad.type)?.getValue()).toBe(1);
    expect(activity.getStat(DataEndingCNSLoad.type)?.getValue()).toBe(2);
    expect(activity.getStat(DataStartingN2Load.type)?.getValue()).toBe(3);
    expect(activity.getStat(DataEndingN2Load.type)?.getValue()).toBe(61);
    expect(activity.getStat(DataOxygenToxicity.type)?.getValue()).toBe(3);
    expect(activity.getStat(DataPressureSACAvg.type)?.getValue()).toBe(1.67);
    expect(activity.getStat(DataVolumeSACAvg.type)?.getValue()).toBe(22.22);
    expect(activity.getStat(DataRMVAvg.type)?.getValue()).toBe(21.5);
    expect(activity.getLaps()[0].getStat(DataDepthAvg.type)?.getValue()).toBe(10);
    expect(activity.getLaps()[0].getStat(DataDepthMax.type)?.getValue()).toBe(15);

    expect(streamValue(DataNextStopDepth.type)).toBe(3);
    expect(streamValue(DataNextStopTime.type)).toBe(60);
    expect(streamValue(DataTimeToSurface.type)).toBe(300);
    expect(streamValue(DataNoDecompressionLimit.type)).toBe(900);
    expect(streamValue(DataCNSLoad.type)).toBe(12);
    expect(streamValue(DataN2Load.type)).toBe(34);
    expect(streamValue(DataAirTimeRemaining.type)).toBe(4_294_961_197);
    expect(streamValue(DataPressureSAC.type)).toBe(12.34);
    expect(streamValue(DataVolumeSAC.type)).toBe(23.45);
    expect(streamValue(DataRMV.type)).toBe(34.56);
    expect(streamValue(DataPO2.type)).toBe(0.21);
    expect(streamValue(DataDiveAscentRate.type)).toBe(-0.287);
    expect(activity.getStreamData(DataAirTimeRemaining.type).filter(value => Number.isFinite(value))).toEqual([
      4_294_961_197
    ]);
  });

  it('retains canonical session depth and metabolic calories without a dive summary', async () => {
    const encoder = new FitEncoder();
    const startTime = FitEncoder.toFitTimestamp(new Date('2026-08-22T10:00:00.000Z'));
    const endTime = startTime + 1000;

    encoder.writeMessage(0, [enum8(0, 1), uint16(1, 1), uint32(4, startTime)]);
    encoder.writeMessage(
      18,
      [
        uint16(254, 0),
        uint32(253, endTime),
        uint32(2, startTime),
        enum8(5, 53),
        uint32(7, 1000),
        uint32(8, 1000),
        uint32(140, 70),
        uint16(196, 159)
      ],
      1
    );

    const encoded = encoder.close();
    const event = await EventImporterFIT.getFromArrayBuffer(
      encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer
    );
    const activity = event.getFirstActivity();

    expect(activity.getStat(DataDepthAvg.type)?.getValue()).toBe(0.07);
    expect(activity.getStat(DataMetabolicCalories.type)?.getValue()).toBe(159);
  });

  it('retains multiple source-native gases and tank records without creating a derived summary', async () => {
    const encoder = new FitEncoder();
    const start = new Date('2026-08-22T10:00:00.000Z');
    const startTime = FitEncoder.toFitTimestamp(start);
    const endTime = startTime + 1_000;
    const firstTankUpdateTime = startTime + 100;

    encoder.writeMessage(0, [enum8(0, 4), uint16(1, 1), uint32(4, startTime)]);
    encoder.writeMessage(
      18,
      [
        uint16(254, 0),
        uint32(253, endTime),
        uint32(2, startTime),
        enum8(5, 53),
        enum8(6, 54),
        uint32(7, 1_000_000),
        uint32(8, 1_000_000)
      ],
      1
    );
    encoder.writeMessage(259, [uint8(0, 0), uint8(1, 21), enum8(2, 1), enum8(3, 0), uint16(254, 0)], 2);
    encoder.writeMessage(259, [uint8(0, 0), uint8(1, 50), enum8(2, 1), enum8(3, 0), uint16(254, 1)], 2);
    encoder.writeMessage(259, [uint8(0, 0), uint8(1, 98), enum8(2, 2), enum8(3, 0), uint16(254, 2)], 2);
    encoder.writeMessage(
      323,
      [uint32z(0, 10_001), uint16(1, 20_000), uint16(2, 7_500), uint32(3, 139_601), uint32(253, endTime)],
      3
    );
    encoder.writeMessage(
      323,
      [uint32z(0, 10_002), uint16(1, 18_000), uint16(2, 9_500), uint32(3, 88_100), uint32(253, endTime)],
      3
    );
    encoder.writeMessage(319, [uint32z(0, 10_001), uint16(1, 19_900), uint32(253, firstTankUpdateTime)], 4);
    encoder.writeMessage(319, [uint32z(0, 10_002), uint16(1, 17_900), uint32(253, firstTankUpdateTime + 1)], 4);
    // A separate session's tank summary must not be assigned to this activity.
    encoder.writeMessage(
      323,
      [uint32z(0, 10_003), uint16(1, 20_000), uint16(2, 10_000), uint32(3, 100_000), uint32(253, endTime + 1)],
      3
    );

    const encoded = encoder.close();
    const event = await EventImporterFIT.getFromArrayBuffer(
      encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer
    );
    const records = event.getFirstActivity().getDiveSourceRecords();

    expect(records.gases).toEqual([
      {
        messageIndex: { value: 0, reserved: false, selected: false },
        heliumContent: 0,
        oxygenContent: 21,
        status: 'enabled',
        mode: 'open_circuit'
      },
      {
        messageIndex: { value: 1, reserved: false, selected: false },
        heliumContent: 0,
        oxygenContent: 50,
        status: 'enabled',
        mode: 'open_circuit'
      },
      {
        messageIndex: { value: 2, reserved: false, selected: false },
        heliumContent: 0,
        oxygenContent: 98,
        status: 'backup_only',
        mode: 'open_circuit'
      }
    ]);
    expect(records.tankSummaries).toEqual([
      {
        sensor: 10_001,
        startPressure: 200,
        endPressure: 75,
        volumeUsed: 1396.01,
        timestamp: new Date(start.getTime() + 1_000_000)
      },
      {
        sensor: 10_002,
        startPressure: 180,
        endPressure: 95,
        volumeUsed: 881,
        timestamp: new Date(start.getTime() + 1_000_000)
      }
    ]);
    expect(records.tankUpdates).toEqual([
      {
        sensor: 10_001,
        pressure: 199,
        timestamp: new Date(start.getTime() + 100_000)
      },
      {
        sensor: 10_002,
        pressure: 179,
        timestamp: new Date(start.getTime() + 101_000)
      }
    ]);
  });
});
