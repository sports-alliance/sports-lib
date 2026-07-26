import { GradeCalculator } from './grade-calculator';

type StreamValue = number | null;

interface GradeStreamCase {
  name: string;
  time: StreamValue[];
  distance: StreamValue[];
  altitude: StreamValue[];
  aheadMeters?: number;
  clamp?: number;
}

/**
 * Frozen reference for the pre-optimization grade behavior.
 *
 * Keep this implementation intentionally independent from GradeCalculator so an
 * optimized lookup can be checked against today's handling of sparse, duplicate,
 * non-monotonic, and non-finite stream data.
 */
const legacyComputeGradeStream = (
  timeStream: StreamValue[],
  distanceStream: StreamValue[],
  altitudeStream: StreamValue[],
  aheadMeters = 10,
  clamp = 50
): StreamValue[] => {
  const squashedAlignedTime: number[] = [];
  const squashedAlignedDistance: number[] = [];
  const squashedAlignedAltitude: number[] = [];

  let lastKnownDistance = distanceStream.find(distance => Number.isFinite(distance));
  let lastKnownAltitude = altitudeStream.find(altitude => Number.isFinite(altitude));

  timeStream.forEach((seconds, index) => {
    if (!Number.isFinite(seconds)) {
      return;
    }

    const distance = distanceStream[index];
    const altitude = altitudeStream[index];
    if (Number.isFinite(distance) && Number.isFinite(altitude)) {
      squashedAlignedTime.push(seconds as number);
      squashedAlignedDistance.push(distance as number);
      squashedAlignedAltitude.push(altitude as number);
      lastKnownDistance = distance;
      lastKnownAltitude = altitude;
    } else if (!Number.isFinite(distance) && Number.isFinite(altitude)) {
      squashedAlignedTime.push(seconds as number);
      squashedAlignedDistance.push(lastKnownDistance as number);
      squashedAlignedAltitude.push(altitude as number);
      lastKnownAltitude = altitude;
    } else if (Number.isFinite(distance) && !Number.isFinite(altitude)) {
      squashedAlignedTime.push(seconds as number);
      squashedAlignedDistance.push(distance as number);
      squashedAlignedAltitude.push(lastKnownAltitude as number);
      lastKnownDistance = distance;
    }
  });

  const squashedAlignedGrade: number[] = [];
  let indexNow = 0;
  do {
    const aheadDistances = squashedAlignedDistance.slice(indexNow);
    const aheadAltitudes = squashedAlignedAltitude.slice(indexNow);
    const distanceNow = aheadDistances[0];
    const altitudeNow = aheadAltitudes[0];

    let aheadIndex = aheadDistances.findIndex(distance => distanceNow + aheadMeters <= distance);
    aheadIndex = aheadIndex >= 0 ? aheadIndex : aheadDistances.length - 1;

    const aheadDeltaDistance = aheadDistances[aheadIndex] - distanceNow;
    const aheadDeltaAltitude = aheadAltitudes[aheadIndex] - altitudeNow;
    const aheadGrade =
      aheadDeltaDistance > 0 ? Math.min(Math.max((aheadDeltaAltitude / aheadDeltaDistance) * 100, -clamp), clamp) : 0;

    squashedAlignedGrade.push(Math.round(aheadGrade * 10) / 10);
    indexNow++;
  } while (indexNow < squashedAlignedTime.length);

  const gradeStream: StreamValue[] = Array(altitudeStream.length).fill(null);
  for (const [index, seconds] of squashedAlignedTime.entries()) {
    gradeStream[seconds] = squashedAlignedGrade[index];
  }
  return gradeStream;
};

