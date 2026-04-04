export interface Species {
  id: string;
  name: string;
  ideal_ec: number;
  ideal_spectrum_rgb: [number, number, number];
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
  applied_rgb: [number, number, number];
  status: 'active' | 'completed' | 'abandoned';
}

export interface GrowthLog {
  id: string;
  instance_id: string;
  day: number;
  timestamp: number;
  applied_ec: number;
  applied_rgb: [number, number, number];
  biomass_gain: number;
  total_biomass: number;
  spectrum_match: number;
  nutrient_efficiency: number;
}

export type Tab = 'explorer' | 'silos';
