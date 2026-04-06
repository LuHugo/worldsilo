import { NutrientFormula, Species, CompoundIngredient } from '../types';

function calculateCompatibility(species: Species, ecRange: [number, number]): number {
  const idealEC = species.ideal_ec;
  const [minEC, maxEC] = ecRange;
  const midEC = (minEC + maxEC) / 2;
  const halfRange = (maxEC - minEC) / 2;
  const distance = Math.abs(idealEC - midEC);
  if (distance <= halfRange) {
    return Math.round(100 - (distance / halfRange) * 15);
  }
  const outsideDistance = distance - halfRange;
  return Math.max(20, Math.round(85 - (outsideDistance / 1.0) * 40));
}

const seedSpecies: Species[] = [
  { id: 'lettuce-butterhead', name: 'Butterhead Lettuce', ideal_ec: 1.4, ideal_spectrum: [220, 60, 180, 20], total_days: 45, base_growth_rate: 2.8, description: '', icon: '🥬' },
  { id: 'basil-genovese', name: 'Genovese Basil', ideal_ec: 1.8, ideal_spectrum: [200, 80, 160, 40], total_days: 60, base_growth_rate: 2.2, description: '', icon: '🌿' },
  { id: 'tomato-cherry', name: 'Cherry Tomato', ideal_ec: 2.4, ideal_spectrum: [240, 40, 120, 80], total_days: 90, base_growth_rate: 1.6, description: '', icon: '🍅' },
  { id: 'spinach-bloomsdale', name: 'Bloomsdale Spinach', ideal_ec: 1.6, ideal_spectrum: [160, 80, 220, 10], total_days: 40, base_growth_rate: 2.5, description: '', icon: '🍃' },
  { id: 'strawberry-albion', name: 'Albion Strawberry', ideal_ec: 1.8, ideal_spectrum: [230, 50, 140, 60], total_days: 120, base_growth_rate: 1.2, description: '', icon: '🍓' },
  { id: 'kale-lacinato', name: 'Lacinato Kale', ideal_ec: 2.0, ideal_spectrum: [180, 100, 200, 25], total_days: 55, base_growth_rate: 2.0, description: '', icon: '🥗' },
];

const leafyMacro: CompoundIngredient[] = [
  { compound: 'Calcium Nitrate', formula: 'Ca(NO₃)₂·4H₂O', amount_per_liter: 470, provides: 'Ca, N' },
  { compound: 'Potassium Nitrate', formula: 'KNO₃', amount_per_liter: 320, provides: 'K, N' },
  { compound: 'Monopotassium Phosphate', formula: 'KH₂PO₄', amount_per_liter: 85, provides: 'P, K' },
  { compound: 'Magnesium Sulfate', formula: 'MgSO₄·7H₂O', amount_per_liter: 250, provides: 'Mg, S' },
];

const leafyMicro: CompoundIngredient[] = [
  { compound: 'Fe-EDTA', formula: 'Fe-EDTA', amount_per_liter: 20, provides: 'Fe' },
  { compound: 'Boric Acid', formula: 'H₃BO₃', amount_per_liter: 2.8, provides: 'B' },
  { compound: 'Manganese Sulfate', formula: 'MnSO₄·H₂O', amount_per_liter: 1.5, provides: 'Mn' },
  { compound: 'Zinc Sulfate', formula: 'ZnSO₄·7H₂O', amount_per_liter: 0.22, provides: 'Zn' },
  { compound: 'Copper Sulfate', formula: 'CuSO₄·5H₂O', amount_per_liter: 0.08, provides: 'Cu' },
  { compound: 'Ammonium Molybdate', formula: '(NH₄)₆Mo₇O₂₄', amount_per_liter: 0.02, provides: 'Mo' },
];

const herbMacro: CompoundIngredient[] = [
  { compound: 'Calcium Nitrate', formula: 'Ca(NO₃)₂·4H₂O', amount_per_liter: 400, provides: 'Ca, N' },
  { compound: 'Potassium Nitrate', formula: 'KNO₃', amount_per_liter: 280, provides: 'K, N' },
  { compound: 'Monopotassium Phosphate', formula: 'KH₂PO₄', amount_per_liter: 90, provides: 'P, K' },
  { compound: 'Magnesium Sulfate', formula: 'MgSO₄·7H₂O', amount_per_liter: 230, provides: 'Mg, S' },
];

