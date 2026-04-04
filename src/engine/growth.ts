export function cosineSimilarity(a: [number, number, number], b: [number, number, number]): number {
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const magA = Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
  const magB = Math.sqrt(b[0] ** 2 + b[1] ** 2 + b[2] ** 2);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export function nutrientEfficiency(appliedEC: number, idealEC: number): number {
  const deviation = appliedEC - idealEC;
  const sigma = idealEC * 0.4;
  return Math.exp(-(deviation ** 2) / (2 * sigma ** 2));
}

export function simulateDay(
  baseRate: number,
  appliedRGB: [number, number, number],
  idealRGB: [number, number, number],
  appliedEC: number,
  idealEC: number,
): { biomassGain: number; spectrumMatch: number; nutrientEff: number } {
  const spectrumMatch = cosineSimilarity(appliedRGB, idealRGB);
  const nutrientEff = nutrientEfficiency(appliedEC, idealEC);
  const biomassGain = baseRate * spectrumMatch * nutrientEff;
  return {
    biomassGain: Math.max(0, biomassGain),
    spectrumMatch,
    nutrientEff,
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

export function calculateHealth(spectrumMatch: number, nutrientEff: number): number {
  return Math.round(((spectrumMatch + nutrientEff) / 2) * 100);
}

export function calculateHealthFromInstance(
  appliedRGB: [number, number, number],
  idealRGB: [number, number, number],
  appliedEC: number,
  idealEC: number,
): number {
  const spectrumMatch = cosineSimilarity(appliedRGB, idealRGB);
  const nutrientEff = nutrientEfficiency(appliedEC, idealEC);
  return calculateHealth(spectrumMatch, nutrientEff);
}
