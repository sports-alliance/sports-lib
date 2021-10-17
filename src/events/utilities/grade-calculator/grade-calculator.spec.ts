import * as strava_3025376963 from './fixtures/strava_3025376963.json';
import * as strava_3025855594 from './fixtures/strava_3025855594.json';
import { CLAMP, GradeCalculator } from './grade-calculator';

export const GRADE_TOLERANCE = 1.5;

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
    it('should compute grade', done => {
      // Given
      const previousDistance = 10;
      const currentDistance = 15;
      const previousAltitude = 200;
      const currentAltitude = 201;

      // When
      const gradePercentage = GradeCalculator.computeGrade(
        previousDistance,
        currentDistance,
        previousAltitude,
        currentAltitude
      );

      // Then
      expect(gradePercentage).toEqual(20);
      done();
    });

    it('should compute a grade stream', done => {
      // Given
      const distanceStream = [0, 10, 20, 30, 40];
      const altitudeStream = [10, 10, 10, 10, 10];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream);

      // Then
      done();
    });

    it('should compute a grade stream with nulls', done => {
      // Given
      const distanceStream = [0, null, 20, 30, 40];
      const altitudeStream = [10, null, 10, 10, 10];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false);

      // Then
      done();
    });

    it('should compute a grade stream with nulls only for altitude', done => {
      // Given
      const distanceStream = [0, 10, 20, 30, 40];
      const altitudeStream = [10, null, 10, 10, 10];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false);

      // Then
      done();
    });

    it('should compute a grade stream with nulls and change in data #1', done => {
      // Given
      const distanceStream = [0, null, 20, 30, 40];
      const altitudeStream = [10, null, 20, 20, 20];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, null, CLAMP, 0, 0]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #2', done => {
      // Given
      const distanceStream = [0, 10, 20, 30, 40];
      const altitudeStream = [10, null, 20, 20, 20];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, null, CLAMP, 0, 0]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #3', done => {
      // Given
      const distanceStream = [0, null, null, null, 40];
      const altitudeStream = [10, null, 20, 20, 20];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, null, 0, 0, 0]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #4', done => {
      // Given
      const distanceStream = [0, null, null, 30, 40];
      const altitudeStream = [10, null, null, 20, 20];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, null, null, 33.3, 0]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #5', done => {
      // Given
      const distanceStream = [0, null, null, 30, 40];
      const altitudeStream = [10, 15, 20, 20, 20];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, 0, 0, 0, 0]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #6', done => {
      // Given
      const distanceStream = [0, 0, 0, 30, null, 50, 60];
      const altitudeStream = [10, 20, 30, 30, 30, null, null];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, 0, 0, 0, 0, null, null]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #7', done => {
      // @todo important case to understand
      // Given
      const distanceStream = [0, 0, 0, 30, null, 50, 60];
      const altitudeStream = [10, null, 30, 40, 30, null, 40];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, null, 0, 33.3, 0, null, 33.3]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #7.1', done => {
      // @todo important case to understand
      // Given
      const distanceStream = [0, null, null, 30, null, null, 80];
      const altitudeStream = [10, 20, 30, 40, 30, null, 50];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, 0, 0, 33.3, 0, null, 40]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #7.2', done => {
      // @todo important case to understand
      // Given
      const distanceStream = [0, null, null, 30, null, null, 80];
      const altitudeStream = [10, 35, null, 40, 30, null, 50];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, 0, null, 16.7, 0, null, 40]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #8', done => {
      // Given
      const distanceStream = [0, null, null, 30, 40];
      const altitudeStream = [10, 12, 20, 20, 20];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false, false);

      // Then
      expect(gradeStream).toEqual([0, null, null, 33.3, 0]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #9', done => {
      // Given
      const distanceStream = [0, null, null, 30, null];
      const altitudeStream = [10, 12, 20, 20, 20];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false, false);

      // Then
      expect(gradeStream).toEqual([0, null, null, 33.3, null]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #10', done => {
      // Given
      const distanceStream = [0, 0, 0, 30, null, 50, 60];
      const altitudeStream = [10, 12, 20, 20, 20, null, null];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false, false);

      // Then
      expect(gradeStream).toEqual([0, 0, 0, 33.3, null, 0, 0]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #11', done => {
      // Given
      const distanceStream = [0, null, null, 30, null, 50, 60];
      const altitudeStream = [10, 12, 20, 20, 20, null, null];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false, false);

      // Then
      expect(gradeStream).toEqual([0, null, null, 33.3, null, 0, 0]);
      done();
    });

    it('should compute a grade stream with nulls and change in data #12', done => {
      // Given
      const distanceStream = [0, null, null, 30, null, 60, 70];
      const altitudeStream = [10, 12, 20, 20, 10, null, null];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false, false);

      // Then
      expect(gradeStream).toEqual([0, null, null, 33.3, null, -33.3, 0]);
      done();
    });

    it('should compute a grade stream with static distance and static altitude', done => {
      // Given
      const distanceStream = [0, 20, 20, 20, 30];
      const altitudeStream = [10, 10, 10, 10, 10];

      // When
      const gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false);

      // Then
      done();
    });

    it('should compute a grade stream with static distance based on distance', done => {
      // Given
      let distanceStream = [0, 20, 20, 20, 30];
      let altitudeStream = [10, 10, 20, 20, 20];

      // When
      let gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false, false);

      // Then
      expect(gradeStream).toEqual([0, 0, 0, 0, CLAMP]);

      distanceStream = [0, 20, 20, 20, 20];
      altitudeStream = [10, 10, 20, 20, 20];

      // When
      gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, false, false, false);

      // Then
      expect(gradeStream).toEqual([0, 0, 0, 0, 0]);

      done();
    });

    it('should compute a grade stream with static distance based on altitude', done => {
      // Given
      let distanceStream = [0, 20, 20, 20, 30];
      let altitudeStream = [10, 10, 20, 20, 20];

      // When
      let gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, 0, 0, 0, 0]);

      distanceStream = [0, 20, 60, 70, 80];
      altitudeStream = [10, 20, 30, 30, 20];

      // When
      gradeStream = GradeCalculator.computeGradeStream(distanceStream, altitudeStream, true, false, false);

      // Then
      expect(gradeStream).toEqual([0, CLAMP, 25, 0, -CLAMP]);

      done();
    });

    it('should calculate grade stream from activity strava_3025376963', done => {
      // Given
      const distanceStream = clone(strava_3025376963.distance);
      const altitudeStream = clone(strava_3025376963.altitude);

      // When
      const gradeStream = <number[]>GradeCalculator.computeGradeStream(distanceStream, altitudeStream);

      // Then
      expect(gradeStream.length).toEqual(distanceStream.length);
      expect(gradeStream.length).toEqual(altitudeStream.length);

      const deltaBetweenStreams = averageDeltaBetweenStreams(gradeStream, strava_3025376963.grade_smooth);
      console.log(`Delta is ${deltaBetweenStreams}`);
      expect(deltaBetweenStreams).toBeLessThan(GRADE_TOLERANCE);

      done();
    });

    it('should calculate grade stream from activity strava_3025855594', done => {
      // Given
      const distanceStream = clone(strava_3025855594.distance);
      const altitudeStream = clone(strava_3025855594.altitude);

      // When
      const gradeStream = <number[]>GradeCalculator.computeGradeStream(distanceStream, altitudeStream);

      // Then
      expect(gradeStream.length).toEqual(distanceStream.length);
      expect(gradeStream.length).toEqual(altitudeStream.length);

      const deltaBetweenStreams = averageDeltaBetweenStreams(gradeStream, strava_3025855594.grade_smooth);
      console.log(`Delta is ${deltaBetweenStreams}`);
      expect(deltaBetweenStreams).toBeLessThan(GRADE_TOLERANCE);

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
