import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url || !key) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local and fill it in.",
  );
}

// Note: this project keeps all real tables in non-public schemas (`app`, `core`, ...).
// For these to be reachable via the JS client, add them to:
//   Supabase Dashboard → Project Settings → API → "Exposed schemas"
// Then call them via `.schema('app').from('page_objects')`.
export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "flyhigh.auth",
  },
});
