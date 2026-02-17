import { createClient } from '@supabase/supabase-js';

// Configuration: Credentials can be read from environment variables or fall back to hardcoded values
// On Netlify, set SUPABASE_URL and SUPABASE_ANON_KEY in your Environment Variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://kimwiqlypyaesieknmuz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_aTQqx8TpSwRv5KJzlvXqZw_t_lJvRdI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);