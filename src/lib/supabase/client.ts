import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

// Used inside Client Components. RLS applies based on the logged-in
// user's session — never use this for calls that need a secret key.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
