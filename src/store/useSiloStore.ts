import { create } from 'zustand';
import { PGlite } from '@electric-sql/pglite';
import { Spectrum4, Species, SiloInstance, GrowthLog } from '../types';
import { seedSpecies } from '../db/seed';
import { simulateDay } from '../engine/growth';
import { useFormulaStore } from './useFormulaStore';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function spectrumToString(s: Spectrum4): string {
  return `[${s[0]},${s[1]},${s[2]},${s[3]}]`;
}

function stringToSpectrum(str: string | null | undefined): Spectrum4 {
  if (!str) return [255, 255, 255, 0];
  const nums = str.replace(/[\[\]]/g, '').split(',').map(Number);
  return [nums[0] || 0, nums[1] || 0, nums[2] || 0, nums[3] || 0];
}

interface AppState {
  db: PGlite | null;
  species: Species[];
  instances: SiloInstance[];
  logs: GrowthLog[];
  selectedInstance: SiloInstance | null;
  activeTab: 'explorer' | 'silos';
  loading: boolean;

  init: (db: PGlite) => Promise<void>;
  setActiveTab: (tab: 'explorer' | 'silos') => void;
  createSiloInstance: (speciesId: string, name: string) => Promise<void>;
  advanceDay: (instanceId: string) => Promise<void>;
  updateInstanceSettings: (instanceId: string, ec: number, spectrum: Spectrum4) => Promise<void>;
  selectInstance: (instance: SiloInstance | null) => void;
  refreshInstances: () => Promise<void>;
  refreshLogs: (instanceId: string) => Promise<void>;
}