const legacyComputeGradeStreamByDistance = (
  distanceStream: StreamValue[],
  altitudeStream: StreamValue[],
  aheadMeters = 10,
  clamp = 50
): StreamValue[] => {
  const points: { index: number; distance: number; altitude: number }[] = [];
  let lastKnownDistance: number | null = null;
  let lastKnownAltitude: number | null = null;

  const streamLength = Math.max(distanceStream.length, altitudeStream.length);
  for (let index = 0; index < streamLength; index++) {
    const distance = distanceStream[index];
    const altitude = altitudeStream[index];
    if (Number.isFinite(distance) && Number.isFinite(altitude)) {
      points.push({ index, distance: distance as number, altitude: altitude as number });
      lastKnownDistance = distance;
      lastKnownAltitude = altitude;
    } else if (!Number.isFinite(distance) && Number.isFinite(altitude) && Number.isFinite(lastKnownDistance)) {
      points.push({ index, distance: lastKnownDistance as number, altitude: altitude as number });
      lastKnownAltitude = altitude;
    } else if (Number.isFinite(distance) && !Number.isFinite(altitude) && Number.isFinite(lastKnownAltitude)) {
      points.push({ index, distance: distance as number, altitude: lastKnownAltitude as number });
      lastKnownDistance = distance;
    }
  }

  const gradeStream: StreamValue[] = Array(streamLength).fill(null);
  if (!points.length) {
    return gradeStream;
  }

  const grades: number[] = [];
  for (let indexNow = 0; indexNow < points.length; indexNow++) {
    const aheadPoints = points.slice(indexNow);
    const pointNow = aheadPoints[0];
    let aheadIndex = aheadPoints.findIndex(point => pointNow.distance + aheadMeters <= point.distance);
    aheadIndex = aheadIndex >= 0 ? aheadIndex : aheadPoints.length - 1;

    const aheadPoint = aheadPoints[aheadIndex];
    const aheadDeltaDistance = aheadPoint.distance - pointNow.distance;
    const aheadDeltaAltitude = aheadPoint.altitude - pointNow.altitude;
    const aheadGrade =
      aheadDeltaDistance > 0 ? Math.min(Math.max((aheadDeltaAltitude / aheadDeltaDistance) * 100, -clamp), clamp) : 0;
    grades.push(Math.round(aheadGrade * 10) / 10);
  }

  points.forEach((point, index) => {
    gradeStream[point.index] = grades[index];
  });
  return gradeStream;
};

