import type { Spectrum4 } from '../types';

const MCCREE_EFFICIENCY = [0.65, 0.90, 0.60, 1.00];

export function cosineSimilarity4(a: Spectrum4, b: Spectrum4): number {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const magA = Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2 + a[3] ** 2);
  const magB = Math.sqrt(b[0] ** 2 + b[1] ** 2 + b[2] ** 2 + b[3] ** 2);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export function mcCreeSpectrumMatch(applied: Spectrum4, ideal: Spectrum4): number {
  const appliedNorm = applied.map((v) => v / 255) as number[];
  const idealNorm = ideal.map((v) => v / 255) as number[];

  let appliedWeighted = 0;
  let idealWeighted = 0;

  for (let i = 0; i < 4; i++) {
    appliedWeighted += appliedNorm[i] * MCCREE_EFFICIENCY[i];
    idealWeighted += idealNorm[i] * MCCREE_EFFICIENCY[i];
  }

  if (idealWeighted === 0) return 0;

  const match = Math.min(appliedWeighted, idealWeighted) / idealWeighted;
  const shape = cosineSimilarity4(applied, ideal);

  return match * 0.6 + shape * 0.4;
}

export function brightnessFactor(spectrum: Spectrum4): number {
  const avg = (spectrum[0] + spectrum[1] + spectrum[2] + spectrum[3]) / (255 * 4);
  return Math.pow(avg, 0.7);
}

export function nutrientEfficiency(appliedEC: number, idealEC: number): number {
  const deviation = appliedEC - idealEC;
  const sigma = idealEC * 0.4;
  return Math.exp(-(deviation ** 2) / (2 * sigma ** 2));
}

export function rFrRatio(spectrum: Spectrum4): number {
  const r = spectrum[0];
  const fr = spectrum[3];
  if (fr === 0) return r > 0 ? 10 : 0;
  return r / fr;
}

export function rFrPenalty(spectrum: Spectrum4, idealRFR: number): number {
  const actual = rFrRatio(spectrum);
  const ratio = actual / idealRFR;
  if (ratio < 0.5) return 0.5 + ratio;
  if (ratio > 3) return 1.5 / ratio;
  return 1.0;
}

export function simulateDay(
  baseRate: number,
  appliedSpectrum: Spectrum4,
  idealSpectrum: Spectrum4,
  appliedEC: number,
  idealEC: number,
): { biomassGain: number; spectrumMatch: number; brightnessFactor: number; nutrientEff: number; rFrRatio: number; rFrPenalty: number } {
  const spectrumMatch = mcCreeSpectrumMatch(appliedSpectrum, idealSpectrum);
  const brightFactor = brightnessFactor(appliedSpectrum);
  const nutrientEff = nutrientEfficiency(appliedEC, idealEC);
  const idealRFR = rFrRatio(idealSpectrum);
  const rfrPenalty = rFrPenalty(appliedSpectrum, idealRFR);
  const rfr = rFrRatio(appliedSpectrum);

  const biomassGain = baseRate * spectrumMatch * brightFactor * nutrientEff * rfrPenalty;

  return {
    biomassGain: Math.max(0, biomassGain),
    spectrumMatch,
    brightnessFactor: brightFactor,
    nutrientEff,
    rFrRatio: rfr,
    rFrPenalty: rfrPenalty,
  };
}

export function getIdealBiomassCurve(baseRate: number, totalDays: number): number[] {
  const curve: number[] = [];
  let biomass = 0;
  for (let day = 0; day <= totalDays; day++) {
    curve.push(biomass);
    if (day < totalDays) {
      biomass += baseRate * 0.95;
    }
  }
  return curve;
}

export function calculateHealth(
  spectrumMatch: number,
  brightFactor: number,
  nutrientEff: number,
  rfrPenalty: number,
): number {
  return Math.round(((spectrumMatch + brightFactor + nutrientEff + rfrPenalty) / 4) * 100);
}

export function calculateHealthFromInstance(
  appliedSpectrum: Spectrum4,
  idealSpectrum: Spectrum4,
  appliedEC: number,
  idealEC: number,
): number {
  const { spectrumMatch, brightnessFactor: bf, nutrientEff, rFrPenalty: rfrP } = simulateDay(
    1.0,
    appliedSpectrum,
    idealSpectrum,
    appliedEC,
    idealEC,
  );
  return calculateHealth(spectrumMatch, bf, nutrientEff, rfrP);
}
