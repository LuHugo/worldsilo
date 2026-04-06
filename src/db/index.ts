import { PGlite } from '@electric-sql/pglite';

let db: PGlite | null = null;

async function fetchAsBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.blob();
}

async function fetchAsWasmModule(url: string): Promise<WebAssembly.Module> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  return WebAssembly.compile(buffer);
}

export async function initDB(): Promise<PGlite> {
  if (db) return db;

  const base = '/pglite';

  const [fsBundle, pgliteWasmModule, initdbWasmModule] = await Promise.all([
    fetchAsBlob(`${base}/pglite.data`),
    fetchAsWasmModule(`${base}/pglite.wasm`),
    fetchAsWasmModule(`${base}/initdb.wasm`),
  ]);

  db = new PGlite({
    dataDir: 'idb://worldsilo-v3',
    fsBundle,
    pgliteWasmModule,
    initdbWasmModule,
  });

  await db.waitReady;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT false,
      created_at REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS species (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ideal_ec REAL NOT NULL,
      ideal_spectrum TEXT NOT NULL,
      total_days INTEGER NOT NULL,
      base_growth_rate REAL NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT,
      user_id TEXT,
      is_system BOOLEAN DEFAULT true,
      note TEXT
    );

    ALTER TABLE species ADD COLUMN IF NOT EXISTS category TEXT;
    ALTER TABLE species ADD COLUMN IF NOT EXISTS user_id TEXT;
    ALTER TABLE species ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT true;
    ALTER TABLE species ADD COLUMN IF NOT EXISTS note TEXT;

    CREATE TABLE IF NOT EXISTS formulas (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      is_system BOOLEAN DEFAULT true,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      n INTEGER NOT NULL,
      p INTEGER NOT NULL,
      k INTEGER NOT NULL,
      ec_min REAL NOT NULL,
      ec_max REAL NOT NULL,
      ph_min REAL NOT NULL,
      ph_max REAL NOT NULL,
      description TEXT,
      note TEXT,
      created_at REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS formula_compounds (
      id TEXT PRIMARY KEY,
      formula_id TEXT NOT NULL REFERENCES formulas(id),
      compound TEXT NOT NULL,
      formula TEXT NOT NULL,
      amount_per_liter REAL NOT NULL,
      provides TEXT NOT NULL,
      is_macro BOOLEAN NOT NULL
    );

    CREATE TABLE IF NOT EXISTS formula_species (
      id TEXT PRIMARY KEY,
      formula_id TEXT NOT NULL REFERENCES formulas(id),
      species_id TEXT NOT NULL,
      compatibility INTEGER NOT NULL,
      from_user BOOLEAN DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS silo_instances (
      id TEXT PRIMARY KEY,
      species_id TEXT NOT NULL REFERENCES species(id),
      name TEXT NOT NULL,
      start_time REAL NOT NULL,
      current_day INTEGER NOT NULL DEFAULT 0,
      current_biomass REAL NOT NULL DEFAULT 0,
      applied_ec REAL NOT NULL DEFAULT 1.0,
      applied_spectrum TEXT NOT NULL DEFAULT '[255,255,255,0]',
      status TEXT NOT NULL DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS growth_logs (
      id TEXT PRIMARY KEY,
      instance_id TEXT NOT NULL REFERENCES silo_instances(id),
      day INTEGER NOT NULL,
      timestamp REAL NOT NULL,
      applied_ec REAL NOT NULL,
      applied_spectrum TEXT NOT NULL,
      biomass_gain REAL NOT NULL,
      total_biomass REAL NOT NULL,
      spectrum_match REAL NOT NULL,
      brightness_factor REAL NOT NULL,
      nutrient_efficiency REAL NOT NULL,
      r_fr_ratio REAL NOT NULL
    );
  `);

  return db;
}

export function getDB(): PGlite {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}
