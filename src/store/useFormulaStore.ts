import { create } from 'zustand';
import { PGlite } from '@electric-sql/pglite';
import { UserFormulaSpecies } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface FormulaState {
  db: PGlite | null;
  init: (db: PGlite) => void;
  userFormulas: any[];
  loading: boolean;
  setUserFormulas: (formulas: any[]) => void;
  addUserFormula: (formula: { id: string; name: string; category: string; n: number; p: number; k: number; ecMin: number; ecMax: number; phMin: number; phMax: number; description: string; note?: string }, userId?: string) => Promise<void>;
  addToMyFormulas: (formulaId: string, userId?: string) => Promise<boolean>;
  deleteUserFormula: (formulaId: string) => Promise<void>;
  addFormulaCompound: (formulaId: string, compound: { compound: string; formula: string; amount_per_liter: number; provides: string; is_macro: boolean }) => Promise<void>;
  loadFormulaCompounds: (formulaId: string) => Promise<{ macronutrients: any[]; micronutrients: any[] }>;
  deleteFormulaCompound: (compoundId: string) => Promise<void>;
  addFormulaSpecies: (formulaId: string, speciesId: string, compatibility: number) => Promise<void>;
  removeFormulaSpecies: (id: string) => Promise<void>;
  loadFormulaSpecies: (formulaId: string) => Promise<UserFormulaSpecies[]>;
}

