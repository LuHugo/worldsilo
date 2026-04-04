import { create } from 'zustand';
import { PGlite } from '@electric-sql/pglite';
import { Species, SiloInstance, GrowthLog } from '../types';
import { seedSpecies } from '../db/seed';
import { simulateDay } from '../engine/growth';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function rgbToString(rgb: [number, number, number]): string {
  return `[${rgb[0]},${rgb[1]},${rgb[2]}]`;
}

function stringToRGB(str: string): [number, number, number] {
  const nums = str.replace(/[\[\]]/g, '').split(',').map(Number);
  return [nums[0], nums[1], nums[2]];
}

interface AppState {
  db: PGlite | null;
  species: Species[];
  instances: SiloInstance[];
  logs: GrowthLog[];
  selectedInstance: SiloInstance | null;
  activeTab: 'explorer' | 'silos';
  autoAdvance: boolean;
  loading: boolean;

  init: (db: PGlite) => Promise<void>;
  setActiveTab: (tab: 'explorer' | 'silos') => void;
  createSiloInstance: (speciesId: string, name: string) => Promise<void>;
  advanceDay: (instanceId: string) => Promise<void>;
  updateInstanceSettings: (instanceId: string, ec: number, rgb: [number, number, number]) => Promise<void>;
  selectInstance: (instance: SiloInstance | null) => void;
  setAutoAdvance: (value: boolean) => void;
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
  autoAdvance: false,
  loading: true,

  init: async (db: PGlite) => {
    set({ db, loading: true });

    const existing = await db.query('SELECT COUNT(*) FROM species');
    const count = Number((existing.rows[0] as any).count);

    if (count === 0) {
      for (const s of seedSpecies) {
        await db.query(
          'INSERT INTO species (id, name, ideal_ec, ideal_spectrum_rgb, total_days, base_growth_rate, description, icon) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
          [s.id, s.name, s.ideal_ec, rgbToString(s.ideal_spectrum_rgb), s.total_days, s.base_growth_rate, s.description, s.icon],
        );
      }
    }

    const speciesResult = await db.query('SELECT * FROM species');
    const species: Species[] = speciesResult.rows.map((r: any) => ({
      ...r,
      ideal_ec: Number(r.ideal_ec),
      ideal_spectrum_rgb: stringToRGB(r.ideal_spectrum_rgb),
      total_days: Number(r.total_days),
      base_growth_rate: Number(r.base_growth_rate),
    }));

    const instancesResult = await db.query('SELECT * FROM silo_instances');
    const instances: SiloInstance[] = instancesResult.rows.map((r: any) => ({
      ...r,
      start_time: Number(r.start_time),
      current_day: Number(r.current_day),
      current_biomass: Number(r.current_biomass),
      applied_ec: Number(r.applied_ec),
      applied_rgb: stringToRGB(r.applied_rgb),
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
      applied_rgb: [255, 255, 255],
      status: 'active',
    };

    await db.query(
      'INSERT INTO silo_instances (id, species_id, name, start_time, current_day, current_biomass, applied_ec, applied_rgb, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [instance.id, instance.species_id, instance.name, instance.start_time, instance.current_day, instance.current_biomass, instance.applied_ec, rgbToString(instance.applied_rgb), instance.status],
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

    const { biomassGain, spectrumMatch, nutrientEff } = simulateDay(
      sp.base_growth_rate,
      instance.applied_rgb,
      sp.ideal_spectrum_rgb,
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
      applied_rgb: instance.applied_rgb,
      biomass_gain: biomassGain,
      total_biomass: newBiomass,
      spectrum_match: spectrumMatch,
      nutrient_efficiency: nutrientEff,
    };

    await db.query(
      'INSERT INTO growth_logs (id, instance_id, day, timestamp, applied_ec, applied_rgb, biomass_gain, total_biomass, spectrum_match, nutrient_efficiency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [log.id, log.instance_id, log.day, log.timestamp, log.applied_ec, rgbToString(log.applied_rgb), log.biomass_gain, log.total_biomass, log.spectrum_match, log.nutrient_efficiency],
    );

    const updatedInstances = instances.map((i) =>
      i.id === instanceId ? { ...i, current_day: newDay, current_biomass: newBiomass, status: newStatus as 'active' | 'completed' | 'abandoned' } : i,
    );

    set({
      instances: updatedInstances,
      selectedInstance: updatedInstances.find((i) => i.id === instanceId) || null,
    });
  },

  updateInstanceSettings: async (instanceId, ec, rgb) => {
    const { db } = get();
    if (!db) return;

    await db.query(
      'UPDATE silo_instances SET applied_ec = $1, applied_rgb = $2 WHERE id = $3',
      [ec, rgbToString(rgb), instanceId],
    );

    const updatedInstances = get().instances.map((i) =>
      i.id === instanceId ? { ...i, applied_ec: ec, applied_rgb: rgb } : i,
    );

    set({
      instances: updatedInstances,
      selectedInstance: updatedInstances.find((i) => i.id === instanceId) || null,
    });
  },

  selectInstance: (instance) => set({ selectedInstance: instance }),

  setAutoAdvance: (value) => set({ autoAdvance: value }),

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
      applied_rgb: stringToRGB(r.applied_rgb),
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
      applied_rgb: stringToRGB(r.applied_rgb),
      biomass_gain: Number(r.biomass_gain),
      total_biomass: Number(r.total_biomass),
      spectrum_match: Number(r.spectrum_match),
      nutrient_efficiency: Number(r.nutrient_efficiency),
    }));

    set({ logs });
  },
}));