const namedCases: GradeStreamCase[] = [
  {
    name: 'empty streams',
    time: [],
    distance: [],
    altitude: []
  },
  {
    name: 'leading one-sided measurements before fully aligned data',
    time: [0, 1, 2, 3, 4, 5, 6, 7],
    distance: [null, null, 5, 9, null, 20, 27, 35],
    altitude: [100, null, null, 103, 104, null, 108, 110]
  },
  {
    name: 'long stationary plateaus and repeated distances',
    time: Array.from({ length: 80 }, (_value, index) => index),
    distance: Array.from({ length: 80 }, (_value, index) => (index < 30 ? 0 : index < 60 ? 25 : 25 + (index - 59) * 2)),
    altitude: Array.from({ length: 80 }, (_value, index) => 100 + Math.floor(index / 8))
  },
  {
    name: 'distance decreases and resets',
    time: Array.from({ length: 18 }, (_value, index) => index),
    distance: [0, 4, 9, 15, 21, 18, 8, 3, 7, 14, 22, 31, 2, 5, 12, 20, 19, 35],
    altitude: [100, 101, 102, 104, 105, 104, 103, 102, 104, 107, 108, 111, 99, 100, 103, 108, 107, 112]
  },
  {
    name: 'non-monotonic data with multiple qualifying future samples',
    time: Array.from({ length: 12 }, (_value, index) => index),
    distance: [0, 100, 5, 20, 15, 11, 50, 7, 17, 12, 22, 60],
    altitude: [0, 20, 5, 8, 7, 6, 18, 4, 9, 7, 12, 22]
  },
  {
    name: 'duplicate time slots',
    time: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6],
    distance: [0, 5, 11, 15, 20, 27, 31, 38, 44, 51],
    altitude: [10, 11, 12, 11, 13, 14, 13, 15, 17, 16]
  },
  {
    name: 'null and non-finite samples',
    time: [0, 1, null, 3, 4, Number.NaN, 6, 7, 8, 9, 10],
    distance: [null, 0, 5, Number.NaN, 12, 18, Number.POSITIVE_INFINITY, 25, null, 39, 48],
    altitude: [100, null, 102, 103, Number.NEGATIVE_INFINITY, 105, 106, Number.NaN, 108, null, 111]
  },
  {
    name: 'no future sample reaches the look-ahead distance',
    time: [0, 1, 2, 3, 4, 5],
    distance: [100, 101, 102, 103, 104, 105],
    altitude: [20, 21, 20, 22, 21, 23],
    aheadMeters: 25
  },
  {
    name: 'unequal stream lengths and trailing gaps',
    time: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    distance: [0, 3, null, 12, 16, Number.NaN, 28, 35],
    altitude: [50, null, 52, 54, 53, 55, null, 58, 59, 60, null, 63, 65, 66, 67],
    clamp: 30
  },
  {
    name: 'floating point values immediately around the look-ahead threshold',
    time: Array.from({ length: 9 }, (_value, index) => index),
    distance: [0, 9.999999999, 10, 10.000000001, 19.999999999, 20, 20.000000001, 30, 30.000000001],
    altitude: [0, 1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    name: 'zero look-ahead distance',
    time: [0, 1, 2, 3, 4, 5],
    distance: [0, 0, 5, 5, 10, 15],
    altitude: [10, 12, 15, 13, 20, 18],
    aheadMeters: 0
  },
  {
    name: 'negative look-ahead distance',
    time: [0, 1, 2, 3, 4, 5],
    distance: [0, 5, 3, 10, 8, 20],
    altitude: [10, 12, 11, 16, 15, 18],
    aheadMeters: -5
  },
  {
    name: 'infinite look-ahead distance',
    time: [0, 1, 2, 3, 4, 5],
    distance: [0, 5, 10, 15, 20, 25],
    altitude: [10, 12, 11, 16, 15, 18],
    aheadMeters: Number.POSITIVE_INFINITY
  },
  {
    name: 'not-a-number look-ahead distance',
    time: [0, 1, 2, 3, 4, 5],
    distance: [0, 5, 10, 15, 20, 25],
    altitude: [10, 12, 11, 16, 15, 18],
    aheadMeters: Number.NaN
  },
  {
    name: 'large finite values whose look-ahead threshold overflows',
    time: [0, 1, 2, 3],
    distance: [Number.MAX_VALUE / 2, Number.MAX_VALUE * 0.75, Number.MAX_VALUE * 0.9, Number.MAX_VALUE],
    altitude: [0, 10, 20, 30],
    aheadMeters: Number.MAX_VALUE
  },
  {
    name: 'zero grade clamp',
    time: [0, 1, 2, 3, 4],
    distance: [0, 10, 20, 30, 40],
    altitude: [0, 5, -5, 10, -10],
    clamp: 0
  },
  {
    name: 'all measurements invalid',
    time: [0, 1, 2, 3],
    distance: [null, Number.NaN, Number.POSITIVE_INFINITY, null],
    altitude: [Number.NaN, null, Number.NEGATIVE_INFINITY, null]
  }
];