export const useFormulaStore = create<FormulaState>((set, get) => ({
  db: null,
  userFormulas: [],
  loading: false,

  init: (db: PGlite) => {
    set({ db });
  },

  setUserFormulas: (formulas: any[]) => {
    set({ userFormulas: formulas });
  },

  addUserFormula: async (formula, userId) => {
    const { db, userFormulas } = get();
    if (!db) return;

    const id = formula.id || generateId();
    await db.query(
      'INSERT INTO formulas (id, user_id, is_system, name, category, n, p, k, ec_min, ec_max, ph_min, ph_max, description, note, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
      [id, userId || null, false, formula.name, formula.category, formula.n, formula.p, formula.k, formula.ecMin, formula.ecMax, formula.phMin, formula.phMax, formula.description, formula.note || null, Date.now()],
    );

    const newFormula = {
      id,
      name: formula.name,
      category: formula.category,
      n: formula.n,
      p: formula.p,
      k: formula.k,
      ec_range: [formula.ecMin, formula.ecMax] as [number, number],
      ph_range: [formula.phMin, formula.phMax] as [number, number],
      macronutrients: [],
      micronutrients: [],
      description: formula.description,
      is_system: false,
      user_id: userId,
      note: formula.note || undefined,
      compatible_species: [],
    };

    set({ userFormulas: [...userFormulas, newFormula] });
  },

  addToMyFormulas: async (formulaId: string, userId?: string): Promise<boolean> => {
    const { db, userFormulas } = get();
    if (!db) return false;

    const { nutrientFormulas } = await import('@/data/nutrientFormulas');
    const allFormulas = [...nutrientFormulas, ...userFormulas];
    const sourceFormula = allFormulas.find((f: any) => f.id === formulaId);
    if (!sourceFormula) return false;

    const existing = await db.query(
      'SELECT id FROM formulas WHERE user_id = $1 AND name = $2 AND is_system = false',
      [userId || null, sourceFormula.name],
    );
    if (existing.rows.length > 0) return false;

    const newId = `formula-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await db.query(
      'INSERT INTO formulas (id, user_id, is_system, name, category, n, p, k, ec_min, ec_max, ph_min, ph_max, description, note, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
      [newId, userId || null, false, sourceFormula.name, sourceFormula.category, sourceFormula.n, sourceFormula.p, sourceFormula.k, sourceFormula.ec_range[0], sourceFormula.ec_range[1], sourceFormula.ph_range[0], sourceFormula.ph_range[1], sourceFormula.description, sourceFormula.note || null, Date.now()],
    );

    for (const c of sourceFormula.macronutrients || []) {
      await db.query(
        'INSERT INTO formula_compounds (id, formula_id, compound, formula, amount_per_liter, provides, is_macro) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [generateId(), newId, c.compound, c.formula, c.amount_per_liter, c.provides, true],
      );
    }
    for (const c of sourceFormula.micronutrients || []) {
      await db.query(
        'INSERT INTO formula_compounds (id, formula_id, compound, formula, amount_per_liter, provides, is_macro) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [generateId(), newId, c.compound, c.formula, c.amount_per_liter, c.provides, false],
      );
    }

    for (const cs of sourceFormula.compatible_species || []) {
      await db.query(
        'INSERT INTO formula_species (id, formula_id, species_id, compatibility, from_user) VALUES ($1, $2, $3, $4, $5)',
        [generateId(), newId, cs.species_id, cs.compatibility, cs.from_user || false],
      );
    }

    const newFormula = {
      id: newId,
      name: sourceFormula.name,
      category: sourceFormula.category,
      n: sourceFormula.n,
      p: sourceFormula.p,
      k: sourceFormula.k,
      ec_range: sourceFormula.ec_range as [number, number],
      ph_range: sourceFormula.ph_range as [number, number],
      macronutrients: [],
      micronutrients: [],
      description: sourceFormula.description,
      is_system: false,
      user_id: userId,
      note: sourceFormula.note || undefined,
      compatible_species: sourceFormula.compatible_species || [],
    };

    set({ userFormulas: [...userFormulas, newFormula] });
    return true;
  },

  deleteUserFormula: async (formulaId: string) => {
    const { db, userFormulas } = get();
    if (!db) return;

    await db.query('DELETE FROM formula_compounds WHERE formula_id = $1', [formulaId]);
    await db.query('DELETE FROM formula_species WHERE formula_id = $1', [formulaId]);
    await db.query('DELETE FROM formulas WHERE id = $1 AND is_system = false', [formulaId]);

    set({ userFormulas: userFormulas.filter((f: any) => f.id !== formulaId) });
  },

  addFormulaCompound: async (formulaId, compound) => {
    const { db } = get();
    if (!db) return;

    const id = generateId();
    await db.query(
      'INSERT INTO formula_compounds (id, formula_id, compound, formula, amount_per_liter, provides, is_macro) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, formulaId, compound.compound, compound.formula, compound.amount_per_liter, compound.provides, compound.is_macro],
    );
  },

  loadFormulaCompounds: async (formulaId) => {
    const { db } = get();
    if (!db) return { macronutrients: [], micronutrients: [] };

    const result = await db.query('SELECT * FROM formula_compounds WHERE formula_id = $1', [formulaId]);
    const macronutrients: any[] = [];
    const micronutrients: any[] = [];

    result.rows.forEach((r: any) => {
      const item = {
        id: r.id,
        compound: r.compound,
        formula: r.formula,
        amount_per_liter: Number(r.amount_per_liter),
        provides: r.provides,
      };
      if (r.is_macro) {
        macronutrients.push(item);
      } else {
        micronutrients.push(item);
      }
    });

    return { macronutrients, micronutrients };
  },

  deleteFormulaCompound: async (compoundId) => {
    const { db } = get();
    if (!db) return;

    await db.query('DELETE FROM formula_compounds WHERE id = $1', [compoundId]);
  },

  addFormulaSpecies: async (formulaId: string, speciesId: string, compatibility: number) => {
    const { db } = get();
    if (!db) return;

    const id = generateId();
    await db.query(
      'INSERT INTO formula_species (id, formula_id, species_id, compatibility, from_user) VALUES ($1, $2, $3, $4, $5)',
      [id, formulaId, speciesId, compatibility, true],
    );
  },

  removeFormulaSpecies: async (id: string) => {
    const { db } = get();
    if (!db) return;

    await db.query('DELETE FROM formula_species WHERE id = $1', [id]);
  },

  loadFormulaSpecies: async (formulaId: string): Promise<UserFormulaSpecies[]> => {
    const { db } = get();
    if (!db) return [];

    const result = await db.query(
      'SELECT * FROM formula_species WHERE formula_id = $1 AND from_user = true',
      [formulaId],
    );

    return result.rows.map((r: any) => ({
      id: r.id,
      formula_id: r.formula_id,
      species_id: r.species_id,
      compatibility: Number(r.compatibility),
      from_user: r.from_user,
    }));
  },
}));
