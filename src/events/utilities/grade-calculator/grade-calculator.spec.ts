import { GradeCalculator } from './grade-calculator';

const floor = (value: number, decimals: number) => {
  const pow = Math.pow(10, decimals);
  return Math.floor(value * pow) / pow;
};

describe('GradeCalculator', () => {
  it('should align and squash distance & altitude along time', done => {
    // Given
    const timeData = [0, null, 2, 3, 4, 5, 6, 7, 8, 9];
    const distanceData = [0, null, 20, null, 40, 56, null, 73, 85, 99];
    const altitudeData = [100, null, 102, 303, null, 205, null, 207, 308, 109];
    const expectedSquashedAlignTime = [0, 2, 3, 4, 5, 7, 8, 9];
    const expectedSquashedAlignDistance = [0, 20, 20, 40, 56, 73, 85, 99];
    const expectedSquashedAlignAltitude = [100, 102, 303, 303, 205, 207, 308, 109];

    // When
    const [squashedAlignedTime, squashedAlignedDist, squashedAlignedAlt] = GradeCalculator.squashAlignStreams(
      timeData,
      distanceData,
      altitudeData
    );

    // Then
    expect(squashedAlignedDist.length).toEqual(squashedAlignedTime.length);
    expect(squashedAlignedAlt.length).toEqual(squashedAlignedTime.length);
    expect(squashedAlignedTime).toEqual(expectedSquashedAlignTime);
    expect(squashedAlignedDist).toEqual(expectedSquashedAlignDistance);
    expect(squashedAlignedAlt).toEqual(expectedSquashedAlignAltitude);
    done();
  });

  describe('Grade compute', () => {
    it('should calculate grade on flat terrain', done => {
      // Given
      const timeData = [0, null, 2, 3, 4, 5, 6, 7, 8, 9];
      const distanceData = [10, null, 20, null, 30, 35, null, 45, 50, 55];
      const altitudeData = [10, null, 10, 10, 10, 10, null, 10, 10, 10];
      const gradeData = [0, null, 0, 0, 0, 0, null, 0, 0, 0];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(timeData, distanceData, altitudeData);

      // Then
      expect(gradeStream.length).toEqual(timeData.length);
      expect(gradeStream.length).toEqual(gradeData.length);
      expect(gradeStream).toEqual(gradeData);
      done();
    });

    it('should calculate grade on hilly terrain', done => {
      // Given
      const timeData = [0, null, 2, 3, 4, 5, 6, 7, 8, 9];
      const distanceData = [10, null, 20, null, 30, 35, null, 45, 50, 55];
      const altitudeData = [10, null, 10, 11, 13, 16, null, 15, 14, 13];
      const expectedGradeData = [0, null, 30, 20, 13.3, -10, null, -20, -20, 0];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(timeData, distanceData, altitudeData, 10, 50);

      // Then
      expect(gradeStream.length).toEqual(timeData.length);
      expect(gradeStream.length).toEqual(expectedGradeData.length);
      expect(gradeStream).toEqual(expectedGradeData);
      done();
    });
  });

  describe('Grade adjusted speed', () => {
    it('should model grade adjusted pace at grade of -32', () => {
      // Given
      const speedMeterSeconds = 10;
      const grade = -30;

      // When
      const gradeAdjustedSpeed = GradeCalculator.estimateAdjustedSpeed(speedMeterSeconds, grade);

      // Then
      expect(floor(gradeAdjustedSpeed, 1)).toEqual(15);
    });

    it('should model grade adjusted pace at grade of 0', () => {
      // Given
      const speedMeterSeconds = 10;
      const grade = 0;

      // When
      const gradeAdjustedSpeed = GradeCalculator.estimateAdjustedSpeed(speedMeterSeconds, grade);

      // Then
      expect(floor(gradeAdjustedSpeed, 1)).toEqual(10);
    });

    it('should model grade adjusted pace at grade of 6', () => {
      // Given
      const speedMeterSeconds = 10;
      const grade = 6;

      // When
      const gradeAdjustedSpeed = GradeCalculator.estimateAdjustedSpeed(speedMeterSeconds, grade);

      // Then
      expect(floor(gradeAdjustedSpeed, 1)).toEqual(12.4);
    });

    it('should model grade adjusted pace at grade of 28', () => {
      // Given
      const speedMeterSeconds = 10;
      const grade = 28;

      // When
      const gradeAdjustedSpeed = GradeCalculator.estimateAdjustedSpeed(speedMeterSeconds, grade);

      // Then
      expect(floor(gradeAdjustedSpeed, 1)).toEqual(29.7);
    });
  });
});