const createRandom = (initialSeed: number): (() => number) => {
  let state = initialSeed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const createRandomCase = (seed: number): GradeStreamCase => {
  const random = createRandom(seed);
  const length = 1 + Math.floor(random() * 160);
  const time: StreamValue[] = [];
  const distance: StreamValue[] = [];
  const altitude: StreamValue[] = [];
  let currentDistance = 0;
  let currentAltitude = 100;

  for (let index = 0; index < length; index++) {
    const timeChoice = random();
    time.push(timeChoice < 0.12 ? null : timeChoice < 0.2 && index > 0 ? (time[index - 1] ?? index) : index);

    const distanceChoice = random();
    if (distanceChoice < 0.1) {
      distance.push(null);
    } else if (distanceChoice < 0.14) {
      distance.push(Number.NaN);
    } else if (distanceChoice < 0.17) {
      distance.push(Number.POSITIVE_INFINITY);
    } else {
      if (distanceChoice < 0.34) {
        // Stationary or duplicate distance.
      } else if (distanceChoice < 0.43) {
        currentDistance -= random() * 20;
      } else if (distanceChoice < 0.48) {
        currentDistance = random() * 25;
      } else {
        currentDistance += random() * 14;
      }
      distance.push(Math.round(currentDistance * 100) / 100);
    }

    const altitudeChoice = random();
    if (altitudeChoice < 0.1) {
      altitude.push(null);
    } else if (altitudeChoice < 0.14) {
      altitude.push(Number.NaN);
    } else if (altitudeChoice < 0.17) {
      altitude.push(Number.NEGATIVE_INFINITY);
    } else {
      currentAltitude += random() * 8 - 4;
      altitude.push(Math.round(currentAltitude * 100) / 100);
    }
  }

  return {
    name: `deterministic corrupt stream seed ${seed}`,
    time,
    distance,
    altitude,
    aheadMeters: [0, 1, 10, 25][seed % 4],
    clamp: [10, 30, 50, 100][seed % 4]
  };
};

const createMonotonicRandomCase = (seed: number): GradeStreamCase => {
  const random = createRandom(seed ^ 0x9e3779b9);
  const length = 1 + Math.floor(random() * 200);
  const time: StreamValue[] = [];
  const distance: StreamValue[] = [];
  const altitude: StreamValue[] = [];
  let currentDistance = random() * 10;
  let currentAltitude = 100 + random() * 20;

  for (let index = 0; index < length; index++) {
    const timeChoice = random();
    time.push(timeChoice < 0.1 ? null : timeChoice < 0.18 && index > 0 ? (time[index - 1] ?? index) : index);

    const distanceChoice = random();
    if (distanceChoice < 0.1) {
      distance.push(null);
    } else if (distanceChoice < 0.14) {
      distance.push(Number.NaN);
    } else {
      if (distanceChoice >= 0.35) {
        currentDistance += random() * 15;
      }
      distance.push(Math.round(currentDistance * 1000) / 1000);
    }

    const altitudeChoice = random();
    if (altitudeChoice < 0.1) {
      altitude.push(null);
    } else if (altitudeChoice < 0.14) {
      altitude.push(Number.NaN);
    } else {
      currentAltitude += random() * 6 - 3;
      altitude.push(Math.round(currentAltitude * 1000) / 1000);
    }
  }

  return {
    name: `deterministic monotonic stream seed ${seed}`,
    time,
    distance,
    altitude,
    aheadMeters: [0, 0.001, 1, 10, 25][seed % 5],
    clamp: [0, 10, 30, 50, 100][seed % 5]
  };
};

describe('GradeCalculator legacy output preservation', () => {
  describe.each(namedCases)('$name', testCase => {
    it('preserves time-indexed grade values and does not mutate inputs', () => {
      const originalTime = [...testCase.time];
      const originalDistance = [...testCase.distance];
      const originalAltitude = [...testCase.altitude];

      expect(
        GradeCalculator.computeGradeStream(
          testCase.time,
          testCase.distance,
          testCase.altitude,
          testCase.aheadMeters,
          testCase.clamp
        )
      ).toStrictEqual(
        legacyComputeGradeStream(
          testCase.time,
          testCase.distance,
          testCase.altitude,
          testCase.aheadMeters,
          testCase.clamp
        )
      );
      expect(testCase.time).toStrictEqual(originalTime);
      expect(testCase.distance).toStrictEqual(originalDistance);
      expect(testCase.altitude).toStrictEqual(originalAltitude);
    });

    it('preserves point-indexed grade values and does not mutate inputs', () => {
      const originalDistance = [...testCase.distance];
      const originalAltitude = [...testCase.altitude];

      expect(
        GradeCalculator.computeGradeStreamByDistance(
          testCase.distance,
          testCase.altitude,
          testCase.aheadMeters,
          testCase.clamp
        )
      ).toStrictEqual(
        legacyComputeGradeStreamByDistance(testCase.distance, testCase.altitude, testCase.aheadMeters, testCase.clamp)
      );
      expect(testCase.distance).toStrictEqual(originalDistance);
      expect(testCase.altitude).toStrictEqual(originalAltitude);
    });
  });

  it.each(Array.from({ length: 64 }, (_value, index) => createRandomCase(index + 1)))(
    'matches the legacy implementation for $name',
    testCase => {
      expect(
        GradeCalculator.computeGradeStream(
          testCase.time,
          testCase.distance,
          testCase.altitude,
          testCase.aheadMeters,
          testCase.clamp
        )
      ).toStrictEqual(
        legacyComputeGradeStream(
          testCase.time,
          testCase.distance,
          testCase.altitude,
          testCase.aheadMeters,
          testCase.clamp
        )
      );
      expect(
        GradeCalculator.computeGradeStreamByDistance(
          testCase.distance,
          testCase.altitude,
          testCase.aheadMeters,
          testCase.clamp
        )
      ).toStrictEqual(
        legacyComputeGradeStreamByDistance(testCase.distance, testCase.altitude, testCase.aheadMeters, testCase.clamp)
      );
    }
  );

  it.each(Array.from({ length: 64 }, (_value, index) => createMonotonicRandomCase(index + 1)))(
    'matches the legacy implementation for $name',
    testCase => {
      expect(
        GradeCalculator.computeGradeStream(
          testCase.time,
          testCase.distance,
          testCase.altitude,
          testCase.aheadMeters,
          testCase.clamp
        )
      ).toStrictEqual(
        legacyComputeGradeStream(
          testCase.time,
          testCase.distance,
          testCase.altitude,
          testCase.aheadMeters,
          testCase.clamp
        )
      );
      expect(
        GradeCalculator.computeGradeStreamByDistance(
          testCase.distance,
          testCase.altitude,
          testCase.aheadMeters,
          testCase.clamp
        )
      ).toStrictEqual(
        legacyComputeGradeStreamByDistance(testCase.distance, testCase.altitude, testCase.aheadMeters, testCase.clamp)
      );
    }
  );
});

describe('GradeCalculator large-stream regression guards', () => {
  it('does not perform per-sample suffix slicing in either grade path', () => {
    const length = 2048;
    const time = Array.from({ length }, (_value, index) => index);
    const distance = Array.from({ length }, (_value, index) => index % 97);
    const altitude = Array.from({ length }, () => 100);
    const sliceSpy = jest.spyOn(Array.prototype, 'slice');
    let sliceCalls = Number.POSITIVE_INFINITY;

    try {
      GradeCalculator.computeGradeStream(time, distance, altitude);
      GradeCalculator.computeGradeStreamByDistance(distance, altitude);
      sliceCalls = sliceSpy.mock.calls.length;
    } finally {
      sliceSpy.mockRestore();
    }

    expect(sliceCalls).toBeLessThan(10);
  });

  it('preserves every sample in a large monotonic stream', () => {
    const length = 50_000;
    const time = Array.from({ length }, (_value, index) => index);
    const distance = Array.from({ length }, (_value, index) => index * 2);
    const altitude = Array.from({ length }, (_value, index) => index * 0.2);
    const expected = Array<number>(length).fill(10);
    expected[length - 1] = 0;

    expect(GradeCalculator.computeGradeStream(time, distance, altitude)).toStrictEqual(expected);
    expect(GradeCalculator.computeGradeStreamByDistance(distance, altitude)).toStrictEqual(expected);
  });

  it('preserves every sample in a large stream with repeated distance resets', () => {
    const length = 30_000;
    const time = Array.from({ length }, (_value, index) => index);
    const distance = Array.from({ length }, (_value, index) => index % 200);
    const altitude = Array<number>(length).fill(100);
    const expected = Array<number>(length).fill(0);

    expect(GradeCalculator.computeGradeStream(time, distance, altitude)).toStrictEqual(expected);
    expect(GradeCalculator.computeGradeStreamByDistance(distance, altitude)).toStrictEqual(expected);
  });
});
