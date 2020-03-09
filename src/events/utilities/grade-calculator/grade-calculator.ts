import { isNumber } from '../helpers';

const KalmanFilter = require('kalmanjs');

export class GradeCalculator {

  public static computeGrade(previousDistance: number, currentDistance: number, previousAltitude: number, currentAltitude: number): number {
    const distanceDelta = currentDistance - previousDistance;
    const altitudeDelta = currentAltitude - previousAltitude;
    if (distanceDelta === 0) {
      return 0;
    }
    let percentage: number = altitudeDelta / distanceDelta * 100;
    percentage = Math.min(Math.max(percentage, -45), 45); // Clamp between -45% & 45%
    return Math.round(percentage * 10) / 10;
  }

  public static computeGradeStream(distanceStream: number[], altitudeStream: number[]): number[] {
    // First filter the altitude to remove any noise
    let kf = new KalmanFilter();
    altitudeStream = altitudeStream.map(v => kf.filter(v));

    const gradeStream = [];

    for (let i = 0; i < distanceStream.length; i++) {

      const previousDistance = (distanceStream[i - 1]) || 0;
      // Find the next i for distance = prev distance + 5m
      // @todo perhaps this threshold should be per avg speed / activity type
      // Or just perhaps the speed? 
      const nextIndex = distanceStream.slice(i).findIndex(d => d >= (previousDistance + 5));
      const currentDistance = distanceStream[nextIndex + i];
      const previousAltitude = isNumber(altitudeStream[i - 1]) ? altitudeStream[i - 1] : altitudeStream[i];
      const currentAltitude = altitudeStream[nextIndex + i];

      const currentGrade = GradeCalculator.computeGrade(previousDistance, currentDistance, previousAltitude, currentAltitude);
      gradeStream.push(currentGrade);
    }

    kf = new KalmanFilter();
    return gradeStream
      .map(v => kf.filter(v))
      .map(v => Math.round(v * 10) / 10);
  }

  /**
   * Contains a 5th order equation which models the Strava GAP behavior described on picture "./fixture/strava_gap_modelization.png"
   *
   * This Strava GAP behavior is described by the below data
   * [{ grade: -34, speedFactor: 1.7 }, { grade: -32, speedFactor: 1.6 }, { grade: -30, speedFactor: 1.5 },
   * { grade: -28, speedFactor: 1.4 }, { grade: -26, speedFactor: 1.3 }, { grade: -24, speedFactor: 1.235 },
   * { grade: -22, speedFactor: 1.15 }, { grade: -20, speedFactor: 1.09 }, { grade: -18, speedFactor: 1.02 },
   * { grade: -16, speedFactor: 0.95 }, { grade: -14, speedFactor: 0.91 }, { grade: -12, speedFactor: 0.89 },
   * { grade: -10, speedFactor: 0.88 }, { grade: -8, speedFactor: 0.88 }, { grade: -6, speedFactor: 0.89 },
   * { grade: -4, speedFactor: 0.91 }, { grade: -2, speedFactor: 0.95 }, { grade: 0, speedFactor: 1 },
   * { grade: 2, speedFactor: 1.05 }, { grade: 4, speedFactor: 1.14 }, { grade: 6, speedFactor: 1.24 },
   * { grade: 8, speedFactor: 1.34 }, { grade: 10, speedFactor: 1.47 }, { grade: 12, speedFactor: 1.5 },
   * { grade: 14, speedFactor: 1.76 }, { grade: 16, speedFactor: 1.94 }, { grade: 18, speedFactor: 2.11 },
   * { grade: 20, speedFactor: 2.3 }, { grade: 22, speedFactor: 2.4 }, { grade: 24, speedFactor: 2.48 },
   * { grade: 26, speedFactor: 2.81 }, { grade: 28, speedFactor: 3 }, { grade: 30, speedFactor: 3.16 },
   * { grade: 32, speedFactor: 3.31 }, { grade: 34, speedFactor: 3.49 } ]
   *
   * The 5th order equation has been curve fitted using plot.ly
   */
  public static estimateAdjustedSpeed(speedMeterSeconds: number, grade: number): number {
    const kA = 0.9944001227713231;
    const kB = 0.029290920646623777;
    const kC = 0.0018083953212790634;
    const kD = 4.0662425671715924e-7;
    const kE = -3.686186584867523e-7;
    const kF = -2.6628107325930747e-9;
    const speedAdjust = (kA + kB * grade + kC * Math.pow(grade, 2) + kD * Math.pow(grade, 3) + kE * Math.pow(grade, 4)
      + kF * Math.pow(grade, 5));
    return speedMeterSeconds * speedAdjust;
  }
}
