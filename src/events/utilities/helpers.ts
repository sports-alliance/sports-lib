export function isNumberOrString(property: any) {
  return typeof property === 'number' || typeof property === 'string';
}

export function isNumber(property: any) {
  return typeof property === 'number' && !isNaN(property);
}

/**
 * Converts speed from m/s to pace as of seconds per km
 * @param {number} number
 * @return {number}
 */
export function convertSpeedToPace(number: number): number {
  return number === 0 ? Infinity : 1000 / number;
}

/**
 * Converts m/s to seconds per 100m
 * @param number
 */
export function convertSpeedToSwimPace(number: number): number {
  return number === 0 ? Infinity : 100 / number;
}

export function convertSpeedToSpeedInKilometersPerHour(number: number): number {
  return number * 3.6;
}

export function convertSpeedToSpeedInMilesPerHour(number: number): number {
  return number * 2.237;
}

export function convertSpeedToSpeedInFeetPerSecond(number: number): number {
  return number * 3.28084;
}

export function convertSpeedToSpeedInMetersPerMinute(number: number): number {
  return number * 60;
}

export function convertSpeedToSpeedInFeetPerMinute(number: number): number {
  return number * 196.85;
}

export function convertSpeedToSpeedInFeetPerHour(number: number): number {
  return number * 11811.024;
}

export function convertSpeedToSpeedInMetersPerHour(number: number): number {
  return number * 3600;
}

export function convertSpeedToSpeedInKnots(number: number): number {
  return number * 1.943844;
}

export function convertPaceToPaceInMinutesPerMile(number: number): number {
  return number * 1.60934;
}

export function convertMetersToMiles(number: number): number {
  return number === 0 ? 0 : number / 1609;
}

/**
 * Converts m/s to seconds per 100m
 * @param number
 */
export function convertSwimPaceToSwimPacePer100Yard(number: number): number {
  return number * 1.93613298;
}

export function getSize(obj: any): number {
  return <number>getSizeWithOptionalFormat(obj, false);
}

export function getSizeFormated(obj: any): string {
  return <string>getSizeWithOptionalFormat(obj, true);
}

function getSizeWithOptionalFormat(obj: any, format = true): string | number {
  let size;
  try {
    size = new Blob([obj]).size;
  } catch (e) {
    size = Buffer.from(obj).length;
  }

  function formatByteSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(4) + ' KiB';
    } else if (bytes < 1073741824) {
      return (bytes / 1048576).toFixed(4) + ' MiB';
    } else {
      return (bytes / 1073741824).toFixed(4) + ' GiB';
    }
  }

  return format ? formatByteSize(size) : size;
}

/**
 * from https://stackoverflow.com/questions/48340403/fill-missing-numeric-values-in-an-array
 * Very badly written
 * @param array
 */
export function fillMissingValuesLinear(array: (number | null)[]): number[] {
  let i = 0,
    j,
    delta;
  while (i < array.length) {
    if (array[i] !== null) {
      i++;
      continue;
    }
    j = i;
    // eslint-disable-next-line no-empty
    while (array[++j] === null) {}
    // @ts-ignore
    delta = (array[j] - array[i - 1]) / (j - i + 1);
    do {
      // @ts-ignore
      array[i] = delta + array[i - 1];
      i++;
    } while (i < j);
  }
  return <number[]>array;
}

export const mean = (array: number[]): number => {
  return array.reduce((a: number, b: number) => a + b, 0) / array.length;
};

export const meanWindowSmoothing = (array: number[], windowSize = 7, roundDecimals = 3): number[] => {
  const roundDecimalsFactor = 10 ** roundDecimals;
  return array.map((value: number, index: number) => {
    const window = array.slice(index, index + windowSize); // Get window
    return Math.round(mean(window) * roundDecimalsFactor) / roundDecimalsFactor; // Round and return
  });
};

const median = (inputArray: number[]): number => {
  const s = inputArray.slice().sort((a: number, b: number) => {
    return a - b;
  });
  return s[Math.floor((s.length - 1) / 2)];
};

/**
 * Remove spikes into a vector (http://fourier.eng.hmc.edu/e161/lectures/smooth_sharpen/node2.html)
 * @param array to be filtered
 * @param window Window size (should be odd number)
 */
export const medianFilter = (array: number[], window = 11) => {
  if (window % 2 === 0) {
    throw new Error('Window size should be an odd number');
  }

  if (array.length < window) {
    return array;
  }
  const f = [];
  const w = [];
  let i;
  w.push(array[0]);
  for (i = 0; i < array.length; i++) {
    const midWindowIndex = Math.floor(window / 2);
    if (array.length - 1 >= i + midWindowIndex) {
      w.push(array[i + midWindowIndex]);
    }
    f.push(median(w));
    if (i >= midWindowIndex) {
      w.shift();
    }
  }
  return f;
};

export const standardDeviation = (stream: number[]): number => {
  const avg = mean(stream);
  const variance = mean(stream.map(value => Math.pow(value, 2))) - Math.pow(avg, 2);
  return variance > 0 ? Math.sqrt(variance) : 0;
};
