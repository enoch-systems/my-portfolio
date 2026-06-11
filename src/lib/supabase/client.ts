import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Whether Supabase env vars are configured */
const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

/** Create a mock client that always throws, falling back to hardcoded data */
function createMockClient() {
  return new Proxy({} as ReturnType<typeof createClient>, {
    get() {
      return () => Promise.reject(new Error("Supabase not configured"));
    },
  }) as unknown as ReturnType<typeof createClient>;
}

export const supabase = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createMockClient();

export { isConfigured };


