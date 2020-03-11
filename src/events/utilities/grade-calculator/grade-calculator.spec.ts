import * as strava_3025376963 from './fixtures/strava_3025376963.json';
import * as strava_3025855594 from './fixtures/strava_3025855594.json';
import { GradeCalculator } from './grade-calculator';

function clone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

function floor(value: number, decimals: number) {
  const pow = Math.pow(10, decimals);
  return Math.floor(value * pow) / pow;
}

describe('GradeCalculator', () => {

  const averageDeltaBetweenStreams = (actualStream: number[], expectedStream: number[]) => {
    let deltaSum = 0;
    actualStream.forEach((value, index) => {
      deltaSum += Math.abs(value - expectedStream[index]);
    });
    return deltaSum / actualStream.length;
  };

  describe('Grade computing', () => {

    it('should compute grade', (done: Function) => {

      // Given
      const previousDistance = 10;
      const currentDistance = 15;
      const previousAltitude = 200;
      const currentAltitude = 201;

      // When
      const gradePercentage = GradeCalculator.computeGrade(previousDistance, currentDistance, previousAltitude, currentAltitude);

      // Then
      expect(gradePercentage).toEqual(20);
      done();
    });

    it('should compute a grade stream', (done: Function) => {

      // Given
      const distanceStream = [0, 10, 20, 30, 40];
      const altitudeStream = [10, 10, 10, 10, 10];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream);

      // Then
      expect(gradeStream).toEqual([
        0, 0, 0, 0, 0
      ]);
      done();
    });

    it('should compute a grade stream with nulls', (done: Function) => {

      // Given
      const distanceStream = [0, null, 20, 30, 40];
      const altitudeStream = [10, null, 10, 10, 10];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream , false, false);

      // Then
      expect(gradeStream).toEqual([
        0, null, 0, 0, 0
      ]);
      done();
    });

    it('should compute a grade stream with nulls and change in data', (done: Function) => {

      // Given
      let distanceStream = [0, null, 20, 30, 40];
      let altitudeStream = [10, null, 20, 20, 20];

      // When
      let gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false);

      // Then
      expect(gradeStream).toEqual([
        0, null, 45, 0, 0
      ]);

      distanceStream = [0, null, null, 30, 40];
      altitudeStream = [10, null, null, 20, 20];
      gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false);
      expect(gradeStream).toEqual([
        0, null, null, 33.3, 0
      ]);

      distanceStream = [0,  null, null, 30, 40];
      altitudeStream = [10, 12,   20,   20, 20];
      gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false);
      expect(gradeStream).toEqual([
        0, null, null, 33.3, 0
      ]);

      distanceStream = [0, null, null, 30, null];
      altitudeStream = [10, 12,   20,   20,  20];
      gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false);
      expect(gradeStream).toEqual([
        0, null, null, 33.3, null
      ]);

      distanceStream = [0, null, null, 30, null, 50,   60];
      altitudeStream = [10, 12,   20,  20, 20,   null, null];
      gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false);
      expect(gradeStream).toEqual([
        0, null, null, 33.3, null, 0, 0
      ]);

      distanceStream = [0,  null, null, 30, null, 60,   70];
      altitudeStream = [10, 12,   20,   20, 10,   null, null];
      gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false);
      expect(gradeStream).toEqual([
        0, null, null, 33.3, null, -33.3, 0
      ]);
      done();
    });

    it('should compute a grade stream with static distance and static altitude', (done: Function) => {

      // Given
      const distanceStream = [0, 20, 20, 20, 30];
      const altitudeStream = [10, 10, 10, 10, 10];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false);

      // Then
      expect(gradeStream).toEqual([
        0, 0, 0, 0, 0
      ]);
      done();
    });

    it('should compute a grade stream with static distance', (done: Function) => {

      // Given
      const distanceStream = [0, 20, 20, 20, 30];
      const altitudeStream = [10, 10, 20, 20, 20];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false);

      // Then
      expect(gradeStream).toEqual([
        0, 0, 0, 0, 0
      ]);
      done();
    });

    it('should calculate grade stream from activity strava_3025376963', (done: Function) => {

      // Given
      const distanceStream = clone(strava_3025376963.distance);
      const altitudeStream = clone(strava_3025376963.altitude);

      // When
      const gradeStream = <number[]>GradeCalculator.computeGradeStream(distanceStream, altitudeStream);

      // Then
      expect(gradeStream.length).toEqual(distanceStream.length);
      expect(gradeStream.length).toEqual(altitudeStream.length);

      const deltaBetweenStreams = averageDeltaBetweenStreams(gradeStream, strava_3025376963.grade_smooth);
      expect(deltaBetweenStreams).toBeLessThan(1.5);

      done();
    });

    it('should calculate grade stream from activity strava_3025855594', (done: Function) => {

      // Given
      const distanceStream = clone(strava_3025855594.distance);
      const altitudeStream = clone(strava_3025855594.altitude);

      // When
      const gradeStream = <number[]>GradeCalculator.computeGradeStream(distanceStream, altitudeStream);

      // Then
      expect(gradeStream.length).toEqual(distanceStream.length);
      expect(gradeStream.length).toEqual(altitudeStream.length);

      const deltaBetweenStreams = averageDeltaBetweenStreams(gradeStream, strava_3025855594.grade_smooth);
      expect(deltaBetweenStreams).toBeLessThan(1.5);

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
      expect(floor(gradeAdjustedSpeed, 1)).toEqual(14.9);
    });

    it('should model grade adjusted pace at grade of 0', () => {

      // Given
      const speedMeterSeconds = 10;
      const grade = 0;

      // When
      const gradeAdjustedSpeed = GradeCalculator.estimateAdjustedSpeed(speedMeterSeconds, grade);

      // Then
      expect(floor(gradeAdjustedSpeed, 1)).toEqual(9.9);
    });

    it('should model grade adjusted pace at grade of 6', () => {

      // Given
      const speedMeterSeconds = 10;
      const grade = 6;

      // When
      const gradeAdjustedSpeed = GradeCalculator.estimateAdjustedSpeed(speedMeterSeconds, grade);

      // Then
      expect(floor(gradeAdjustedSpeed, 1)).toEqual(12.3);
    });

    it('should model grade adjusted pace at grade of 28', () => {

      // Given
      const speedMeterSeconds = 10;
      const grade = 28;

      // When
      const gradeAdjustedSpeed = GradeCalculator.estimateAdjustedSpeed(speedMeterSeconds, grade);

      // Then
      expect(floor(gradeAdjustedSpeed, 1)).toEqual(29.6);
    });

  });

});
