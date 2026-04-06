export type Spectrum4 = [number, number, number, number];

export type SpeciesCategory = 'leafy' | 'fruiting' | 'herb' | 'root' | 'legume' | 'fungi';

export const SPECIES_CATEGORIES: { key: SpeciesCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'leafy', label: 'LEAFY' },
  { key: 'herb', label: 'HERB' },
  { key: 'fruiting', label: 'FRUITING' },
  { key: 'root', label: 'ROOT' },
  { key: 'legume', label: 'LEGUME' },
  { key: 'fungi', label: 'FUNGI' },
];

export interface Species {
  id: string;
  name: string;
  ideal_ec: number;
  ideal_spectrum: Spectrum4;
  total_days: number;
  base_growth_rate: number;
  description: string;
  icon: string;
  category?: SpeciesCategory;
  is_system?: boolean;
  user_id?: string;
  note?: string;
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

export interface User {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: number;
}

export interface UserFormulaSpecies {
  id: string;
  formula_id: string;
  species_id: string;
  compatibility: number;
  from_user: boolean;
}

export interface CompatibleSpecies {
  species_id: string;
  compatibility: number;
  from_user: boolean;
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
  is_system?: boolean;
  user_id?: string;
  note?: string;
  compatible_species: CompatibleSpecies[];
}

export type Tab = 'explorer' | 'silos';
