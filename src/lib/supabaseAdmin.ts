/**
 * lib/supabaseAdmin.ts
 * ─────────────────────────────────────────────────────────────
 * Client Supabase avec privilèges élevés (service_role_key)
 * À UTILISER UNIQUEMENT CÔTÉ SERVEUR (API Routes / Server Actions).
 * NE JAMAIS IMPORTER DANS DES COMPOSANTS CLIENTS.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// This key bypasses Row Level Security. Never expose it on the client.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
