import { create } from 'zustand';
import { PGlite } from '@electric-sql/pglite';
import { User } from '../types';
import { hashPassword, generateSalt } from '../utils/crypto';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface AuthState {
  db: PGlite | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isFirstRun: boolean;

  init: (db: PGlite) => Promise<void>;
  registerAdmin: (username: string, password: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  db: null,
  currentUser: null,
  isAuthenticated: false,
  loading: true,
  isFirstRun: false,

  init: async (db: PGlite) => {
    set({ db, loading: true });

    const userCount = await db.query('SELECT COUNT(*) FROM users');
    const count = Number((userCount.rows[0] as any).count);
    const isFirstRun = count === 0;

    const sessionUser = sessionStorage.getItem('worldsilo_user_id');
    if (sessionUser && !isFirstRun) {
      const result = await db.query('SELECT id, username, is_admin, created_at FROM users WHERE id = $1', [sessionUser]);
      if (result.rows.length > 0) {
        const row = result.rows[0] as any;
        set({
          currentUser: {
            id: row.id,
            username: row.username,
            is_admin: row.is_admin,
            created_at: Number(row.created_at),
          },
          isAuthenticated: true,
          isFirstRun,
          loading: false,
        });
        return;
      }
    }

    set({ isFirstRun, loading: false });
  },

  registerAdmin: async (username: string, password: string): Promise<boolean> => {
    const { db } = get();
    if (!db) return false;

    try {
      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);
      const id = generateId();
      const createdAt = Date.now();

      await db.query(
        'INSERT INTO users (id, username, password_hash, salt, is_admin, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, username, passwordHash, salt, true, createdAt],
      );

      const user: User = { id, username, is_admin: true, created_at: createdAt };
      sessionStorage.setItem('worldsilo_user_id', id);
      set({ currentUser: user, isAuthenticated: true, isFirstRun: false });
      return true;
    } catch {
      return false;
    }
  },

  login: async (username: string, password: string): Promise<boolean> => {
    const { db } = get();
    if (!db) return false;

    try {
      const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) return false;

      const row = result.rows[0] as any;
      const passwordHash = await hashPassword(password, row.salt);
      if (passwordHash !== row.password_hash) return false;

      const user: User = {
        id: row.id,
        username: row.username,
        is_admin: row.is_admin,
        created_at: Number(row.created_at),
      };
      sessionStorage.setItem('worldsilo_user_id', row.id);
      set({ currentUser: user, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    sessionStorage.removeItem('worldsilo_user_id');
    set({ currentUser: null, isAuthenticated: false });
  },
}));
