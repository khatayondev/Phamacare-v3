import { createClient } from "npm:@supabase/supabase-js@2";

// Database configuration and connection setup
export const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('kv_store_3e7703d4').select('key').limit(1);
    return !error;
  } catch {
    return false;
  }
}