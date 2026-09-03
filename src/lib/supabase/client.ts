import { createClient } from '@supabase/supabase-js';

// Used in the browser. Only ever touches tables/policies that are safe
// for anonymous public read access (see RLS policies in supabase/schema.sql).
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