const herbMicro: CompoundIngredient[] = [
  { compound: 'Fe-EDTA', formula: 'Fe-EDTA', amount_per_liter: 20, provides: 'Fe' },
  { compound: 'Boric Acid', formula: 'H₃BO₃', amount_per_liter: 2.8, provides: 'B' },
  { compound: 'Manganese Sulfate', formula: 'MnSO₄·H₂O', amount_per_liter: 1.5, provides: 'Mn' },
  { compound: 'Zinc Sulfate', formula: 'ZnSO₄·7H₂O', amount_per_liter: 0.22, provides: 'Zn' },
  { compound: 'Copper Sulfate', formula: 'CuSO₄·5H₂O', amount_per_liter: 0.08, provides: 'Cu' },
  { compound: 'Ammonium Molybdate', formula: '(NH₄)₆Mo₇O₂₄', amount_per_liter: 0.02, provides: 'Mo' },
];

const fruitingMacro: CompoundIngredient[] = [
  { compound: 'Calcium Nitrate', formula: 'Ca(NO₃)₂·4H₂O', amount_per_liter: 380, provides: 'Ca, N' },
  { compound: 'Potassium Nitrate', formula: 'KNO₃', amount_per_liter: 450, provides: 'K, N' },
  { compound: 'Monopotassium Phosphate', formula: 'KH₂PO₄', amount_per_liter: 140, provides: 'P, K' },
  { compound: 'Magnesium Sulfate', formula: 'MgSO₄·7H₂O', amount_per_liter: 280, provides: 'Mg, S' },
];

const fruitingMicro: CompoundIngredient[] = [
  { compound: 'Fe-EDTA', formula: 'Fe-EDTA', amount_per_liter: 25, provides: 'Fe' },
  { compound: 'Boric Acid', formula: 'H₃BO₃', amount_per_liter: 3.0, provides: 'B' },
  { compound: 'Manganese Sulfate', formula: 'MnSO₄·H₂O', amount_per_liter: 1.5, provides: 'Mn' },
  { compound: 'Zinc Sulfate', formula: 'ZnSO₄·7H₂O', amount_per_liter: 0.22, provides: 'Zn' },
  { compound: 'Copper Sulfate', formula: 'CuSO₄·5H₂O', amount_per_liter: 0.1, provides: 'Cu' },
  { compound: 'Ammonium Molybdate', formula: '(NH₄)₆Mo₇O₂₄', amount_per_liter: 0.02, provides: 'Mo' },
];

export const nutrientFormulas: NutrientFormula[] = [
  {
    id: 'leafy-green',
    name: 'Leafy Green Formula',
    category: 'leafy',
    n: 3,
    p: 1,
    k: 4,
    ec_range: [1.0, 2.4],
    ph_range: [5.5, 7.0],
    macronutrients: leafyMacro,
    micronutrients: leafyMicro,
    description: 'Universal formula for leafy greens. High potassium promotes strong cell walls and thick leaf development. Moderate nitrogen supports steady growth without excessive leaf expansion.',
    is_system: true,
    compatible_species: seedSpecies
      .filter(s => ['lettuce-butterhead', 'kale-lacinato', 'spinach-bloomsdale'].includes(s.id))
      .map(s => ({ species_id: s.id, compatibility: calculateCompatibility(s, [1.0, 2.4]), from_user: false }))
      .sort((a, b) => b.compatibility - a.compatibility),
  },
  {
    id: 'herb',
    name: 'Herb & Aromatic Formula',
    category: 'herb',
    n: 3,
    p: 1,
    k: 3,
    ec_range: [1.2, 2.2],
    ph_range: [5.5, 7.0],
    macronutrients: herbMacro,
    micronutrients: herbMicro,
    description: 'Balanced N-K ratio ideal for herbs and aromatic plants. Promotes essential oil production and rich flavor development without excessive vegetative growth.',
    is_system: true,
    compatible_species: seedSpecies
      .filter(s => ['basil-genovese', 'spinach-bloomsdale', 'lettuce-butterhead'].includes(s.id))
      .map(s => ({ species_id: s.id, compatibility: calculateCompatibility(s, [1.2, 2.2]), from_user: false }))
      .sort((a, b) => b.compatibility - a.compatibility),
  },
  {
    id: 'fruiting',
    name: 'Fruiting Crop Formula',
    category: 'fruiting',
    n: 2,
    p: 2,
    k: 4,
    ec_range: [1.4, 3.0],
    ph_range: [5.5, 6.5],
    macronutrients: fruitingMacro,
    micronutrients: fruitingMicro,
    description: 'Higher EC formula for fruiting crops. Balanced N-P-K supports flowering and fruit development. Extra calcium prevents blossom end rot in tomatoes and firmness in strawberries.',
    is_system: true,
    compatible_species: seedSpecies
      .filter(s => ['tomato-cherry', 'strawberry-albion'].includes(s.id))
      .map(s => ({ species_id: s.id, compatibility: calculateCompatibility(s, [1.4, 3.0]), from_user: false }))
      .sort((a, b) => b.compatibility - a.compatibility),
  },
];
