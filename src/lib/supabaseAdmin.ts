/**
 * lib/supabaseAdmin.ts
 * ─────────────────────────────────────────────────────────────
 * Client Supabase avec privilèges élevés (service_role_key)
 * À UTILISER UNIQUEMENT CÔTÉ SERVEUR (API Routes / Server Actions).
 * NE JAMAIS IMPORTER DANS DES COMPOSANTS CLIENTS.
 */

import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = (rawUrl && rawUrl.startsWith('http') && rawUrl !== '[SENSITIVE]')
  ? rawUrl
  : 'https://vrfmytzkhsktwyjcdnja.supabase.co';

const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseServiceKey = (rawKey && rawKey !== '[SENSITIVE]')
  ? rawKey
  : 'placeholder-service-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
