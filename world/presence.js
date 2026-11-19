// Optional action extension. The existing [sit, bow, palms] packet stays intact.
// Kind 1 is cloud hands, kind 2 wooden sword, kind 3 empty-hand practice.
export function readPractice(value) {
  return Array.isArray(value) && value.length === 3 && [1,2,3].includes(value[0]) &&
    Number.isInteger(value[1]) && value[1] >= 0 && value[1] <= 2 &&
    Number.isFinite(value[2]) && value[2] >= 0 && value[2] < 1
    ? [...value] : null;
}

// Extrapolate at most 600 ms, then hold. A stalled connection must not invent
// new movements or finish somebody else's lesson.
export function samplePractice(value, elapsed) {
  const p = readPractice(value);
  if (!p) return null;
  p[2] = (p[2] + Math.max(0, Math.min(.6, Number.isFinite(elapsed) ? elapsed : 0)) / 5) % 1;
  return p;
}

// Optional chair pose; absent/unknown values keep the original cushion pose.
export const readBench=value=>value===1?1:0;
