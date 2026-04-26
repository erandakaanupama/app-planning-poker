import type { Vote } from '../types';

export function calculateAverage(votes: Vote[]): string {
  const numeric = votes
    .map((v) => parseFloat(v.value))
    .filter((n) => !isNaN(n));

  if (numeric.length === 0) return 'N/A';

  const sum = numeric.reduce((acc, n) => acc + n, 0);
  const avg = sum / numeric.length;

  return Number.isInteger(avg) ? avg.toString() : avg.toFixed(1);
}
