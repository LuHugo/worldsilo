import { create } from 'zustand';
import { Species } from '../types';
import { PGlite } from '@electric-sql/pglite';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function spectrumToString(s: [number, number, number, number]): string {
  return `[${s[0]},${s[1]},${s[2]},${s[3]}]`;
}

interface PlantState {
  db: PGlite | null;
  init: (db: PGlite) => void;
  addUserSpecies: (species: Omit<Species, 'is_system'>, userId?: string) => Promise<void>;
  updateUserSpeciesNote: (speciesId: string, note: string) => Promise<void>;
  deleteUserSpecies: (speciesId: string) => Promise<void>;
  addToMyPlants: (speciesId: string, userId?: string) => Promise<boolean>;
}

export const usePlantStore = create<PlantState>((set, get) => ({
  db: null,

  init: (db: PGlite) => {
    set({ db });
  },

  addUserSpecies: async (species: Omit<Species, 'is_system'>, userId?: string) => {
    const { db } = get();
    if (!db) return;

    const id = species.id || generateId();
    await db.query(
      'INSERT INTO species (id, name, ideal_ec, ideal_spectrum, total_days, base_growth_rate, description, icon, category, user_id, is_system, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [id, species.name, species.ideal_ec, spectrumToString(species.ideal_spectrum), species.total_days, species.base_growth_rate, species.description, species.icon, species.category || null, userId || null, false, species.note || null],
    );
  },

  updateUserSpeciesNote: async (speciesId: string, note: string) => {
    const { db } = get();
    if (!db) return;

    await db.query('UPDATE species SET note = $1 WHERE id = $2', [note, speciesId]);
  },

  deleteUserSpecies: async (speciesId: string) => {
    const { db } = get();
    if (!db) return;

    await db.query('DELETE FROM species WHERE id = $1 AND is_system = false', [speciesId]);
  },

  addToMyPlants: async (speciesId: string, userId?: string): Promise<boolean> => {
    const { db } = get();
    if (!db) return false;

    const result = await db.query<Species>('SELECT * FROM species WHERE id = $1', [speciesId]);
    if (result.rows.length === 0) return false;

    const sourceSpecies = result.rows[0];
    const existing = await db.query(
      'SELECT id FROM species WHERE user_id = $1 AND name = $2 AND is_system = false',
      [userId || null, sourceSpecies.name],
    );
    if (existing.rows.length > 0) return false;

    const newId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await db.query(
      'INSERT INTO species (id, name, ideal_ec, ideal_spectrum, total_days, base_growth_rate, description, icon, category, user_id, is_system, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
      [newId, sourceSpecies.name, sourceSpecies.ideal_ec, sourceSpecies.ideal_spectrum, sourceSpecies.total_days, sourceSpecies.base_growth_rate, sourceSpecies.description, sourceSpecies.icon, sourceSpecies.category || null, userId || null, false, sourceSpecies.note || null],
    );

    return true;
  },
}));
