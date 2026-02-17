import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables in various environments (Vite, standard Node, etc.)
const getEnvVar = (key: string, defaultValue: string) => {
  let value: string | undefined;

  // Try import.meta.env (Vite/Modern)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      value = import.meta.env[key] || import.meta.env[`VITE_${key}`];
    }
  } catch (e) {}

  // Try process.env (Node/Webpack/Standard)
  if (!value) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        value = process.env[key];
      }
    } catch (e) {}
  }

  return value || defaultValue;
}

// Configuration: Credentials can be read from environment variables or fall back to default values
// On Netlify, set SUPABASE_URL and SUPABASE_ANON_KEY in your Environment Variables
const supabaseUrl = getEnvVar('SUPABASE_URL', 'https://kimwiqlypyaesieknmuz.supabase.co');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY', 'sb_publishable_aTQqx8TpSwRv5KJzlvXqZw_t_lJvRdI');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);