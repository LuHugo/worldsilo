import { create } from 'zustand';
import { PGlite } from '@electric-sql/pglite';

interface Usertate {
  db: PGlite | null;
  autoAdvance: boolean;
  init: (db: PGlite) => void;
  setAutoAdvance: (value: boolean) => void;
  setDb: (db: PGlite) => void;
  exportData: () => Promise<void>;
  importData: (data: any) => Promise<void>;
  clearAllData: () => Promise<void>;
  clearInstances: () => Promise<void>;
  clearFormulas: () => Promise<void>;
}

export const useUsertore = create<Usertate>((set, get) => ({
  db: null,
  autoAdvance: false,

  init: (db: PGlite) => set({ db }),

  setAutoAdvance: (autoAdvance) => set({ autoAdvance }),

  setDb: (db: PGlite) => set({ db }),

  exportData: async () => {
    const { db } = get();
    if (!db) return;

    const speciesResult = await db.query('SELECT * FROM species');
    const instancesResult = await db.query('SELECT * FROM silo_instances');
    const logsResult = await db.query('SELECT * FROM growth_logs');

    const data = {
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      species: speciesResult.rows,
      instances: instancesResult.rows,
      logs: logsResult.rows,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worldsilo-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: async (data: any) => {
    const { db } = get();
    if (!db) return;

    for (const s of data.species || []) {
      await db.query(
        `INSERT INTO species (id, name, ideal_ec, ideal_spectrum, total_days, base_growth_rate, description, icon, category, user_id, is_system, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.name, s.ideal_ec, s.ideal_spectrum, s.total_days, s.base_growth_rate, s.description, s.icon, s.category, s.user_id, s.is_system, s.note],
      );
    }

    for (const i of data.instances || []) {
      await db.query(
        `INSERT INTO silo_instances (id, species_id, name, start_time, current_day, current_biomass, applied_ec, applied_spectrum, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [i.id, i.species_id, i.name, i.start_time, i.current_day, i.current_biomass, i.applied_ec, i.applied_spectrum, i.status],
      );
    }

    for (const l of data.logs || []) {
      await db.query(
        `INSERT INTO growth_logs (id, instance_id, day, biomass, ec, spectrum, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [l.id, l.instance_id, l.day, l.biomass, l.ec, l.spectrum, l.timestamp],
      );
    }
  },

  clearAllData: async () => {
    const { db } = get();
    if (!db) return;

    await db.query('DELETE FROM growth_logs');
    await db.query('DELETE FROM silo_instances');
    await db.query('DELETE FROM formula_species');
    await db.query('DELETE FROM formula_compounds');
    await db.query('DELETE FROM formulas WHERE is_system = false');
    await db.query('DELETE FROM species WHERE is_system = false');
  },

  clearInstances: async () => {
    const { db } = get();
    if (!db) return;

    await db.query('DELETE FROM growth_logs');
    await db.query('DELETE FROM silo_instances');
  },

  clearFormulas: async () => {
    const { db } = get();
    if (!db) return;

    await db.query('DELETE FROM formula_species');
    await db.query('DELETE FROM formula_compounds');
    await db.query('DELETE FROM formulas WHERE is_system = false');
  },
}));
