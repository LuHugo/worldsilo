export type Spectrum4 = [number, number, number, number];

export interface Species {
  id: string;
  name: string;
  ideal_ec: number;
  ideal_spectrum: Spectrum4;
  total_days: number;
  base_growth_rate: number;
  description: string;
  icon: string;
}

export interface SiloInstance {
  id: string;
  species_id: string;
  name: string;
  start_time: number;
  current_day: number;
  current_biomass: number;
  applied_ec: number;
  applied_spectrum: Spectrum4;
  status: 'active' | 'completed' | 'abandoned';
}

export interface GrowthLog {
  id: string;
  instance_id: string;
  day: number;
  timestamp: number;
  applied_ec: number;
  applied_spectrum: Spectrum4;
  biomass_gain: number;
  total_biomass: number;
  spectrum_match: number;
  brightness_factor: number;
  nutrient_efficiency: number;
  r_fr_ratio: number;
}

export interface CompoundIngredient {
  compound: string;
  formula: string;
  amount_per_liter: number;
  provides: string;
}

export interface CompatibleSpecies {
  species_id: string;
  compatibility: number;
  manual_override?: boolean;
}

export interface NutrientFormula {
  id: string;
  name: string;
  category: 'leafy' | 'fruiting' | 'herb';
  n: number;
  p: number;
  k: number;
  ec_range: [number, number];
  ph_range: [number, number];
  macronutrients: CompoundIngredient[];
  micronutrients: CompoundIngredient[];
  description: string;
  compatible_species: CompatibleSpecies[];
}

export type Tab = 'explorer' | 'silos';
