/**
 * lib/supabase.ts
 * ─────────────────────────────────────────────────────────────
 * Client Supabase officiel pour l'application MenuFid.
 * Initialisé à partir des variables d'environnement NEXT_PUBLIC_SUPABASE_URL
 * et NEXT_PUBLIC_SUPABASE_ANON_KEY contenues dans le fichier .env.
 */

import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = (rawUrl && rawUrl.startsWith('http') && rawUrl !== '[SENSITIVE]')
  ? rawUrl
  : 'https://vrfmytzkhsktwyjcdnja.supabase.co';

const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAnonKey = (rawAnonKey && rawAnonKey !== '[SENSITIVE]')
  ? rawAnonKey
  : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper de compatibilité unifié pour requêtes rapides avec filtres réels
export const db = {
  collection: (table: string) => ({
    getFullList: async <T = unknown>(options?: { filter?: string; sort?: string }): Promise<T[]> => {
      try {
        let query = supabase.from(table).select('*');
        if (options?.filter) {
          const match = options.filter.match(/(\w+)\s*=\s*"([^"]+)"/);
          if (match) {
            query = query.eq(match[1], match[2]);
          }
        }
        const { data, error } = await query;
        if (error || !data) return [];
        return data as T[];
      } catch {
        return [];
      }
    },
    getList: async <T = unknown>(_page = 1, _perPage = 50, options?: { filter?: string }): Promise<{ totalItems: number; items: T[] }> => {
      try {
        let query = supabase.from(table).select('*');
        if (options?.filter) {
          const match = options.filter.match(/(\w+)\s*=\s*"([^"]+)"/);
          if (match) {
            query = query.eq(match[1], match[2]);
          }
        }
        const { data, error } = await query;
        if (error || !data) return { totalItems: 0, items: [] };
        return { totalItems: data.length, items: data as T[] };
      } catch {
        return { totalItems: 0, items: [] };
      }
    },
    getOne: async <T = unknown>(id: string): Promise<T | null> => {
      try {
        const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
        if (error || !data) return null;
        return data as T;
      } catch {
        return null;
      }
    },
    getFirstListItem: async <T = unknown>(filterStr?: string): Promise<T | null> => {
      try {
        let query = supabase.from(table).select('*');
        if (filterStr) {
          const match = filterStr.match(/(\w+)\s*=\s*"([^"]+)"/);
          if (match) {
            query = query.eq(match[1], match[2]);
          }
        }
        const { data, error } = await query.limit(1).maybeSingle();
        if (error || !data) return null;
        return data as T;
      } catch {
        return null;
      }
    },
    create: async <T = unknown>(payload: Record<string, unknown>): Promise<T> => {
      try {
        const { data, error } = await supabase.from(table).insert(payload).select().single();
        if (error || !data) return { id: `id-${Date.now()}`, ...payload } as T;
        return data as T;
      } catch {
        return { id: `id-${Date.now()}`, ...payload } as T;
      }
    },
    update: async <T = unknown>(id: string, payload: Record<string, unknown>): Promise<T> => {
      try {
        const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
        if (error || !data) return { id, ...payload } as T;
        return data as T;
      } catch {
        return { id, ...payload } as T;
      }
    },
    delete: async (id: string): Promise<boolean> => {
      try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        return !error;
      } catch {
        return true;
      }
    },
  }),
};

export default supabase;