export const useSiloStore = create<AppState>((set, get) => ({
  db: null,
  species: [],
  instances: [],
  logs: [],
  selectedInstance: null,
  activeTab: 'explorer',
  loading: true,

  init: async (db: PGlite) => {
    set({ db, loading: true });

    const existing = await db.query('SELECT COUNT(*) FROM species');
    const count = Number((existing.rows[0] as any).count);

    if (count === 0) {
      for (const s of seedSpecies) {
        await db.query(
          'INSERT INTO species (id, name, ideal_ec, ideal_spectrum, total_days, base_growth_rate, description, icon, category, is_system) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING',
          [s.id, s.name, s.ideal_ec, spectrumToString(s.ideal_spectrum), s.total_days, s.base_growth_rate, s.description, s.icon, s.category || null, true],
        );
      }
    } else {
      const missingCategory = await db.query('SELECT id, name FROM species WHERE category IS NULL AND is_system = true');
      const categoryMap: Record<string, string> = {
        'lettuce-butterhead': 'leafy',
        'basil-genovese': 'herb',
        'tomato-cherry': 'fruiting',
        'spinach-bloomsdale': 'leafy',
        'strawberry-albion': 'fruiting',
        'kale-lacinato': 'leafy',
      };
      for (const row of missingCategory.rows) {
        const cat = categoryMap[(row as any).id];
        if (cat) {
          await db.query('UPDATE species SET category = $1 WHERE id = $2', [cat, (row as any).id]);
        }
      }
    }

    const speciesResult = await db.query('SELECT * FROM species');
    const species: Species[] = speciesResult.rows.map((r: any) => ({
      ...r,
      ideal_ec: Number(r.ideal_ec),
      ideal_spectrum: stringToSpectrum(r.ideal_spectrum),
      total_days: Number(r.total_days),
      base_growth_rate: Number(r.base_growth_rate),
      is_system: r.is_system !== false,
      note: r.note || undefined,
      category: r.category || undefined,
    }));

    const formulasResult = await db.query('SELECT * FROM formulas WHERE is_system = false');
    const userFormulas: any[] = await Promise.all(formulasResult.rows.map(async (r: any) => {
      const speciesResult = await db.query('SELECT * FROM formula_species WHERE formula_id = $1', [r.id]);
      const compatible_species = speciesResult.rows.map((sr: any) => ({
        species_id: sr.species_id,
        compatibility: Number(sr.compatibility),
        from_user: sr.from_user,
      }));
      return {
        id: r.id,
        name: r.name,
        category: r.category,
        n: Number(r.n),
        p: Number(r.p),
        k: Number(r.k),
        ec_range: [Number(r.ec_min), Number(r.ec_max)],
        ph_range: [Number(r.ph_min), Number(r.ph_max)],
        macronutrients: [],
        micronutrients: [],
        description: r.description,
        is_system: false,
        user_id: r.user_id || undefined,
        note: r.note || undefined,
        compatible_species,
      };
    }));

    useFormulaStore.getState().setUserFormulas(userFormulas);

    const instancesResult = await db.query('SELECT * FROM silo_instances');
    const instances: SiloInstance[] = instancesResult.rows.map((r: any) => ({
      ...r,
      start_time: Number(r.start_time),
      current_day: Number(r.current_day),
      current_biomass: Number(r.current_biomass),
      applied_ec: Number(r.applied_ec),
      applied_spectrum: stringToSpectrum(r.applied_spectrum),
    }));

    set({ species, instances, loading: false });
  },

  setActiveTab: (tab) => set({ activeTab: tab, selectedInstance: null }),

  createSiloInstance: async (speciesId, name) => {
    const { db } = get();
    if (!db) return;

    const instance: SiloInstance = {
      id: generateId(),
      species_id: speciesId,
      name,
      start_time: Date.now(),
      current_day: 0,
      current_biomass: 0,
      applied_ec: 1.0,
      applied_spectrum: [255, 255, 255, 0],
      status: 'active',
    };

    await db.query(
      'INSERT INTO silo_instances (id, species_id, name, start_time, current_day, current_biomass, applied_ec, applied_spectrum, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [instance.id, instance.species_id, instance.name, instance.start_time, instance.current_day, instance.current_biomass, instance.applied_ec, spectrumToString(instance.applied_spectrum), instance.status],
    );

    set((state) => ({ instances: [...state.instances, instance] }));
  },

  advanceDay: async (instanceId) => {
    const { db, instances, species } = get();
    if (!db) return;

    const instance = instances.find((i) => i.id === instanceId);
    if (!instance || instance.status !== 'active') return;

    const sp = species.find((s) => s.id === instance.species_id);
    if (!sp) return;

    const { biomassGain, spectrumMatch, brightnessFactor, nutrientEff, rFrRatio: rfr } = simulateDay(
      sp.base_growth_rate,
      instance.applied_spectrum,
      sp.ideal_spectrum,
      instance.applied_ec,
      sp.ideal_ec,
    );

    const newDay = instance.current_day + 1;
    const newBiomass = instance.current_biomass + biomassGain;
    const newStatus = newDay >= sp.total_days ? 'completed' : 'active';

    await db.query(
      'UPDATE silo_instances SET current_day = $1, current_biomass = $2, status = $3 WHERE id = $4',
      [newDay, newBiomass, newStatus, instanceId],
    );

    const log: GrowthLog = {
      id: generateId(),
      instance_id: instanceId,
      day: newDay,
      timestamp: Date.now(),
      applied_ec: instance.applied_ec,
      applied_spectrum: instance.applied_spectrum,
      biomass_gain: biomassGain,
      total_biomass: newBiomass,
      spectrum_match: spectrumMatch,
      brightness_factor: brightnessFactor,
      nutrient_efficiency: nutrientEff,
      r_fr_ratio: rfr,
    };

    await db.query(
      'INSERT INTO growth_logs (id, instance_id, day, timestamp, applied_ec, applied_spectrum, biomass_gain, total_biomass, spectrum_match, brightness_factor, nutrient_efficiency, r_fr_ratio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [log.id, log.instance_id, log.day, log.timestamp, log.applied_ec, spectrumToString(log.applied_spectrum), log.biomass_gain, log.total_biomass, log.spectrum_match, log.brightness_factor, log.nutrient_efficiency, log.r_fr_ratio],
    );

    const updatedInstances = instances.map((i) =>
      i.id === instanceId ? { ...i, current_day: newDay, current_biomass: newBiomass, status: newStatus as 'active' | 'completed' | 'abandoned' } : i,
    );

    set({
      instances: updatedInstances,
      selectedInstance: updatedInstances.find((i) => i.id === instanceId) || null,
    });
  },

  updateInstanceSettings: async (instanceId, ec, spectrum) => {
    const { db } = get();
    if (!db) return;

    await db.query(
      'UPDATE silo_instances SET applied_ec = $1, applied_spectrum = $2 WHERE id = $3',
      [ec, spectrumToString(spectrum), instanceId],
    );

    const updatedInstances = get().instances.map((i) =>
      i.id === instanceId ? { ...i, applied_ec: ec, applied_spectrum: spectrum } : i,
    );

    set({
      instances: updatedInstances,
      selectedInstance: updatedInstances.find((i) => i.id === instanceId) || null,
    });
  },

  selectInstance: (instance) => set({ selectedInstance: instance }),

  refreshInstances: async () => {
    const { db } = get();
    if (!db) return;

    const result = await db.query('SELECT * FROM silo_instances');
    const instances: SiloInstance[] = result.rows.map((r: any) => ({
      ...r,
      start_time: Number(r.start_time),
      current_day: Number(r.current_day),
      current_biomass: Number(r.current_biomass),
      applied_ec: Number(r.applied_ec),
      applied_spectrum: stringToSpectrum(r.applied_spectrum),
    }));

    set({ instances });
  },

  refreshLogs: async (instanceId) => {
    const { db } = get();
    if (!db) return;

    const result = await db.query('SELECT * FROM growth_logs WHERE instance_id = $1 ORDER BY day ASC', [instanceId]);
    const logs: GrowthLog[] = result.rows.map((r: any) => ({
      ...r,
      day: Number(r.day),
      timestamp: Number(r.timestamp),
      applied_ec: Number(r.applied_ec),
      applied_spectrum: stringToSpectrum(r.applied_spectrum),
      biomass_gain: Number(r.biomass_gain),
      total_biomass: Number(r.total_biomass),
      spectrum_match: Number(r.spectrum_match),
      brightness_factor: Number(r.brightness_factor),
      nutrient_efficiency: Number(r.nutrient_efficiency),
      r_fr_ratio: Number(r.r_fr_ratio),
    }));

    set({ logs });
  },
}));
